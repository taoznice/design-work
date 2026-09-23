import { NextResponse } from 'next/server'
import { workItems } from '@/content/portfolio'

// 本地 CMS 专用接口，仅在 localhost 使用，无需鉴权
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/works
 * 直接读取 portfolio.ts 中导出的 workItems，返回给管理后台前端渲染
 */
export async function GET() {
  try {
    return NextResponse.json({ workItems })
  } catch (error) {
    const message = error instanceof Error ? error.message : '读取作品列表失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
