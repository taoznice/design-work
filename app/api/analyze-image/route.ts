import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// 创建 OpenAI 客户端（使用内部 API）
function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://aigc.sankuai.com/v1/openai/native'
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY 未配置')
  }
  
  return new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl,
  })
}

interface KnowledgeCard {
  id: string
  title: string
  contentType: 'text' | 'image'
  content: string
  enabled: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageBase64, videoUrl, imageAnalysisType = 'aesthetic', useTeamWisdom, knowledgeCards, styleReference, translationPrompt } = body

    if (!imageBase64 && !videoUrl) {
      return NextResponse.json(
        { error: '图片或视频数据不能为空' },
        { status: 400 }
      )
    }

    // 检查 API Key
    const API_KEY = process.env.OPENAI_API_KEY
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
      return NextResponse.json(
        { 
          error: 'API Key 未配置',
          message: '请在项目根目录的 .env.local 文件中设置 OPENAI_API_KEY'
        },
        { status: 500 }
      )
    }

    // 构建系统提示词
    let systemMessage = ''
    if (imageAnalysisType === 'translation') {
      // 翻译模式：使用自定义提示词或默认提示词
      systemMessage = translationPrompt || '你是一个专业的翻译助手，擅长识别图片中的文字并将其翻译成中文。请保持排版逻辑，如果图片是设计图，请重点翻译界面上的文案。'
    } else if (imageAnalysisType === 'aesthetic') {
      systemMessage = `你是一个资深的设计审美专家，擅长从多个维度分析设计的审美价值。请从以下角度分析上传的设计图片：

1. **视觉层次**：布局结构、视觉平衡、留白运用
2. **色彩运用**：配色方案、对比度、色彩情绪
3. **细节处理**：字体选择、图标与图形、交互元素
4. **整体评价**：设计优点和改进建议

请用 Markdown 格式输出，结构清晰，语言专业但易懂。`
    } else if (imageAnalysisType === 'proposal') {
      systemMessage = `你是一个资深的设计方案评审专家，专注于评估设计方案的完整性和可用性。请从以下维度分析上传的设计方案：

1. **信息层级**：
   - 层级结构是否清晰，主要信息是否突出
   - 视觉引导是否合理，是否符合用户阅读习惯
   - 信息密度是否适中，不会造成认知负担

2. **交互逻辑**：
   - 操作流程是否清晰，是否符合用户预期
   - 反馈机制是否明确，状态变化是否可见
   - 错误处理是否友好，是否能引导用户正确操作

3. **体验硬伤检查**：
   - 可访问性：文字对比度、字体大小是否符合可读性标准
   - 响应式适配：在不同设备上布局是否合理
   - 性能影响：视觉元素是否会造成明显的性能问题

请用 Markdown 格式输出，结构清晰，语言专业但易懂。重点关注方案的完整性和可用性，而非单纯的视觉美感。`
    } else {
      systemMessage = `你是一个专业的内容分析专家。请分析上传的图片，识别其中的文字内容、图形元素、视觉结构，并提取关键信息。用 Markdown 格式输出分析结果。`
    }

    // 如果启用团队知识库，注入知识库内容
    if (useTeamWisdom && knowledgeCards) {
      const enabledCards: KnowledgeCard[] = knowledgeCards.filter((card: KnowledgeCard) => card.enabled)
      
      if (enabledCards.length > 0) {
        systemMessage += `\n\n【公司内部方法论】：`
        enabledCards.forEach(card => {
          if (card.contentType === 'text') {
            systemMessage += `\n[${card.title}]: ${card.content}`
          }
        })
      }
    }

    // 如果提供了风格基准，添加到 System Message
    if (styleReference) {
      systemMessage += styleReference
    }

    const openai = createOpenAIClient()
    
    // 构建 content 数组，支持 text、image_url 和 video_url
    const content: any[] = []
    
    // 根据分析类型设置不同的提示文本
    let promptText = ''
    if (imageAnalysisType === 'translation') {
      promptText = translationPrompt || '请识别这张图片中的所有文字，并将其翻译成中文。请保持排版逻辑，如果图片是设计图，请重点翻译界面上的文案。'
    } else if (imageAnalysisType === 'aesthetic') {
      promptText = '请分析这张设计图片的审美价值，从视觉层次、色彩运用、细节处理等方面给出专业评价。'
    } else if (imageAnalysisType === 'proposal') {
      promptText = '请分析这个设计方案的完整性，重点关注信息层级、交互逻辑和体验硬伤。'
    } else {
      promptText = '请分析这张图片的内容，识别文字、图形元素和关键信息。'
    }
    
    if (promptText) {
      content.push({
        type: 'text',
        text: promptText
      })
    }
    
    // 添加图片（如果提供）
    if (imageBase64) {
      // 提取 base64 数据（去掉 data:image/...;base64, 前缀）
      const base64Data = imageBase64.includes(',') 
        ? imageBase64.split(',')[1] 
        : imageBase64
      
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${base64Data}`
        }
      })
    }
    
    // 如果启用知识库，添加知识库中的图片
    if (useTeamWisdom && knowledgeCards) {
      const enabledImageCards: KnowledgeCard[] = knowledgeCards.filter(
        (card: KnowledgeCard) => card.enabled && card.contentType === 'image'
      )
      
      enabledImageCards.forEach(card => {
        content.push({
          type: 'text',
          text: `这是我们公司的内部参考标准/图表：${card.title}`
        })
        content.push({
          type: 'image_url',
          image_url: {
            url: card.content
          }
        })
      })
    }
    
    // 添加视频（如果提供）- 使用 as any 绕过 TypeScript 类型检查
    if (videoUrl) {
      content.push({
        type: 'video_url',
        video_url: {
          url: videoUrl
        }
      } as any)
    }

    const completion = await openai.chat.completions.create({
      model: 'qwen3-vl-plus',
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: content as any, // 使用 as any 支持 video_url 类型
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const aiResponse = completion.choices[0]?.message?.content || ''

    if (!aiResponse) {
      throw new Error('API 返回的数据格式不正确')
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis: aiResponse,
      },
    })
  } catch (error: any) {
    console.error('Image Analysis API Error:', error)
    
    // 处理不同的错误类型
    let errorMessage = '图片分析失败'
    let errorDetails = error.message || '未知错误'
    
    // 401 或连接失败，显示内部服务错误提示
    if (error.status === 401 || 
        error.message?.includes('401') || 
        error.message?.includes('Unauthorized') ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('Connect') ||
        error.message?.includes('timeout') ||
        error.message?.includes('Timeout')) {
      errorMessage = '内部服务连接失败，请检查 VPN 或 Key'
      errorDetails = '无法连接到内部 API 服务，请检查 VPN 连接和 API Key 配置'
    } else if (error.message?.includes('429')) {
      errorMessage = 'API 请求频率过高'
      errorDetails = '请稍后再试，或检查你的 API 配额'
    } else if (error.status === 500 || error.message?.includes('500')) {
      errorMessage = '服务器错误'
      errorDetails = 'API 服务暂时不可用，请稍后再试'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    )
  }
}
