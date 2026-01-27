'use client'

import { useState, useEffect, useRef } from 'react'
import { Upload, X, Sparkles, Image as ImageIcon, Link as LinkIcon, Trash2, Palette } from 'lucide-react'
import imageCompression from 'browser-image-compression'

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
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageUrl, setImageUrl] = useState<string>('')
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload')
  const [isExtracting, setIsExtracting] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [extractedData, setExtractedData] = useState<AestheticStyle | null>(null)
  const [styles, setStyles] = useState<AestheticStyle[]>([])
  const [errorState, setErrorState] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_IMAGES = 6
  const MAX_SIZE_PER_IMAGE = 500 * 1024 // 500KB
  const MAX_TOTAL_SIZE = 4 * 1024 * 1024 // 4MB

  // 从 LocalStorage 加载历史风格
  useEffect(() => {
    if (typeof window === 'undefined') return
    
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
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('aesthetic-collection', JSON.stringify(updatedStyles))
      setStyles(updatedStyles)
    } catch (e) {
      console.error('Failed to save styles:', e)
    }
  }

  // 压缩图片
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.5, // 500KB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    }
    
    try {
      const compressedFile = await imageCompression(file, options)
      return compressedFile
    } catch (error) {
      console.error('Image compression error:', error)
      throw new Error('图片压缩失败')
    }
  }

  // 处理批量图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length === 0) return

    // 检查数量限制
    const currentCount = selectedImages.length
    if (currentCount + files.length > MAX_IMAGES) {
      setErrorState({
        show: true,
        message: `最多只能上传 ${MAX_IMAGES} 张图片，当前已有 ${currentCount} 张`,
      })
      return
    }

    // 只取前 N 张
    const filesToProcess = files.slice(0, MAX_IMAGES - currentCount)
    setIsCompressing(true)
    setErrorState({ show: false, message: '' })

    try {
      const compressedFiles: File[] = []
      const compressedImages: string[] = []

      // 逐个压缩图片
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) {
          continue
        }

        const compressedFile = await compressImage(file)
        compressedFiles.push(compressedFile)

        // 转换为 base64
        const reader = new FileReader()
        await new Promise<void>((resolve, reject) => {
          reader.onloadend = () => {
            compressedImages.push(reader.result as string)
            resolve()
          }
          reader.onerror = reject
          reader.readAsDataURL(compressedFile)
        })
      }

      // 检查总大小
      const totalSize = compressedFiles.reduce((sum, file) => sum + file.size, 0)
      if (totalSize > MAX_TOTAL_SIZE) {
        setErrorState({
          show: true,
          message: `压缩后的图片总大小超过 4MB，请减少图片数量或选择更小的图片`,
        })
        return
      }

      setImageFiles([...imageFiles, ...compressedFiles])
      setSelectedImages([...selectedImages, ...compressedImages])
      setImageUrl('')
    } catch (error: any) {
      console.error('Image upload error:', error)
      setErrorState({
        show: true,
        message: error.message || '图片处理失败',
      })
    } finally {
      setIsCompressing(false)
      // 清空 input 以便再次选择相同文件
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 移除单张图片
  const handleRemoveImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newFiles = imageFiles.filter((_, i) => i !== index)
    setSelectedImages(newImages)
    setImageFiles(newFiles)
    setExtractedData(null)
  }

  // 移除所有图片
  const handleRemoveAllImages = () => {
    setSelectedImages([])
    setImageFiles([])
    setImageUrl('')
    setExtractedData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 处理图片 URL
  const handleImageUrlChange = (url: string) => {
    setImageUrl(url)
    setSelectedImages([])
    setImageFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 提取风格特征
  const extractFeatures = async () => {
    const hasImages = selectedImages.length > 0 || imageUrl
    if (!hasImages) {
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
          imagesBase64: selectedImages.length > 0 ? selectedImages : undefined,
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
          imageUrl: selectedImages.length > 0 ? selectedImages[0] : imageUrl,
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
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gemini-text mb-2">
            审美合集
          </h1>
          <p className="text-sm text-gemini-text-secondary">
            上传图片提取风格特征，构建可回溯的风格库
          </p>
        </div>

        {/* 输入区域 */}
        <div className="mb-8 border border-gemini-border rounded-2xl md:rounded-3xl p-4 md:p-6 bg-gemini-bg">
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
                {selectedImages.length === 0 ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gemini-border rounded-3xl p-8 md:p-12 
                             text-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      点击上传图片（最多 {MAX_IMAGES} 张）
                    </p>
                    <p className="text-xs text-gray-400">
                      支持 JPG、PNG、GIF 格式，每张图片将自动压缩至 500KB 以下
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        已选择 {selectedImages.length} / {MAX_IMAGES} 张图片
                      </p>
                      {selectedImages.length < MAX_IMAGES && (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-gray-600 hover:text-gray-900 underline"
                        >
                          继续添加
                        </button>
                      )}
                      <button
                        onClick={handleRemoveAllImages}
                        className="text-xs text-red-600 hover:text-red-800 underline"
                      >
                        清空所有
                      </button>
                    </div>
                    {isCompressing && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
                        正在压缩图片...
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`上传的图片 ${index + 1}`}
                            className="w-full aspect-square rounded-2xl border border-gemini-border object-cover bg-gemini-surface"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} className="text-gray-600" />
                          </button>
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                            {Math.round((imageFiles[index]?.size || 0) / 1024)}KB
                          </div>
                        </div>
                      ))}
                    </div>
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
          {(selectedImages.length > 0 || imageUrl) && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
