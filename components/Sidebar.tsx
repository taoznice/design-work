'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dna, FlaskConical, FileSearch, Palette, Radio, Languages } from 'lucide-react'

const workItems = [
  {
    icon: Radio,
    label: 'AI Radar',
    href: '/ai-radar',
  },
  {
    icon: FlaskConical,
    label: '课题讨论',
    href: '/strategy-lab',
  },
  {
    icon: FileSearch,
    label: '方案判断',
    href: '/proposal-review',
  },
  {
    icon: Palette,
    label: '审美合集',
    href: '/aesthetic-collection',
  },
  {
    icon: Dna,
    label: '团队知识库',
    href: '/knowledge',
  },
  {
    icon: Languages,
    label: '翻译助手',
    href: '/translation',
  },
]

const memoryItem = {
  icon: Dna,
  label: '记忆',
  href: '/memory',
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full md:w-64 bg-gemini-surface border-b md:border-b-0 md:border-r border-gemini-border flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
      <div className="p-4 md:p-6 flex-shrink-0">
        <h1 className="text-base md:text-lg font-semibold text-gemini-text whitespace-nowrap">
          DS的设计工作台
        </h1>
      </div>
      <nav className="flex-1 p-2 md:p-4 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
        <ul className="flex md:flex-col flex-row space-x-2 md:space-x-0 md:space-y-2">
          {workItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.href} className="flex-shrink-0">
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-2xl md:rounded-3xl text-xs md:text-sm font-medium
                    transition-all duration-200 whitespace-nowrap
                    ${
                      isActive
                        ? 'bg-gemini-active-bg text-gemini-active-text shadow-gemini-sm border border-gemini-border'
                        : 'text-gemini-text-secondary hover:bg-gemini-surface-hover hover:text-gemini-text'
                    }
                  `}
                >
                  <Icon size={16} className="md:w-[18px] md:h-[18px]" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
        {/* 记忆功能常驻底部 */}
        <div className="md:mt-auto pt-0 md:pt-4 ml-2 md:ml-0 flex-shrink-0">
          <Link
            href={memoryItem.href}
            className={`
              flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-2xl md:rounded-3xl text-xs md:text-sm font-medium
              transition-all duration-200 whitespace-nowrap
              ${
                pathname === memoryItem.href
                  ? 'bg-gemini-active-bg text-gemini-active-text shadow-gemini-sm border border-gemini-border'
                  : 'text-gemini-text-secondary hover:bg-gemini-surface-hover hover:text-gemini-text'
              }
            `}
          >
            <memoryItem.icon size={16} className="md:w-[18px] md:h-[18px]" />
            <span>{memoryItem.label}</span>
          </Link>
        </div>
      </nav>
    </aside>
  )
}
