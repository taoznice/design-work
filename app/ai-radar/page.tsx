'use client'

import { useState, useEffect } from 'react'
import { Sparkles, ExternalLink, TrendingUp, Newspaper, Lightbulb, Award, Code, Image, Video, Zap } from 'lucide-react'

interface NewsItem {
  title: string
  link: string
  pubDate?: string
  source: string
}

// 新的类型定义
interface DailyAINews {
  title: string
  content: string
  design_impact: string
  potential_usage: string
  url?: string // 新增：新闻链接
}

interface ToolItem {
  rank: number
  name: string
  reason: string
  last_update: string // 新增字段
}

interface RadarData {
  weekly_insight: {
    date_label: string
    content: string
  }
  daily_ai_news: DailyAINews[]
  ai_tools_rank: {
    comprehensive: ToolItem[]
    coding: ToolItem[]
    image_gen: ToolItem[]
    video_gen: ToolItem[]
  }
}

type TabType = 'news' | 'insight' | 'tools'
type ToolSubTabType = 'comprehensive' | 'coding' | 'image_gen' | 'video_gen'

// 缓存配置（升级 Key 强制清除旧脏数据）
const CACHE_KEY = 'radar_data_v3'
const TIME_KEY = 'radar_time_v3'
const CACHE_DURATION = 12 * 60 * 60 * 1000 // 12小时（毫秒）

