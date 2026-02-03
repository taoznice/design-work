import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// 创建 OpenAI 客户端（使用阿里云通义千问）
function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  const baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY 未配置')
  }
  
  return new OpenAI({
    apiKey: apiKey,
    baseURL: baseUrl,
  })
}

// Vercel 超时配置
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imagesBase64, imageBase64, imageUrl } = body

    // 支持多图或单图
    const images = imagesBase64 || (imageBase64 ? [imageBase64] : [])

    if (images.length === 0 && !imageUrl) {
      return NextResponse.json(
        { error: '图片数据不能为空' },
        { status: 400 }
      )
    }

    // 限制最多 6 张图片
    if (images.length > 6) {
      return NextResponse.json(
        { error: '最多只能上传 6 张图片' },
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

    // 构建系统提示词 - 专注于风格特征提取
    const systemMessage = images.length > 1 
      ? `你是一个专业的视觉风格分析专家。你的任务是综合分析多张图片的**风格特征**，找出它们的共性和视觉风格特点。

**重要要求**：
1. 忽略图片中的具体内容（比如画的是猫还是狗，写的是什么文字）
2. 专注于提取**视觉风格特征**：配色方案、构图手法、视觉情绪、设计风格
3. 综合分析这几张图片的视觉风格、配色和构图共性
4. 必须返回 JSON 格式，包含以下字段：
   - title: 风格的简短名称（如"极简主义"、"赛博朋克"）
   - keywords: 风格关键词数组（如["极简", "黑白", "几何"]）
   - colorPalette: 主要配色的 Hex 代码数组（如["#000000", "#FFFFFF", "#FF0000"]）
   - mood: 视觉情绪（如"冷静"、"活泼"、"焦虑"）
   - composition: 构图手法分析（如"对称构图"、"黄金分割"、"留白为主"）

**输出格式**：必须是有效的 JSON 对象，不要包含任何 Markdown 格式或额外文字。`
      : `你是一个专业的视觉风格分析专家。你的任务是分析图片的**风格特征**，而不是具体内容。

**重要要求**：
1. 忽略图片中的具体内容（比如画的是猫还是狗，写的是什么文字）
2. 专注于提取**视觉风格特征**：配色方案、构图手法、视觉情绪、设计风格
3. 必须返回 JSON 格式，包含以下字段：
   - title: 风格的简短名称（如"极简主义"、"赛博朋克"）
   - keywords: 风格关键词数组（如["极简", "黑白", "几何"]）
   - colorPalette: 主要配色的 Hex 代码数组（如["#000000", "#FFFFFF", "#FF0000"]）
   - mood: 视觉情绪（如"冷静"、"活泼"、"焦虑"）
   - composition: 构图手法分析（如"对称构图"、"黄金分割"、"留白为主"）

**输出格式**：必须是有效的 JSON 对象，不要包含任何 Markdown 格式或额外文字。`

    const openai = createOpenAIClient()
    
    // 构建 content 数组
    const content: any[] = [
      {
        type: 'text',
        text: images.length > 1 
          ? '请综合分析这几张图片的视觉风格、配色和构图共性。忽略具体内容，专注于提取视觉风格、配色、构图和情绪。返回 JSON 格式。'
          : '请分析这张图片的风格特征，忽略具体内容，专注于提取视觉风格、配色、构图和情绪。返回 JSON 格式。'
      }
    ]
    
    // 添加多张图片
    if (images.length > 0) {
      for (const img of images) {
        const base64Data = img.includes(',') 
          ? img.split(',')[1] 
          : img
        
        content.push({
          type: 'image_url',
          image_url: {
            url: `data:image/jpeg;base64,${base64Data}`
          }
        })
      }
    } else if (imageUrl) {
      content.push({
        type: 'image_url',
        image_url: {
          url: imageUrl
        }
      })
    }

    const completion = await openai.chat.completions.create({
      model: 'qwen-vl-max',
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: content as any,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }, // 强制返回 JSON
    })

    const aiResponse = completion.choices[0]?.message?.content || ''

    if (!aiResponse) {
      throw new Error('API 返回的数据格式不正确')
    }

    // 解析 JSON 响应
    let parsedData
    try {
      // 尝试直接解析
      parsedData = JSON.parse(aiResponse)
    } catch (e) {
      // 如果失败，尝试提取 JSON 部分
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('无法解析 JSON 响应')
      }
    }

    // 验证和规范化数据
    const result = {
      title: parsedData.title || parsedData.style || '未命名风格',
      keywords: Array.isArray(parsedData.keywords) ? parsedData.keywords : 
                (parsedData.keywords ? [parsedData.keywords] : []),
      colorPalette: Array.isArray(parsedData.colorPalette) ? parsedData.colorPalette :
                     (parsedData.colors ? parsedData.colors : []),
      mood: parsedData.mood || parsedData.emotion || '',
      composition: parsedData.composition || parsedData.layout || '',
    }

    return NextResponse.json({
      success: true,
      data: result,
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
