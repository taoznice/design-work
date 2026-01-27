# 全局记忆功能集成指南

## 概述

全局记忆功能已集成到应用中，可以在任何页面中监听用户输入和 AI 回复，自动提取并保存用户的长期偏好、项目背景和专用术语。

## 快速集成（3 步）

### 1. 导入 Hook 和组件

```typescript
import MemoryToast from '@/components/MemoryToast'
import { useMemoryExtraction } from '@/hooks/useMemoryExtraction'
```

### 2. 在组件中使用 Hook

```typescript
export default function YourPage() {
  // 使用全局记忆提取 Hook
  const {
    suggestion: memoryUpdateSuggestion,
    extractMemory,
    confirmMemory,
    ignoreMemory,
  } = useMemoryExtraction()
  
  // ... 你的其他代码
}
```

### 3. 在 AI 生成完成后触发记忆提取

```typescript
// 在 AI 生成完成后（不阻塞用户）
if (userInput.trim() && aiResponse.trim()) {
  setTimeout(() => {
    extractMemory(userInput.trim(), aiResponse.trim())
  }, 500)
}
```

### 4. 添加 Toast 组件到 JSX

```typescript
return (
  <div>
    {/* 你的页面内容 */}
    
    {/* 全局记忆更新 Toast 通知 */}
    <MemoryToast
      suggestion={memoryUpdateSuggestion}
      onConfirm={confirmMemory}
      onIgnore={ignoreMemory}
      onClose={ignoreMemory}
    />
  </div>
)
```

## 完整示例

```typescript
'use client'

import { useState } from 'react'
import MemoryToast from '@/components/MemoryToast'
import { useMemoryExtraction } from '@/hooks/useMemoryExtraction'

export default function YourNewFeature() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  // 使用全局记忆提取 Hook
  const {
    suggestion: memoryUpdateSuggestion,
    extractMemory,
    confirmMemory,
    ignoreMemory,
  } = useMemoryExtraction()
  
  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // 调用你的 API
      const response = await fetch('/api/your-api', {
        method: 'POST',
        body: JSON.stringify({ query: input }),
      })
      const data = await response.json()
      
      if (data.success) {
        const aiResponse = data.data.response
        setOutput(aiResponse)
        
        // 后台静默分析记忆（不阻塞用户）
        if (input.trim()) {
          setTimeout(() => {
            extractMemory(input.trim(), aiResponse)
          }, 500)
        }
      }
    } finally {
      setIsGenerating(false)
    }
  }
  
  return (
    <div>
      {/* 你的页面内容 */}
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={handleGenerate}>生成</button>
      <div>{output}</div>
      
      {/* 全局记忆更新 Toast 通知 */}
      <MemoryToast
        suggestion={memoryUpdateSuggestion}
        onConfirm={confirmMemory}
        onIgnore={ignoreMemory}
        onClose={ignoreMemory}
      />
    </div>
  )
}
```

## 已集成的页面

- ✅ **策略实验室** (`app/strategy-lab/page.tsx`)
- ✅ **方案判断** (`app/proposal-review/page.tsx`)
- ✅ **翻译助手** (`app/translation/page.tsx`)

## 工作原理

1. **监听触发**：当用户点击"生成"、"发送"或"保存"按钮时，在 AI 生成完成后自动触发
2. **后台分析**：使用 `setTimeout` 延迟 500ms 执行，不阻塞用户当前操作
3. **AI 判别**：调用 `/api/extract-memory` API，AI 判断是否为长期偏好或关键事实
4. **Toast 通知**：如果检测到可保存的记忆，在右下角显示 Toast 通知
5. **用户确认**：用户可以选择"确认保存"或"忽略"

## 注意事项

- 记忆提取是**静默执行**的，失败不会影响主流程
- 只在**记忆功能启用**时才会执行
- 使用 `setTimeout` 确保不阻塞用户操作
- Toast 会在 5 秒后自动关闭，也可以手动关闭

## 未来扩展

如需在其他页面集成，只需按照上述 4 个步骤操作即可。Hook 会自动处理：
- 读取记忆配置
- 调用 API
- 管理 Toast 状态
- 保存记忆到 localStorage
