'use client'

import { useState, useRef, useEffect } from 'react'
import { Languages, Upload, X, Square, Sparkles, Trash2 } from 'lucide-react'

export default function TranslationPage() {
  const [inputText, setInputText] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [output, setOutput] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [errorState, setErrorState] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Command+Enter 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!isTranslating && (inputText.trim() || selectedImage)) {
          handleTranslate()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [inputText, selectedImage, isTranslating])

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 处理拖拽上传
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  // 移除图片
  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 停止翻译
  const stopTranslation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsTranslating(false)
    }
  }

  // 清空所有内容
  const handleClear = () => {
    setInputText('')
    setSelectedImage(null)
    setImageFile(null)
    setOutput('')
    setErrorState({ show: false, message: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 翻译处理
  const handleTranslate = async () => {
    if (!inputText.trim() && !selectedImage) return

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setIsTranslating(true)
    setOutput('')
    setErrorState({ show: false, message: '' })

    try {
      let response

      if (selectedImage) {
        // 图片翻译：调用 analyze-image API
        response = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64: selectedImage,
            imageAnalysisType: 'translation', // 翻译模式
            translationPrompt: '请识别这张图片中的所有文字，并将其翻译成中文。请保持排版逻辑，如果图片是设计图，请重点翻译界面上的文案。',
          }),
          signal: signal,
        })
      } else {
        // 文本翻译：调用 generate API
        const translationPrompt = `请作为一名资深设计师，将以下英文翻译成流畅、专业的中文。保留专业术语的英文原文（如 feasible 请根据语境翻译）。\n\n${inputText.trim()}`
        
        response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: translationPrompt,
            useTeamWisdom: false, // 翻译不需要知识库
          }),
          signal: signal,
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || '翻译失败')
      }

      const data = await response.json()

      if (data.success) {
        if (selectedImage) {
          // 图片翻译结果
          setOutput(data.data?.analysis || data.data?.translation || '翻译完成')
        } else {
          // 文本翻译结果
          setOutput(data.data?.response || '翻译完成')
        }
      } else {
        throw new Error(data.error || '翻译失败')
      }
    } catch (error: any) {
      // 如果是用户主动取消，不显示错误
      if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        setIsTranslating(false)
        abortControllerRef.current = null
        return
      }

      console.error('Translation error:', error)
      const errorMessage = error.message || '未知错误'
      let userFriendlyMessage = '连接信号微弱，正在尝试重新建立链路...'

      if (errorMessage.includes('401') ||
          errorMessage.includes('Unauthorized') ||
          errorMessage.includes('内部服务连接失败') ||
          errorMessage.includes('VPN') ||
          errorMessage.includes('timeout') ||
          errorMessage.includes('Timeout') ||
          errorMessage.includes('连接') ||
          errorMessage.includes('ECONNREFUSED')) {
        userFriendlyMessage = '内部服务连接失败，请检查 VPN 或 Key'
      } else if (errorMessage.includes('429')) {
        userFriendlyMessage = '请求过于频繁，稍候片刻...'
      } else if (errorMessage.includes('500')) {
        userFriendlyMessage = '服务暂时不可用，正在重试...'
      }

      setErrorState({
        show: true,
        message: userFriendlyMessage,
      })
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsTranslating(false)
        abortControllerRef.current = null
      }
    }
  }

  return (
    <div className="h-full bg-gemini-bg">
      <div className="h-full flex flex-col md:flex-row">
        {/* 左侧输入区 */}
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gemini-border flex flex-col">
          <div className="p-4 md:p-6 border-b border-gemini-border">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-lg font-semibold text-gemini-text flex items-center gap-2">
                <Languages size={18} className="md:w-5 md:h-5" />
                翻译助手
              </h2>
              {(inputText.trim() || selectedImage || output) && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-gemini-text-secondary hover:text-gemini-text transition-colors"
                >
                  <Trash2 size={14} />
                  清空
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 p-4 md:p-6 flex flex-col gap-4 overflow-auto">
            {/* 文本输入区 */}
            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-medium text-gemini-text mb-2">
                输入文本
              </label>
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="输入需要翻译的文本，或上传包含文字的图片..."
                className="flex-1 w-full px-4 py-3 bg-[#F5F5F5] text-gemini-text placeholder:text-gemini-text-secondary rounded-3xl 
                         focus:outline-none focus:ring-0 focus:shadow-gemini-focus focus:bg-white
                         resize-none text-sm transition-all"
              />
              <p className="text-xs text-gemini-text-secondary mt-2">
                提示：按 <kbd className="px-1.5 py-0.5 bg-gemini-surface rounded text-xs">⌘</kbd> + <kbd className="px-1.5 py-0.5 bg-gemini-surface rounded text-xs">Enter</kbd> 快速翻译
              </p>
            </div>

            {/* 图片上传区 */}
            <div>
              <label className="block text-sm font-medium text-gemini-text mb-2">
                上传图片（可选）
              </label>
              {!selectedImage ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gemini-border rounded-3xl p-12 
                           text-center cursor-pointer hover:border-black hover:bg-gemini-surface transition-all"
                >
                  <Upload size={32} className="mx-auto text-gemini-text-secondary mb-3" />
                  <p className="text-sm text-gemini-text mb-1">
                    点击上传或拖拽图片到此处
                  </p>
                  <p className="text-xs text-gemini-text-secondary">
                    支持 JPG、PNG、GIF 格式
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="上传的图片"
                    className="w-full rounded-3xl border border-gemini-border max-h-64 object-contain bg-gemini-surface"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-gemini-bg rounded-full 
                             shadow-gemini-sm hover:bg-gemini-surface-hover transition-colors"
                  >
                    <X size={16} className="text-gemini-text-secondary" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 md:p-6 border-t border-gemini-border">
            <button
              onClick={isTranslating ? stopTranslation : handleTranslate}
              disabled={(!inputText.trim() && !selectedImage) && !isTranslating}
              className={`
                flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-medium
                rounded-full transition-all w-full justify-center
                ${
                  (!inputText.trim() && !selectedImage) && !isTranslating
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-800 shadow-gemini-sm'
                }
              `}
            >
              {isTranslating ? (
                <>
                  <Square size={16} />
                  停止翻译
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  开始翻译
                </>
              )}
            </button>
          </div>
        </div>

        {/* 右侧输出区 */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="p-4 md:p-6 border-b border-gemini-border">
            <h2 className="text-base md:text-lg font-semibold text-gemini-text">
              翻译结果
            </h2>
          </div>
          <div className="flex-1 p-4 md:p-6 overflow-auto bg-gemini-surface rounded-2xl md:rounded-3xl m-2 md:m-4">
            {/* 错误提示卡片 */}
            {errorState.show && (
              <div className="mb-4 p-4 bg-gemini-bg border border-gemini-border rounded-3xl shadow-gemini-sm">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-gemini-text-secondary rounded-full animate-breathe"></div>
                  </div>
                  <p className="text-sm text-gemini-text flex-1">{errorState.message}</p>
                </div>
              </div>
            )}

            {/* 加载状态 */}
            {isTranslating && !output && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-8">
                    <div className="inline-flex items-center gap-3">
                      <span className="text-sm text-gemini-text-secondary">正在翻译</span>
                      <div className="flex gap-1.5 items-center">
                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-breathe" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-breathe" style={{ animationDelay: '300ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-breathe" style={{ animationDelay: '600ms' }}></div>
                      </div>
                    </div>
                  </div>
                  {/* 打字机光标效果 */}
                  <div className="inline-block w-0.5 h-6 bg-black animate-blink"></div>
                </div>
              </div>
            )}

            {/* 翻译结果 */}
            {output ? (
              <div className="prose prose-sm max-w-none">
                <div
                  className="text-sm text-gemini-text leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: output
                      .split('\n')
                      .map((line) => {
                        // 处理标题
                        if (line.match(/^## /)) {
                          return `<h2 class="text-base font-semibold text-gemini-text mt-4 mb-2">${line.replace(/^## /, '')}</h2>`
                        }
                        if (line.match(/^### /)) {
                          return `<h3 class="text-sm font-semibold text-gemini-text mt-3 mb-1.5">${line.replace(/^### /, '')}</h3>`
                        }
                        // 处理列表项
                        if (line.match(/^- /)) {
                          return `<div class="ml-4 mb-1">• ${line.replace(/^- /, '')}</div>`
                        }
                        if (line.match(/^\d+\. /)) {
                          return `<div class="ml-4 mb-1">${line}</div>`
                        }
                        // 处理粗体
                        if (line.trim()) {
                          return `<div class="mb-2">${line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gemini-text">$1</strong>')}</div>`
                        }
                        return '<br />'
                      })
                      .join(''),
                  }}
                />
              </div>
            ) : !isTranslating && !errorState.show ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Languages size={48} className="mx-auto text-gemini-text-secondary mb-4" />
                  <p className="text-sm text-gemini-text-secondary">
                    在左侧输入文本或上传图片，然后点击"开始翻译"
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
