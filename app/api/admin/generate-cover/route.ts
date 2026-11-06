import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

/**
 * AI 封面生成 API
 * 调用美团 AIGC 生图接口：无参考图走 /generations（文生图），有参考图走 /edits（JSON + raw base64，不支持 multipart）
 * 生成结果保存到 public/assets/work/[slug]/，返回可直接使用的站点路径
 * 鉴权使用用户自己的 AIGC_API_KEY（.env.local），Key 不进入代码库
 * 模型默认 gpt-image-1.5（gpt-image-2 需要单独的 AppId 配额），可用 AIGC_IMAGE_MODEL 覆盖
 */

const AIGC_BASE = 'https://aigc.sankuai.com/v1/openai/native/images'
const MODEL = process.env.AIGC_IMAGE_MODEL || 'gpt-image-1.5'
const ALLOWED_SIZES = ['1024x1024', '1536x1024', '1024x1536']

export async function POST(request: NextRequest) {
  try {
    // 生成结果要写入本地 public/ 目录，仅本地 dev server 可用；线上直接给出明确指引
    if (process.env.VERCEL) {
      return NextResponse.json(
        { error: '线上站点不支持 AI 生成封面。请在本地 localhost:3000/admin 操作，推送后线上会自动更新。' },
        { status: 403 },
      )
    }

    const apiKey = process.env.AIGC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: '未配置 AIGC_API_KEY：请在项目根目录 .env.local 中设置 AIGC_API_KEY=你的Key，然后重启 dev server' },
        { status: 400 },
      )
    }

    const { prompt, slug, referencePaths, size } = await request.json()
    if (!prompt || !slug) {
      return NextResponse.json({ error: 'prompt 和 slug 不能为空' }, { status: 400 })
    }

    // 封面默认横向 3:2，适配首页列表缩略图
    const coverSize = ALLOWED_SIZES.includes(size) ? size : '1536x1024'

    let endpoint = `${AIGC_BASE}/generations`
    const body: Record<string, unknown> = { model: MODEL, prompt, size: coverSize, quality: 'high' }

    if (Array.isArray(referencePaths) && referencePaths.length > 0) {
      const images = referencePaths.map((sitePath: string) => {
        const safePath = sitePath.replace(/^\/+/, '')
        const filePath = path.join(process.cwd(), 'public', safePath)
        if (!existsSync(filePath)) throw new Error(`参考图不存在：${safePath}`)
        return readFileSync(filePath).toString('base64')
      })
      body.image = images.length === 1 ? images[0] : images
      endpoint = `${AIGC_BASE}/edits`
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: `生图接口返回 ${response.status}：${text.slice(0, 300)}` }, { status: 502 })
    }

    const data = await response.json()
    const first = data?.data?.[0]

    let buffer: Buffer | null = null
    if (first?.b64_json) {
      buffer = Buffer.from(first.b64_json, 'base64')
    } else if (first?.url) {
      const imageResponse = await fetch(first.url)
      if (!imageResponse.ok) return NextResponse.json({ error: '生成图下载失败' }, { status: 502 })
      buffer = Buffer.from(await imageResponse.arrayBuffer())
    }
    if (!buffer) {
      return NextResponse.json({ error: '生图接口未返回图片' }, { status: 502 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'assets', 'work', slug)
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true })
    const fileName = `cover-gen-${Date.now()}.png`
    writeFileSync(path.join(uploadDir, fileName), buffer)

    return NextResponse.json({ success: true, path: `/assets/work/${slug}/${fileName}`, model: MODEL })
  } catch (error) {
    console.error('AI 封面生成失败:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : '生成失败' }, { status: 500 })
  }
}
