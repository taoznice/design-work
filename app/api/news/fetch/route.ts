import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'

// 配置自定义 fetch，添加 User-Agent headers 以避免被拒绝
const customFetch = async (url: string, options?: any) => {
  return fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      ...options?.headers,
    },
  })
}

// 配置 parser 使用自定义 fetch
const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail'],
  },
  requestOptions: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/xml, text/xml, */*',
    },
  },
})

// 定义 RSS 源（多源聚合）
const RSS_FEEDS = [
  {
    name: 'Wired Design',
    url: 'https://www.wired.com/feed/rss',
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
  },
  // Fast Company Design RSS feed 已不可用，暂时移除
  // {
  //   name: 'Fast Company Design',
  //   url: 'https://www.fastcompany.com/co-design/rss',
  // },
  // Designer News 网站可能已不可用，暂时注释
  // {
  //   name: 'Designer News',
  //   url: 'https://www.designernews.co/?format=rss',
  // },
  {
    name: 'Smashing Magazine',
    url: 'https://www.smashingmagazine.com/feed/',
  },
  {
    name: 'Awwwards',
    url: 'https://www.awwwards.com/blog.rss',
  },
  {
    name: 'Creative Bloq',
    url: 'https://www.creativebloq.com/feeds/rss',
  },
]

// 设计相关关键词池（用于权重计算）
const DESIGN_KEYWORDS = [
  'Design', 'UX', 'UI', 'Creative', 'Figma', 'Product', 'Visual',
  'Interface', 'User Experience', 'User Interface', 'Prototype',
  'Wireframe', 'Mockup', 'Design System', 'Typography', 'Layout',
  'Branding', 'Illustration', 'Animation', 'Interaction', 'Usability',
  'Accessibility', 'Responsive', 'Mobile Design', 'Web Design',
  'Graphic Design', 'Industrial Design', 'Service Design'
]

interface NewsItem {
  title: string
  link: string
  pubDate?: string
  source: string
  weightScore?: number // 新增：权重分数
}

// 计算新闻的相关性权重分数
function calculateWeightScore(news: NewsItem): number {
  let score = 0
  const titleLower = news.title.toLowerCase()
  const sourceLower = news.source.toLowerCase()
  
  // 检查标题中是否包含关键词
  for (const keyword of DESIGN_KEYWORDS) {
    const keywordLower = keyword.toLowerCase()
    if (titleLower.includes(keywordLower)) {
      // 关键词在标题中出现，权重更高
      score += 10
    }
  }
  
  // 设计相关源的基础权重加成
  const designSources = ['design', 'creative', 'smashing', 'awwwards', 'figma']
  if (designSources.some(ds => sourceLower.includes(ds))) {
    score += 5
  }
  
  return score
}

export async function GET(request: NextRequest) {
  try {
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时

      try {
        const response = await customFetch(feed.url, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const text = await response.text()
        const feedData = await parser.parseString(text)

        if (!feedData.items) return []

        return feedData.items.slice(0, 10).flatMap((item) => {
          if (!item.title || !item.link) return []
          return [{
            title: item.title,
            link: item.link,
            pubDate: item.pubDate || undefined,
            source: feed.name,
          }]
        })
      } catch (error: any) {
        clearTimeout(timeoutId)
        if (error.name === 'AbortError') {
          console.error(`获取 ${feed.name} 失败：请求超时`)
        } else {
          console.error(`获取 ${feed.name} 失败：`, error)
        }
        return []
      }
    })

    const results = await Promise.allSettled(feedPromises)
    const allNews: NewsItem[] = results.flatMap((result) =>
      result.status === 'fulfilled' ? result.value : []
    )

    // 计算每条新闻的权重分数
    const newsWithWeight = allNews.map(news => ({
      ...news,
      weightScore: calculateWeightScore(news),
    }))

    // 混合排序：权重分（高->低）+ 发布时间（新->旧）
    const sortedNews = newsWithWeight
      .sort((a, b) => {
        // 首先按权重分数排序（高权重在前）
        if (a.weightScore !== b.weightScore) {
          return (b.weightScore || 0) - (a.weightScore || 0)
        }
        
        // 权重相同，按发布时间排序（新->旧）
        if (a.pubDate && b.pubDate) {
          return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        }
        
        // 如果只有一条有日期，有日期的排在前面
        if (a.pubDate && !b.pubDate) return -1
        if (!a.pubDate && b.pubDate) return 1
        
        return 0
      })
      .slice(0, 30) // 增加到30条，确保有足够的数据供AI筛选

    return NextResponse.json({
      success: true,
      data: {
        news: sortedNews,
        total: sortedNews.length,
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
