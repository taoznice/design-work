import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// 创建 OpenAI 客户端（使用阿里云通义千问）
function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  const baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  
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

    // 构建提取提示词 - 优化判别逻辑
    const extractPrompt = `你是一个智能记忆提取助手。请分析用户的输入和AI的回复，判断是否有需要保存为长期记忆的信息。

${currentMemoryText}

用户输入：
${userInput}

AI回复：
${aiResponse}

**判别标准**（必须同时满足以下条件）：
1. **长期偏好**：这是用户表达的长期偏好或习惯吗？
   - ✅ 是：例如"以后输出都用中文"、"生成的图片都要16:9"、"我不喜欢圆角设计"
   - ❌ 否：例如"这次用红色"、"今天要加班"（临时性、一次性）

2. **关键事实**：这是关于用户或项目的关键事实信息吗？
   - ✅ 是：例如"我的产品叫AI Radar"、"我们公司是做SaaS的"、"我们团队用'Team DNA'这个词"
   - ❌ 否：例如"今天天气不错"、"我吃了午饭"（无关紧要的信息）

3. **可复用性**：这个信息在未来的对话中会用到吗？
   - ✅ 是：会在多次对话中重复使用
   - ❌ 否：只适用于当前对话

**如果满足以上条件**，请按以下JSON格式返回：
{
  "category": "userPreferences" | "projectContext" | "vocabulary",
  "oldValue": "旧值（如果有需要替换的，否则省略此字段）",
  "newValue": "简洁的记忆文本（20字以内）"
}

**如果不满足条件**，请返回 null。

只返回JSON，不要其他文字。`

    const openai = createOpenAIClient()

    const completion = await openai.chat.completions.create({
      model: 'qwen-vl-max',
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
