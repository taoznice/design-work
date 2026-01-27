import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

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
  {
    name: 'Fast Company Design',
    url: 'https://www.fastcompany.com/design/rss.xml',
  },
  {
    name: 'Designer News',
    url: 'https://www.designernews.co/?format=rss',
  },
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
    const allNews: NewsItem[] = []

    // 循环抓取所有 RSS 源
    for (const feed of RSS_FEEDS) {
      try {
        const feedData = await parser.parseURL(feed.url)
        
        if (feedData.items) {
          feedData.items.slice(0, 10).forEach((item) => {
            if (item.title && item.link) {
              allNews.push({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate || undefined,
                source: feed.name,
              })
            }
          })
        }
      } catch (error) {
        console.error(`Failed to fetch ${feed.name}:`, error)
        // 继续处理其他源
      }
    }

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
    console.error('News Fetch Error:', error)
    return NextResponse.json(
      {
        error: '获取新闻失败',
        details: error.message || '未知错误',
      },
      { status: 500 }
    )
  }
}
