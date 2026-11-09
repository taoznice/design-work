'use client'

import { ArrowDown, ArrowLeft, ArrowUp, Camera, Check, Crop, GripVertical, Images, Loader2, Plus, Save, Sparkles, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { workItems, type Language, type LocalizedText, type MediaCrop, type WorkContentBlock, type WorkItem } from '@/content/portfolio'
import { CroppedMedia } from '@/components/CroppedMedia'
import { isVideoSrc } from '@/lib/media'

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
          ? 'whitespace-pre-wrap bg-black/[0.03] outline outline-1 outline-black/30 outline-offset-4'
          : 'cursor-text whitespace-pre-wrap transition-colors hover:text-text-primary hover:underline hover:decoration-text-primary/25 hover:underline-offset-4 focus:outline focus:outline-1 focus:outline-black/30 focus:outline-offset-4'
      } ${!value && !editing ? 'text-muted' : ''}`}
    >
      {value || placeholder}
    </Tag>
  )
}

/** 视频容器背景色预设（空值 = 默认 surface 灰） */
const VIDEO_BG_PRESETS = [
  { label: '默认灰', value: '' },
  { label: '纯白', value: '#FFFFFF' },
  { label: '暖米', value: '#F5EFE6' },
  { label: '深灰', value: '#262626' },
  { label: '纯黑', value: '#000000' },
]

function ImageSlot({
  src,
  slug,
  onUpdate,
  label = '替换图片',
  className = '',
  mediaClassName = '',
  mediaBgClass = 'bg-surface',
  crop = null,
}: {
  src: string
  slug: string
  onUpdate: (path: string) => void
  label?: string
  className?: string
  /** 追加到内部 img/video 上的类名（用于窄版视频预览等场景） */
  mediaClassName?: string
  /** 媒体元素的兜底背景类，默认 surface 灰；窄版视频容器自带背景时传空 */
  mediaBgClass?: string
  /** 显示区域裁剪：传入后按裁剪区域渲染媒体（与前台详情页一致，不会变形） */
  crop?: MediaCrop | null
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
    <div className={`group/image relative overflow-hidden border border-transparent transition-colors hover:border-black/20 focus-within:border-black/20 ${className}`}>
      {src ? (
        crop ? (
          <CroppedMedia src={src} crop={crop} />
        ) : isVideoSrc(src) ? (
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className={`block h-auto w-full object-contain ${mediaBgClass} ${mediaClassName}`}
          />
        ) : (
          <img
            src={src}
            alt=""
            className={`block h-auto w-full object-contain ${mediaBgClass} ${mediaClassName}`}
          />
        )
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-full min-h-40 w-full items-center justify-center bg-surface text-[10px] font-medium uppercase tracking-[0.08em] text-muted transition-colors hover:text-text-primary"
        >
          <Camera size={12} className="mr-2" /> 添加图片/视频
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
        accept="image/*,video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) upload(file)
        }}
      />
    </div>
  )
}

/** 裁剪框的最小尺寸（占素材宽/高的比例），防止误触产生不可见的微小选区 */
const CROP_MIN = 0.05

type CropDragMode = 'draw' | 'move' | 'nw' | 'ne' | 'sw' | 'se'

/**
 * 显示区域框选器：在素材上拖动框出要展示的范围，可整体移动、可拉四角调整。
 * 只记录百分比坐标，不修改素材文件本身；视频/GIF/图片通用。
 */
function CropEditor({
  src,
  initial,
  onApply,
  onCancel,
}: {
  src: string
  initial?: MediaCrop
  onApply: (crop: MediaCrop | undefined) => void
  onCancel: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rect, setRect] = useState<MediaCrop | null>(initial ?? null)
  const dragRef = useRef<{ mode: CropDragMode; startX: number; startY: number; orig: MediaCrop | null } | null>(null)

  function toPoint(clientX: number, clientY: number) {
    const box = containerRef.current?.getBoundingClientRect()
    if (!box) return { x: 0, y: 0 }
    return {
      x: Math.min(1, Math.max(0, (clientX - box.left) / box.width)),
      y: Math.min(1, Math.max(0, (clientY - box.top) / box.height)),
    }
  }

  function startDrag(event: React.PointerEvent, mode: CropDragMode) {
    event.preventDefault()
    event.stopPropagation()
    const point = toPoint(event.clientX, event.clientY)
    dragRef.current = { mode, startX: point.x, startY: point.y, orig: rect ? { ...rect } : null }
    window.addEventListener('pointermove', handleDragMove)
    window.addEventListener('pointerup', handleDragEnd, { once: true })
  }

  function handleDragMove(event: PointerEvent) {
    const drag = dragRef.current
    if (!drag) return
    const point = toPoint(event.clientX, event.clientY)

    if (drag.mode === 'draw') {
      setRect({
        x: Math.min(drag.startX, point.x),
        y: Math.min(drag.startY, point.y),
        w: Math.abs(point.x - drag.startX),
        h: Math.abs(point.y - drag.startY),
      })
      return
    }
    if (!drag.orig) return
    const origin = drag.orig

    if (drag.mode === 'move') {
      setRect({
        ...origin,
        x: Math.min(1 - origin.w, Math.max(0, origin.x + point.x - drag.startX)),
        y: Math.min(1 - origin.h, Math.max(0, origin.y + point.y - drag.startY)),
      })
      return
    }

    let { x, y, w, h } = origin
    if (drag.mode.includes('e')) w = Math.min(1 - x, Math.max(CROP_MIN, point.x - x))
    if (drag.mode.includes('s')) h = Math.min(1 - y, Math.max(CROP_MIN, point.y - y))
    if (drag.mode.includes('w')) {
      const nextX = Math.min(origin.x + origin.w - CROP_MIN, Math.max(0, point.x))
      w = origin.x + origin.w - nextX
      x = nextX
    }
    if (drag.mode.includes('n')) {
      const nextY = Math.min(origin.y + origin.h - CROP_MIN, Math.max(0, point.y))
      h = origin.y + origin.h - nextY
      y = nextY
    }
    setRect({ x, y, w, h })
  }

  function handleDragEnd() {
    window.removeEventListener('pointermove', handleDragMove)
    dragRef.current = null
    // 过小的选区视为误触，直接丢弃
    setRect((current) => (current && (current.w < CROP_MIN || current.h < CROP_MIN) ? null : current))
  }

  const valid = !!rect && rect.w >= CROP_MIN && rect.h >= CROP_MIN

  return (
    <div>
      <p className="mb-2 text-[12px] text-muted">在素材上拖动框选要展示的区域；拖动选区可移动，拖动四角圆点可调整大小。</p>
      <div
        ref={containerRef}
        onPointerDown={(event) => startDrag(event, 'draw')}
        className="relative w-full cursor-crosshair touch-none select-none overflow-hidden rounded-[20px]"
      >
        {isVideoSrc(src) ? (
          <video src={src} autoPlay loop muted playsInline className="pointer-events-none block w-full" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" draggable={false} className="pointer-events-none block w-full" />
        )}
        {valid && rect && (
          <div
            onPointerDown={(event) => startDrag(event, 'move')}
            className="absolute cursor-move border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
            style={{ left: `${rect.x * 100}%`, top: `${rect.y * 100}%`, width: `${rect.w * 100}%`, height: `${rect.h * 100}%` }}
          >
            {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
              <span
                key={corner}
                onPointerDown={(event) => startDrag(event, corner)}
                className="absolute h-3.5 w-3.5 rounded-full border border-black/20 bg-white shadow"
                style={{
                  left: corner.includes('w') ? '-7px' : undefined,
                  right: corner.includes('e') ? '-7px' : undefined,
                  top: corner.includes('n') ? '-7px' : undefined,
                  bottom: corner.includes('s') ? '-7px' : undefined,
                  cursor: corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize',
                }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          disabled={!valid}
          onClick={() => onApply(valid && rect ? rect : undefined)}
          className="inline-flex items-center gap-1.5 rounded-full bg-text-primary px-4 py-1.5 text-[12px] font-semibold text-bg transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Check size={12} strokeWidth={2.5} /> 应用裁剪
        </button>
        {initial && (
          <button type="button" onClick={() => onApply(undefined)} className="text-[12px] font-semibold text-red-500 transition-colors hover:text-red-600">
            清除裁剪
          </button>
        )}
        <button type="button" onClick={onCancel} className="text-[12px] font-semibold text-muted transition-colors hover:text-text-primary">
          取消
        </button>
      </div>
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
        className="inline-flex items-center gap-1 border border-red-300/60 bg-bg/90 px-2 py-1.5 text-[10px] text-red-500 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600"
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
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [coverPickerOpen, setCoverPickerOpen] = useState(false)
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverAiOpen, setCoverAiOpen] = useState(false)
  const [coverPrompt, setCoverPrompt] = useState('')
  const [coverRefs, setCoverRefs] = useState<string[]>([])
  const [coverGenerating, setCoverGenerating] = useState(false)
  const [cropEditingIndex, setCropEditingIndex] = useState<number | null>(null)
  const [triplePicker, setTriplePicker] = useState<{ block: number; cell: number } | null>(null)

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

  /** 项目内已上传的全部素材（详情页配图 + 当前封面），用于封面选择器 */
  const projectMedia = Array.from(
    new Set(
      blocks
        .flatMap((block) => {
          if (block.type !== 'image') return []
          return block.layout === 'wide' ? [block.src] : [...block.srcs]
        })
        .concat(item.image ? [item.image] : [])
        .filter(Boolean),
    ),
  )

  /** 上传封面：复用素材上传接口，成功后设为 item.image */
  async function handleCoverFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setCoverUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('slug', slug)
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '上传失败')
      updateItem({ image: data.path })
    } catch (error) {
      setMessage(`封面上传失败：${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setCoverUploading(false)
    }
  }

  /** 基于项目标题与正文，生成一段封面描述建议，供用户确认或修改 */
  function buildCoverPromptSuggestion(): string {
    const title = item?.title.zh || item?.title.en || ''
    const summary = blocks
      .filter((block): block is Extract<WorkContentBlock, { type: 'heading' | 'text' }> => block.type !== 'image')
      .map((block) => (block.content.zh || block.content.en || '').trim())
      .find((text) => text.length > 0)
      ?.slice(0, 120)
    const subject = summary ? `${title}。${summary}` : title
    return `为作品集项目「${subject}」设计一张封面图。要求：极简构图，浅色干净背景，大面积留白，视觉焦点集中，高品质设计感，横版构图，画面中不要出现任何文字。`
  }

  /** 打开 AI 生成面板：首次打开且未填写时，自动预填内容建议 */
  function toggleCoverAiPanel() {
    setCoverAiOpen((open) => {
      if (!open && !coverPrompt.trim()) setCoverPrompt(buildCoverPromptSuggestion())
      return !open
    })
  }

  /** AI 生成封面：调用 gpt-image-2，成功后直接设为封面 */
  async function handleCoverGenerate() {
    if (!coverPrompt.trim() || coverGenerating) return
    setCoverGenerating(true)
    setMessage(null)
    try {
      const response = await fetch('/api/admin/generate-cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: coverPrompt.trim(), slug, referencePaths: coverRefs }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '生成失败')
      updateItem({ image: data.path })
      setMessage(`封面已生成（${data.model || 'AIGC'}）并设为当前封面，满意后记得保存。`)
    } catch (error) {
      setMessage(`封面生成失败：${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setCoverGenerating(false)
    }
  }

  function toggleCoverRef(src: string) {
    setCoverRefs((current) => (current.includes(src) ? current.filter((s) => s !== src) : [...current, src]))
  }

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

  /** 更新 wide 块的展示设置（视频撑满 / 背景色 / 显示裁剪 / 裁剪圆角） */
  function updateWideVideo(index: number, partial: { videoFill?: boolean; videoBg?: string; crop?: MediaCrop; cropRounded?: boolean }) {
    updateBlocks((current) => current.map((block, blockIndex) => (
      blockIndex === index && block.type === 'image' && block.layout === 'wide' ? { ...block, ...partial } : block
    )))
  }

  /** 单张横图块 → 三图并排块（原图进第一格，其余两格留空可补） */
  function convertWideToTriple(index: number) {
    updateBlocks((current) => current.map((block, blockIndex) => (
      blockIndex === index && block.type === 'image' && block.layout === 'wide'
        ? { id: block.id, type: 'image', layout: 'triple', srcs: [block.src, '', ''] }
        : block
    )))
  }

  /** 三图并排块 → 单张横图块（保留第一格非空的素材） */
  function convertTripleToWide(index: number) {
    updateBlocks((current) => current.map((block, blockIndex) => (
      blockIndex === index && block.type === 'image' && block.layout === 'triple'
        ? { id: block.id, type: 'image', layout: 'wide', src: block.srcs.find((src) => src) || '' }
        : block
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
        <div className="mx-auto flex w-full max-w-[72rem] items-center justify-between px-6 py-4">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-text-primary">
            <ArrowLeft size={15} strokeWidth={2} /> 返回列表
          </Link>
          <div className="flex items-center gap-6">
            <LanguageSwitch language={language} setLanguage={setLanguage} />
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full border border-text-primary px-4 py-1.5 text-[13px] font-semibold transition-colors hover:bg-text-primary hover:text-bg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} strokeWidth={2} />}
              {saving ? '保存中' : '保存'}
            </button>
          </div>
        </div>
      </header>

      {message && (
        <div className={`fixed right-5 top-16 z-50 rounded-lg border px-3 py-2 text-xs ${message.startsWith('保存失败') ? 'border-red-200 bg-red-50 text-red-600' : 'border-stroke bg-bg text-text-primary'}`}>
          {message}
        </div>
      )}

      <article className="mx-auto w-full max-w-[72rem] px-6 pb-24 pt-10 sm:pt-14 lg:pb-32">
        <InlineEdit
          value={item.title[language]}
          onChange={updateTitle}
          as="h1"
          className="text-[26px] font-extrabold leading-[1.35] tracking-tight text-text-primary sm:text-[32px]"
          placeholder="输入项目标题"
        />

        {/* 封面编辑区：独立上传 / 从项目配图选择 / 清除 */}
        <div className="mt-12 rounded-2xl border border-stroke p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <p className="shrink-0 text-[13px] font-semibold text-text-primary">项目封面（首页列表展示）</p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={coverUploading}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold text-muted transition-colors hover:text-text-primary disabled:opacity-50"
              >
                {coverUploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} strokeWidth={2} />}
                上传封面
              </button>
              <button
                type="button"
                onClick={() => setCoverPickerOpen((open) => !open)}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold text-muted transition-colors hover:text-text-primary"
              >
                <Images size={14} strokeWidth={2} /> 从配图选择
              </button>
              <button
                type="button"
                onClick={toggleCoverAiPanel}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-[13px] font-semibold text-muted transition-colors hover:text-text-primary"
              >
                <Sparkles size={14} strokeWidth={2} /> AI 生成
              </button>
              {item.image && (
                <button
                  type="button"
                  onClick={() => updateItem({ image: '' })}
                  className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-red-500 transition-colors hover:text-red-600"
                >
                  清除
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            {item.image ? (
              isVideoSrc(item.image) ? (
                <video src={item.image} autoPlay loop muted playsInline className="h-40 rounded-xl bg-surface object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="封面预览" className="h-40 rounded-xl bg-surface object-cover" />
              )
            ) : (
              <p className="flex h-24 items-center justify-center rounded-xl bg-surface text-[12px] text-muted">未设置封面</p>
            )}
          </div>

          {coverPickerOpen && (
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {projectMedia.map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => {
                    updateItem({ image: src })
                    setCoverPickerOpen(false)
                  }}
                  className={`overflow-hidden rounded-xl transition-shadow ${item.image === src ? 'ring-2 ring-text-primary ring-offset-2 ring-offset-bg' : 'hover:ring-2 hover:ring-black/15 hover:ring-offset-2 hover:ring-offset-bg'}`}
                >
                  {isVideoSrc(src) ? (
                    <video src={src} muted playsInline preload="metadata" className="aspect-video w-full bg-surface object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" loading="lazy" className="aspect-video w-full bg-surface object-cover" />
                  )}
                </button>
              ))}
              {projectMedia.length === 0 && (
                <p className="col-span-full py-4 text-center text-[12px] text-muted">详情页还没有配图，先在正文里上传图片或视频。</p>
              )}
            </div>
          )}

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={handleCoverFileChange}
          />

          {coverAiOpen && (
            <div className="mt-4 rounded-xl bg-surface p-4">
              <textarea
                value={coverPrompt}
                onChange={(event) => setCoverPrompt(event.target.value)}
                rows={3}
                placeholder="描述想要的封面，例如：浅米色背景上，一部 iPhone 展示外卖首页的界面截图，极简构图，柔和自然光，高品质产品摄影感"
                className="w-full resize-none rounded-lg border border-stroke bg-bg px-3 py-2 text-[13px] leading-relaxed text-text-primary placeholder:text-muted/70"
              />

              {projectMedia.filter((src) => !isVideoSrc(src)).length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-[12px] font-semibold text-muted">参考图（可选，结合项目配图生成，点击勾选）</p>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {projectMedia
                      .filter((src) => !isVideoSrc(src))
                      .map((src) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => toggleCoverRef(src)}
                          className={`overflow-hidden rounded-lg transition-shadow ${coverRefs.includes(src) ? 'ring-2 ring-text-primary ring-offset-2 ring-offset-surface' : 'opacity-70 hover:opacity-100'}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" loading="lazy" className="aspect-video w-full bg-bg object-cover" />
                        </button>
                      ))}
                  </div>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] text-muted">AIGC 生图 · 高质量 · 横版 3:2，生成约需 30–60 秒，成功后自动设为封面</p>
                <button
                  type="button"
                  onClick={handleCoverGenerate}
                  disabled={coverGenerating || !coverPrompt.trim()}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-text-primary px-4 py-1.5 text-[13px] font-semibold text-bg transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {coverGenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} strokeWidth={2} />}
                  {coverGenerating ? '生成中…' : '生成封面'}
                </button>
              </div>
            </div>
          )}
        </div>

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
                  className="pt-14 text-[21px] font-bold leading-[1.35] text-text-primary sm:pt-16 sm:text-[24px]"
                  placeholder="输入段落标题"
                />
              )}

              {block.type === 'text' && (
                <InlineEdit
                  value={block.content[language]}
                  onChange={(value) => updateTextBlock(index, value)}
                  as="p"
                  className="pt-5 text-[17px] leading-[1.8] text-muted sm:pt-6 sm:text-[21px] sm:leading-[1.72]"
                  placeholder="输入段落文字"
                  multiline
                />
              )}

              {block.type === 'image' && block.layout === 'wide' && (
                <div className="mt-10 sm:mt-14">
                  {cropEditingIndex === index && block.src ? (
                    <CropEditor
                      src={block.src}
                      initial={block.crop}
                      onApply={(crop) => {
                        updateWideVideo(index, { crop })
                        setCropEditingIndex(null)
                      }}
                      onCancel={() => setCropEditingIndex(null)}
                    />
                  ) : isVideoSrc(block.src) && !block.videoFill ? (
                    <div
                      className={`flex justify-center rounded-[20px] py-10 sm:py-14 ${block.videoBg ? '' : 'bg-surface'}`}
                      style={block.videoBg ? { backgroundColor: block.videoBg } : undefined}
                    >
                      {block.crop ? (
                        <ImageSlot
                          src={block.src}
                          slug={slug}
                          onUpdate={(src) => updateWideImage(index, src)}
                          className={`w-[calc((100%-1.5rem)/3)] sm:w-[calc((100%-2.5rem)/3)] ${block.cropRounded === false ? '' : 'rounded-2xl'}`}
                          label="替换视频"
                          crop={block.crop}
                        />
                      ) : (
                        <div className="aspect-[9/16] w-[calc((100%-1.5rem)/3)] sm:w-[calc((100%-2.5rem)/3)]">
                          <ImageSlot
                            src={block.src}
                            slug={slug}
                            onUpdate={(src) => updateWideImage(index, src)}
                            className="h-full rounded-2xl"
                            mediaClassName="h-full"
                            mediaBgClass=""
                            label="替换视频"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <ImageSlot
                      src={block.src}
                      slug={slug}
                      onUpdate={(src) => updateWideImage(index, src)}
                      className="rounded-[20px]"
                      label={isVideoSrc(block.src) ? '替换视频' : '替换横图'}
                      crop={block.crop ?? null}
                    />
                  )}

                  {cropEditingIndex !== index && block.src && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                      <button
                        type="button"
                        onClick={() => convertWideToTriple(index)}
                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted transition-colors hover:text-text-primary"
                      >
                        <Images size={12} strokeWidth={2} />
                        转为三图并排
                      </button>
                      <button
                        type="button"
                        onClick={() => setCropEditingIndex(index)}
                        className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted transition-colors hover:text-text-primary"
                      >
                        <Crop size={12} strokeWidth={2} />
                        {block.crop ? '重新裁剪' : '裁剪显示区域'}
                      </button>
                      {block.crop && (
                        <button
                          type="button"
                          onClick={() => updateWideVideo(index, { cropRounded: block.cropRounded === false })}
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted transition-colors hover:text-text-primary"
                        >
                          <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border transition-colors ${block.cropRounded === false ? 'border-muted/60' : 'border-text-primary bg-text-primary text-bg'}`}>
                            {block.cropRounded !== false && <Check size={11} strokeWidth={2.5} />}
                          </span>
                          圆角
                        </button>
                      )}
                      {block.crop && (
                        <button
                          type="button"
                          onClick={() => updateWideVideo(index, { crop: undefined })}
                          className="text-[12px] font-semibold text-red-500 transition-colors hover:text-red-600"
                        >
                          清除裁剪
                        </button>
                      )}
                      {isVideoSrc(block.src) && (
                        <>
                          <button
                            type="button"
                            onClick={() => updateWideVideo(index, { videoFill: !block.videoFill })}
                            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted transition-colors hover:text-text-primary"
                          >
                            <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border transition-colors ${block.videoFill ? 'border-text-primary bg-text-primary text-bg' : 'border-muted/60'}`}>
                              {block.videoFill && <Check size={11} strokeWidth={2.5} />}
                            </span>
                            撑满整行
                          </button>
                          {!block.videoFill && (
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-semibold text-muted">背景</span>
                              {VIDEO_BG_PRESETS.map((preset) => {
                                const active = (block.videoBg || '') === preset.value
                                return (
                                  <button
                                    key={preset.label}
                                    type="button"
                                    title={preset.label}
                                    onClick={() => updateWideVideo(index, { videoBg: preset.value || undefined })}
                                    className={`h-5 w-5 rounded-full border transition-transform ${preset.value ? '' : 'bg-surface'} ${active ? 'scale-110 border-transparent ring-2 ring-text-primary ring-offset-2 ring-offset-bg' : 'border-stroke hover:scale-105'}`}
                                    style={preset.value ? { backgroundColor: preset.value } : undefined}
                                  />
                                )
                              })}
                              <input
                                type="color"
                                value={block.videoBg || '#F5F4F0'}
                                onChange={(event) => updateWideVideo(index, { videoBg: event.target.value })}
                                className="h-5 w-8 cursor-pointer rounded border border-stroke bg-transparent"
                                title="自定义背景色"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {block.type === 'image' && block.layout === 'triple' && (
                <div className="mt-10 sm:mt-14">
                  <div className="grid grid-cols-3 gap-3 sm:gap-5">
                    {block.srcs.map((src, imageIndex) => (
                      <div
                        key={imageIndex}
                        className={triplePicker?.block === index && triplePicker.cell === imageIndex ? 'rounded-2xl ring-2 ring-text-primary ring-offset-2 ring-offset-bg' : ''}
                      >
                        <ImageSlot
                          src={src}
                          slug={slug}
                          onUpdate={(path) => updateTripleImage(index, imageIndex, path)}
                          className="aspect-[9/16] rounded-2xl"
                          label={src ? '替换竖图' : '添加图片/视频'}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <button
                      type="button"
                      onClick={() => setTriplePicker(triplePicker?.block === index ? null : { block: index, cell: 0 })}
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted transition-colors hover:text-text-primary"
                    >
                      <Images size={12} strokeWidth={2} />
                      从配图选择
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        convertTripleToWide(index)
                        setTriplePicker(null)
                      }}
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted transition-colors hover:text-text-primary"
                    >
                      <X size={12} strokeWidth={2} />
                      改回单图
                    </button>
                  </div>

                  {triplePicker?.block === index && (
                    <div className="mt-3 rounded-xl bg-surface p-3">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-[12px] font-semibold text-muted">填入</span>
                        {[0, 1, 2].map((cellIndex) => (
                          <button
                            key={cellIndex}
                            type="button"
                            onClick={() => setTriplePicker({ block: index, cell: cellIndex })}
                            className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold transition-colors ${triplePicker.cell === cellIndex ? 'bg-text-primary text-bg' : 'bg-bg text-muted hover:text-text-primary'}`}
                          >
                            第{cellIndex + 1}格
                          </button>
                        ))}
                      </div>
                      {projectMedia.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                          {projectMedia.map((mediaSrc) => (
                            <button
                              key={mediaSrc}
                              type="button"
                              onClick={() => updateTripleImage(index, triplePicker.cell, mediaSrc)}
                              className={`overflow-hidden rounded-lg transition-shadow ${block.srcs[triplePicker.cell] === mediaSrc ? 'ring-2 ring-text-primary ring-offset-2 ring-offset-surface' : 'hover:ring-1 hover:ring-muted/40 hover:ring-offset-2 hover:ring-offset-surface'}`}
                            >
                              {isVideoSrc(mediaSrc) ? (
                                <video src={mediaSrc} muted playsInline preload="metadata" className="aspect-video w-full bg-bg object-cover" />
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={mediaSrc} alt="" loading="lazy" className="aspect-video w-full bg-bg object-cover" />
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[12px] text-muted">这个项目还没有可选素材，先在上方内容块里上传图片/视频。</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>

        <div className="mt-20 border-t border-stroke pt-6">
          <p className="mb-3 text-[13px] font-semibold text-muted">新增内容</p>
          <div className="flex flex-wrap gap-x-5 gap-y-3">
            <button type="button" onClick={() => addBlock('heading')} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-text-primary">
              <Plus size={14} strokeWidth={2} /> 段落标题
            </button>
            <button type="button" onClick={() => addBlock('text')} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-text-primary">
              <Plus size={14} strokeWidth={2} /> 段落文字
            </button>
            <button type="button" onClick={() => addBlock('wide-image')} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-text-primary">
              <Plus size={14} strokeWidth={2} /> 单张横图
            </button>
            <button type="button" onClick={() => addBlock('triple-image')} className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-text-primary">
              <Plus size={14} strokeWidth={2} /> 三张竖图
            </button>
          </div>
        </div>
      </article>
    </main>
  )
}
