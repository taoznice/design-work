import { NextRequest } from 'next/server'
import { createGeminiClient, checkAPIKey } from '@/lib/api-client'

// Vercel 超时配置：60秒（Pro 计划）
export const maxDuration = 60

function getCurrentMonthLabel(): string {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月`
}

function getLast4MonthsLabels(): string[] {
  const labels: string[] = []
  const now = new Date()
  for (let i = 0; i < 4; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(`${date.getFullYear()}年${date.getMonth() + 1}月`)
  }
  return labels
}

/** 构建 AI 简报系统提示（与前端期望的 JSON 结构一致） */
function buildSystemPrompt(last4MonthsLabels: string[]): string {
  return `你是一个对技术极度敏感的资深设计总监。请生成一份针对设计行业的 AI 情报简报。

**强制要求**：
1. **全中文输出**。
2. **严格 JSON 格式**：不包含 Markdown 标记。
3. **每日 AI 动态 (Daily News)**：必须返回 **5条**，每条包含 title, insight, tags, design_impact, potential_usage, url。只收录与设计行业强相关的内容，字段极度精简。
4. **月度AI趋势 (Monthly AI Trends)**：必须返回 **最近4个月**，使用系统提供的月度标签：${last4MonthsLabels.join(', ')}。每个元素包含 date_label 和 content（200-300字）。
5. **工具风向标 (ai_tools_rank)**：4个分类 comprehensive, coding, image_gen, video_gen，每个分类 **Top 10**，每项包含 rank, name, reason, last_update。必须包含主流工具（Cursor, Midjourney v6, Framer 等），排名基于客观数据。

**只返回纯 JSON**，不要任何 Markdown 代码块或解释。结构示例：
{
  "monthly_trends": [ { "date_label": "YYYY年M月", "content": "..." }, ... ],
  "daily_ai_news": [ { "title": "...", "insight": "...", "tags": [], "design_impact": "...", "potential_usage": "...", "url": "..." }, ... ],
  "ai_tools_rank": {
    "comprehensive": [ { "rank": 1, "name": "...", "reason": "...", "last_update": "..." }, ... ],
    "coding": [ ... ],
    "image_gen": [ ... ],
    "video_gen": [ ... ]
  }
}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { newsData } = body

    const currentMonthLabel = getCurrentMonthLabel()
    const last4MonthsLabels = getLast4MonthsLabels()

    if (!newsData || !Array.isArray(newsData) || newsData.length === 0) {
      return new Response(JSON.stringify({ error: '新闻数据不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!checkAPIKey('gemini').exists) {
      return new Response(
        JSON.stringify({
          error: 'API Key 未配置',
          message: '请在 .env.local 中设置 GOOGLE_API_KEY',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const newsListText = newsData
      .map((item: any, index: number) => `${index + 1}. ${item.title} - ${item.source} (${item.link})`)
      .join('\n')

    const systemPrompt = buildSystemPrompt(last4MonthsLabels)
    const userPrompt = `当前系统日期：${currentMonthLabel}\n\n这是从 RSS 源抓取到的最新科技新闻列表（可能包含英文内容）：\n\n${newsListText}\n\n请作为对技术极度敏感的资深设计总监，结合你的知识库，生成一份针对设计行业的 AI 情报简报。要求：1. 将英文翻译为中文；2. 严格筛选与设计行业强相关的新闻，生成 5 条 daily_ai_news；3. 生成 monthly_trends（最近4个月），使用月度标签：${last4MonthsLabels.join(', ')}；4. 生成 ai_tools_rank 四个子榜单各 Top 10。只返回纯 JSON，不要 Markdown。`

    const genAI = createGeminiClient()
    const model = genAI.getGenerativeModel({ model: 'gemini-3.0-flash' })

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          // 关键：立即发送 started，避免 Vercel/客户端 10 秒无首字节超时
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'started' })}\n\n`))

          const fullPrompt = systemPrompt + '\n\n' + userPrompt
          const result = await model.generateContentStream(fullPrompt)

          let fullText = ''
          for await (const chunk of result.stream) {
            try {
              const text = chunk.text()
              if (text) {
                fullText += text
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: text })}\n\n`)
                )
              }
            } catch (e) {
              // 忽略单 chunk 解析错误
            }
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done', fullText })}\n\n`)
          )
        } catch (error: any) {
          console.error('Stream error:', error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', error: error.message || '未知错误' })}\n\n`
            )
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('后端捕获到错误:', error)
    return new Response(
      JSON.stringify({
        error: error.message || '未知错误',
        details: error.stack,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
