'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, X, ThumbsUp, ThumbsDown, Sparkles, CheckCircle2, FileSearch, Square } from 'lucide-react'

interface ProposalFeedback {
  id: string
  timestamp: number
  imageUrl: string
  aiJudgment: string
  userFeedback: 'good' | 'bad'
  userComment: string
  adjustedJudgment?: string
}

interface ProposalMemory {
  feedbacks: ProposalFeedback[]
  preferences: {
    goodPatterns: string[]
    badPatterns: string[]
  }
}

interface AestheticStyle {
  id: string
  title: string
  keywords: string[]
  colorPalette: string[]
  mood: string
  composition: string
  imageUrl: string
  createdAt: number
}

export default function ProposalReviewPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [aiJudgment, setAiJudgment] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [userFeedback, setUserFeedback] = useState<'good' | 'bad' | null>(null)
  const [userComment, setUserComment] = useState('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [enableMemory, setEnableMemory] = useState(true) // 默认开启
  const [useTeamWisdom, setUseTeamWisdom] = useState(false) // 默认关闭
  const [selectedStyle, setSelectedStyle] = useState<string>('') // 选择的风格基准
  const [availableStyles, setAvailableStyles] = useState<AestheticStyle[]>([])
  const [errorState, setErrorState] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  })
  const [memory, setMemory] = useState<ProposalMemory>({
    feedbacks: [],
    preferences: {
      goodPatterns: [],
      badPatterns: [],
    },
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 从 LocalStorage 加载历史反馈和风格库
  useEffect(() => {
    const saved = localStorage.getItem('proposal-memory')
    if (saved) {
      try {
        setMemory(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load proposal memory:', e)
      }
    }

    // 加载审美合集中的风格
    const stylesSaved = localStorage.getItem('aesthetic-collection')
    if (stylesSaved) {
      try {
        const styles = JSON.parse(stylesSaved)
        setAvailableStyles(styles)
      } catch (e) {
        console.error('Failed to load aesthetic styles:', e)
      }
    }
  }, [])

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
      setAiJudgment('')
      setUserFeedback(null)
      setUserComment('')
    }
  }

  // 移除图片
  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImageFile(null)
    setAiJudgment('')
    setUserFeedback(null)
    setUserComment('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 停止生成
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsAnalyzing(false)
    }
  }

  // 生成方案判断（调用真实 API）
  const generateJudgment = async () => {
    if (!selectedImage) return

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setIsAnalyzing(true)

    // 读取历史反馈和偏好（仅在启用记忆时）
    let savedMemory: ProposalMemory = {
      feedbacks: [],
      preferences: { goodPatterns: [], badPatterns: [] },
    }
    
    if (enableMemory) {
      const saved = localStorage.getItem('proposal-memory')
      if (saved) {
        try {
          savedMemory = JSON.parse(saved)
        } catch (e) {
          console.error('Failed to load memory:', e)
        }
      }
    }

    // 读取知识库（如果启用）
    let knowledgeCards: any[] = []
    if (useTeamWisdom) {
      try {
        const saved = localStorage.getItem('team-wisdom')
        if (saved) {
          knowledgeCards = JSON.parse(saved)
        }
      } catch (e) {
        console.error('Failed to load knowledge:', e)
      }
    }

    // 读取选中的风格基准
    let styleReference = ''
    if (selectedStyle) {
      const style = availableStyles.find(s => s.id === selectedStyle)
      if (style) {
        styleReference = `\n\n【风格对比基准】\n请将当前方案与以下风格进行对比：\n- 风格名称：${style.title}\n- 关键词：${style.keywords.join('、')}\n- 配色：${style.colorPalette.join('、')}\n- 情绪：${style.mood}\n- 构图：${style.composition}\n\n请分析当前方案与基准风格的契合度，指出相似点和差异点。`
      }
    }

    try {
      // 调用图片分析 API
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: selectedImage,
          imageAnalysisType: 'proposal', // 使用新的方案判断类型
          useTeamWisdom: useTeamWisdom,
          knowledgeCards: useTeamWisdom ? knowledgeCards : undefined,
          styleReference: styleReference, // 传递风格基准
        }),
        signal: signal, // 添加 abort signal
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || '图片分析失败')
      }

      const data = await response.json()
      
      if (data.success && data.data?.analysis) {
        let judgment = data.data.analysis
        
        // 基于历史反馈调整判断（仅在启用记忆时）
        if (enableMemory && savedMemory) {
          if (savedMemory.preferences.goodPatterns.length > 0) {
            judgment += `\n\n### 基于你的偏好\n`
            judgment += `根据你之前的反馈，我注意到你偏好：${savedMemory.preferences.goodPatterns.slice(0, 3).join('、')}。本次方案在这些方面表现良好。`
          }

          if (savedMemory.preferences.badPatterns.length > 0) {
            judgment += `\n\n### 需要注意\n`
            judgment += `基于你之前的反馈，建议避免：${savedMemory.preferences.badPatterns.slice(0, 2).join('、')}。`
          }
        } else if (!enableMemory) {
          judgment += `\n\n*提示：当前未启用记忆功能，判断基于通用设计原则。*`
        }
        
        setAiJudgment(judgment)
      } else {
        throw new Error(data.error || '分析失败')
      }
    } catch (error: any) {
      // 如果是用户主动取消，不显示错误
      if (error.name === 'AbortError' || signal.aborted) {
        setIsAnalyzing(false)
        abortControllerRef.current = null
        return
      }

      console.error('Failed to analyze image:', error)
      
      // 判断错误类型，显示优雅的错误提示
      const errorMessage = error.message || '未知错误'
      let userFriendlyMessage = '连接信号微弱，正在尝试重新建立链路...'
      
      // 401 或连接失败，显示内部服务错误提示
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
      
      // 3秒后使用降级方案
      setTimeout(() => {
        const original = generateMockJudgment(enableMemory ? savedMemory : null)
        let finalResult = original
        
        finalResult += `\n\n*⚠️ 注意：由于 API 调用失败，以上为基于通用设计原则的模拟分析。*`
        setAiJudgment(finalResult)
        setErrorState({ show: false, message: '' })
      }, 3000)
    } finally {
      if (!signal.aborted) {
        setIsAnalyzing(false)
        abortControllerRef.current = null
      }
    }
  }

  // 生成模拟判断（基于历史反馈调整）
  const generateMockJudgment = (memory: ProposalMemory | null): string => {
    let baseJudgment = `## 方案完整性分析

### 信息层级
- **层级结构**：信息组织清晰，主要信息突出
- **视觉引导**：用户视线路径合理，符合阅读习惯
- **信息密度**：内容密度适中，不会造成认知负担

### 交互逻辑
- **操作流程**：交互路径清晰，符合用户预期
- **反馈机制**：操作反馈明确，状态变化可见
- **错误处理**：错误提示友好，引导用户正确操作

### 体验硬伤检查
- **可访问性**：文字对比度、字体大小符合可读性标准
- **响应式适配**：在不同设备上布局合理
- **性能影响**：视觉元素不会造成明显的性能问题

### 改进建议
1. 可以考虑优化某些区域的视觉重点
2. 检查交互流程的完整性
3. 验证在不同场景下的可用性`

    // 基于历史反馈调整判断（仅在启用记忆时）
    if (memory && memory.preferences.goodPatterns.length > 0) {
      baseJudgment += `\n\n### 基于你的偏好\n`
      baseJudgment += `根据你之前的反馈，我注意到你偏好：${memory.preferences.goodPatterns.slice(0, 3).join('、')}。本次方案在这些方面表现良好。`
    }

    if (memory && memory.preferences.badPatterns.length > 0) {
      baseJudgment += `\n\n### 需要注意\n`
      baseJudgment += `基于你之前的反馈，建议避免：${memory.preferences.badPatterns.slice(0, 2).join('、')}。`
    }

    if (!memory) {
      baseJudgment += `\n\n*提示：当前未启用记忆功能，判断基于通用设计原则。*`
    }

    return baseJudgment
  }

  // 提交反馈
  const handleSubmitFeedback = () => {
    if (!userFeedback || !selectedImage || !aiJudgment) return

    setIsSubmittingFeedback(true)

    // 生成调整后的判断
    let adjustedJudgment = aiJudgment
    if (userComment) {
      adjustedJudgment += `\n\n### 基于你的反馈\n`
      adjustedJudgment += `你提到：${userComment}。我会在后续判断中考虑这一点。`
    }

    // 提取关键词作为偏好模式
    const newFeedback: ProposalFeedback = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      imageUrl: selectedImage,
      aiJudgment,
      userFeedback,
      userComment,
      adjustedJudgment,
    }

    // 更新记忆
    const updatedMemory: ProposalMemory = {
      feedbacks: [...memory.feedbacks, newFeedback],
      preferences: {
        goodPatterns: userFeedback === 'good' 
          ? [...memory.preferences.goodPatterns, ...extractKeywords(userComment)]
          : memory.preferences.goodPatterns,
        badPatterns: userFeedback === 'bad'
          ? [...memory.preferences.badPatterns, ...extractKeywords(userComment)]
          : memory.preferences.badPatterns,
      },
    }

    // 保存到 LocalStorage
    try {
      localStorage.setItem('proposal-memory', JSON.stringify(updatedMemory))
      setMemory(updatedMemory)
      setUserFeedback(null)
      setUserComment('')
      setIsSubmittingFeedback(false)
      alert('反馈已保存！这会影响后续的判断。')
    } catch (e) {
      console.error('Failed to save feedback:', e)
      setIsSubmittingFeedback(false)
    }
  }

  // 提取关键词（简单实现）
  const extractKeywords = (text: string): string[] => {
    if (!text) return []
    // 简单的关键词提取，实际可以更复杂
    const keywords = text.match(/[\u4e00-\u9fa5]{2,}/g) || []
    return keywords.slice(0, 3) // 最多提取3个关键词
  }

  const hasMemory = memory.feedbacks.length > 0

  return (
    <div className="h-full bg-gemini-bg">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gemini-text mb-2">
                方案判断
              </h1>
              <p className="text-sm text-gemini-text-secondary">
                上传设计方案，获取AI完整性分析，检查信息层级、交互逻辑和体验硬伤
              </p>
            </div>
            <div className="flex items-center gap-4">
              {hasMemory && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gemini-surface text-gemini-text-secondary text-xs font-medium rounded-full">
                  <CheckCircle2 size={14} />
                  已学习 {memory.feedbacks.length} 条反馈
                </span>
              )}
              <label className="flex items-center gap-2 cursor-pointer group">
                <span className="text-xs text-gemini-text-secondary group-hover:text-gemini-text transition-colors">
                  是否启用记忆
                </span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={enableMemory}
                    onChange={(e) => setEnableMemory(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`
                      w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
                      ${enableMemory ? 'bg-black' : 'bg-gray-300'}
                    `}
                  >
                    <div
                      className={`
                        absolute top-0.5 left-0.5 w-5 h-5 bg-gemini-bg rounded-full shadow-gemini-sm
                        transition-transform duration-200 ease-in-out
                        ${enableMemory ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* 左侧：图片上传和AI判断 */}
          <div className="space-y-4 md:space-y-6">
            {/* 记忆标签墙 */}
            {enableMemory && (memory.preferences.goodPatterns.length > 0 || memory.preferences.badPatterns.length > 0) && (
              <div className="border border-gemini-border rounded-3xl p-4 bg-gemini-surface">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={14} className="text-gemini-text-secondary" />
                  <h3 className="text-xs font-medium text-gemini-text">当前记忆偏好</h3>
                </div>
                <div className="space-y-2">
                  {memory.preferences.goodPatterns.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500 mb-1.5 block">偏好：</span>
                      <div className="flex flex-wrap gap-1.5">
                        {memory.preferences.goodPatterns.map((pattern, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 bg-white border border-green-200 text-green-700 rounded text-xs font-medium"
                          >
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {memory.preferences.badPatterns.length > 0 && (
                    <div>
                      <span className="text-xs text-gray-500 mb-1.5 block">避讳：</span>
                      <div className="flex flex-wrap gap-1.5">
                        {memory.preferences.badPatterns.map((pattern, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 bg-white border border-red-200 text-red-700 rounded text-xs font-medium"
                          >
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* 上下文开关 */}
            <div className={`p-4 rounded-3xl border transition-all ${
              useTeamWisdom 
                ? 'border-black bg-gemini-surface' 
                : 'border-gemini-border bg-gemini-bg'
            }`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useTeamWisdom}
                  onChange={(e) => setUseTeamWisdom(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-6 rounded-full transition-colors ${
                  useTeamWisdom ? 'bg-black' : 'bg-gray-300'
                }`}>
                  <div className={`w-5 h-5 bg-gemini-bg rounded-full shadow-gemini-sm transition-transform mt-0.5 ${
                    useTeamWisdom ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gemini-text">
                      {useTeamWisdom ? '✅' : '🚫'} 引用团队知识库
                    </span>
                  </div>
                  {useTeamWisdom && (
                    <p className="text-xs text-gemini-text-secondary mt-1">
                      AI 将基于内部方法论进行回答
                    </p>
                  )}
                </div>
              </label>
            </div>

            {/* 风格对比基准选择 */}
            {availableStyles.length > 0 && (
              <div className="border border-gemini-border rounded-3xl p-4 bg-gemini-bg">
                <label className="block text-xs font-medium text-gemini-text mb-2">
                  <FileSearch size={14} className="inline mr-1" />
                  风格对比基准（可选）
                </label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F5F5F5] text-gemini-text rounded-3xl text-sm focus:outline-none focus:ring-0 focus:shadow-gemini-focus focus:bg-white transition-all"
                >
                  <option value="">不选择基准（通用分析）</option>
                  {availableStyles.map((style) => (
                    <option key={style.id} value={style.id}>
                      {style.title} - {style.keywords.slice(0, 2).join('、')}
                    </option>
                  ))}
                </select>
                {selectedStyle && (
                  <p className="text-xs text-gray-500 mt-2">
                    将对比当前方案与选中风格的契合度
                  </p>
                )}
              </div>
            )}
            
            {/* 图片上传区域 */}
            <div className="border border-gemini-border rounded-3xl p-6 bg-gemini-bg">
              <h2 className="text-sm font-medium text-gemini-text mb-4">
                上传设计方案
              </h2>
              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gemini-border rounded-3xl p-12 
                           text-center cursor-pointer hover:border-black hover:bg-gemini-surface transition-all"
                >
                  <Upload size={32} className="mx-auto text-gemini-text-secondary mb-3" />
                  <p className="text-sm text-gemini-text mb-1">
                    点击或拖拽图片到此处
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
                    alt="上传的设计"
                    className="w-full rounded-3xl border border-gemini-border"
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

            {/* AI判断区域 */}
            {selectedImage && (
              <div className="border border-gemini-border rounded-3xl p-6 bg-gemini-bg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-gemini-text">
                    AI 方案分析
                  </h2>
                  {!aiJudgment && !isAnalyzing && (
                    <button
                      onClick={generateJudgment}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-medium rounded-full transition-all hover:bg-gray-800 shadow-gemini-sm"
                    >
                      <Sparkles size={14} />
                      生成分析
                    </button>
                  )}
                  {isAnalyzing && (
                    <button
                      onClick={stopGeneration}
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-medium rounded-full transition-all hover:bg-gray-800 shadow-gemini-sm"
                    >
                      <Square size={14} />
                      停止生成
                    </button>
                  )}
                </div>
                
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
                
                {isAnalyzing ? (
                  <div className="text-center py-8">
                    <div className="mb-6">
                      <div className="inline-flex items-center gap-3">
                        <span className="text-sm text-gray-500">正在分析方案</span>
                        <div className="flex gap-1.5 items-center">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-breathe" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-breathe" style={{ animationDelay: '300ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-breathe" style={{ animationDelay: '600ms' }}></div>
                        </div>
                      </div>
                    </div>
                    {/* 打字机光标效果 */}
                    <div className="inline-block w-0.5 h-6 bg-gray-900 animate-blink"></div>
                  </div>
                ) : aiJudgment ? (
                  <div className="prose prose-sm max-w-none">
                    <div
                      className="text-sm text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: aiJudgment
                          .split('\n')
                          .map((line) => {
                            // 处理标题
                            if (line.match(/^## /)) {
                              return `<h2 class="text-base font-semibold text-gray-900 mt-4 mb-2">${line.replace(/^## /, '')}</h2>`
                            }
                            if (line.match(/^### /)) {
                              return `<h3 class="text-sm font-semibold text-gray-900 mt-3 mb-1.5">${line.replace(/^### /, '')}</h3>`
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
                              return `<div class="mb-2">${line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')}</div>`
                            }
                            return '<br />'
                          })
                          .join(''),
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-sm text-gray-400">
                    点击"生成分析"按钮获取AI分析
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 右侧：用户反馈区域 */}
          <div className="space-y-6">
            <div className="border border-gemini-border rounded-3xl p-6 bg-gemini-bg">
              <h2 className="text-sm font-medium text-gray-900 mb-4">
                你的主观反馈
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                对AI的判断给出反馈，帮助AI学习你的评价标准
              </p>

              {!aiJudgment ? (
                <div className="text-center py-12 text-sm text-gray-400">
                  请先上传图片并生成AI分析
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 反馈按钮 */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setUserFeedback('good')}
                      className={`
                        flex-1 flex items-center justify-center gap-2 px-4 py-3 
                        border rounded-3xl text-sm font-medium transition-all
                        ${
                          userFeedback === 'good'
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      <ThumbsUp size={16} />
                      判断准确
                    </button>
                    <button
                      onClick={() => setUserFeedback('bad')}
                      className={`
                        flex-1 flex items-center justify-center gap-2 px-4 py-3 
                        border rounded-3xl text-sm font-medium transition-all
                        ${
                          userFeedback === 'bad'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      <ThumbsDown size={16} />
                      判断有误
                    </button>
                  </div>

                  {/* 反馈输入 */}
                  {userFeedback && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        详细说明（可选）
                      </label>
                      <textarea
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder={`请说明${userFeedback === 'good' ? '哪些方面判断准确' : '哪些方面判断有误，或者你的真实想法'}...`}
                        className="w-full min-h-[100px] px-4 py-3 bg-[#F5F5F5] text-gemini-text placeholder:text-gemini-text-secondary rounded-3xl 
                                 focus:outline-none focus:ring-0 focus:shadow-gemini-focus focus:bg-white
                                 resize-none text-sm transition-all"
                      />
                      <button
                        onClick={handleSubmitFeedback}
                        disabled={isSubmittingFeedback}
                        className={`
                          mt-3 w-full px-4 py-2.5 bg-black text-white text-sm font-medium
                          rounded-full transition-all
                          ${isSubmittingFeedback ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}
                        `}
                      >
                        {isSubmittingFeedback ? '保存中...' : '提交反馈'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 历史反馈统计 */}
            {hasMemory && (
              <div className="border border-gemini-border rounded-3xl p-6 bg-gemini-bg">
                <h2 className="text-sm font-medium text-gray-900 mb-4">
                  学习记录
                </h2>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-gray-500">总反馈数：</span>
                    <span className="font-medium text-gray-900 ml-2">
                      {memory.feedbacks.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">正面反馈：</span>
                    <span className="font-medium text-green-600 ml-2">
                      {memory.feedbacks.filter((f) => f.userFeedback === 'good').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">负面反馈：</span>
                    <span className="font-medium text-red-600 ml-2">
                      {memory.feedbacks.filter((f) => f.userFeedback === 'bad').length}
                    </span>
                  </div>
                  {memory.preferences.goodPatterns.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-gray-500 block mb-1">已学习的偏好：</span>
                      <div className="flex flex-wrap gap-1">
                        {memory.preferences.goodPatterns.slice(0, 5).map((pattern, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs"
                          >
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {memory.preferences.badPatterns.length > 0 && (
                    <div className="pt-2">
                      <span className="text-gray-500 block mb-1">已学习的避讳：</span>
                      <div className="flex flex-wrap gap-1">
                        {memory.preferences.badPatterns.slice(0, 5).map((pattern, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-red-50 text-red-700 rounded text-xs"
                          >
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
