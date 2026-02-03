'use client'

import { Send, Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 聚焦输入框
  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus()
    }
  }, [isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        let errorData: any = { error: '未知错误' }
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json()
          } else {
            const text = await response.text()
            errorData = { error: text || `请求失败 (${response.status})` }
          }
        } catch (parseError) {
          errorData = { error: `请求失败 (${response.status} ${response.statusText})` }
        }
        
        const errorMessage = errorData.error || errorData.details || `请求失败 (${response.status})`
        console.error('[Chat] API 错误:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })
        throw new Error(errorMessage)
      }

      // 处理流式响应
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('无法读取响应流')
      }

      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      }

      setMessages((prev) => [...prev, assistantMessage])

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          if (chunk) {
            assistantMessage.content += chunk
            // 更新消息内容
            setMessages((prev) => {
              const newMessages = [...prev]
              const lastMsg = newMessages[newMessages.length - 1]
              if (lastMsg && lastMsg.role === 'assistant' && lastMsg.id === assistantMessage.id) {
                lastMsg.content = assistantMessage.content
              }
              return newMessages
            })
          }
        }
      } catch (streamError: any) {
        console.error('Stream read error:', streamError)
        // 如果流式读取失败，保留已接收的部分内容
        if (assistantMessage.content.trim()) {
          // 如果已经有部分内容，保留它
          console.log('保留部分响应内容')
        } else {
          // 如果没有内容，移除助手消息
          setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessage.id))
        }
        throw new Error(`流式读取失败: ${streamError.message}`)
      }
    } catch (err: any) {
      const errorMessage = err.message || '发送消息失败，请重试'
      setError(errorMessage)
      console.error('Chat error:', err)
      // 如果出错，移除最后添加的用户消息和助手消息（因为 AI 没有回复）
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))
      // 恢复输入框内容，方便用户重试
      setInput(userMessage.content)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* 聊天消息区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.length === 0 && (
            <div className="text-center pt-20">
              <p className="text-gray-400 text-sm">开始对话...</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] ${
                  message.role === 'user'
                    ? 'text-right'
                    : 'text-left text-gray-600'
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {/* Loading 状态 */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">思考中...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div 
          className="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700 z-50 cursor-pointer"
          onClick={() => setError(null)}
        >
          错误：{error} (点击关闭)
        </div>
      )}

      {/* 输入框区域 */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入消息..."
              disabled={isLoading}
              className={`w-full px-4 py-3 pr-12 text-sm bg-transparent 
                       border-0 border-b-2 border-gray-200 
                       focus:outline-none focus:border-gray-900 
                       transition-colors
                       placeholder-gray-400
                       ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2
                       p-2 rounded-md
                       text-gray-400 hover:text-gray-900
                       disabled:opacity-30 disabled:cursor-not-allowed
                       transition-colors"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
