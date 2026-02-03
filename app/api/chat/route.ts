import { createGeminiClient, checkAPIKey } from '@/lib/api-client'
import { createStreamResponse, handleGeminiStream, createErrorResponse } from '@/lib/api-utils'

const SYSTEM_PROMPT = '你是一个得力的设计助手。请简短回答用户的问题。'

export async function POST(req: Request) {
  try {
    // 检查 API Key
    const keyCheck = checkAPIKey('gemini')
    if (!keyCheck.exists) {
      console.error('❌ GOOGLE_API_KEY 未配置')
      return createErrorResponse('API Key 未配置', '请在 .env.local 文件中设置 GOOGLE_API_KEY', 500)
    }
    console.log(`[Chat] API Key 前缀: ${keyCheck.prefix}...`)

    // 解析请求
    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return createErrorResponse('消息不能为空', '请提供有效的消息数组', 400)
    }

    // 初始化 Gemini 客户端
    const genAI = createGeminiClient()
    const model = genAI.getGenerativeModel({ model: 'gemini-3.0-flash' })

    // 构建提示词
    const lastMessage = messages[messages.length - 1]
    const prompt = `${SYSTEM_PROMPT}\n\n用户: ${lastMessage.content}`

    // 生成流式响应
    const geminiStream = await model.generateContentStream(prompt)

    // 转换为流式响应
    const stream = handleGeminiStream(geminiStream.stream, (fullText) => {
      console.log(`[Chat] 回复完成，长度: ${fullText.length}`)
    })

    return createStreamResponse(stream)

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
