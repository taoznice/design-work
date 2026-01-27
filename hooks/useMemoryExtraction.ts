'use client'

import { useState, useCallback } from 'react'

interface MemoryContext {
  userPreferences?: string[]
  projectContext?: string[]
  vocabulary?: string[]
}

interface Memory {
  context: MemoryContext
  enabled: boolean
}

interface MemorySuggestion {
  category: 'userPreferences' | 'projectContext' | 'vocabulary'
  oldValue?: string
  newValue: string
}

/**
 * 全局记忆提取 Hook
 * 用于在任何页面中监听用户输入和 AI 回复，自动提取记忆
 */
export function useMemoryExtraction() {
  const [suggestion, setSuggestion] = useState<MemorySuggestion | null>(null)

  /**
   * 提取记忆更新建议（后台静默执行，不阻塞用户）
   * @param userInput 用户输入内容
   * @param aiResponse AI 回复内容
   */
  const extractMemory = useCallback(async (
    userInput: string,
    aiResponse: string
  ) => {
    // 如果没有输入或回复，直接返回
    if (!userInput?.trim() || !aiResponse?.trim()) {
      return
    }

    // 读取当前记忆配置（仅在客户端）
    let currentMemory: Memory | null = null
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('team-dna')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed.context) {
            currentMemory = {
              context: parsed.context,
              enabled: parsed.enabled !== false,
            }
          }
        }
      } catch (e) {
        console.error('Failed to load memory:', e)
      }
    }

    // 如果记忆功能未启用，直接返回
    if (!currentMemory?.enabled) {
      return
    }

    // 后台静默分析（不阻塞用户）
    try {
      const response = await fetch('/api/extract-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userInput.trim(),
          aiResponse: aiResponse.trim(),
          currentMemory: currentMemory.context,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.suggestion) {
          setSuggestion(data.data.suggestion)
        }
      }
    } catch (error) {
      // 静默失败，不影响主流程
      console.error('Failed to extract memory update:', error)
    }
  }, [])

  /**
   * 确认保存记忆
   */
  const confirmMemory = useCallback(() => {
    if (!suggestion || typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('team-dna')
      if (!saved) return

      const memory: Memory = JSON.parse(saved)
      const updatedContext = { ...memory.context }
      const category = suggestion.category

      // 移除旧值（如果存在）
      if (suggestion.oldValue) {
        updatedContext[category] = (updatedContext[category] || []).filter(
          (item: string) => item !== suggestion.oldValue
        )
      }

      // 添加新值
      if (!updatedContext[category]?.includes(suggestion.newValue)) {
        if (!updatedContext[category]) {
          updatedContext[category] = []
        }
        updatedContext[category].push(suggestion.newValue)
      }

      const updatedMemory: Memory = {
        ...memory,
        context: updatedContext,
      }

      localStorage.setItem('team-dna', JSON.stringify(updatedMemory))
      setSuggestion(null)
    } catch (e) {
      console.error('Failed to update memory:', e)
    }
  }, [suggestion])

  /**
   * 忽略记忆建议
   */
  const ignoreMemory = useCallback(() => {
    setSuggestion(null)
  }, [])

  return {
    suggestion,
    extractMemory,
    confirmMemory,
    ignoreMemory,
  }
}
