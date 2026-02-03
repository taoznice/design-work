'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dna, FlaskConical, FileSearch, Palette, Radio, Languages, MessageSquare } from 'lucide-react'

const workItems = [
  { icon: MessageSquare, label: 'AI 聊天', href: '/chat' },
  { icon: Radio, label: 'AI Radar', href: '/ai-radar' },
  { icon: FlaskConical, label: '课题讨论', href: '/strategy-lab' },
  { icon: FileSearch, label: '方案判断', href: '/proposal-review' },
  { icon: Palette, label: '审美合集', href: '/aesthetic-collection' },
  { icon: Dna, label: '团队知识库', href: '/knowledge' },
  { icon: Languages, label: '翻译助手', href: '/translation' },
]

const memoryItem = { icon: Dna, label: '记忆', href: '/memory' }

const allNavItems = [...workItems, memoryItem]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* 宽屏：左侧导航栏（≥640px 显示） */}
      <aside className="hidden sm:flex sm:w-64 flex-col bg-gemini-surface border-r border-gemini-border overflow-y-auto">
        <div className="p-4 sm:p-6 flex-shrink-0">
          <h1 className="text-base sm:text-lg font-semibold text-gemini-text whitespace-nowrap">
            工作台
          </h1>
        </div>
        <nav className="flex-1 p-2 sm:p-4 flex flex-col">
          <ul className="flex flex-col space-y-2">
            {workItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-2xl sm:rounded-3xl text-sm font-medium
                      transition-all duration-200
                      ${
                        isActive
                          ? 'bg-gemini-active-bg text-gemini-active-text shadow-gemini-sm border border-gemini-border'
                          : 'text-gemini-text-secondary hover:bg-gemini-surface-hover hover:text-gemini-text'
                      }
                    `}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
          <div className="mt-auto pt-4">
            <Link
              href={memoryItem.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl sm:rounded-3xl text-sm font-medium
                transition-all duration-200
                ${
                  pathname === memoryItem.href
                    ? 'bg-gemini-active-bg text-gemini-active-text shadow-gemini-sm border border-gemini-border'
                    : 'text-gemini-text-secondary hover:bg-gemini-surface-hover hover:text-gemini-text'
                }
              `}
            >
              <memoryItem.icon size={18} className="flex-shrink-0" />
              <span>{memoryItem.label}</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* 窄屏：底部 Tab 栏（<640px 显示），玻璃拟态 + 顶部分割线 */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 sm:hidden
          flex items-center justify-around
          bg-white/80 dark:bg-gray-900/80 backdrop-blur-md
          border-t border-gemini-border"
        aria-label="主导航"
      >
        {allNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-0.5
                flex-1 min-w-0 py-2.5 px-1
                text-[10px] font-medium transition-colors
                ${isActive ? 'text-black dark:text-white' : 'text-gemini-text-secondary'}
              `}
            >
              <Icon
                size={22}
                className={`flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`}
              />
              <span className="truncate max-w-full">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
