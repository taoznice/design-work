import { NextRequest } from 'next/server'
import { createOpenAIClient } from '@/lib/api-client'
import { safeParseJSON, createErrorResponse, createSuccessResponse } from '@/lib/api-utils'

const defaultPersona = `你是一个 Google Gemini 风格的高级设计助手。你的回答应该是流畅自然、富有洞察力的 Markdown 文本。除非用户明确要求，否则不要过度使用表格。保持段落清晰，重点突出，语气专业且乐于助人。

在规划功能时，请使用列表（Bullet points）和关键步骤的形式，而不是复杂的结构化数据。`

interface KnowledgeCard {
  id: string
  title: string
  contentType: 'text' | 'image'
  content: string
  enabled: boolean
}

interface MemoryContext {
  userPreferences?: string[]
  projectContext?: string[]
  vocabulary?: string[]
}

export const maxDuration = 60 // Vercel 超时配置

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const parseResult = await safeParseJSON(request)
    if (parseResult.error) {
      return createErrorResponse(parseResult.error.error, parseResult.error.details, 400)
    }
    
    const { query, memoryContext, customPersona, imageAnalysis, useTeamWisdom, enableMemory } = parseResult.data

    if (!query && !imageAnalysis) {
      return createErrorResponse(
        'query 或 imageAnalysis 至少需要一个',
        '请提供文本查询或图片分析内容',
        400
      )
    }

    // 初始化 OpenAI 客户端（会自动检查 API Key）
    let openai
    try {
      openai = createOpenAIClient()
    } catch (error: any) {
      return createErrorResponse('API Key 未配置', error.message, 500)
    }

    // 构建 System Message - 确保 System Prompt 优先级最高
    const persona = customPersona || defaultPersona
    
    // 核心 System Prompt（最高优先级）
    let systemMessage = `${persona}`

    // 添加记忆上下文（仅在启用记忆时）
    if (enableMemory !== false && memoryContext) {
      const memoryParts: string[] = []
      
      if (memoryContext.userPreferences && memoryContext.userPreferences.length > 0) {
        memoryParts.push(`用户偏好：${memoryContext.userPreferences.join('、')}`)
      }
      if (memoryContext.projectContext && memoryContext.projectContext.length > 0) {
        memoryParts.push(`项目背景：${memoryContext.projectContext.join('、')}`)
      }
      if (memoryContext.vocabulary && memoryContext.vocabulary.length > 0) {
        memoryParts.push(`专用术语：${memoryContext.vocabulary.join('、')}`)
      }
      
      if (memoryParts.length > 0) {
        systemMessage += `\n\n【记忆上下文】\n${memoryParts.join('\n')}`
      }
    }

    // 如果启用团队知识库，注入知识库内容
    if (useTeamWisdom) {
      // 注意：这里需要从请求中获取知识库数据，因为这是服务端
      // 实际应该从前端传递知识库数据，或者从共享存储读取
      // 为了简化，我们假设前端会传递 knowledgeCards 数组
      const knowledgeCards: KnowledgeCard[] = parseResult.data.knowledgeCards || []
      const enabledCards = knowledgeCards.filter(card => card.enabled)
      
      if (enabledCards.length > 0) {
        systemMessage += `\n\n【公司内部方法论】：`
        enabledCards.forEach(card => {
          if (card.contentType === 'text') {
            systemMessage += `\n[${card.title}]: ${card.content}`
          }
        })
      }
    }

    // 构建用户消息
    let userMessage: string | any[] = ''
    const userContent: any[] = []
    
    // 如果启用知识库且有图片类型的知识卡片，添加到 content 数组
    if (useTeamWisdom) {
      const knowledgeCards: KnowledgeCard[] = parseResult.data.knowledgeCards || []
      const enabledImageCards = knowledgeCards.filter(
        card => card.enabled && card.contentType === 'image'
      )
      
      if (enabledImageCards.length > 0 || imageAnalysis || query) {
        // 使用 content 数组格式以支持图片
        if (query) {
          userContent.push({
            type: 'text',
            text: `用户问题：\n${query}`
          })
        }
        
        if (imageAnalysis) {
          userContent.push({
            type: 'text',
            text: `图片内容分析：\n${imageAnalysis}`
          })
        }
        
        // 添加知识库中的图片
        enabledImageCards.forEach(card => {
          userContent.push({
            type: 'text',
            text: `这是我们公司的内部参考标准/图表：${card.title}`
          })
          userContent.push({
            type: 'image_url',
            image_url: {
              url: card.content
            }
          })
        })
      }
    }
    
    // 如果没有使用知识库或没有图片，使用纯文本格式
    if (userContent.length === 0) {
      if (imageAnalysis) {
        userMessage += `图片内容分析：\n${imageAnalysis}\n\n`
      }
      if (query) {
        userMessage += `用户问题：\n${query}`
      }
    }

    // 调用 API
    try {
      console.log('[Generate] API Request:', {
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        model: 'qwen-vl-max',
      })

      // 构建 messages 数组，确保 System Prompt 优先级最高（始终在第一位）
      const messages: any[] = [
        {
          role: 'system',
          content: systemMessage, // System Prompt + Memory Context + Knowledge Base（最高优先级）
        },
        {
          role: 'user',
          content: userContent.length > 0 ? userContent : userMessage, // 用户查询 + 图片分析 + 知识库图片
        },
      ]

      const completion = await openai.chat.completions.create({
        model: 'qwen-vl-max',
        messages: messages, // 确保 System Prompt 在最前面
        temperature: 0.7,
        max_tokens: 2000,
      })

      const aiResponse = completion.choices[0]?.message?.content || ''

      if (!aiResponse) {
        throw new Error('API 返回的数据格式不正确')
      }

      return createSuccessResponse({ response: aiResponse })
    } catch (apiError: any) {
      console.error('[Generate] API Error:', apiError)
      
      // 处理不同的错误类型
      let errorMessage = 'API 调用失败'
      let errorDetails = apiError.message || '未知错误'
      
      if (apiError.status === 401 || 
          apiError.message?.includes('401') || 
          apiError.message?.includes('Unauthorized') ||
          apiError.message?.includes('ECONNREFUSED') ||
          apiError.message?.includes('Connect') ||
          apiError.message?.includes('timeout') ||
          apiError.message?.includes('Timeout')) {
        errorMessage = '内部服务连接失败，请检查 VPN 或 Key'
        errorDetails = '无法连接到内部 API 服务，请检查 VPN 连接和 API Key 配置'
      } else if (apiError.message?.includes('429')) {
        errorMessage = 'API 请求频率过高'
        errorDetails = '请稍后再试，或检查你的 API 配额'
      } else if (apiError.status === 500 || apiError.message?.includes('500')) {
        errorMessage = '服务器错误'
        errorDetails = 'API 服务暂时不可用，请稍后再试'
      }
      
      return createErrorResponse(errorMessage, errorDetails, 500)
    }
  } catch (error: any) {
    console.error("后端捕获到错误:", error);
    
    // 关键：把错误消息包装成 JSON 发给前端
    return new Response(JSON.stringify({ 
      error: error.message || "未知错误",
      details: error.stack 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

