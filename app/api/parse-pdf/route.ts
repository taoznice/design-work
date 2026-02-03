import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore - pdf-parse 没有类型声明
import pdfParse from 'pdf-parse'

// Vercel 超时配置
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: '文件不能为空' },
        { status: 400 }
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: '只支持 PDF 文件' },
        { status: 400 }
      )
    }

    // 检查文件大小（限制 10MB）
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'PDF 文件大小不能超过 10MB' },
        { status: 400 }
      )
    }

    // 读取文件内容
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 解析 PDF
    const data = await pdfParse(buffer)
    const fullText = data.text

    // 截取前 10,000 个字符（防止 Token 溢出）
    const MAX_LENGTH = 10000
    const truncatedText = fullText.length > MAX_LENGTH 
      ? fullText.substring(0, MAX_LENGTH) 
      : fullText

    const isTruncated = fullText.length > MAX_LENGTH

    return NextResponse.json({
      success: true,
      data: {
        text: truncatedText,
        isTruncated,
        originalLength: fullText.length,
        truncatedLength: truncatedText.length,
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
