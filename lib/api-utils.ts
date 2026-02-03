/**
 * API 路由通用工具函数
 * 统一错误处理、响应格式等
 */

import { NextResponse } from 'next/server'

/**
 * 统一的错误响应格式
 */
export interface ApiError {
  error: string
  details?: string
  message?: string
}

/**
 * 创建标准错误响应
 */
export function createErrorResponse(
  error: string,
  details?: string,
  status: number = 500
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error,
      ...(details && { details }),
    },
    { status }
  )
}

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(data: T): NextResponse<{ success: true; data: T }> {
  return NextResponse.json({
    success: true,
    data,
  })
}

/**
 * 安全解析 JSON 请求体
 */
export async function safeParseJSON<T = any>(request: Request): Promise<{ data?: T; error?: ApiError }> {
  try {
    const data = await request.json()
    return { data }
  } catch (error: any) {
    return {
      error: {
        error: '请求数据格式错误',
        details: '无法解析请求体 JSON 数据',
      },
    }
  }
}

/**
 * 创建流式响应
 */
export function createStreamResponse(stream: ReadableStream): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

/**
 * 处理 Gemini 流式响应
 */
export function handleGeminiStream(
  geminiStream: AsyncIterable<any>,
  onComplete?: (fullText: string) => void
): ReadableStream {
  const encoder = new TextEncoder()
  let fullText = ''
  
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of geminiStream) {
          try {
            const text = chunk.text()
            if (text) {
              fullText += text
              controller.enqueue(encoder.encode(text))
            }
          } catch (chunkError: any) {
            console.warn('[Stream] 处理 chunk 时出错:', chunkError.message)
          }
        }
        
        if (onComplete) {
          onComplete(fullText)
        }
        
        controller.close()
      } catch (error: any) {
        console.error('[Stream] 流式处理错误:', error)
        controller.enqueue(encoder.encode(`\n\n[错误: ${error.message}]`))
        controller.close()
      }
    },
  })
}
