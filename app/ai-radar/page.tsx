'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Sparkles, ExternalLink, TrendingUp, Newspaper, Lightbulb, Award, Code, Image, Video, Zap } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'

interface NewsItem {
  title: string
  link: string
  pubDate?: string
  source: string
}

// 新的类型定义（支持精简格式）
interface DailyAINews {
  title: string
  content?: string // 旧格式兼容
  insight?: string // 新格式：一句话核心洞察
  tags?: string[] // 新格式：关键词数组
  design_impact: string // 对设计行业的影响（必需）
  potential_usage: string // 可发散利用空间（必需）
  url?: string // 新闻链接
}

interface ToolItem {
  rank: number
  name: string
  reason: string
  last_update: string // 新增字段
}

interface RadarData {
  // 向后兼容：支持旧格式 weekly_insight/weekly_insights 和新格式 monthly_trends
  weekly_insight?: {
    date_label: string
    content: string
  }
  weekly_insights?: Array<{
    date_label: string
    content: string
  }>
  monthly_trends?: Array<{
    date_label: string
    content: string
  }>
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

// 工具子榜单配置（静态，避免每次渲染创建）
const toolSubTabs: { key: ToolSubTabType; label: string; icon: any }[] = [
  { key: 'comprehensive', label: '综合', icon: Zap },
  { key: 'coding', label: 'Coding', icon: Code },
  { key: 'image_gen', label: '生图', icon: Image },
  { key: 'video_gen', label: '视频', icon: Video },
]

export default function AIRadarPage() {
  // 全局状态管理
  const { radar, setRadarState } = useAppStore()
  
  // 从全局状态恢复数据（使用函数式初始化，确保只执行一次）
  const [rawNews, setRawNews] = useState<NewsItem[]>(() => {
    if (radar.input && Array.isArray(radar.input)) {
      console.log('📥 [AIRadar] 初始化 rawNews 从全局状态:', radar.input.length)
      return radar.input
    }
    return []
  })
  const [radarData, setRadarData] = useState<RadarData | null>(() => {
    if (radar.result) {
      console.log('📥 [AIRadar] 初始化 radarData 从全局状态')
      return radar.result
    }
    return null
  })
  const [activeTab, setActiveTab] = useState<TabType>('news')
  const [activeToolSubTab, setActiveToolSubTab] = useState<ToolSubTabType>('comprehensive')
  const [isFetching, setIsFetching] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [errorState, setErrorState] = useState<{ show: boolean; message: string }>(() => {
    if (radar.error) {
      return radar.error
    }
    return { show: false, message: '' }
  })
  
  // 流式输出相关状态
  const [streamingText, setStreamingText] = useState<string>('')
  const [partialData, setPartialData] = useState<RadarData | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateTimeRef = useRef<number>(0)

  // 渲染列表预计算，减少流式更新期间的重复渲染开销
  const dailyNewsItems = useMemo(() => {
    if (!radarData?.daily_ai_news?.length) return null
    return radarData.daily_ai_news.map((news, index) => (
      <div
        key={index}
        className="p-4 md:p-6 bg-gemini-surface border border-gemini-border rounded-2xl md:rounded-3xl hover:border-black transition-colors"
      >
        <div className="flex items-start gap-3 mb-4">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-semibold flex-shrink-0">
            {index + 1}
          </span>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gemini-text mb-2">
              {news.title}
            </h3>
            {/* 支持新旧两种格式 */}
            {news.insight ? (
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gemini-text font-medium">
                  {news.insight}
                </p>
                {news.tags && news.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {news.tags.map((tag, tagIdx) => (
                      <span
                        key={tagIdx}
                        className="px-2 py-0.5 bg-gemini-surface text-xs text-gemini-text-secondary rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gemini-text-secondary mb-4">
                {news.content}
              </p>
            )}
            {news.url && (
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gemini-text-secondary hover:text-gemini-text transition-colors mb-4"
              >
                <ExternalLink size={14} />
                查看原文
              </a>
            )}
          </div>
        </div>

        {/* 对设计的影响和可发散利用空间（必需显示） */}
        <div className="space-y-3 pl-9">
          {news.design_impact && (
            <div className="p-3 bg-gemini-bg rounded-2xl">
              <div className="text-xs font-medium text-gemini-text-secondary mb-1">
                对设计行业的影响
              </div>
              <p className="text-sm text-gemini-text">
                {news.design_impact}
              </p>
            </div>
          )}
          {news.potential_usage && (
            <div className="p-3 bg-gemini-bg rounded-2xl">
              <div className="text-xs font-medium text-gemini-text-secondary mb-1">
                可发散利用空间
              </div>
              <p className="text-sm text-gemini-text">
                {news.potential_usage}
              </p>
            </div>
          )}
        </div>
      </div>
    ))
  }, [radarData?.daily_ai_news])

  const monthlyTrendsItems = useMemo(() => {
    if (!radarData?.monthly_trends?.length) return null
    return radarData.monthly_trends.map((trend, index) => (
      <div key={index} className="bg-gemini-surface rounded-3xl p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <span className="inline-block px-3 py-1.5 bg-black text-white text-xs font-medium rounded-full">
              {trend.date_label}
            </span>
          </div>
          <p className="text-base md:text-lg text-gemini-text leading-relaxed whitespace-pre-wrap font-light">
            {trend.content}
          </p>
        </div>
      </div>
    ))
  }, [radarData?.monthly_trends])

  const weeklyInsightsItems = useMemo(() => {
    if (!radarData?.weekly_insights?.length) return null
    return radarData.weekly_insights.map((insight, index) => (
      <div key={index} className="bg-gemini-surface rounded-3xl p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-black text-white text-xs font-medium rounded-full">
              {insight.date_label}
            </span>
          </div>
          <p className="text-base md:text-lg text-gemini-text leading-relaxed whitespace-pre-wrap font-light">
            {insight.content}
          </p>
        </div>
      </div>
    ))
  }, [radarData?.weekly_insights])

  const toolItems = useMemo(() => {
    const tools = radarData?.ai_tools_rank?.[activeToolSubTab] || []
    return tools.map((tool) => (
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
    ))
  }, [radarData?.ai_tools_rank, activeToolSubTab])

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
    if (typeof window === 'undefined') return false
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
    if (typeof window === 'undefined') return null
    try {
      const cachedData = localStorage.getItem(CACHE_KEY)
      if (cachedData) {
        const parsed = JSON.parse(cachedData) as RadarData
        
        // 验证缓存数据有效性（支持新旧多种格式）
        if (parsed && 
            parsed.daily_ai_news && Array.isArray(parsed.daily_ai_news) && parsed.daily_ai_news.length > 0 &&
            (parsed.weekly_insight || 
             (parsed.weekly_insights && Array.isArray(parsed.weekly_insights)) ||
             (parsed.monthly_trends && Array.isArray(parsed.monthly_trends))) &&
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
    if (typeof window === 'undefined') return
    try {
      // 验证数据有效性（支持新旧多种格式）
      if (!data || 
          !data.daily_ai_news || !Array.isArray(data.daily_ai_news) || data.daily_ai_news.length === 0 ||
          (!data.weekly_insight && 
           (!data.weekly_insights || !Array.isArray(data.weekly_insights)) &&
           (!data.monthly_trends || !Array.isArray(data.monthly_trends))) ||
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

  // 页面加载时从全局状态恢复或自动获取新闻
  useEffect(() => {
    // 检查是否有全局状态
    const hasStoredData = radar.result || (radar.input && Array.isArray(radar.input) && radar.input.length > 0)
    
    if (hasStoredData) {
      console.log('🔄 [AIRadar] 从全局状态恢复数据', {
        hasResult: !!radar.result,
        hasInput: !!radar.input,
        resultNewsCount: radar.result?.daily_ai_news?.length || 0,
        inputCount: radar.input?.length || 0
      })
      
      // 确保状态已恢复（直接设置，不使用函数式更新，确保使用全局状态的值）
      if (radar.result) {
        console.log('✅ [AIRadar] 恢复分析结果，数据条数:', radar.result.daily_ai_news?.length || 0)
        setRadarData(radar.result)
      }
      
      if (radar.input && Array.isArray(radar.input) && radar.input.length > 0) {
        console.log('✅ [AIRadar] 恢复原始新闻数据，数量:', radar.input.length)
        setRawNews(radar.input)
      }
      
      // 恢复错误状态
      if (radar.error) {
        setErrorState(radar.error)
      }
      
      // 如果有部分数据，显示提示
      if (radar.result && radar.result.daily_ai_news && radar.result.daily_ai_news.length > 0) {
        const newsCount = radar.result.daily_ai_news.length
        if (newsCount < 5) {
          // 如果数据不完整，显示提示
          setErrorState({
            show: true,
            message: `已恢复 ${newsCount} 条数据（共需 5 条，之前的分析可能未完成）`
          })
        }
      }
    } else {
      // 没有存储的数据，加载新数据
      console.log('📡 [AIRadar] 没有存储数据，开始加载')
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 保存状态到全局 Store - 使用防抖减少保存频率
  // 注意：流式更新过程中的保存已经在 debouncedUpdate 中立即执行，这里只处理其他状态变化
  useEffect(() => {
    // 如果正在分析，不在这里保存（由流式更新逻辑负责立即保存）
    if (isAnalyzing) {
      return
    }
    
    const timer = setTimeout(() => {
      if (radarData || rawNews.length > 0) {
        setRadarState({
          result: radarData,
          input: rawNews,
          isLoading: isFetching || isAnalyzing,
          error: errorState.show ? errorState : null,
        })
        console.log('💾 [AIRadar] 常规状态更新保存到全局 Store')
      }
    }, 300) // 300ms 防抖
    
    return () => clearTimeout(timer)
  }, [radarData, rawNews, isFetching, isAnalyzing, errorState, setRadarState])

  // 使用 ref 保存最新状态，以便在卸载时访问
  const stateRef = useRef({ radarData, rawNews, isFetching, isAnalyzing, errorState })
  useEffect(() => {
    stateRef.current = { radarData, rawNews, isFetching, isAnalyzing, errorState }
  }, [radarData, rawNews, isFetching, isAnalyzing, errorState])

  // 组件卸载时保存状态（使用同步方式确保保存）
  useEffect(() => {
    return () => {
      // 组件卸载时确保状态已保存
      const current = stateRef.current
      console.log('🔌 [AIRadar] 组件卸载，保存状态', {
        hasData: !!current.radarData,
        hasInput: current.rawNews.length > 0,
        isLoading: current.isFetching || current.isAnalyzing,
        dataCount: current.radarData?.daily_ai_news?.length || 0
      })
      
      if (current.radarData || current.rawNews.length > 0) {
        // 同步保存，不等待
        setRadarState({
          result: current.radarData,
          input: current.rawNews,
          isLoading: false, // 卸载时设为 false，因为流式请求已中断
          error: current.errorState.show ? current.errorState : null,
        })
        console.log('✅ [AIRadar] 卸载时状态已保存到全局 Store')
      }
    }
  }, [setRadarState])

  // 获取新闻后自动分析（但不要重复分析）
  useEffect(() => {
    if (rawNews.length > 0 && !radarData) {
      // 只有在没有结果且不在加载中时才自动分析
      const shouldAnalyze = !isAnalyzing && !isFetching && !radarData
      if (shouldAnalyze) {
        console.log('🔍 [AIRadar] 开始分析新闻，数量:', rawNews.length)
        analyzeNews()
      } else {
        console.log('⏸️ [AIRadar] 等待中或已有结果，isAnalyzing:', isAnalyzing, 'isFetching:', isFetching, 'hasData:', !!radarData)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawNews.length, radarData])

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

  // 流式分析新闻（新版本）
  const analyzeNewsStream = async () => {
    if (rawNews.length === 0) {
      console.log('⏸️ [AIRadar] analyzeNewsStream 跳过：rawNews 为空')
      setIsAnalyzing(false)
      setRadarState({ isLoading: false })
      return
    }

    console.log('🚀 [AIRadar] analyzeNewsStream 开始，新闻数量:', rawNews.length)
    setIsAnalyzing(true)
    setStreamingText('')
    setPartialData(null)
    setErrorState({ show: false, message: '' })
    setRadarState({ isLoading: true, error: null })

    // 创建新的 AbortController
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    try {
      console.log('🚀 [AIRadar] 请求流式 API 中...')
      
      const response = await fetch('/api/news/analyze-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newsData: rawNews,
        }),
        signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.details || '分析新闻失败')
      }

      if (!response.body) {
        throw new Error('响应体为空')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let accumulatedText = ''

      // 防抖更新函数 - 减少渲染频率
      const debouncedUpdate = (text: string) => {
        const now = Date.now()
        // 每 200ms 最多更新一次
        if (now - lastUpdateTimeRef.current < 200) {
          if (updateTimerRef.current) {
            clearTimeout(updateTimerRef.current)
          }
          updateTimerRef.current = setTimeout(() => {
            debouncedUpdate(text)
          }, 200)
          return
        }
        
        lastUpdateTimeRef.current = now
        setStreamingText(text)
        
        // 只在文本足够长时才尝试解析（减少解析次数）
        if (text.length > 100) {
          try {
            const parsed = cleanAndParseJSON(text)
            if (parsed && parsed.daily_ai_news && Array.isArray(parsed.daily_ai_news) && parsed.daily_ai_news.length > 0) {
              setPartialData(parsed)
              setRadarData(parsed)
              // 立即保存到全局状态（不等待防抖）- 确保切换页面时数据不丢失
              // 注意：即使 isLoading 会被 partialize 设为 false，但 result 和 input 会被保存
              setRadarState({ 
                result: parsed, 
                input: rawNews,
                isLoading: true, // 仍在加载中（虽然会被 partialize 设为 false，但 result 会保存）
                error: null 
              })
              console.log('💾 [AIRadar] 流式更新中保存部分数据到全局状态:', parsed.daily_ai_news.length, '条')
            }
          } catch (e) {
            // 部分 JSON 解析失败是正常的，继续等待
          }
        }
      }

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留最后一个不完整的行

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'started') {
                // 后端已建立流，立即给用户视觉反馈，避免“假死”感
                setStreamingText('...')
              } else if (data.type === 'chunk') {
                // 累积文本，使用防抖更新
                accumulatedText += data.content
                debouncedUpdate(accumulatedText)
              } else if (data.type === 'done') {
                // 清除定时器
                if (updateTimerRef.current) {
                  clearTimeout(updateTimerRef.current)
                  updateTimerRef.current = null
                }
                
                // 完成，解析最终 JSON
                const finalText = data.fullText || accumulatedText
                const parsedData = cleanAndParseJSON(finalText)
                
                // 验证数据
                if (parsedData && 
                    parsedData.daily_ai_news && Array.isArray(parsedData.daily_ai_news) &&
                    parsedData.daily_ai_news.length > 0) {
                  setRadarData(parsedData)
                  setPartialData(null)
                  setStreamingText('')
                  accumulatedText = ''
                  saveToCache(parsedData)
                  // 立即保存到全局状态（不等待防抖）
                  setRadarState({ 
                    result: parsedData, 
                    input: rawNews,
                    isLoading: false,
                    error: null 
                  })
                  console.log('✅ [AIRadar] 流式数据获取成功')
                } else {
                  throw new Error('返回数据格式不正确')
                }
              } else if (data.type === 'error') {
                throw new Error(data.error || '流式处理错误')
              }
            } catch (e) {
              console.warn('解析流数据失败:', e)
            }
          }
        }
      }
      
    } catch (error: any) {
      console.error('🔴 [AIRadar] Stream Error:', error)
      
      // 如果有部分数据，保留它
      if (partialData && partialData.daily_ai_news && partialData.daily_ai_news.length > 0) {
        console.log('⚠️ [AIRadar] 保留部分数据:', partialData.daily_ai_news.length, '条')
        setRadarData(partialData)
        // 立即保存到全局状态
        setRadarState({ 
          result: partialData, 
          input: rawNews,
          isLoading: false,
          error: { show: true, message: `已生成 ${partialData.daily_ai_news.length} 条，但生成中断：${error.message}` }
        })
        setErrorState({ 
          show: true, 
          message: `已生成 ${partialData.daily_ai_news.length} 条，但生成中断：${error.message}` 
        })
      } else {
        let errorMessage = error.message || '未知错误'
        if (error.name === 'AbortError') {
          errorMessage = '请求已取消'
        }
        
        setErrorState({ show: true, message: errorMessage })
        setRadarState({ 
          isLoading: false,
          error: { show: true, message: errorMessage }
        })
      }
    } finally {
      // 清除定时器
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
        updateTimerRef.current = null
      }
      setIsAnalyzing(false)
      setStreamingText('')
      abortControllerRef.current = null
      
      // 确保最终状态保存（使用最新状态，包括 partialData）
      // 使用 setTimeout 确保状态已更新
      setTimeout(() => {
        const currentData = radarData || partialData
        if (currentData) {
          setRadarState({
            result: currentData,
            input: rawNews,
            isLoading: false,
            error: errorState.show ? errorState : null,
          })
          console.log('💾 [AIRadar] 最终状态已保存到全局 Store')
        }
      }, 100)
    }
  }

  // 分析新闻（保留旧版本作为后备）
  const analyzeNews = analyzeNewsStream

  return (
    <div className="h-full bg-gemini-bg text-gemini-text">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-gemini-text mb-2">
                AI Radar (设计雷达)
              </h1>
              <p className="text-xs md:text-sm text-gemini-text-secondary">
                自动聚合科技新闻，AI 生成设计情报日报
              </p>
            </div>
            <button
              onClick={() => loadData(true)}
              disabled={isFetching || isAnalyzing}
              className={`
                flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-black text-white text-xs md:text-sm font-medium
                rounded-full transition-all w-full md:w-auto
                ${isFetching || isAnalyzing ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'hover:bg-gray-800 shadow-gemini-sm'}
              `}
            >
              <Sparkles size={16} className={isFetching || isAnalyzing ? 'animate-spin' : ''} />
              {isFetching || isAnalyzing ? '正在分析数据...' : '刷新新闻'}
            </button>
          </div>
        </div>

        {/* 第一优先级：加载状态 */}
        {(isFetching || isAnalyzing) && (
          <div className="mb-6 p-6 bg-gemini-surface border border-gemini-border rounded-3xl">
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex items-center gap-3">
                  <span className="text-sm font-medium text-gemini-text">
                    {isAnalyzing && streamingText ? '正在生成...' : '正在分析数据...'}
                  </span>
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gemini-text-secondary mt-2">
                {isFetching ? '正在获取新闻源...' : '正在生成设计情报...'}
              </p>
              {/* 流式文本预览 */}
              {isAnalyzing && streamingText && (
                <div className="mt-4 p-4 bg-gemini-bg rounded-2xl text-left">
                  <p className="text-xs text-gemini-text-secondary mb-2">实时生成中...</p>
                  <pre className="text-xs text-gemini-text font-mono whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                    {streamingText.slice(-500)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 第二优先级：错误状态（如果有错误且没有数据，显示错误；如果有数据，错误提示在数据下方显示） */}
        {!isFetching && !isAnalyzing && errorState.show && !radarData && (
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

        {/* 第三优先级：数据内容（即使有错误提示，如果有数据也要显示） */}
        {radarData && (
          <>
            {/* Tab 切换 */}
            <div className="mb-6 flex flex-wrap gap-2">
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
                月度AI趋势
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
                  {dailyNewsItems}
                </div>
              </div>
            )}

            {/* Tab 2: 月度AI趋势（最近4个月） */}
            {activeTab === 'insight' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-6">
                  <Lightbulb size={20} className="text-black" />
                  <h2 className="text-lg font-semibold text-gemini-text">
                    月度AI趋势（最近4个月）
                  </h2>
                </div>

                {/* 优先显示新的月度趋势格式，向后兼容旧格式 */}
                {radarData.monthly_trends && Array.isArray(radarData.monthly_trends) && radarData.monthly_trends.length > 0 ? (
                  <div className="space-y-4">
                    {monthlyTrendsItems}
                  </div>
                ) : radarData.weekly_insights && Array.isArray(radarData.weekly_insights) && radarData.weekly_insights.length > 0 ? (
                  // 向后兼容：显示旧的周度数据
                  <div className="space-y-4">
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-2xl">
                      <p className="text-xs text-yellow-700">
                        ⚠️ 这是旧格式的周度数据，请刷新获取最新的月度趋势
                      </p>
                    </div>
                    {weeklyInsightsItems}
                  </div>
                ) : radarData.weekly_insight ? (
                  // 向后兼容：显示单个周度数据
                  <div className="bg-gemini-surface rounded-3xl p-8">
                    <div className="max-w-4xl mx-auto">
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-2xl">
                        <p className="text-xs text-yellow-700">
                          ⚠️ 这是旧格式的周度数据，请刷新获取最新的月度趋势
                        </p>
                      </div>
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
                ) : (
                  <div className="bg-gemini-surface rounded-3xl p-8 text-center">
                    <p className="text-sm text-gemini-text-secondary">
                      暂无月度趋势数据
                    </p>
                  </div>
                )}
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
                  {toolItems}
                </div>
              </div>
            )}
          </>
        )}

        {/* 数据下方的错误提示（如果有数据但仍有错误提示） */}
        {radarData && errorState.show && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
            <div className="text-yellow-700 text-sm">
              ⚠️ {errorState.message}
            </div>
          </div>
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
