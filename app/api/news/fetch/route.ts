import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'

const parser = new Parser()

// 定义 RSS 源
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
]

interface NewsItem {
  title: string
  link: string
  pubDate?: string
  source: string
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

    // 按日期排序（最新的在前），取前 20 条
    const sortedNews = allNews
      .sort((a, b) => {
        if (a.pubDate && b.pubDate) {
          return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        }
        return 0
      })
      .slice(0, 20)

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
