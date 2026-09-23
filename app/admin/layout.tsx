'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * 管理后台布局壳
 * 白色背景 + 灰色边框，与前台暗色风格区分，方便一眼识别当前处于编辑态
 * 但所见即所得编辑页 (/admin/work/xxx) 使用前台暗色风格，不需要此壳
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // 所见即所得编辑页使用自己的全屏暗色布局，不包裹管理壳
  if (pathname.startsWith('/admin/work/')) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 text-xs font-semibold text-white">
            C
          </span>
          <span className="text-sm font-semibold tracking-tight">CMS</span>
        </Link>
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-neutral-500 transition hover:text-neutral-900"
        >
          预览站点 →
        </Link>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  )
}
