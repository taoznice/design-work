'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, X, Sparkles, Image as ImageIcon, Link as LinkIcon, Trash2, Palette } from 'lucide-react'

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

export default function AestheticCollectionPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedData, setExtractedData] = useState<AestheticStyle | null>(null)
  const [styles, setStyles] = useState<AestheticStyle[]>([])
  const [errorState, setErrorState] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 从 LocalStorage 加载历史风格
  useEffect(() => {
    const saved = localStorage.getItem('aesthetic-collection')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setStyles(parsed)
      } catch (e) {
        console.error('Failed to load aesthetic collection:', e)
      }
    }
  }, [])

  // 保存风格到 LocalStorage
  const saveStyles = (updatedStyles: AestheticStyle[]) => {
    try {
      localStorage.setItem('aesthetic-collection', JSON.stringify(updatedStyles))
      setStyles(updatedStyles)
    } catch (e) {
      console.error('Failed to save styles:', e)
    }
  }

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setImageUrl('')
      }
      reader.readAsDataURL(file)
    }
  }

  // 处理图片 URL
  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 移除图片
  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImageUrl('')
    setExtractedData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 提取风格特征
  const extractFeatures = async () => {
    const imageSource = selectedImage || imageUrl
    if (!imageSource) {
      alert('请先上传图片或输入图片链接')
      return
    }

    setIsExtracting(true)
    setErrorState({ show: false, message: '' })

    try {
      // 调用图片分析 API，使用专门的风格提取模式
      const response = await fetch('/api/extract-aesthetic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: selectedImage || undefined,
          imageUrl: imageUrl || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || '特征提取失败')
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        const style: AestheticStyle = {
          id: Date.now().toString(),
          title: data.data.title || '未命名风格',
          keywords: data.data.keywords || [],
          colorPalette: data.data.colorPalette || [],
          mood: data.data.mood || '',
          composition: data.data.composition || '',
          imageUrl: imageSource,
          createdAt: Date.now(),
        }
        
        setExtractedData(style)
        
        // 自动保存到风格库
        const updatedStyles = [style, ...styles]
        saveStyles(updatedStyles)
      } else {
        throw new Error(data.error || '提取失败')
      }
    } catch (error: any) {
      console.error('Failed to extract features:', error)
      
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
      }
      
      setErrorState({
        show: true,
        message: userFriendlyMessage,
      })
    } finally {
      setIsExtracting(false)
    }
  }

  // 删除风格
  const handleDeleteStyle = (id: string) => {
    if (confirm('确定要删除这个风格吗？')) {
      const updatedStyles = styles.filter(style => style.id !== id)
      saveStyles(updatedStyles)
    }
  }

  return (
    <div className="h-full bg-gemini-bg">
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gemini-text mb-2">
            审美合集
          </h1>
          <p className="text-sm text-gemini-text-secondary">
            上传图片提取风格特征，构建可回溯的风格库
          </p>
        </div>

        {/* 输入区域 */}
        <div className="mb-8 border border-gemini-border rounded-3xl p-6 bg-gemini-bg">
          <div className="mb-4">
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="inputMode"
                  checked={inputMode === 'upload'}
                  onChange={() => setInputMode('upload')}
                  className="text-gray-900"
                />
                <Upload size={16} className="text-gray-600" />
                <span className="text-sm text-gray-700">上传图片</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="inputMode"
                  checked={inputMode === 'url'}
                  onChange={() => setInputMode('url')}
                  className="text-gray-900"
                />
                <LinkIcon size={16} className="text-gray-600" />
                <span className="text-sm text-gray-700">图片链接</span>
              </label>
            </div>

            {inputMode === 'upload' ? (
              <div>
                {!selectedImage ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gemini-border rounded-3xl p-12 
                             text-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      点击上传图片
                    </p>
                    <p className="text-xs text-gray-400">
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
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50"
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="粘贴图片链接 URL..."
                  className="w-full px-4 py-3 bg-[#F5F5F5] text-gemini-text rounded-full text-sm focus:outline-none focus:ring-0 focus:shadow-gemini-focus focus:bg-white transition-all"
                />
                {imageUrl && (
                  <div className="mt-3 relative">
                    <img
                      src={imageUrl}
                      alt="预览"
                      className="w-full rounded-3xl border border-gemini-border max-h-64 object-contain bg-gemini-surface"
                      onError={() => {
                        setErrorState({ show: true, message: '图片链接无效，请检查 URL' })
                      }}
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50"
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 错误提示 */}
          {errorState.show && (
            <div className="mb-4 p-4 bg-white border border-gemini-border rounded-3xl shadow-gemini-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-breathe"></div>
                </div>
                <p className="text-sm text-gray-700 flex-1">{errorState.message}</p>
              </div>
            </div>
          )}

          {/* 提取按钮 */}
          {(selectedImage || imageUrl) && (
            <button
              onClick={extractFeatures}
              disabled={isExtracting}
              className={`
                w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-medium
                rounded-full transition-all
                ${isExtracting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}
              `}
            >
              <Sparkles size={16} />
              {isExtracting ? '正在提取特征...' : '提取特征'}
            </button>
          )}

          {/* 提取结果 */}
          {extractedData && (
            <div className="mt-6 p-4 border border-gemini-border rounded-3xl bg-gemini-surface">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">提取结果</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">标题：</span>
                  <span className="font-medium text-gray-900 ml-2">{extractedData.title}</span>
                </div>
                <div>
                  <span className="text-gray-500">关键词：</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {extractedData.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white border border-gray-200 text-gray-700 rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">配色：</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {extractedData.colorPalette.map((color, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <div
                          className="w-6 h-6 rounded border border-gray-200"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-gray-600">{color}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">情绪：</span>
                  <span className="font-medium text-gray-900 ml-2">{extractedData.mood}</span>
                </div>
                <div>
                  <span className="text-gray-500">构图：</span>
                  <span className="text-gray-700 ml-2">{extractedData.composition}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 风格库展示 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            风格库 ({styles.length})
          </h2>
          {styles.length === 0 ? (
            <div className="text-center py-12 border border-gemini-border rounded-3xl">
              <Palette size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-sm text-gray-400">还没有提取过风格特征</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {styles.map((style) => (
                <div
                  key={style.id}
                  className="group border border-gemini-border rounded-3xl overflow-hidden hover:shadow-gemini-sm transition-shadow"
                >
                  <div className="aspect-video bg-gray-50 relative">
                    <img
                      src={style.imageUrl}
                      alt={style.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleDeleteStyle(style.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} className="text-gray-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{style.title}</h3>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-gray-500">关键词：</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {style.keywords.slice(0, 3).map((keyword, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">配色：</span>
                        <div className="flex gap-1 mt-1">
                          {style.colorPalette.slice(0, 4).map((color, idx) => (
                            <div
                              key={idx}
                              className="w-4 h-4 rounded border border-gray-200"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">情绪：</span>
                        <span className="text-gray-700 ml-1">{style.mood}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
