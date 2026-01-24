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

// 获取当前日期并生成周度标签
function getCurrentWeekLabel(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 0-11 -> 1-12
  
  // 计算是第几周（简单算法：基于月份和日期）
  const firstDay = new Date(year, month - 1, 1)
  const dayOfWeek = firstDay.getDay() // 0-6, 0是周日
  const date = now.getDate()
  
  // 计算当前日期是本月第几周
  const weekNumber = Math.ceil((date + dayOfWeek) / 7)
  
  return `${year}年${month}月 第${weekNumber}周`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { newsData } = body
    
    // 获取当前系统日期
    const currentWeekLabel = getCurrentWeekLabel()

    if (!newsData || !Array.isArray(newsData) || newsData.length === 0) {
      return NextResponse.json(
        { error: '新闻数据不能为空' },
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

    // 构建新闻列表文本
    const newsListText = newsData
      .map((item: any, index: number) => `${index + 1}. ${item.title} - ${item.source} (${item.link})`)
      .join('\n')

    // 数据清洗函数：移除 Markdown 标记并解析 JSON
    const cleanAndParse = (text: string) => {
      try {
        // 移除可能存在的 Markdown 代码块包裹
        let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim()
        
        // 尝试提取 JSON 对象（如果被其他文本包裹）
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          cleanText = jsonMatch[0]
        }
        
        return JSON.parse(cleanText)
      } catch (e) {
        console.error('JSON Parse Error:', e)
        console.error('Raw response:', text)
        return null
      }
    }

    // 构建系统提示词
    const systemMessage = `你是一个对技术极度敏感的资深设计总监。请生成一份针对设计行业的 AI 情报简报。

**强制要求**：
1. **全中文输出**。
2. **严格 JSON 格式**：不包含 Markdown 标记。
3. **每日 AI 动态 (Daily News)**:
   - **数量**：必须返回 **6条**。
   - **筛选标准**：只收录与设计行业 **强相关** 的内容。例如：主流生成式模型(Midjourney, MJ, SD)的新版本发布、Adobe 等设计软件的 AI 功能更新、新的 AI 辅助设计工具、或者对设计工作流有直接影响的行业新闻。
   - **格式**：JSON 数组，包含 \`design_impact\` (设计影响) 和 \`potential_usage\` (利用空间)。

4. **工具风向标 (Tools Rank)**:
   - **数量**：4个分类（综合、Coding、生图、视频），每个分类必须返回 **Top 10**。
   - **新增字段**：每个工具必须包含 \`last_update\` (最新迭代时间，例如 '2024-01' 或 'V6.0')。

5. **数据结构**：
   严格返回以下 JSON (不要 Markdown):
   {
     "weekly_insight": { "date_label": "YYYY年M月W周", "content": "..." },
     "daily_ai_news": [
       // ... 6 items
       { "title": "...", "content": "...", "design_impact": "...", "potential_usage": "...", "url": "..." }
     ],
     "ai_tools_rank": {
       "comprehensive": [ { "rank": 1, "name": "...", "reason": "...", "last_update": "..." }, ... ], // 10 items
       "coding": [ ... ], // 10 items
       "image_gen": [ ... ], // 10 items
       "video_gen": [ ... ] // 10 items
     }
   }

**重要**：
- 只返回纯 JSON，不要任何 Markdown 代码块标记，不要任何解释文字。
- 所有文本内容必须为中文。
- daily_ai_news 必须严格筛选与设计行业强相关的新闻，必须返回 6 条。
- ai_tools_rank 每个分类必须返回 Top 10，每个工具必须包含 last_update 字段。
- weekly_insight.date_label 必须使用系统提供的当前日期，不要使用其他日期。`

    const openai = createOpenAIClient()

    const completion = await openai.chat.completions.create({
      model: 'qwen3-vl-plus',
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: `当前系统日期：${currentWeekLabel}\n\n这是从 RSS 源抓取到的最新科技新闻列表（可能包含英文内容）：\n\n${newsListText}\n\n请作为对技术极度敏感的资深设计总监，结合你的知识库，生成一份针对设计行业的 AI 情报简报。要求：
1. 将所有英文内容翻译为流畅的中文
2. 严格筛选与设计行业强相关的新闻，生成 **6条** daily_ai_news，每条必须包含：
   - title: 新闻标题（中文）
   - content: 新闻简介（中文）
   - design_impact: 对设计行业的具体影响（核心分析）
   - potential_usage: 设计师可以用它做什么（发散思维）
   - url: 新闻原文链接（如果原始新闻列表中有链接，请使用该链接；如果没有，请留空字符串 ""）
   - 筛选标准：只收录与设计行业强相关的内容，如主流生成式模型(Midjourney, MJ, SD)的新版本发布、Adobe 等设计软件的 AI 功能更新、新的 AI 辅助设计工具、或者对设计工作流有直接影响的行业新闻
3. 生成 weekly_insight，包含：
   - date_label: 必须使用 "${currentWeekLabel}"（这是当前系统日期，不要使用其他日期）
   - content: 200字左右的深度趋势总结
4. 生成 ai_tools_rank，包含 4 个子榜单，每个榜单 **Top 10**，每个工具必须包含：
   - rank: 排名
   - name: 工具名称（中文）
   - reason: 推荐理由（中文）
   - last_update: 最新迭代时间（例如 '2024-01' 或 'V6.0'）
   - comprehensive: 综合AI榜单 (10 items)
   - coding: AI Coding榜单 (10 items)
   - image_gen: AI生图榜单 (10 items)
   - video_gen: AI视频榜单 (10 items)

所有内容必须为中文。只返回纯 JSON 格式，不要包含任何 Markdown 标记。`,
        },
      ],
      temperature: 0.3, // 降低温度以获得更稳定的 JSON 输出
      max_tokens: 5000, // 增加 token 限制以支持更多内容（6条新闻 + 40个工具）
      response_format: { type: 'json_object' }, // 强制 JSON 格式
    })

    const aiResponse = completion.choices[0]?.message?.content || ''

    if (!aiResponse) {
      throw new Error('API 返回的数据格式不正确')
    }

    // 使用清洗函数解析 JSON
    const parsedData = cleanAndParse(aiResponse)

    if (!parsedData) {
      throw new Error('无法解析 JSON 响应，响应内容可能包含格式错误')
    }

    // 验证数据结构
    if (!parsedData.daily_ai_news || !Array.isArray(parsedData.daily_ai_news)) {
      throw new Error('返回数据格式不正确：缺少 daily_ai_news 字段或格式错误')
    }
    if (!parsedData.weekly_insight || typeof parsedData.weekly_insight !== 'object' || 
        !parsedData.weekly_insight.date_label || !parsedData.weekly_insight.content) {
      throw new Error('返回数据格式不正确：缺少 weekly_insight 字段或格式错误')
    }
    if (!parsedData.ai_tools_rank || typeof parsedData.ai_tools_rank !== 'object') {
      throw new Error('返回数据格式不正确：缺少 ai_tools_rank 字段或格式错误')
    }
    // 验证 ai_tools_rank 的子榜单
    const requiredSubRanks = ['comprehensive', 'coding', 'image_gen', 'video_gen']
    for (const subRank of requiredSubRanks) {
      if (!parsedData.ai_tools_rank[subRank] || !Array.isArray(parsedData.ai_tools_rank[subRank])) {
        throw new Error(`返回数据格式不正确：缺少 ai_tools_rank.${subRank} 字段或格式错误`)
      }
      // 验证每个工具是否包含 last_update 字段
      for (const tool of parsedData.ai_tools_rank[subRank]) {
        if (!tool.last_update || typeof tool.last_update !== 'string') {
          throw new Error(`返回数据格式不正确：ai_tools_rank.${subRank} 中的工具缺少 last_update 字段`)
        }
      }
    }
    // 验证 daily_ai_news 数量
    if (parsedData.daily_ai_news.length !== 6) {
      console.warn(`警告：daily_ai_news 数量为 ${parsedData.daily_ai_news.length}，期望为 6`)
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    })
  } catch (error: any) {
    console.error('News Analyze API Error:', error)
    
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
    } else if (error.message?.includes('429')) {
      errorMessage = 'API 请求频率过高'
      errorDetails = '请稍后再试，或检查你的 API 配额'
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
