'use client'

import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { WorkItem } from '@/content/portfolio'

// admin 内部使用的作品类型：在 WorkItem 基础上加一个可选的隐藏标记
// hidden 为 true 时前台不展示该作品（前台渲染逻辑后续按需接入）
type AdminWorkItem = WorkItem & { hidden?: boolean }

/**
 * 生成一个不与现有 slug 冲突的新 slug
 */
function generateUniqueSlug(existing: AdminWorkItem[]) {
  let index = existing.length + 1
  let slug = `new-work-${index}`
  const slugs = new Set(existing.map((item) => item.slug))
  while (slugs.has(slug)) {
    index += 1
    slug = `new-work-${index}`
  }
  return slug
}

/**
 * 创建一个空白的新作品条目
 */
function createEmptyWorkItem(existing: AdminWorkItem[]): AdminWorkItem {
  return {
    slug: generateUniqueSlug(existing),
    title: { en: 'Untitled Work', zh: '未命名作品' },
    span: 'md:col-span-6',
    aspect: 'h-[360px] sm:h-[400px] md:h-[380px] lg:h-[500px]',
    image: '',
  }
}

export default function AdminPage() {
  const [items, setItems] = useState<AdminWorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadWorks() {
      try {
        const res = await fetch('/api/admin/works')
        if (!res.ok) throw new Error('加载作品列表失败')
        const data = await res.json()
        if (!cancelled) {
          setItems(data.workItems ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '加载失败')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadWorks()
    return () => {
      cancelled = true
    }
  }, [])

  /** 上移/下移调整排序 */
  function moveItem(index: number, direction: -1 | 1) {
    setItems((current) => {
      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= current.length) return current
      const next = [...current]
      const temp = next[index]
      next[index] = next[targetIndex]
      next[targetIndex] = temp
      return next
    })
    setMessage(null)
  }

  /** 切换显隐状态 */
  function toggleHidden(index: number) {
    setItems((current) =>
      current.map((item, i) => (i === index ? { ...item, hidden: !item.hidden } : item)),
    )
    setMessage(null)
  }

  /** 删除作品（需二次确认，避免误删） */
  function deleteItem(index: number) {
    const item = items[index]
    const confirmed = window.confirm(`确定要删除「${item.title.zh || item.title.en}」吗？此操作不可撤销。`)
    if (!confirmed) return
    setItems((current) => current.filter((_, i) => i !== index))
    setMessage(null)
  }

  /** 新增一个空白作品 */
  function addItem() {
    setItems((current) => [...current, createEmptyWorkItem(current)])
    setMessage(null)
  }

  /** 保存并发布：POST 到 /api/admin/save，写回 portfolio.ts 并触发 git push */
  async function handleSave() {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        throw new Error(data.error || '保存失败')
      }
      setMessage('保存成功，已提交并推送，Vercel 稍后会自动构建上线。')
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-20 text-neutral-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">加载作品列表中…</span>
      </div>
    )
  }

  return (
    <div>
      {/* 顶部操作栏 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">作品管理</h1>
          <p className="mt-1 text-sm text-neutral-500">共 {items.length} 个作品</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={addItem}
            className="flex items-center gap-1.5 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-50"
          >
            <Plus className="h-4 w-4" />
            新增作品
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? '保存中…' : '保存并发布'}
          </button>
        </div>
      </div>

      {/* 状态提示 */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {/* 作品卡片列表 */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.slug}
            className={`flex items-center gap-4 rounded-lg border border-neutral-200 p-3 transition ${
              item.hidden ? 'opacity-50' : ''
            }`}
          >
            {/* 封面缩略图 */}
            <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-md bg-neutral-100">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title.zh || item.title.en}
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
                  无图片
                </div>
              )}
            </div>

            {/* 标题 / slug / 详情标记 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-neutral-900">
                  {item.title.zh || '（未命名）'}
                </span>
                <span className="truncate text-xs text-neutral-400">{item.title.en}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                <code className="rounded bg-neutral-100 px-1.5 py-0.5">{item.slug}</code>
                <span
                  className={`rounded px-1.5 py-0.5 ${
                    item.detail ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {item.detail ? '有详情页' : '无详情页'}
                </span>
                <span className="text-neutral-400">排序 #{index + 1}</span>
              </div>
            </div>

            {/* 排序按钮 */}
            <div className="flex shrink-0 flex-col gap-1">
              <button
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                className="rounded border border-neutral-200 p-1 text-neutral-500 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="上移"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
                className="rounded border border-neutral-200 p-1 text-neutral-500 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="下移"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* 操作按钮：编辑、显隐、删除 */}
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/admin/work/${item.slug}`}
                className="flex items-center gap-1 rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                编辑
              </Link>
              <button
                onClick={() => toggleHidden(index)}
                className="flex items-center gap-1 rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition hover:border-neutral-300 hover:bg-neutral-50"
              >
                {item.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {item.hidden ? '已隐藏' : '显示中'}
              </button>
              <button
                onClick={() => deleteItem(index)}
                className="flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-500 transition hover:border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                删除
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-400">
            暂无作品，点击右上角「新增作品」开始添加
          </div>
        )}
      </div>
    </div>
  )
}
