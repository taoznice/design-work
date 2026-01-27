import { NextRequest } from 'next/server'
import OpenAI from 'openai'

// Vercel 超时配置：60秒
export const maxDuration = 60

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

// 获取当前日期并生成周度标签
function getCurrentWeekLabel(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  const firstDay = new Date(year, month - 1, 1)
  const dayOfWeek = firstDay.getDay()
  const date = now.getDate()
  
  const weekNumber = Math.ceil((date + dayOfWeek) / 7)
  
  return `${year}年${month}月 第${weekNumber}周`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { newsData } = body
    
    const currentWeekLabel = getCurrentWeekLabel()

    if (!newsData || !Array.isArray(newsData) || newsData.length === 0) {
      return new Response(
        JSON.stringify({ error: '新闻数据不能为空' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 检查 API Key
    const API_KEY = process.env.OPENAI_API_KEY
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
      return new Response(
        JSON.stringify({ 
          error: 'API Key 未配置',
          message: '请在项目根目录的 .env.local 文件中设置 OPENAI_API_KEY'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 构建新闻列表文本
    const newsListText = newsData
      .map((item: any, index: number) => `${index + 1}. ${item.title} - ${item.source} (${item.link})`)
      .join('\n')

    // 构建系统提示词 - 极度精简版本
    const systemMessage = `你是一个对技术极度敏感的资深设计总监。请生成一份针对设计行业的 AI 情报简报。

**强制要求**：
1. **全中文输出**。
2. **严格 JSON 格式**：不包含 Markdown 标记。
3. **每日 AI 动态 (Daily News)**:
   - **数量**：必须返回 **5条**。
   - **筛选标准**：只收录与设计行业 **强相关** 的内容。
   - **格式要求**：每条资讯必须包含：
     * title: 标题（20字以内）
     * insight: 一句话核心洞察（30字以内）
     * tags: 关键词数组（3-5个词）
     * design_impact: 对设计行业的具体影响（50字以内）
     * potential_usage: 设计师可以用它做什么（50字以内）
     * url: 新闻原文链接（如果原始新闻列表中有链接，请使用该链接；如果没有，请留空字符串 ""）
   - **极度精简**：每个字段控制在指定字数以内，只保留核心信息。

4. **工具风向标 (Tools Rank)**:
   - **数量**：4个分类（综合、Coding、生图、视频），每个分类必须返回 **Top 10**。
   - **新增字段**：每个工具必须包含 \`last_update\` (最新迭代时间，例如 '2024-01' 或 'V6.0')。

5. **数据结构**：
   严格返回以下 JSON (不要 Markdown):
   {
     "weekly_insight": { "date_label": "YYYY年M月W周", "content": "..." },
     "daily_ai_news": [
       { "title": "...", "insight": "...", "tags": ["...", "..."], "design_impact": "...", "potential_usage": "...", "url": "..." },
       // ... 5 items
     ],
     "ai_tools_rank": {
       "comprehensive": [ { "rank": 1, "name": "...", "reason": "...", "last_update": "..." }, ... ],
       "coding": [ ... ],
       "image_gen": [ ... ],
       "video_gen": [ ... ]
     }
   }

**重要**：
- 只返回纯 JSON，不要任何 Markdown 代码块标记，不要任何解释文字。
- 所有文本内容必须为中文。
- daily_ai_news 必须严格筛选与设计行业强相关的新闻，必须返回 5 条。
- weekly_insight.date_label 必须使用系统提供的当前日期，不要使用其他日期。`

    const openai = createOpenAIClient()

    // 创建流式响应
    const stream = await openai.chat.completions.create({
      model: 'qwen-vl-max',
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: `当前系统日期：${currentWeekLabel}\n\n这是从 RSS 源抓取到的最新科技新闻列表（可能包含英文内容）：\n\n${newsListText}\n\n请作为对技术极度敏感的资深设计总监，结合你的知识库，生成一份针对设计行业的 AI 情报简报。要求：
1. 将所有英文内容翻译为流畅的中文
2. 严格筛选与设计行业强相关的新闻，生成 **5条** daily_ai_news，每条必须包含：
   - title: 标题（20字以内）
   - insight: 一句话核心洞察（30字以内）
   - tags: 关键词数组（3-5个词）
   - design_impact: 对设计行业的具体影响（50字以内）
   - potential_usage: 设计师可以用它做什么（50字以内）
   - url: 新闻原文链接（如果原始新闻列表中有链接，请使用该链接；如果没有，请留空字符串 ""）
   - 筛选标准：只收录与设计行业强相关的内容
   - **极度精简**：每个字段控制在指定字数以内，只保留核心信息
3. 生成 weekly_insight，包含：
   - date_label: 必须使用 "${currentWeekLabel}"（这是当前系统日期，不要使用其他日期）
   - content: 200字左右的深度趋势总结
4. 生成 ai_tools_rank，包含 4 个子榜单，每个榜单 **Top 10**，每个工具必须包含：
   - rank: 排名
   - name: 工具名称（中文）
   - reason: 推荐理由（中文）
   - last_update: 最新迭代时间（例如 '2024-01' 或 'V6.0'）

所有内容必须为中文。只返回纯 JSON 格式，不要包含任何 Markdown 标记。`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000, // 减少 token 限制以加快响应
      stream: true, // 启用流式输出
    })

    // 创建 ReadableStream
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          let fullText = ''
          
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullText += content
              // 发送增量内容
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`))
            }
          }
          
          // 发送完成信号
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', fullText })}\n\n`))
          controller.close()
        } catch (error: any) {
          console.error('Stream error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('News Analyze Stream API Error:', error)
    
    let errorMessage = '新闻分析失败'
    let errorDetails = error.message || '未知错误'
    
    if (error.status === 401 || 
        error.message?.includes('401') || 
        error.message?.includes('Unauthorized') ||
        error.message?.includes('ECONNREFUSED') ||
        error.message?.includes('Connect') ||
        error.message?.includes('timeout') ||
        error.message?.includes('Timeout')) {
      errorMessage = '内部服务连接失败，请检查 VPN 或 Key'
      errorDetails = '无法连接到内部 API 服务，请检查 VPN 连接和 API Key 配置'
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
