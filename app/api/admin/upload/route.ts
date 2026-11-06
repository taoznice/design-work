import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

/**
 * 素材上传 API
 * 接收 multipart/form-data，将图片/视频保存到 public/assets/work/[slug]/ 目录
 * 返回可直接在前台使用的素材路径
 */
export async function POST(request: NextRequest) {
  try {
    // 上传需要写本地 public/ 目录，仅本地 dev server 可用；线上直接给出明确指引
    if (process.env.VERCEL) {
      return NextResponse.json(
        { error: '线上站点不支持上传素材。请在本地 localhost:3000/admin 操作，推送后线上会自动更新。' },
        { status: 403 },
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const slug = formData.get('slug') as string | null

    if (!file || !slug) {
      return NextResponse.json({ error: '缺少文件或 slug 参数' }, { status: 400 })
    }

    // 验证文件类型：图片 + 视频
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '不支持的文件类型，仅支持 PNG/JPEG/WebP/GIF/MP4/WebM/MOV' }, { status: 400 })
    }

    // 生成文件名：时间戳 + 原始扩展名
    const ext = file.name.split('.').pop() || 'png'
    const fileName = `${Date.now()}.${ext}`

    // 确保目录存在
    const dir = path.join(process.cwd(), 'public', 'assets', 'work', slug)
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    // 写入文件
    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(dir, fileName)
    await writeFile(filePath, buffer)

    // 返回可用于页面引用的路径
    const publicPath = `/assets/work/${slug}/${fileName}`
    return NextResponse.json({ success: true, path: publicPath })
  } catch (err) {
    const message = err instanceof Error ? err.message : '上传失败'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