export default function AIRadarPage() {
  const [rawNews, setRawNews] = useState<NewsItem[]>([])
  const [radarData, setRadarData] = useState<RadarData | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('news')
  const [activeToolSubTab, setActiveToolSubTab] = useState<ToolSubTabType>('comprehensive')
  const [isFetching, setIsFetching] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [errorState, setErrorState] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  })

  // --- 辅助函数：清洗 AI 返回的字符串 ---
  const cleanAndParseJSON = (text: string): any => {
    try {
      // 1. 移除 Markdown 代码块标记
      let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim()
      
      // 2. 尝试提取 JSON 对象（如果被其他文本包裹）
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleanText = jsonMatch[0]
      }
      
      // 3. 尝试解析
      return JSON.parse(cleanText)
    } catch (e) {
      console.error('🔴 [AIRadar] JSON Parse Error Raw Text:', text) // 打印原始内容以便调试
      throw new Error(`AI 数据格式解析失败：${e instanceof Error ? e.message : '未知错误'}。请查看控制台获取详细信息。`)
    }
  }

  // 检查缓存是否有效
  const isCacheValid = (): boolean => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY)
      const lastTime = localStorage.getItem(TIME_KEY)
      
      if (!cachedData || !lastTime) {
        return false
      }
      
      const now = Date.now()
      const cacheTime = parseInt(lastTime, 10)
      
      if (isNaN(cacheTime)) {
        return false
      }
      
      return (now - cacheTime) < CACHE_DURATION
    } catch (error) {
      console.error('Error checking cache:', error)
      return false
    }
  }

  // 从缓存加载数据
  const loadFromCache = (): RadarData | null => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY)
      if (cachedData) {
        const parsed = JSON.parse(cachedData) as RadarData
        
        // 验证缓存数据有效性
        if (parsed && 
            parsed.daily_ai_news && Array.isArray(parsed.daily_ai_news) && parsed.daily_ai_news.length > 0 &&
            parsed.weekly_insight && parsed.weekly_insight.date_label && parsed.weekly_insight.content &&
            parsed.ai_tools_rank) {
          console.log('🟢 [AIRadar] 命中缓存')
          return parsed
        } else {
          console.warn('⚠️ [AIRadar] 缓存数据格式无效，清除缓存')
          localStorage.removeItem(CACHE_KEY)
          localStorage.removeItem(TIME_KEY)
        }
      }
    } catch (error) {
      console.error('🔴 [AIRadar] Error loading from cache:', error)
      // 清除脏缓存
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(TIME_KEY)
    }
    return null
  }

  // 保存数据到缓存（只有成功解析出有效数据才写入）
  const saveToCache = (data: RadarData) => {
    try {
      // 验证数据有效性
      if (!data || 
          !data.daily_ai_news || !Array.isArray(data.daily_ai_news) || data.daily_ai_news.length === 0 ||
          !data.weekly_insight || !data.weekly_insight.date_label || !data.weekly_insight.content ||
          !data.ai_tools_rank) {
        console.warn('⚠️ [AIRadar] 数据无效，不写入缓存')
        return
      }
      
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      localStorage.setItem(TIME_KEY, Date.now().toString())
      console.log('✅ [AIRadar] 数据缓存成功')
    } catch (error) {
      console.error('🔴 [AIRadar] Error saving to cache:', error)
    }
  }

  // 加载数据（支持强制刷新）
  const loadData = async (forceRefresh = false) => {
    console.log('🔄 [AIRadar] loadData called, forceRefresh:', forceRefresh)
    
    // 清除错误状态
    setErrorState({ show: false, message: '' })
    
    // 1. 尝试读取缓存
    if (!forceRefresh && isCacheValid()) {
      const cachedData = loadFromCache()
      if (cachedData) {
        console.log('✅ [AIRadar] 使用缓存数据')
        setRadarData(cachedData)
        setIsFetching(false)
        setIsAnalyzing(false)
        setErrorState({ show: false, message: '' })
        return
      }
    }

    // 2. 缓存无效或强制刷新，执行 API 调用
    console.log('📡 [AIRadar] 开始获取新闻...')
    await fetchNews()
  }

  // 页面加载时自动获取新闻
  useEffect(() => {
    loadData()
  }, [])

  // 获取新闻后自动分析
  useEffect(() => {
    if (rawNews.length > 0) {
      // 使用 ref 或直接检查状态，避免依赖循环
      const shouldAnalyze = !isAnalyzing && !isFetching
      if (shouldAnalyze) {
        console.log('🔍 [AIRadar] 开始分析新闻，数量:', rawNews.length)
        analyzeNews()
      } else {
        console.log('⏸️ [AIRadar] 等待中，isAnalyzing:', isAnalyzing, 'isFetching:', isFetching)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawNews.length])

  // 获取新闻
  const fetchNews = async () => {
    console.log('📰 [AIRadar] fetchNews 开始')
    setIsFetching(true)
    setErrorState({ show: false, message: '' })

    // 添加超时处理（使用 AbortController）
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => {
      console.error('🔴 [AIRadar] fetchNews 超时（30秒）')
      abortController.abort()
      setErrorState({
        show: true,
        message: '获取新闻超时，请检查网络连接或稍后重试',
      })
      setIsFetching(false)
      setIsAnalyzing(false)
    }, 30000) // 30秒超时

    try {
      const response = await fetch('/api/news/fetch', {
        signal: abortController.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || '获取新闻失败')
      }

      const data = await response.json()
      console.log('📰 [AIRadar] fetchNews 响应:', data)
      
      if (data.success && data.data?.news) {
        console.log('✅ [AIRadar] 获取到', data.data.news.length, '条新闻')
        setRawNews(data.data.news)
      } else {
        throw new Error(data.error || '获取新闻失败')
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error('🔴 [AIRadar] fetchNews 失败:', error)
      
      let errorMessage = error.message || '获取新闻失败，请稍后重试'
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        // 如果是超时导致的 abort，错误信息已经在 timeout 中设置了
        if (!errorState.show) {
          errorMessage = '请求超时，请检查网络连接或稍后重试'
          setErrorState({
            show: true,
            message: errorMessage,
          })
        }
      } else {
        setErrorState({
          show: true,
          message: errorMessage,
        })
      }
      setIsAnalyzing(false) // 确保分析状态也被重置
    } finally {
      setIsFetching(false)
    }
  }

  // 分析新闻
  const analyzeNews = async () => {
    if (rawNews.length === 0) {
      console.log('⏸️ [AIRadar] analyzeNews 跳过：rawNews 为空')
      setIsAnalyzing(false)
      return
    }

    console.log('🚀 [AIRadar] analyzeNews 开始，新闻数量:', rawNews.length)
    setIsAnalyzing(true)
    setErrorState({ show: false, message: '' })

    // 添加超时处理（使用 AbortController）
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => {
      console.error('🔴 [AIRadar] analyzeNews 超时（60秒）')
      abortController.abort()
      setErrorState({
        show: true,
        message: '分析新闻超时，请检查网络连接或稍后重试',
      })
      setIsAnalyzing(false)
    }, 60000) // 60秒超时（分析可能需要更长时间）

    try {
      console.log('🚀 [AIRadar] 请求 API 中...')
      
      const response = await fetch('/api/news/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsData: rawNews,
        }),
        signal: abortController.signal,
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.details || '分析新闻失败')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || data.details || '分析失败')
      }

      // ⚠️ 关键修改：如果 API 返回的 data.data 是字符串（可能包含 Markdown），使用清洗函数
      let parsedData = data.data
      
      // 如果 data.data 是字符串，尝试清洗和解析
      if (typeof data.data === 'string') {
        console.log('⚠️ [AIRadar] API 返回字符串格式，执行清洗...')
        parsedData = cleanAndParseJSON(data.data)
      }
      
      // 验证数据结构
      if (!parsedData || 
          !parsedData.daily_ai_news || !Array.isArray(parsedData.daily_ai_news) ||
          !parsedData.weekly_insight || typeof parsedData.weekly_insight !== 'object' ||
          !parsedData.weekly_insight.date_label || !parsedData.weekly_insight.content ||
          !parsedData.ai_tools_rank || typeof parsedData.ai_tools_rank !== 'object' ||
          !Array.isArray(parsedData.ai_tools_rank.comprehensive) ||
          !Array.isArray(parsedData.ai_tools_rank.coding) ||
          !Array.isArray(parsedData.ai_tools_rank.image_gen) ||
          !Array.isArray(parsedData.ai_tools_rank.video_gen)) {
        throw new Error('返回数据格式不正确：缺少必需字段或格式错误')
      }

      // 验证数据有效性（数组长度 > 0）
      if (parsedData.daily_ai_news.length === 0) {
        throw new Error('返回数据无效：daily_ai_news 数组为空')
      }

      // 验证工具是否包含 last_update 字段（可选验证，不强制）
      const allToolRanks = [
        ...parsedData.ai_tools_rank.comprehensive,
        ...parsedData.ai_tools_rank.coding,
        ...parsedData.ai_tools_rank.image_gen,
        ...parsedData.ai_tools_rank.video_gen,
      ]
      const hasAllLastUpdate = allToolRanks.every(tool => tool.last_update && typeof tool.last_update === 'string')
      if (!hasAllLastUpdate) {
        console.warn('⚠️ [AIRadar] 警告：部分工具缺少 last_update 字段')
      }

      // 4. 成功：更新状态并写入缓存（只有有效数据才写入）
      console.log('✅ [AIRadar] 数据验证通过，准备更新状态')
      console.log('📊 [AIRadar] 数据概览:', {
        daily_ai_news: parsedData.daily_ai_news.length,
        weekly_insight: !!parsedData.weekly_insight,
        tools: {
          comprehensive: parsedData.ai_tools_rank.comprehensive.length,
          coding: parsedData.ai_tools_rank.coding.length,
          image_gen: parsedData.ai_tools_rank.image_gen.length,
          video_gen: parsedData.ai_tools_rank.video_gen.length,
        }
      })
      
      // 清除错误状态
      setErrorState({ show: false, message: '' })
      setRadarData(parsedData)
      saveToCache(parsedData)
      console.log('✅ [AIRadar] 数据获取成功，状态已更新')
      
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error('🔴 [AIRadar] Error:', error)
      
      // 关键：将错误信息展示在 UI 上而不是显示空白
      let errorMessage = error.message || '未知错误'
      
      // 处理超时错误
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        // 如果是超时导致的 abort，错误信息已经在 timeout 中设置了
        // 但为了确保显示，我们再次设置（setState 是幂等的）
        errorMessage = '请求超时，请检查网络连接或稍后重试'
      }
      
      let userFriendlyMessage = errorMessage // 默认显示具体错误信息
      
      // 针对特定错误类型提供友好提示
      if (errorMessage.includes('401') || 
          errorMessage.includes('Unauthorized') ||
          errorMessage.includes('内部服务连接失败') ||
          errorMessage.includes('VPN')) {
        userFriendlyMessage = `内部服务连接失败：${errorMessage}`
      } else if (errorMessage.includes('429')) {
        userFriendlyMessage = `请求过于频繁：${errorMessage}`
      } else if (errorMessage.includes('解析') || errorMessage.includes('JSON')) {
        userFriendlyMessage = `数据解析失败：${errorMessage}。请查看控制台获取详细信息。`
      }
      
      setErrorState({
        show: true,
        message: userFriendlyMessage,
      })
      
      // 失败时清除脏缓存
      localStorage.removeItem(CACHE_KEY)
      localStorage.removeItem(TIME_KEY)
    } finally {
      // 确保状态总是被重置
      console.log('✅ [AIRadar] analyzeNews 完成，重置状态')
      setIsAnalyzing(false)
    }
  }

  // 工具子榜单配置
  const toolSubTabs: { key: ToolSubTabType; label: string; icon: any }[] = [
    { key: 'comprehensive', label: '综合', icon: Zap },
    { key: 'coding', label: 'Coding', icon: Code },
    { key: 'image_gen', label: '生图', icon: Image },
    { key: 'video_gen', label: '视频', icon: Video },
  ]

  return (
    <div className="h-full bg-gemini-bg text-gemini-text">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gemini-text mb-2">
                AI Radar (设计雷达)
              </h1>
              <p className="text-sm text-gemini-text-secondary">
                自动聚合科技新闻，AI 生成设计情报日报
              </p>
            </div>
            <button
              onClick={() => loadData(true)}
              disabled={isFetching || isAnalyzing}
              className={`
                flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm font-medium
                rounded-full transition-all
                ${isFetching || isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800 shadow-gemini-sm'}
              `}
            >
              <Sparkles size={16} />
              {isFetching || isAnalyzing ? '获取中...' : '刷新新闻'}
            </button>
          </div>
        </div>

        {/* 第一优先级：加载状态 */}
        {(isFetching || isAnalyzing) && (
          <div className="mb-6 p-6 bg-gemini-surface border border-gemini-border rounded-3xl">
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex items-center gap-3">
                  <span className="text-sm text-gemini-text-secondary">
                    正在搜集全球情报并翻译...
                  </span>
                  <div className="flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-black rounded-full animate-breathe" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-black rounded-full animate-breathe" style={{ animationDelay: '300ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-black rounded-full animate-breathe" style={{ animationDelay: '600ms' }}></div>
                  </div>
                </div>
              </div>
              <div className="inline-block w-0.5 h-6 bg-black animate-blink"></div>
            </div>
          </div>
        )}

        {/* 第二优先级：错误状态（如果有错误，必须显示，不显示空状态） */}
        {!isFetching && !isAnalyzing && errorState.show && (
          <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-3xl flex flex-col items-center gap-4">
            <div className="text-red-600 font-bold text-base">⚠️ 获取情报失败</div>
            <div className="text-red-500 text-sm font-mono break-all max-w-full text-center px-4">
              {errorState.message}
            </div>
            <button 
              onClick={() => loadData(true)}
              className="px-6 py-2.5 bg-red-100 text-red-700 rounded-full text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
            >
              <Sparkles size={16} />
              重试
            </button>
          </div>
        )}

        {/* 第三优先级：数据内容 */}
        {!isFetching && !isAnalyzing && radarData && !errorState.show && (
          <>
            {/* Tab 切换 */}
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setActiveTab('news')}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all
                  ${
                    activeTab === 'news'
                      ? 'bg-black text-white'
                      : 'bg-transparent text-gemini-text-secondary hover:text-gemini-text'
                  }
                `}
              >
                <Newspaper size={16} />
                每日 AI 动态
              </button>
              <button
                onClick={() => setActiveTab('insight')}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all
                  ${
                    activeTab === 'insight'
                      ? 'bg-black text-white'
                      : 'bg-transparent text-gemini-text-secondary hover:text-gemini-text'
                  }
                `}
              >
                <Lightbulb size={16} />
                周度聚合
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all
                  ${
                    activeTab === 'tools'
                      ? 'bg-black text-white'
                      : 'bg-transparent text-gemini-text-secondary hover:text-gemini-text'
                  }
                `}
              >
                <Award size={16} />
                工具风向标
              </button>
            </div>

            {/* 内容区域 */}
            {/* Tab 1: 每日 AI 动态 */}
            {activeTab === 'news' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <Newspaper size={20} className="text-black" />
                  <h2 className="text-lg font-semibold text-gemini-text">
                    每日 AI 动态（设计相关）
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {radarData.daily_ai_news?.map((news, index) => (
                    <div
                      key={index}
                      className="p-6 bg-gemini-surface border border-gemini-border rounded-3xl hover:border-black transition-colors"
                    >
                      <div className="flex items-start gap-3 mb-4">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-semibold flex-shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gemini-text mb-2">
                            {news.title}
                          </h3>
                          <p className="text-sm text-gemini-text-secondary mb-4">
                            {news.content}
                          </p>
                          {news.url && (
                            <a
                              href={news.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-gemini-text-secondary hover:text-gemini-text transition-colors"
                            >
                              <ExternalLink size={14} />
                              查看原文
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 pl-9">
                        <div className="p-3 bg-gemini-bg rounded-2xl">
                          <div className="text-xs font-medium text-gemini-text-secondary mb-1">
                            对设计行业的影响
                          </div>
                          <p className="text-sm text-gemini-text">
                            {news.design_impact}
                          </p>
                        </div>
                        <div className="p-3 bg-gemini-bg rounded-2xl">
                          <div className="text-xs font-medium text-gemini-text-secondary mb-1">
                            可发散利用空间
                          </div>
                          <p className="text-sm text-gemini-text">
                            {news.potential_usage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: 周度聚合 */}
            {activeTab === 'insight' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <Lightbulb size={20} className="text-black" />
                  <h2 className="text-lg font-semibold text-gemini-text">
                    周度聚合
                  </h2>
                </div>

                <div className="bg-gemini-surface rounded-3xl p-8">
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 bg-black text-white text-xs font-medium rounded-full">
                        {radarData.weekly_insight.date_label}
                      </span>
                    </div>
                    <p className="text-lg text-gemini-text leading-relaxed whitespace-pre-wrap font-light">
                      {radarData.weekly_insight.content}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: 工具风向标 */}
            {activeTab === 'tools' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <Award size={20} className="text-black" />
                  <h2 className="text-lg font-semibold text-gemini-text">
                    AI 设计工具排行榜
                  </h2>
                </div>

                {/* 工具子榜单 Tab */}
                <div className="mb-6 flex gap-2 flex-wrap">
                  {toolSubTabs.map((subTab) => {
                    const Icon = subTab.icon
                    return (
                      <button
                        key={subTab.key}
                        onClick={() => setActiveToolSubTab(subTab.key)}
                        className={`
                          flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all
                          ${
                            activeToolSubTab === subTab.key
                              ? 'bg-black text-white'
                              : 'bg-gemini-surface text-gemini-text-secondary hover:text-gemini-text border border-gemini-border'
                          }
                        `}
                      >
                        <Icon size={16} />
                        {subTab.label}
                      </button>
                    )
                  })}
                </div>

                {/* 工具列表 */}
                <div className="space-y-3">
                  {radarData.ai_tools_rank[activeToolSubTab]?.map((tool) => (
                    <div
                      key={tool.rank}
                      className="p-6 bg-gemini-surface border border-gemini-border rounded-3xl hover:border-black transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`
                          flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold flex-shrink-0
                          ${tool.rank <= 3 
                            ? 'bg-black text-white' 
                            : 'bg-gemini-surface border border-gemini-border text-gemini-text'
                          }
                        `}>
                          {tool.rank}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-base font-semibold text-gemini-text">
                              {tool.name}
                            </h3>
                            {tool.last_update && (
                              <span className="text-xs text-gemini-text-secondary">
                                [{tool.last_update}]
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gemini-text-secondary">
                            {tool.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* 第四优先级：空状态（只有在没有错误、没有数据、不在加载时才显示） */}
        {!isFetching && !isAnalyzing && !radarData && !errorState.show && (
          <div className="text-center py-12">
            <Sparkles size={48} className="mx-auto text-gemini-text-secondary mb-4" />
            <p className="text-sm text-gemini-text-secondary">
              点击"刷新新闻"开始获取最新资讯
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
