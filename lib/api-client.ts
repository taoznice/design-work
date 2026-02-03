/**
 * 统一的 API 客户端工具
 * 用于初始化 OpenAI 和 Google Gemini 客户端
 */

import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

// OpenAI 客户端配置（阿里云通义千问）
const OPENAI_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'

/**
 * 创建 OpenAI 客户端
 */
export function createOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    throw new Error('OPENAI_API_KEY 未配置，请在 .env.local 文件中设置')
  }
  
  return new OpenAI({
    apiKey,
    baseURL: OPENAI_BASE_URL,
  })
}

/**
 * 创建 Google Gemini 客户端
 */
export function createGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GOOGLE_API_KEY
  
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY 未配置，请在 .env.local 文件中设置')
  }
  
  return new GoogleGenerativeAI(apiKey)
}

/**
 * 检查 API Key 是否存在（用于调试）
 */
export function checkAPIKey(service: 'openai' | 'gemini'): { exists: boolean; prefix?: string } {
  const key = service === 'openai' 
    ? process.env.OPENAI_API_KEY 
    : process.env.GOOGLE_API_KEY
  
  if (!key || key === 'YOUR_API_KEY_HERE') {
    return { exists: false }
  }
  
  return { exists: true, prefix: key.substring(0, 3) }
}
