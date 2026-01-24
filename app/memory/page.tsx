'use client'

import { useState, useEffect, useRef } from 'react'
import { Save, Plus, X } from 'lucide-react'

// 记忆标签列表组件
function MemoryTagList({ 
  items, 
  onAdd, 
  onRemove 
}: { 
  items: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
}) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue)
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="space-y-3">
      {/* 标签列表 */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gemini-surface text-gemini-text rounded-full text-sm border border-gemini-border"
            >
              {item}
              <button
                onClick={() => onRemove(index)}
                className="hover:bg-gemini-surface-hover rounded-full p-0.5 transition-colors"
              >
                <X size={12} className="text-gemini-text-secondary" />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* 输入框 */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入新项目，按 Enter 添加"
          className="flex-1 px-4 py-2 bg-[#F5F5F5] text-gemini-text placeholder:text-gemini-text-secondary rounded-full 
                   focus:outline-none focus:ring-0 focus:shadow-gemini-focus focus:bg-white
                   text-sm transition-all"
        />
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

// 新的简化记忆数据结构
interface MemoryContext {
  userPreferences: string[] // 用户偏好，如：黑白风格、极简主义、不写代码
  projectContext: string[] // 当前项目背景，如：正在做SaaS后台、移动端改版
  vocabulary: string[] // 专用术语，如：Team DNA, 内部黑话
}

interface Memory {
  context: MemoryContext
  enabled: boolean // 记忆开关状态
}

const defaultMemory: Memory = {
  context: {
    userPreferences: [],
    projectContext: [],
    vocabulary: [],
  },
  enabled: true, // 默认开启
}

export default function MemoryPage() {
  const [memory, setMemory] = useState<Memory>(defaultMemory)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle')

  // 从 LocalStorage 加载数据
  useEffect(() => {
    const saved = localStorage.getItem('team-dna')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // 兼容旧数据结构
        if (parsed.context) {
          // 新格式
          setMemory({
            context: {
              userPreferences: parsed.context.userPreferences || [],
              projectContext: parsed.context.projectContext || [],
              vocabulary: parsed.context.vocabulary || [],
            },
            enabled: parsed.enabled !== undefined ? parsed.enabled : true,
          })
        } else {
          // 旧格式，迁移到新格式
          const newContext: MemoryContext = {
            userPreferences: [],
            projectContext: [],
            vocabulary: [],
          }
          // 尝试从旧数据中提取信息
          if (parsed.corePrinciples) {
            newContext.userPreferences.push(parsed.corePrinciples)
          }
          if (parsed.strategicFocus) {
            newContext.projectContext.push(parsed.strategicFocus)
          }
          setMemory({
            context: newContext,
            enabled: true,
          })
        }
      } catch (e) {
        console.error('Failed to load memory:', e)
        setMemory(defaultMemory)
      }
    } else {
      // 首次加载，使用默认值
      setMemory(defaultMemory)
    }
  }, [])

  // 保存到 LocalStorage
  const handleSave = () => {
    setIsSaving(true)
    try {
      localStorage.setItem('team-dna', JSON.stringify(memory))
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (e) {
      console.error('Failed to save memory:', e)
    } finally {
      setIsSaving(false)
    }
  }

  // 添加项目到数组
  const handleAddItem = (category: keyof MemoryContext, value: string) => {
    if (!value.trim()) return
    setMemory((prev) => ({
      ...prev,
      context: {
        ...prev.context,
        [category]: [...prev.context[category], value.trim()],
      },
    }))
  }

  // 删除项目
  const handleRemoveItem = (category: keyof MemoryContext, index: number) => {
    setMemory((prev) => ({
      ...prev,
      context: {
        ...prev.context,
        [category]: prev.context[category].filter((_, i) => i !== index),
      },
    }))
  }

  // 切换记忆开关
  const handleToggleEnabled = () => {
    setMemory((prev) => ({ ...prev, enabled: !prev.enabled }))
  }

  return (
    <div className="h-full bg-gemini-bg">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gemini-text mb-2">
                Memory (记忆库)
              </h1>
              <p className="text-sm text-gemini-text-secondary">
                AI 会主动学习你的偏好和项目背景，让回复更贴合你的需求
              </p>
            </div>
            {/* 记忆开关 */}
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm font-medium text-gemini-text">
                {memory.enabled ? '✅' : '🚫'} 启用记忆
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={memory.enabled}
                  onChange={handleToggleEnabled}
                  className="sr-only"
                />
                <div
                  className={`
                    w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
                    ${memory.enabled ? 'bg-black' : 'bg-gray-300'}
                  `}
                >
                  <div
                    className={`
                      absolute top-0.5 left-0.5 w-5 h-5 bg-gemini-bg rounded-full shadow-gemini-sm
                      transition-transform duration-200 ease-in-out
                      ${memory.enabled ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-8">
          {/* 用户偏好 */}
          <div>
            <label className="block text-sm font-medium text-gemini-text mb-2">
              用户偏好 (User Preferences)
            </label>
            <p className="text-xs text-gemini-text-secondary mb-3">
              例如：黑白风格、极简主义、不写代码、偏好圆角设计...
            </p>
            <MemoryTagList
              items={memory.context.userPreferences}
              onAdd={(value) => handleAddItem('userPreferences', value)}
              onRemove={(index) => handleRemoveItem('userPreferences', index)}
            />
          </div>

          {/* 项目背景 */}
          <div>
            <label className="block text-sm font-medium text-gemini-text mb-2">
              项目背景 (Project Context)
            </label>
            <p className="text-xs text-gemini-text-secondary mb-3">
              例如：正在做SaaS后台、移动端改版、B端产品优化...
            </p>
            <MemoryTagList
              items={memory.context.projectContext}
              onAdd={(value) => handleAddItem('projectContext', value)}
              onRemove={(index) => handleRemoveItem('projectContext', index)}
            />
          </div>

          {/* 专用术语 */}
          <div>
            <label className="block text-sm font-medium text-gemini-text mb-2">
              专用术语 (Vocabulary)
            </label>
            <p className="text-xs text-gemini-text-secondary mb-3">
              例如：Team DNA、内部黑话、团队专用术语...
            </p>
            <MemoryTagList
              items={memory.context.vocabulary}
              onAdd={(value) => handleAddItem('vocabulary', value)}
              onRemove={(index) => handleRemoveItem('vocabulary', index)}
            />
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="mt-8 pt-6 border-t border-gemini-border">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`
              flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-medium
              rounded-full transition-all shadow-gemini-sm
              ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}
              ${saveStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : ''}
            `}
          >
            <Save size={16} />
            {saveStatus === 'success' ? '已保存' : '保存记忆'}
          </button>
        </div>
      </div>
    </div>
  )
}
