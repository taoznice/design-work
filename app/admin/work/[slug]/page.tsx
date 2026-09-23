'use client'

import { ArrowDown, ArrowLeft, ArrowUp, Camera, GripVertical, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { workItems, type Language, type LocalizedText, type WorkContentBlock, type WorkItem } from '@/content/portfolio'

function createId() {
  return globalThis.crypto?.randomUUID?.() || `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function InlineEdit({
  value,
  onChange,
  as: Tag = 'p',
  className = '',
  placeholder,
  multiline = false,
}: {
  value: string
  onChange: (value: string) => void
  as?: 'p' | 'h1' | 'h2'
  className?: string
  placeholder: string
  multiline?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const elementRef = useRef<HTMLElement>(null)

  function startEditing() {
    setEditing(true)
    requestAnimationFrame(() => {
      const element = elementRef.current
      if (!element) return
      if (!value) element.innerText = ''
      element.focus()
      const range = document.createRange()
      range.selectNodeContents(element)
      range.collapse(false)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    })
  }

  function finishEditing() {
    onChange(elementRef.current?.innerText?.trim() ?? '')
    setEditing(false)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (!editing && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      startEditing()
      return
    }
    if (editing && event.key === 'Enter' && !multiline) {
      event.preventDefault()
      finishEditing()
    }
    if (editing && event.key === 'Escape') {
      if (elementRef.current) elementRef.current.innerText = value
      setEditing(false)
    }
  }

  return (
    <Tag
      ref={elementRef as React.Ref<never>}
      contentEditable={editing}
      suppressContentEditableWarning
      tabIndex={0}
      onClick={!editing ? startEditing : undefined}
      onBlur={editing ? finishEditing : undefined}
      onKeyDown={handleKeyDown}
      aria-label="点击编辑文本"
      title={!editing ? '点击编辑' : undefined}
      className={`${className} ${
        editing
          ? 'whitespace-pre-wrap bg-white/5 outline outline-1 outline-white/35 outline-offset-4'
          : 'cursor-text whitespace-pre-wrap transition-colors hover:text-white hover:underline hover:decoration-white/25 hover:underline-offset-4 focus:outline focus:outline-1 focus:outline-white/35 focus:outline-offset-4'
      } ${!value && !editing ? 'text-muted' : ''}`}
    >
      {value || placeholder}
    </Tag>
  )
}

function ImageSlot({
  src,
  slug,
  onUpdate,
  label = '替换图片',
  className = '',
}: {
  src: string
  slug: string
  onUpdate: (path: string) => void
  label?: string
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function upload(file: File) {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('slug', slug)
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok || !data.path) throw new Error(data.error || '上传失败')
      onUpdate(data.path)
    } catch (error) {
      console.error('图片上传失败:', error)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={`group/image relative overflow-hidden border border-transparent transition-colors hover:border-white/25 focus-within:border-white/25 ${className}`}>
      {src ? (
        <img src={src} alt="" className="block h-auto w-full bg-surface object-contain" />
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-full min-h-40 w-full items-center justify-center bg-surface text-[10px] font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:text-text-primary"
        >
          <Camera size={12} className="mr-2" /> 添加图片
        </button>
      )}
      {src && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-bg/90 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-text-primary opacity-100 transition-opacity sm:opacity-0 sm:group-hover/image:opacity-100 sm:group-focus-within/image:opacity-100 disabled:opacity-80"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
          {uploading ? '上传中' : label}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) upload(file)
        }}
      />
    </div>
  )
}

function LanguageSwitch({ language, setLanguage }: { language: Language; setLanguage: (language: Language) => void }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-medium tracking-[0.08em] text-muted">
      {(['en', 'zh'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          className={`transition-colors hover:text-text-primary ${language === option ? 'text-text-primary' : ''}`}
          aria-pressed={language === option}
        >
          {option === 'en' ? 'EN' : '中'}
        </button>
      ))}
    </div>
  )
}

function BlockActions({
  index,
  count,
  onMove,
  onDelete,
  onInsert,
  onDragStart,
  onDragEnd,
}: {
  index: number
  count: number
  onMove: (direction: -1 | 1) => void
  onDelete: () => void
  onInsert: (type: 'heading' | 'text' | 'wide-image' | 'triple-image') => void
  onDragStart: (event: React.DragEvent<HTMLButtonElement>) => void
  onDragEnd: () => void
}) {
  const [insertMenuOpen, setInsertMenuOpen] = useState(false)

  function insertAfter(type: 'heading' | 'text' | 'wide-image' | 'triple-image') {
    onInsert(type)
    setInsertMenuOpen(false)
  }

  return (
    <div className="absolute -right-1 top-2 z-10 flex items-center gap-1">
      {/* 已填充的区块始终提供明确删除入口；其余编排操作保持按需显示。 */}
      <button
        type="button"
        title="删除此内容"
        aria-label="删除此内容"
        onClick={onDelete}
        className="inline-flex items-center gap-1 border border-red-400/30 bg-bg/90 px-2 py-1.5 text-[10px] text-red-200 transition-colors hover:border-red-300 hover:bg-red-950/60 hover:text-red-100"
      >
        <Trash2 size={11} strokeWidth={1.5} /> 删除
      </button>

      <div className="flex items-center gap-0.5 bg-bg/90 p-0.5 text-muted opacity-100 transition-opacity sm:opacity-0 sm:group-hover/block:opacity-100 sm:group-focus-within/block:opacity-100">
        <button
          type="button"
          draggable
          title="拖拽移动内容"
          aria-label="拖拽移动内容"
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="cursor-grab touch-none p-1.5 transition-colors hover:text-text-primary active:cursor-grabbing"
        >
          <GripVertical size={12} strokeWidth={1.5} />
        </button>
        <div className="relative">
          <button type="button" title="在后面新增内容" aria-label="在后面新增内容" onClick={() => setInsertMenuOpen((open) => !open)} className="p-1.5 transition-colors hover:text-text-primary">
            <Plus size={12} strokeWidth={1.5} />
          </button>
          {insertMenuOpen && (
            <div className="absolute right-0 top-full mt-1 flex w-max flex-col border border-stroke bg-bg p-1 text-left shadow-xl">
              <button type="button" onClick={() => insertAfter('heading')} className="px-2 py-1.5 text-left text-[10px] hover:bg-surface hover:text-text-primary">段落标题</button>
              <button type="button" onClick={() => insertAfter('text')} className="px-2 py-1.5 text-left text-[10px] hover:bg-surface hover:text-text-primary">段落文字</button>
              <button type="button" onClick={() => insertAfter('wide-image')} className="px-2 py-1.5 text-left text-[10px] hover:bg-surface hover:text-text-primary">单张横图</button>
              <button type="button" onClick={() => insertAfter('triple-image')} className="px-2 py-1.5 text-left text-[10px] hover:bg-surface hover:text-text-primary">三张竖图</button>
            </div>
          )}
        </div>
        <button type="button" title="上移" aria-label="上移" disabled={index === 0} onClick={() => onMove(-1)} className="p-1.5 transition-colors hover:text-text-primary disabled:opacity-20">
          <ArrowUp size={12} strokeWidth={1.5} />
        </button>
        <button type="button" title="下移" aria-label="下移" disabled={index === count - 1} onClick={() => onMove(1)} className="p-1.5 transition-colors hover:text-text-primary disabled:opacity-20">
          <ArrowDown size={12} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}

export default function AdminWorkEditPage() {
  const params = useParams()
  const slug = params.slug as string
  const [language, setLanguage] = useState<Language>('en')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const sourceItem = workItems.find((work) => work.slug === slug)
  const [item, setItem] = useState<WorkItem | null>(null)

  useEffect(() => {
    if (sourceItem) setItem(JSON.parse(JSON.stringify(sourceItem)))
  }, []) // The source module is static for the current editor session.

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  }, [language])

  if (!item || !item.detail) {
    return <div className="flex min-h-screen items-center justify-center bg-bg font-body text-sm text-muted">作品不存在：{slug}</div>
  }

  const blocks = item.detail.blocks || []

  function updateItem(partial: Partial<WorkItem>) {
    setItem((current) => (current ? { ...current, ...partial } : current))
    setMessage(null)
  }

  function updateBlocks(recipe: (current: WorkContentBlock[]) => WorkContentBlock[]) {
    setItem((current) => {
      if (!current?.detail) return current
      return {
        ...current,
        detail: { ...current.detail, blocks: recipe(current.detail.blocks || []) },
      }
    })
    setMessage(null)
  }

  function updateTitle(value: string) {
    if (!item) return
    updateItem({ title: { ...item.title, [language]: value } })
  }

  function updateTextBlock(index: number, value: string) {
    updateBlocks((current) => current.map((block, blockIndex) => (
      blockIndex === index && (block.type === 'heading' || block.type === 'text')
        ? { ...block, content: { ...block.content, [language]: value } }
        : block
    )))
  }

  function updateWideImage(index: number, src: string) {
    updateBlocks((current) => current.map((block, blockIndex) => (
      blockIndex === index && block.type === 'image' && block.layout === 'wide' ? { ...block, src } : block
    )))
  }

  function updateTripleImage(index: number, imageIndex: number, src: string) {
    updateBlocks((current) => current.map((block, blockIndex) => {
      if (blockIndex !== index || block.type !== 'image' || block.layout !== 'triple') return block
      const srcs = [...block.srcs] as [string, string, string]
      srcs[imageIndex] = src
      return { ...block, srcs }
    }))
  }

  function addBlock(type: 'heading' | 'text' | 'wide-image' | 'triple-image', afterIndex?: number) {
    const block: WorkContentBlock = type === 'heading'
      ? { id: createId(), type: 'heading', content: { en: '', zh: '' } }
      : type === 'text'
        ? { id: createId(), type: 'text', content: { en: '', zh: '' } }
        : type === 'wide-image'
          ? { id: createId(), type: 'image', layout: 'wide', src: '' }
          : { id: createId(), type: 'image', layout: 'triple', srcs: ['', '', ''] }

    updateBlocks((current) => {
      if (afterIndex === undefined) return [...current, block]
      return [...current.slice(0, afterIndex + 1), block, ...current.slice(afterIndex + 1)]
    })
  }

  function moveBlock(index: number, direction: -1 | 1) {
    updateBlocks((current) => {
      const destination = index + direction
      if (destination < 0 || destination >= current.length) return current
      const next = [...current]
      ;[next[index], next[destination]] = [next[destination], next[index]]
      return next
    })
  }

  /** 把拖拽的区块插入到目标区块之前，适用于标题、文本、横图和三图组。 */
  function moveBlockBefore(sourceId: string, targetId: string) {
    if (sourceId === targetId) return

    updateBlocks((current) => {
      const sourceIndex = current.findIndex((block) => block.id === sourceId)
      const targetIndex = current.findIndex((block) => block.id === targetId)
      if (sourceIndex < 0 || targetIndex < 0) return current

      const next = [...current]
      const [movedBlock] = next.splice(sourceIndex, 1)
      const insertionIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex
      next.splice(insertionIndex, 0, movedBlock)
      return next
    })
  }

  function handleDragStart(event: React.DragEvent<HTMLButtonElement>, blockId: string) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', blockId)
    setDraggedBlockId(blockId)
    setDropTargetId(null)
  }

  function handleDragOver(event: React.DragEvent<HTMLElement>, blockId: string) {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (blockId !== draggedBlockId) setDropTargetId(blockId)
  }

  function handleDrop(event: React.DragEvent<HTMLElement>, targetId: string) {
    event.preventDefault()
    const sourceId = event.dataTransfer.getData('text/plain') || draggedBlockId
    if (sourceId) moveBlockBefore(sourceId, targetId)
    setDraggedBlockId(null)
    setDropTargetId(null)
  }

  function handleDragEnd() {
    setDraggedBlockId(null)
    setDropTargetId(null)
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      const updatedItems = workItems.map((work) => (work.slug === slug ? item : work))
      const response = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems),
      })
      const data = await response.json()
      if (!response.ok || data.error) throw new Error(data.error || '保存失败')
      setMessage('已保存并推送，站点会在构建完成后更新。')
    } catch (error) {
      setMessage(`保存失败：${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-bg font-body text-text-primary">
      <header className="sticky top-0 z-50 border-b border-stroke bg-bg/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <Link href="/admin" className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em] text-muted transition-colors hover:text-text-primary">
            <ArrowLeft size={13} strokeWidth={1.5} /> 返回列表
          </Link>
          <div className="flex items-center gap-6">
            <LanguageSwitch language={language} setLanguage={setLanguage} />
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 border border-text-primary px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] transition-colors hover:bg-text-primary hover:text-bg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} strokeWidth={1.5} />}
              {saving ? '保存中' : '保存'}
            </button>
          </div>
        </div>
      </header>

      {message && (
        <div className={`fixed right-5 top-16 z-50 border px-3 py-2 text-xs ${message.startsWith('保存失败') ? 'border-red-400/40 bg-red-950 text-red-100' : 'border-white/25 bg-bg text-text-primary'}`}>
          {message}
        </div>
      )}

      <article className="mx-auto w-full max-w-[1240px] px-5 pb-24 pt-10 sm:px-8 sm:pt-16 lg:px-10 lg:pb-32">
        <InlineEdit
          value={item.title[language]}
          onChange={updateTitle}
          as="h1"
          className="mx-auto max-w-[48rem] text-4xl font-normal leading-[1.08] tracking-[-0.05em] text-text-primary sm:text-6xl lg:text-7xl"
          placeholder="输入项目标题"
        />

        <div className="pt-2 sm:pt-4">
          {blocks.map((block, index) => (
            <section
              key={block.id}
              onDragOver={(event) => handleDragOver(event, block.id)}
              onDrop={(event) => handleDrop(event, block.id)}
              className={`group/block relative transition-opacity ${draggedBlockId === block.id ? 'opacity-40' : ''}`}
            >
              {dropTargetId === block.id && draggedBlockId !== block.id && (
                <div className="absolute inset-x-0 top-0 z-20 h-px bg-blue-400" aria-hidden="true" />
              )}
              <BlockActions
                index={index}
                count={blocks.length}
                onMove={(direction) => moveBlock(index, direction)}
                onDelete={() => updateBlocks((current) => current.filter((_, blockIndex) => blockIndex !== index))}
                onInsert={(type) => addBlock(type, index)}
                onDragStart={(event) => handleDragStart(event, block.id)}
                onDragEnd={handleDragEnd}
              />

              {block.type === 'heading' && (
                <InlineEdit
                  value={block.content[language]}
                  onChange={(value) => updateTextBlock(index, value)}
                  as="h2"
                  className="mx-auto max-w-[48rem] pt-12 text-2xl font-medium leading-[1.2] tracking-[-0.035em] text-text-primary sm:pt-20 sm:text-3xl"
                  placeholder="输入段落标题"
                />
              )}

              {block.type === 'text' && (
                <InlineEdit
                  value={block.content[language]}
                  onChange={(value) => updateTextBlock(index, value)}
                  as="p"
                  className="mx-auto max-w-[48rem] pt-5 text-base leading-[1.8] text-text-primary/80 sm:pt-6 sm:text-lg sm:leading-[1.75]"
                  placeholder="输入段落文字"
                  multiline
                />
              )}

              {block.type === 'image' && block.layout === 'wide' && (
                <ImageSlot
                  src={block.src}
                  slug={slug}
                  onUpdate={(src) => updateWideImage(index, src)}
                  className="mx-auto max-w-[48rem] pt-10 sm:pt-16"
                  label="替换横图"
                />
              )}

              {block.type === 'image' && block.layout === 'triple' && (
                <div className="mx-auto grid max-w-[48rem] grid-cols-3 gap-2 pt-10 sm:gap-4 sm:pt-16">
                  {block.srcs.map((src, imageIndex) => (
                    <ImageSlot
                      key={imageIndex}
                      src={src}
                      slug={slug}
                      onUpdate={(path) => updateTripleImage(index, imageIndex, path)}
                      className="aspect-[9/16]"
                      label="替换竖图"
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-[48rem] border-t border-stroke pt-5 sm:mt-24">
          <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.1em] text-muted">新增内容</p>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            <button type="button" onClick={() => addBlock('heading')} className="inline-flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-text-primary">
              <Plus size={13} strokeWidth={1.5} /> 段落标题
            </button>
            <button type="button" onClick={() => addBlock('text')} className="inline-flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-text-primary">
              <Plus size={13} strokeWidth={1.5} /> 段落文字
            </button>
            <button type="button" onClick={() => addBlock('wide-image')} className="inline-flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-text-primary">
              <Plus size={13} strokeWidth={1.5} /> 单张横图
            </button>
            <button type="button" onClick={() => addBlock('triple-image')} className="inline-flex items-center gap-1.5 text-[11px] text-muted transition-colors hover:text-text-primary">
              <Plus size={13} strokeWidth={1.5} /> 三张竖图
            </button>
          </div>
        </div>
      </article>
    </main>
  )
}
