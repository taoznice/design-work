'use client'

import { Asterisk, Building2, Fingerprint, LayoutGrid, Search, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CONTACT_EMAIL, copy, workItems, type Language } from '@/content/portfolio'

const projectIcons: Record<string, typeof LayoutGrid> = {
  'waimai-desktop-widget': LayoutGrid,
  'checkout-order-experience': ShoppingBag,
  'urban-interface-space': Building2,
  'user-perspective-research': Search,
  'brand-experience-identity': Fingerprint,
}

function LanguageSwitch({ language, setLanguage }: { language: Language; setLanguage: (language: Language) => void }) {
  return (
    <div className="flex items-center gap-3 text-[13px] font-semibold text-muted">
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

export default function HomePage() {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  }, [language])

  return (
    <main className="flex min-h-screen flex-col bg-bg font-body text-text-primary">
      <header className="mx-auto flex w-full max-w-[72rem] items-center justify-between px-6 py-6">
        <span className="text-sm font-extrabold tracking-tight">ZD</span>
        <LanguageSwitch language={language} setLanguage={setLanguage} />
      </header>

      <section className="mx-auto flex w-full max-w-[72rem] flex-1 flex-col items-center justify-center px-6 py-16">
        <Asterisk size={48} strokeWidth={2.2} className="text-[#E63329]" aria-hidden />

        <nav aria-label="Projects" className="mt-16 w-full max-w-[26rem] sm:mt-20">
          <ul>
            {workItems.map((item) => {
              const Icon = projectIcons[item.slug] ?? Asterisk
              const label = item.title[language]

              if (!item.detail) {
                return (
                  <li key={item.slug} className="flex items-center justify-between py-5 text-muted">
                    <span className="text-[19px] font-semibold leading-snug">{label}</span>
                    <Icon size={19} strokeWidth={1.8} className="shrink-0" aria-hidden />
                  </li>
                )
              }

              return (
                <li key={item.slug}>
                  <Link
                    href={`/work/${item.slug}`}
                    className="group flex items-center justify-between py-5 text-text-primary"
                  >
                    <span className="text-[19px] font-semibold leading-snug transition-opacity group-hover:opacity-60">
                      {label}
                    </span>
                    <Icon
                      size={19}
                      strokeWidth={1.8}
                      className="shrink-0 text-muted transition-colors group-hover:text-text-primary"
                      aria-hidden
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <p className="mt-16 max-w-[26rem] text-center text-[15px] leading-[1.8] text-muted">
          {copy[language].hero.description}
        </p>
      </section>

      <footer className="mx-auto w-full max-w-[72rem] px-6 py-8 text-center">
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-[13px] font-medium text-muted transition-colors hover:text-text-primary">
          {CONTACT_EMAIL}
        </a>
      </footer>
    </main>
  )
}
