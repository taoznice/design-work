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
    <aside className="w-64 bg-gemini-surface border-r border-gemini-border flex flex-col">
      <div className="p-6">
        <h1 className="text-lg font-semibold text-gemini-text">
          DS的设计工作台
        </h1>
      </div>
      <nav className="flex-1 p-4 flex flex-col">
        <ul className="space-y-2">
          {workItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-3xl text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gemini-active-bg text-gemini-active-text shadow-gemini-sm border border-gemini-border'
                        : 'text-gemini-text-secondary hover:bg-gemini-surface-hover hover:text-gemini-text'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
        {/* 记忆功能常驻底部 */}
        <div className="mt-auto pt-4">
          <Link
            href={memoryItem.href}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-3xl text-sm font-medium
              transition-all duration-200
              ${
                pathname === memoryItem.href
                  ? 'bg-gemini-active-bg text-gemini-active-text shadow-gemini-sm border border-gemini-border'
                  : 'text-gemini-text-secondary hover:bg-gemini-surface-hover hover:text-gemini-text'
              }
            `}
          >
            <memoryItem.icon size={18} />
            <span>{memoryItem.label}</span>
          </Link>
        </div>
      </nav>
    </aside>
  )
}
