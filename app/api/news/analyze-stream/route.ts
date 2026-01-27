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

// 获取当前月份标签
function getCurrentMonthLabel(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  return `${year}年${month}月`
}

// 生成最近4个月的月度标签列表（最新月份在前）
function getLast4MonthsLabels(): string[] {
  const labels: string[] = []
  const now = new Date()
  
  for (let i = 0; i < 4; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1) // 往前推 i 个月
    
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    
    labels.push(`${year}年${month}月`)
  }
  
  // 最新月份已经在前面，不需要 reverse
  return labels
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { newsData } = body
    
    const currentMonthLabel = getCurrentMonthLabel()
    const last4MonthsLabels = getLast4MonthsLabels()

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

4. **月度AI趋势 (Monthly AI Trends)**:
   - **数量**：必须返回 **最近4个月** 的AI设计趋势总结（最新月份在前）。
   - **格式**：数组，每个元素包含 date_label 和 content。
   - **内容要求**：每段总结控制在 200-300 字，聚焦该月的AI设计行业关键趋势、技术突破、工具更新、设计方法论演进等。
   - **时间排序**：最新月份（当前月）排在最前面，依次往前推。

5. **工具风向标 (Tools Rank)**:
   - **数量**：4个分类（综合、Coding、生图、视频），每个分类必须返回 **Top 10**。
   - **排名原则（极其重要）**：
     * **必须基于客观数据排序**：根据工具的实际市场占有率、用户量、技术先进性、社区活跃度、最新版本迭代等客观指标进行排名。
     * **不要受工具列表顺序影响**：下面列出的工具列表仅用于确保不遗漏主流工具，列表中的顺序**不代表排名顺序**，请完全忽略列表顺序。
     * **客观评估标准**：考虑因素包括但不限于：用户基数、市场影响力、技术成熟度、更新频率、社区评价、实际使用率等。
   - **必须包含的主流工具**（仅用于查漏补缺，顺序不代表排名）：
     * **综合类**：Cursor, GitHub Copilot, ChatGPT, Claude, Notion AI, Framer, Webflow AI, V0
     * **Coding类**：Cursor, GitHub Copilot, Codeium, Tabnine, Replit, Codium, Sourcegraph Cody
     * **生图类**：Midjourney v6, DALL-E 3, Stable Diffusion XL, Adobe Firefly, Runway ML, Leonardo AI, Ideogram
     * **视频类**：Runway ML, Pika, Synthesia, D-ID, HeyGen, Kling AI, Stable Video Diffusion
   - **新增字段**：每个工具必须包含 \`last_update\` (最新迭代时间，例如 '2024-01' 或 'V6.0')。
   - **客观性要求**：基于当前行业真实数据，确保榜单客观准确。如果发现遗漏上述主流工具，必须补充进去，但补充时也要根据客观数据确定其排名位置。

6. **数据结构**：
   严格返回以下 JSON (不要 Markdown):
   {
     "monthly_trends": [
       { "date_label": "YYYY年M月", "content": "..." },
       // ... 4 items (最近4个月，最新月份在前)
     ],
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
- monthly_trends 必须返回最近4个月的AI设计趋势总结，使用系统提供的月度标签：${last4MonthsLabels.join(', ')}。最新月份（${last4MonthsLabels[0]}）排在最前面。
- ai_tools_rank 必须包含上述主流工具（Cursor, Midjourney v6, Framer 等），确保榜单客观且完整。
- **关键提醒**：工具榜单的排名必须完全基于客观数据，不要受工具列表顺序影响。例如，Cursor 在列表中排在前面，不代表它应该排第一，请根据实际市场数据和用户反馈客观评估排名。`

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
          content: `当前系统日期：${currentMonthLabel}\n\n这是从 RSS 源抓取到的最新科技新闻列表（可能包含英文内容）：\n\n${newsListText}\n\n请作为对技术极度敏感的资深设计总监，结合你的知识库，生成一份针对设计行业的 AI 情报简报。要求：
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
3. 生成 monthly_trends（最近4个月AI设计趋势），包含：
   - 必须返回4个月的总结，使用系统提供的月度标签：${last4MonthsLabels.join(', ')}
   - 每个总结包含 date_label 和 content（200-300字）
   - **时间排序**：最新月份（${last4MonthsLabels[0]}）排在最前面，依次往前推
   - **内容聚焦**：主要围绕AI设计相关的主题，包括技术突破、工具更新、设计方法论演进、行业趋势等
4. 生成 ai_tools_rank，包含 4 个子榜单，每个榜单 **Top 10**，每个工具必须包含：
   - rank: 排名（必须基于客观数据排序，不要受工具列表顺序影响）
   - name: 工具名称（中文）
   - reason: 推荐理由（中文，说明为什么这个排名是客观的）
   - last_update: 最新迭代时间（例如 '2024-01' 或 'V6.0'）
   - **排名原则**：必须根据工具的实际市场占有率、用户量、技术先进性、社区活跃度等客观指标进行排序，不要因为工具在列表中的位置而影响排名。
   - **必须包含的主流工具**（仅用于查漏补缺，顺序不代表排名）：
     * **综合类**：Cursor, GitHub Copilot, ChatGPT, Claude, Notion AI, Framer, Webflow AI, V0
     * **Coding类**：Cursor, GitHub Copilot, Codeium, Tabnine, Replit, Codium, Sourcegraph Cody
     * **生图类**：Midjourney v6, DALL-E 3, Stable Diffusion XL, Adobe Firefly, Runway ML, Leonardo AI, Ideogram
     * **视频类**：Runway ML, Pika, Synthesia, D-ID, HeyGen, Kling AI, Stable Video Diffusion

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
