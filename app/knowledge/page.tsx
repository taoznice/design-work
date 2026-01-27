'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, X, Image as ImageIcon, FileText, Trash2, Save, File } from 'lucide-react'

interface KnowledgeCard {
  id: string
  title: string
  contentType: 'text' | 'image'
  content: string // 文本内容或图片 URL/base64
  enabled: boolean
  createdAt: number
}

export default function KnowledgePage() {
  const [cards, setCards] = useState<KnowledgeCard[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newCard, setNewCard] = useState<Partial<KnowledgeCard>>({
    title: '',
    contentType: 'text',
    content: '',
    enabled: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isParsingPdf, setIsParsingPdf] = useState(false)
  const [pdfText, setPdfText] = useState<string>('')
  const [pdfTruncated, setPdfTruncated] = useState(false)

  // 从 LocalStorage 加载数据
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const saved = localStorage.getItem('team-wisdom')
    if (saved) {
      try {
        setCards(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load knowledge cards:', e)
      }
    }
  }, [])

  // 保存到 LocalStorage
  const saveCards = (updatedCards: KnowledgeCard[]) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem('team-wisdom', JSON.stringify(updatedCards))
      setCards(updatedCards)
    } catch (e) {
      console.error('Failed to save knowledge cards:', e)
    }
  }

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewCard(prev => ({
          ...prev,
          content: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  // 处理 PDF 上传和解析
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setIsParsingPdf(true)
      setPdfText('')
      setPdfTruncated(false)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/parse-pdf', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'PDF 解析失败')
        }

        const data = await response.json()
        if (data.success && data.data) {
          setPdfText(data.data.text)
          setPdfTruncated(data.data.isTruncated)
          setNewCard(prev => ({
            ...prev,
            content: data.data.text,
          }))
        } else {
          throw new Error(data.error || 'PDF 解析失败')
        }
      } catch (error: any) {
        console.error('PDF Parse Error:', error)
        alert(`PDF 解析失败：${error.message || '未知错误'}`)
        setPdfFile(null)
      } finally {
        setIsParsingPdf(false)
      }
    }
  }

  // 添加新卡片
  const handleAddCard = () => {
    if (!newCard.title || !newCard.content) {
      alert('请填写标题和内容')
      return
    }

    const card: KnowledgeCard = {
      id: Date.now().toString(),
      title: newCard.title!,
      contentType: newCard.contentType || 'text',
      content: newCard.content!,
      enabled: newCard.enabled ?? true,
      createdAt: Date.now(),
    }

    const updatedCards = [...cards, card]
    saveCards(updatedCards)
    
    // 重置表单
    setNewCard({
      title: '',
      contentType: 'text',
      content: '',
      enabled: true,
    })
    setImageFile(null)
    setPdfFile(null)
    setPdfText('')
    setPdfTruncated(false)
    setIsAdding(false)
  }

  // 删除卡片
  const handleDeleteCard = (id: string) => {
    if (confirm('确定要删除这张知识卡片吗？')) {
      const updatedCards = cards.filter(card => card.id !== id)
      saveCards(updatedCards)
    }
  }

  // 切换启用状态
  const handleToggleEnabled = (id: string) => {
    const updatedCards = cards.map(card =>
      card.id === id ? { ...card, enabled: !card.enabled } : card
    )
    saveCards(updatedCards)
  }

  const enabledCount = cards.filter(c => c.enabled).length

  return (
    <div className="h-full bg-gemini-bg">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gemini-text mb-2">
                Team Wisdom (团队知识库)
              </h1>
              <p className="text-sm text-gemini-text-secondary">
                管理公司内部方法论和参考标准，让 AI 在对话时参考这些知识
              </p>
            </div>
            <div className="flex items-center gap-3">
              {cards.length > 0 && (
                <span className="text-xs text-gray-500">
                  共 {cards.length} 条，{enabledCount} 条启用
                </span>
              )}
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                添加知识卡片
              </button>
            </div>
          </div>
        </div>

        {/* 添加卡片表单 */}
        {isAdding && (
          <div className="mb-6 p-6 border border-gemini-border rounded-3xl bg-gemini-surface">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  标题 *
                </label>
                <input
                  type="text"
                  value={newCard.title || ''}
                  onChange={(e) => setNewCard(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="例如：SWOT分析法-公司版"
                  className="w-full px-4 py-3 bg-[#F5F5F5] text-gemini-text rounded-full text-sm focus:outline-none focus:ring-0 focus:shadow-gemini-focus focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  内容类型
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contentType"
                      checked={newCard.contentType === 'text'}
                      onChange={() => setNewCard(prev => ({ ...prev, contentType: 'text' }))}
                      className="text-gray-900"
                    />
                    <FileText size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-700">纯文本描述</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contentType"
                      checked={newCard.contentType === 'image'}
                      onChange={() => setNewCard(prev => ({ ...prev, contentType: 'image' }))}
                      className="text-gray-900"
                    />
                    <ImageIcon size={16} className="text-gray-600" />
                    <span className="text-sm text-gray-700">图片</span>
                  </label>
                </div>
              </div>

              {newCard.contentType === 'text' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    内容 *
                  </label>
                  <div className="mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = '.pdf'
                        input.onchange = (e: any) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handlePdfUpload({ target: { files: [file] } } as any)
                          }
                        }
                        input.click()
                      }}
                      disabled={isParsingPdf}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <File size={14} />
                      {isParsingPdf ? '正在解析 PDF...' : '上传 PDF'}
                    </button>
                  </div>
                  {pdfTruncated && (
                    <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-700">
                      ⚠️ 已截取前 10,000 个字符进行分析
                    </div>
                  )}
                  <textarea
                    value={newCard.content || ''}
                    onChange={(e) => setNewCard(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="输入方法论描述，或点击上方按钮上传 PDF 文件..."
                    className="w-full min-h-[120px] px-4 py-3 bg-[#F5F5F5] text-gemini-text placeholder:text-gemini-text-secondary rounded-3xl text-sm focus:outline-none focus:ring-0 focus:shadow-gemini-focus focus:bg-white resize-none transition-all"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    上传图片 *
                  </label>
                  {!newCard.content ? (
                    <div
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = 'image/*'
                        input.onchange = (e: any) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleImageUpload({ target: { files: [file] } } as any)
                          }
                        }
                        input.click()
                      }}
                      className="border-2 border-dashed border-gemini-border rounded-3xl p-8 text-center cursor-pointer hover:border-black transition-all"
                    >
                      <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">点击上传图片</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={newCard.content}
                        alt="预览"
                        className="w-full rounded-3xl border border-gemini-border max-h-48 object-contain bg-gemini-surface"
                      />
                      <button
                        onClick={() => {
                          setNewCard(prev => ({ ...prev, content: '' }))
                          setImageFile(null)
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50"
                      >
                        <X size={14} className="text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setIsAdding(false)
                    setNewCard({ title: '', contentType: 'text', content: '', enabled: true })
                    setImageFile(null)
                    setPdfFile(null)
                    setPdfText('')
                    setPdfTruncated(false)
                  }}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  取消
                </button>
                <button
                  onClick={handleAddCard}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
                >
                  <Save size={16} />
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 知识卡片列表 */}
        {cards.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-400 mb-2">还没有知识卡片</p>
            <p className="text-xs text-gray-400">点击"添加知识卡片"开始创建</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`border rounded-3xl p-5 transition-all ${
                  card.enabled
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-100 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">{card.title}</h3>
                      <span className="text-xs text-gray-500">
                        {card.contentType === 'text' ? (
                          <FileText size={14} className="inline" />
                        ) : (
                          <ImageIcon size={14} className="inline" />
                        )}
                      </span>
                    </div>
                    {card.contentType === 'text' ? (
                      <p className="text-sm text-gray-600 line-clamp-2">{card.content}</p>
                    ) : (
                      <img
                        src={card.content}
                        alt={card.title}
                        className="mt-2 rounded border border-gray-200 max-h-32 object-contain bg-gray-50"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={card.enabled}
                        onChange={() => handleToggleEnabled(card.id)}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-6 rounded-full transition-colors ${
                          card.enabled ? 'bg-gray-900' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform mt-0.5 ${
                            card.enabled ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    </label>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
