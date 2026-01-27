import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 各工具的状态类型定义
interface RadarState {
  input: any // 原始新闻数据
  result: any // 分析结果
  isLoading: boolean
  error: { show: boolean; message: string } | null
}

interface KnowledgeState {
  input: string // 文本输入或 PDF 内容
  result: any // 知识卡片列表
  isLoading: boolean
}

interface AestheticState {
  input: string[] // 图片数组（base64）
  result: any // 提取的风格数据
  isLoading: boolean
}

interface AppState {
  // 各工具的状态
  radar: RadarState
  knowledge: KnowledgeState
  aesthetic: AestheticState
  
  // Actions
  setRadarState: (state: Partial<RadarState>) => void
  setKnowledgeState: (state: Partial<KnowledgeState>) => void
  setAestheticState: (state: Partial<AestheticState>) => void
  
  // 重置状态
  resetRadar: () => void
  resetKnowledge: () => void
  resetAesthetic: () => void
}

const initialState = {
  radar: {
    input: null,
    result: null,
    isLoading: false,
    error: null,
  },
  knowledge: {
    input: '',
    result: null,
    isLoading: false,
  },
  aesthetic: {
    input: [],
    result: null,
    isLoading: false,
  },
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setRadarState: (state) =>
        set((prev) => ({
          radar: { ...prev.radar, ...state },
        })),
      
      setKnowledgeState: (state) =>
        set((prev) => ({
          knowledge: { ...prev.knowledge, ...state },
        })),
      
      setAestheticState: (state) =>
        set((prev) => ({
          aesthetic: { ...prev.aesthetic, ...state },
        })),
      
      resetRadar: () =>
        set({ radar: initialState.radar }),
      
      resetKnowledge: () =>
        set({ knowledge: initialState.knowledge }),
      
      resetAesthetic: () =>
        set({ aesthetic: initialState.aesthetic }),
    }),
    {
      name: 'app-state-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // 持久化结果和输入，但将 isLoading 设为 false（因为流式请求已中断）
        // 保留 result 和 input，这样切换回来时可以恢复数据
        radar: {
          input: state.radar.input,
          result: state.radar.result, // 保留结果，包括部分数据
          isLoading: false, // 流式请求已中断，设为 false
          error: state.radar.error, // 保留错误信息
        },
        knowledge: {
          input: state.knowledge.input,
          result: state.knowledge.result,
          isLoading: false,
        },
        aesthetic: {
          input: state.aesthetic.input,
          result: state.aesthetic.result,
          isLoading: false,
        },
      }),
    }
  )
)
