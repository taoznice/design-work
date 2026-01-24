'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, CheckCircle2, Upload, X, Square } from 'lucide-react'

interface MemoryContext {
  userPreferences: string[]
  projectContext: string[]
  vocabulary: string[]
}

interface Memory {
  context: MemoryContext
  enabled: boolean
}

interface MemoryUpdateSuggestion {
  category: 'userPreferences' | 'projectContext' | 'vocabulary'
  oldValue?: string
  newValue: string
}

export default function StrategyLabPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasDNA, setHasDNA] = useState(false)
  const [enableMemory, setEnableMemory] = useState(true) // 默认开启
  const [useTeamWisdom, setUseTeamWisdom] = useState(false) // 默认关闭
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageAnalysis, setImageAnalysis] = useState<string>('')
  const [statusMessages, setStatusMessages] = useState<string[]>([])
  const [errorState, setErrorState] = useState<{ show: boolean; message: string; retrying: boolean; retryCount: number }>({
    show: false,
    message: '',
    retrying: false,
    retryCount: 0,
  })
  const [memoryUpdateSuggestion, setMemoryUpdateSuggestion] = useState<MemoryUpdateSuggestion | null>(null)
  const [memory, setMemory] = useState<Memory | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 检查是否有 Memory 配置
  useEffect(() => {
    const saved = localStorage.getItem('team-dna')
    if (saved) {
      try {
        const parsedMemory: Memory = JSON.parse(saved)
        // 兼容旧数据结构
        if (parsedMemory.context) {
          const hasContent = (
            parsedMemory.context.userPreferences.length > 0 ||
            parsedMemory.context.projectContext.length > 0 ||
            parsedMemory.context.vocabulary.length > 0
          )
          setHasDNA(hasContent)
          setEnableMemory(parsedMemory.enabled !== false) // 默认开启
          setMemory(parsedMemory)
        } else {
          // 旧格式，迁移到新格式
          const newMemory: Memory = {
            context: {
              userPreferences: [],
              projectContext: [],
              vocabulary: [],
            },
            enabled: true,
          }
          setMemory(newMemory)
          setHasDNA(false)
        }
      } catch (e) {
        setHasDNA(false)
        setMemory(null)
      }
    } else {
      setMemory(null)
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
        // 自动分析图片
        analyzeImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 移除图片
  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImageFile(null)
    setImageAnalysis('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 分析图片内容（调用真实 API）
  const analyzeImage = async (imageUrl: string) => {
    setImageAnalysis('分析中...')
    
    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imageUrl,
          imageAnalysisType: 'content', // 内容分析模式
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '图片分析失败')
      }

      const data = await response.json()
      
      if (data.success && data.data?.analysis) {
        setImageAnalysis(data.data.analysis)
      } else {
        throw new Error(data.error || '分析失败')
      }
    } catch (error: any) {
      console.error('Failed to analyze image:', error)
      // 如果 API 调用失败，使用降级方案
      const mockAnalysis = `## 图片内容分析

### 识别到的文字内容
- 标题："产品课题讨论"
- 关键信息：Q1 产品路线图、用户增长目标、技术架构升级
- 数据点：用户量 100万+、DAU 增长 30%、新功能上线 5个

### 图形元素识别
- **流程图**：识别到产品开发流程，包含需求分析、设计、开发、测试、上线等环节
- **时间轴**：发现时间规划，显示关键里程碑节点
- **数据图表**：识别到柱状图和折线图，展示用户增长趋势
- **标注信息**：发现多处手写或标注的重点内容

### 视觉结构分析
- 整体布局采用左右分栏结构
- 左侧为时间轴和流程，右侧为数据展示
- 使用了多种颜色标记不同优先级（红色-高优先级，黄色-中优先级，绿色-低优先级）

### 关键洞察
1. 项目时间线较为紧凑，需要重点关注资源分配
2. 用户增长目标明确，但需要验证可行性
3. 技术架构升级可能影响现有功能稳定性

*⚠️ 注意：由于 API 调用失败，以上为模拟分析结果。*`
      setImageAnalysis(mockAnalysis)
    }
  }

  // 添加状态消息
  const addStatusMessage = (message: string) => {
    setStatusMessages(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`])
  }

  // 停止生成
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsGenerating(false)
      addStatusMessage('已停止生成')
    }
  }

  // 生成策略（调用 API）
  const generateStrategy = async () => {
    if (!input.trim() && !selectedImage) return

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    setIsGenerating(true)
    setStatusMessages([])
    setErrorState({ show: false, message: '', retrying: false, retryCount: 0 }) // 重置错误状态
    addStatusMessage('开始生成策略...')

    // 使用已加载的 Memory
    if (enableMemory && memory) {
      addStatusMessage('✓ 记忆配置已加载')
    } else if (enableMemory) {
      addStatusMessage('ℹ 未找到记忆配置，使用默认设置')
    } else {
      addStatusMessage('ℹ 记忆功能已禁用')
    }

    // 读取知识库（如果启用）
    let knowledgeCards: any[] = []
    if (useTeamWisdom) {
      addStatusMessage('正在读取团队知识库...')
      try {
        const saved = localStorage.getItem('team-wisdom')
        if (saved) {
          knowledgeCards = JSON.parse(saved)
          const enabledCount = knowledgeCards.filter((c: any) => c.enabled).length
          addStatusMessage(`✓ 知识库已加载（${enabledCount} 条启用）`)
        } else {
          addStatusMessage('ℹ 未找到知识库数据')
        }
      } catch (e) {
        console.error('Failed to load knowledge:', e)
        addStatusMessage('⚠ 知识库加载失败')
      }
    }

    // 构建请求参数
    addStatusMessage('正在构建请求参数...')
    const requestBody = {
      query: input.trim() || undefined,
      imageAnalysis: imageAnalysis || undefined,
      memoryContext: memory && memory.enabled ? memory.context : undefined,
      enableMemory: enableMemory && memory?.enabled,
      useTeamWisdom: useTeamWisdom, // 传递知识库开关状态
      knowledgeCards: useTeamWisdom ? knowledgeCards : undefined, // 传递知识库数据
    }
    addStatusMessage('✓ 请求参数已构建')

    try {
      // 调用 API
      addStatusMessage('正在连接 API 服务器...')
      addStatusMessage('→ 请求地址: /api/generate')
      addStatusMessage('→ 请求方法: POST')
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: signal, // 添加 abort signal
      })

      addStatusMessage(`✓ 服务器响应: HTTP ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        addStatusMessage(`✗ 请求失败: ${errorData.error || '未知错误'}`)
        throw new Error(errorData.error || errorData.message || 'API 请求失败')
      }

      addStatusMessage('正在解析响应数据...')
      const data = await response.json()
      addStatusMessage('✓ 响应数据已接收')
      
      if (data.success && data.data?.response) {
        addStatusMessage('正在处理 AI 生成的内容...')
        setOutput(data.data.response)
        addStatusMessage('✓ 策略生成完成！')
      } else {
        const errorMsg = data.error || data.message || '生成失败'
        const errorDetails = data.details ? `\n\n**详细信息**：${data.details}` : ''
        addStatusMessage(`✗ 生成失败: ${errorMsg}`)
        throw new Error(errorMsg + errorDetails)
      }
    } catch (error: any) {
      // 如果是用户主动取消，不显示错误
      if (error.name === 'AbortError' || signal.aborted) {
        setIsGenerating(false)
        abortControllerRef.current = null
        return
      }

      console.error('Failed to generate strategy:', error)
      
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
      
      setErrorState(prev => {
        const newRetryCount = prev.retryCount + 1
        const shouldRetry = newRetryCount < 2 // 最多重试1次
        
        // 如果是第一次错误，3秒后自动重试一次
        if (shouldRetry) {
          setTimeout(() => {
            setErrorState(current => {
              if (current.retrying && current.retryCount < 2) {
                // 自动重试
                setTimeout(() => {
                  generateStrategy()
                }, 100)
                return { ...current, retrying: false }
              }
              return current
            })
          }, 3000)
        } else {
          // 如果已经重试过，直接显示详细错误
          setTimeout(() => {
            const formattedError = errorMessage.includes('\n') 
              ? errorMessage.split('\n').map((line: string) => line.trim()).join('\n')
              : errorMessage
            
            setOutput(`## 连接异常\n\n**${formattedError}**\n\n### 解决方案\n\n1. **检查 API Key 配置**\n   - 打开项目根目录的 \`.env.local\` 文件\n   - 确认 API Key 已正确配置\n   - 重启开发服务器\n\n2. **检查网络连接**\n   - 确保网络连接正常\n   - 如需代理，请配置 HTTP_PROXY 环境变量\n\n3. **稍后重试**\n   - 可能是临时网络问题，请稍后再试`)
            setErrorState({ show: false, message: '', retrying: false, retryCount: 0 })
          }, 2000)
        }
        
        return {
          show: true,
          message: userFriendlyMessage,
          retrying: shouldRetry,
          retryCount: newRetryCount,
        }
      })
    } finally {
      if (!signal.aborted) {
        setIsGenerating(false)
        abortControllerRef.current = null
        setTimeout(() => {
          // 3秒后清空状态消息
          setStatusMessages([])
        }, 3000)
      }
    }
  }

  // 提取记忆更新建议
  const extractMemoryUpdate = async (userInput: string, aiResponse: string, currentMemory: Memory | null) => {
    try {
      const response = await fetch('/api/extract-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput,
          aiResponse,
          currentMemory: currentMemory?.context,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.suggestion) {
          setMemoryUpdateSuggestion(data.data.suggestion)
        }
      }
    } catch (error) {
      // 静默失败，不影响主流程
      console.error('Failed to extract memory update:', error)
    }
  }

  // 确认记忆更新
  const handleConfirmMemoryUpdate = () => {
    if (!memoryUpdateSuggestion || !memory) return

    const updatedContext = { ...memory.context }
    const category = memoryUpdateSuggestion.category

    // 移除旧值（如果存在）
    if (memoryUpdateSuggestion.oldValue) {
      updatedContext[category] = updatedContext[category].filter(
        (item: string) => item !== memoryUpdateSuggestion.oldValue
      )
    }

    // 添加新值
    if (!updatedContext[category].includes(memoryUpdateSuggestion.newValue)) {
      updatedContext[category].push(memoryUpdateSuggestion.newValue)
    }

    const updatedMemory: Memory = {
      ...memory,
      context: updatedContext,
    }

    try {
      localStorage.setItem('team-dna', JSON.stringify(updatedMemory))
      setMemory(updatedMemory)
      setMemoryUpdateSuggestion(null)
      // 可以显示一个成功提示
    } catch (e) {
      console.error('Failed to update memory:', e)
    }
  }

  // 忽略记忆更新
  const handleIgnoreMemoryUpdate = () => {
    setMemoryUpdateSuggestion(null)
  }

  // 生成模拟的 Markdown 格式策略（降级方案）
  const generateMockStrategy = (userInput: string, memory: Memory | null, imageAnalysis: string, useMemory: boolean): string => {
    const hasImage = !!imageAnalysis
    const hasText = !!userInput.trim()
    
    let content = `## 问题洞察\n\n`
    
    if (hasImage && hasText) {
      content += `基于你提出的问题："${userInput.substring(0, 50)}${userInput.length > 50 ? '...' : ''}"，以及上传的图片内容，`
    } else if (hasImage) {
      content += `基于上传图片中的内容，`
    } else {
      content += `基于你提出的问题："${userInput.substring(0, 50)}${userInput.length > 50 ? '...' : ''}"，`
    }
    
    const prefs = useMemory && memory?.context?.userPreferences ? memory.context.userPreferences.join('、') : ''
    content += `${prefs ? `结合你的偏好（${prefs.substring(0, 30)}${prefs.length > 30 ? '...' : ''}），` : ''}我们识别出以下关键洞察：\n\n`
    
    if (hasImage) {
      content += `### 图片内容要点\n`
      content += `从图片中识别到：\n`
      content += `- 产品规划时间线：Q1 关键节点明确\n`
      content += `- 用户增长目标：DAU 增长 30%\n`
      content += `- 技术架构升级：需要重点关注稳定性\n`
      content += `- 资源分配：时间紧凑，需要优化流程\n\n`
    }
    
    return content + `

1. **核心挑战**：${hasImage ? '从图片可见时间线紧凑，需要明确资源分配和优先级' : '需要明确问题的本质和影响范围'}
2. **机会点**：${hasImage ? '用户增长目标明确，技术架构升级带来新的可能性' : '通过系统化方法可以找到突破点'}
3. **风险因素**：${hasImage ? '技术架构升级可能影响现有功能，需要平衡升级与稳定性' : '需要平衡短期目标和长期愿景'}

---

## 执行步骤

### 第一阶段：问题定义（1-2 天）
- 收集相关数据和用户反馈
- 明确问题的边界和优先级
- 建立评估标准

### 第二阶段：方案探索（3-5 天）
- 进行竞品分析和最佳实践研究
- 生成 3-5 个初步方案
- 与关键利益相关者进行初步沟通

### 第三阶段：方案验证（5-7 天）
- 选择最有潜力的方案进行原型设计
- 进行内部测试和反馈收集
- 迭代优化方案

### 第四阶段：执行落地（根据项目规模）
- 制定详细的执行计划
- 分配资源和责任
- 建立进度跟踪机制

---

## 团队沟通话术

建议使用以下话术与团队沟通：

**开场白**：
"大家好，针对 [具体问题]，我进行了一些初步分析。想和大家同步一下思路，听听大家的想法。"

**问题陈述**：
"目前我们面临的核心挑战是 [具体挑战]。这个问题影响了 [影响范围]，我们需要在 [时间框架] 内找到解决方案。"

**方案建议**：
"我建议我们采用 [方案名称] 的方法，因为 [理由]。这个方案的优势是 [优势]，同时我们也需要注意 [风险点]。"

**寻求支持**：
"希望得到大家在 [具体方面] 的支持，特别是 [关键人员/部门]。我们可以通过 [协作方式] 来推进。"

---

*策略生成时间：${new Date().toLocaleString('zh-CN')}*
${useMemory && hasDNA ? '*已基于记忆配置生成*' : useMemory ? '*提示：建议先在"记忆"中配置团队信息，以获得更精准的策略建议*' : '*未启用记忆功能*'}

---

**注意**：这是模拟响应。实际项目中会调用真实的 AI API 生成内容。`
  }

  return (
    <div className="h-full bg-gemini-bg">
      <div className="h-full flex">
        {/* 左侧输入区 */}
        <div className="w-1/2 border-r border-gemini-border flex flex-col">
          <div className="p-6 border-b border-gemini-border">
            <h2 className="text-lg font-semibold text-gemini-text">
              当前课题/思考
            </h2>
          </div>
          
          {/* 图片上传区域 */}
          <div className="px-6 pt-6 pb-4 border-b border-gemini-border">
            <div className="mb-3">
              <label className="block text-xs font-medium text-gemini-text-secondary mb-2">
                上传相关图片（可选）
              </label>
              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gemini-border rounded-3xl p-6 
                           text-center cursor-pointer hover:border-black hover:bg-gemini-surface transition-all"
                >
                  <Upload size={20} className="mx-auto text-gemini-text-secondary mb-2" />
                  <p className="text-xs text-gemini-text-secondary">
                    点击上传图片（支持 JPG、PNG、GIF）
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
                    className="w-full rounded-3xl border border-gemini-border max-h-48 object-contain bg-gemini-surface"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1.5 bg-gemini-bg rounded-full 
                             shadow-gemini-sm hover:bg-gemini-surface-hover transition-colors"
                  >
                    <X size={14} className="text-gemini-text-secondary" />
                  </button>
                </div>
              )}
            </div>
            {imageAnalysis && (
              <div className="mt-3 p-3 bg-gemini-surface rounded-3xl border border-gemini-border">
                <p className="text-xs font-medium text-gemini-text mb-2">图片分析结果：</p>
                <div className="text-xs text-gemini-text-secondary line-clamp-3">
                  {imageAnalysis.split('\n').slice(0, 3).join(' ')}...
                </div>
              </div>
            )}
          </div>

          {/* 文本输入区域 */}
          <div className="flex-1 p-6 flex flex-col">
            {/* 上下文开关 */}
            <div className={`mb-4 p-4 rounded-3xl border transition-all ${
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
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你对设计前景的思考、团队遇到的难题，或即将开展的项目..."
              className="flex-1 w-full px-4 py-3 bg-[#F5F5F5] text-gemini-text placeholder:text-gemini-text-secondary rounded-3xl 
                       focus:outline-none focus:ring-0 focus:shadow-gemini-focus focus:bg-white
                       resize-none text-sm transition-all"
            />
          </div>
          
          <div className="p-6 border-t border-gemini-border">
            <button
              onClick={isGenerating ? stopGeneration : generateStrategy}
              disabled={(!input.trim() && !selectedImage) && !isGenerating}
              className={`
                flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-medium
                rounded-full transition-all
                ${
                  (!input.trim() && !selectedImage) && !isGenerating
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-gray-800 shadow-gemini-sm'
                }
              `}
            >
              {isGenerating ? (
                <>
                  <Square size={16} />
                  停止生成
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  生成讨论建议
                </>
              )}
            </button>
          </div>
        </div>

        {/* 右侧输出区 */}
        <div className="w-1/2 flex flex-col relative">
          {/* 记忆更新请求弹窗 */}
          {memoryUpdateSuggestion && (
            <div className="absolute top-4 right-4 z-50 w-80 bg-gemini-bg border border-gemini-border rounded-3xl shadow-gemini-md p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-gemini-text">记忆更新请求</h3>
                <button
                  onClick={handleIgnoreMemoryUpdate}
                  className="text-gemini-text-secondary hover:text-gemini-text transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-2 mb-4">
                <div className="text-xs text-gemini-text-secondary">
                  <span className="font-medium">类别：</span>
                  {memoryUpdateSuggestion.category === 'userPreferences' && '用户偏好'}
                  {memoryUpdateSuggestion.category === 'projectContext' && '项目背景'}
                  {memoryUpdateSuggestion.category === 'vocabulary' && '专用术语'}
                </div>
                {memoryUpdateSuggestion.oldValue && (
                  <div className="text-xs">
                    <span className="text-gemini-text-secondary">旧值：</span>
                    <span className="text-gemini-text line-through ml-1">{memoryUpdateSuggestion.oldValue}</span>
                  </div>
                )}
                <div className="text-xs">
                  <span className="text-gemini-text-secondary">新值：</span>
                  <span className="text-gemini-text ml-1">{memoryUpdateSuggestion.newValue}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmMemoryUpdate}
                  className="flex-1 px-3 py-2 bg-black text-white text-xs font-medium rounded-full hover:bg-gray-800 transition-colors"
                >
                  确认更新
                </button>
                <button
                  onClick={handleIgnoreMemoryUpdate}
                  className="flex-1 px-3 py-2 bg-gemini-surface text-gemini-text text-xs font-medium rounded-full hover:bg-gemini-surface-hover transition-colors"
                >
                  忽略
                </button>
              </div>
            </div>
          )}

          <div className="p-6 border-b border-gemini-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gemini-text">
              讨论建议
            </h2>
            <div className="flex items-center gap-3">
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
          <div className="flex-1 p-6 overflow-auto">
            {/* 错误提示卡片 */}
            {errorState.show && (
              <div className="mb-4 p-4 bg-white border border-gemini-border rounded-3xl shadow-gemini-sm">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-sm text-gemini-text flex-1">{errorState.message}</p>
                </div>
              </div>
            )}
            
            {isGenerating && statusMessages.length > 0 && (
              <div className="mb-4 p-4 bg-gemini-surface border border-gemini-border rounded-3xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-gray-600 animate-pulse" />
                  <span className="text-xs font-medium text-gray-700">处理状态</span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {statusMessages.map((msg, idx) => (
                    <div key={idx} className="text-xs text-gray-600 font-mono">
                      {msg}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* 加载状态 - 呼吸灯效果 */}
            {isGenerating && !output && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-8">
                    <div className="inline-flex items-center gap-3">
                      <span className="text-sm text-gray-500">正在生成</span>
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
              </div>
            )}
            
            {output ? (
              <div className="prose prose-sm max-w-none">
                <div
                  className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: output
                      .replace(/\n/g, '<br />')
                      .replace(/## (.*?)\n/g, '<h2 class="text-lg font-semibold text-gray-900 mt-6 mb-3">$1</h2>')
                      .replace(/### (.*?)\n/g, '<h3 class="text-base font-semibold text-gray-900 mt-4 mb-2">$1</h3>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                      .replace(/---/g, '<hr class="my-4 border-gray-200" />'),
                  }}
                />
              </div>
            ) : !isGenerating && !errorState.show ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-sm text-gray-400">
                    在左侧输入你的思考或上传图片，然后点击"生成讨论建议"
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
