'use client'

import { useEffect } from 'react'
import { Check, X, Brain } from 'lucide-react'

interface MemorySuggestion {
  category: 'userPreferences' | 'projectContext' | 'vocabulary'
  oldValue?: string
  newValue: string
}

interface MemoryToastProps {
  suggestion: MemorySuggestion | null
  onConfirm: () => void
  onIgnore: () => void
  onClose: () => void
}

export default function MemoryToast({ 
  suggestion, 
  onConfirm, 
  onIgnore,
  onClose 
}: MemoryToastProps) {
  // 自动关闭（5秒后）
  useEffect(() => {
    if (suggestion) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [suggestion, onClose])

  if (!suggestion) return null

  const categoryLabels = {
    userPreferences: '用户偏好',
    projectContext: '项目背景',
    vocabulary: '专用术语',
  }

  const categoryLabel = categoryLabels[suggestion.category]

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-gemini-bg border border-gemini-border rounded-2xl shadow-gemini-md p-4 w-80 max-w-[calc(100vw-2rem)]">
        {/* 标题 */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gemini-text mb-1">
              检测到新的使用习惯
            </h3>
            <p className="text-xs text-gemini-text-secondary">
              是否沉淀为记忆？
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gemini-text-secondary hover:text-gemini-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* 记忆内容 */}
        <div className="mb-4 p-3 bg-gemini-surface rounded-xl border border-gemini-border">
          <div className="text-xs text-gemini-text-secondary mb-1">
            {categoryLabel}
          </div>
          {suggestion.oldValue && (
            <div className="text-xs text-gemini-text-secondary mb-1 line-through">
              旧值：{suggestion.oldValue}
            </div>
          )}
          <div className="text-sm text-gemini-text font-medium">
            记忆：{suggestion.newValue}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
          >
            <Check size={16} />
            确认保存
          </button>
          <button
            onClick={onIgnore}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gemini-surface text-gemini-text-secondary text-sm font-medium rounded-full hover:bg-gemini-surface-hover transition-colors"
          >
            <X size={16} />
            忽略
          </button>
        </div>
      </div>
    </div>
  )
}
