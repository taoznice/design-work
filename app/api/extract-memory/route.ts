import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// 创建 OpenAI 客户端
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

interface MemoryContext {
  userPreferences?: string[]
  projectContext?: string[]
  vocabulary?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userInput, aiResponse, currentMemory } = body

    if (!userInput && !aiResponse) {
      return NextResponse.json(
        { error: '用户输入或AI回复不能为空' },
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

    // 构建当前记忆的文本描述
    let currentMemoryText = ''
    if (currentMemory) {
      const parts: string[] = []
      if (currentMemory.userPreferences?.length > 0) {
        parts.push(`用户偏好：${currentMemory.userPreferences.join('、')}`)
      }
      if (currentMemory.projectContext?.length > 0) {
        parts.push(`项目背景：${currentMemory.projectContext.join('、')}`)
      }
      if (currentMemory.vocabulary?.length > 0) {
        parts.push(`专用术语：${currentMemory.vocabulary.join('、')}`)
      }
      currentMemoryText = parts.length > 0 ? `当前记忆：\n${parts.join('\n')}` : '当前无记忆'
    } else {
      currentMemoryText = '当前无记忆'
    }

    // 构建提取提示词
    const extractPrompt = `基于用户的这段输入和AI的回复，分析是否有新的设计偏好、项目信息或专用术语需要更新到记忆中。

${currentMemoryText}

用户输入：
${userInput}

AI回复：
${aiResponse}

请分析：
1. 用户是否表达了新的设计偏好（如：不喜欢圆角、偏好黑白风格、不写代码等）？
2. 用户是否提到了当前项目背景（如：正在做SaaS后台、移动端改版等）？
3. 用户是否使用了新的专用术语或内部黑话？

如果发现需要更新的记忆，请按以下JSON格式返回：
{
  "category": "userPreferences" | "projectContext" | "vocabulary",
  "oldValue": "旧值（如果有需要替换的）",
  "newValue": "新值"
}

如果没有需要更新的记忆，请返回 null。

只返回JSON，不要其他文字。`

    const openai = createOpenAIClient()

    const completion = await openai.chat.completions.create({
      model: 'qwen3-vl-plus',
      messages: [
        {
          role: 'system',
          content: '你是一个记忆提取助手，负责从对话中提取用户的偏好、项目背景和专用术语。只返回JSON格式，不要其他文字。',
        },
        {
          role: 'user',
          content: extractPrompt,
        },
      ],
      temperature: 0.3, // 降低温度以获得更稳定的输出
      max_tokens: 200,
      response_format: { type: 'json_object' },
    })

    const aiResponseText = completion.choices[0]?.message?.content || ''

    if (!aiResponseText || aiResponseText === 'null') {
      return NextResponse.json({
        success: true,
        data: {
          suggestion: null,
        },
      })
    }

    // 解析JSON响应
    let parsedData
    try {
      parsedData = JSON.parse(aiResponseText)
    } catch (e) {
      // 尝试提取JSON
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0])
      } else {
        return NextResponse.json({
          success: true,
          data: {
            suggestion: null,
          },
        })
      }
    }

    // 验证数据结构
    if (parsedData && parsedData.category && parsedData.newValue) {
      return NextResponse.json({
        success: true,
        data: {
          suggestion: {
            category: parsedData.category,
            oldValue: parsedData.oldValue || undefined,
            newValue: parsedData.newValue,
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        suggestion: null,
      },
    })
  } catch (error: any) {
    console.error('Extract Memory API Error:', error)
    
    // 静默失败，返回null
    return NextResponse.json({
      success: true,
      data: {
        suggestion: null,
      },
    })
  }
}
