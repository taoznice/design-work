'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { workItems, type Language, type WorkContentBlock } from '@/content/portfolio'

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

function ContentBlock({ block, language }: { block: WorkContentBlock; language: Language }) {
  if (block.type === 'heading') {
    return (
      <h2 className="mx-auto max-w-[48rem] pt-12 text-2xl font-medium leading-[1.2] tracking-[-0.035em] text-text-primary sm:pt-20 sm:text-3xl">
        {block.content[language]}
      </h2>
    )
  }

  if (block.type === 'text') {
    return (
      <p className="mx-auto max-w-[48rem] whitespace-pre-wrap pt-5 text-base leading-[1.8] text-text-primary/80 sm:pt-6 sm:text-lg sm:leading-[1.75]">
        {block.content[language]}
      </p>
    )
  }

  if (block.type !== 'image') return null

  if (block.layout === 'wide') {
    return (
      <figure className="mx-auto max-w-[48rem] pt-10 sm:pt-16">
        <img src={block.src} alt="" loading="lazy" className="block w-full bg-surface" />
      </figure>
    )
  }

  return (
    <figure className="mx-auto grid max-w-[48rem] grid-cols-3 gap-2 pt-10 sm:gap-4 sm:pt-16">
      {block.srcs.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={src}
          alt=""
          loading="lazy"
          className="aspect-[9/16] w-full bg-surface object-contain"
        />
      ))}
    </figure>
  )
}

export default function WorkDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [language, setLanguage] = useState<Language>('en')
  const item = workItems.find((work) => work.slug === slug)

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  }, [language])

  if (!item || !item.detail) return notFound()

  return (
    <main className="min-h-screen bg-bg font-body text-text-primary">
      <header className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link
          href="/#work"
          className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em] text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          {language === 'en' ? 'All work' : '全部作品'}
        </Link>
        <LanguageSwitch language={language} setLanguage={setLanguage} />
      </header>

      <article className="mx-auto w-full max-w-[1240px] px-5 pb-24 pt-10 sm:px-8 sm:pt-16 lg:px-10 lg:pb-32">
        <h1 className="mx-auto max-w-[48rem] text-4xl font-normal leading-[1.08] tracking-[-0.05em] text-text-primary sm:text-6xl lg:text-7xl">
          {item.title[language]}
        </h1>

        <div className="pt-2 sm:pt-4">
          {item.detail.blocks.map((block) => (
            <ContentBlock key={block.id} block={block} language={language} />
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-[48rem] border-t border-stroke pt-6 sm:mt-28">
          <Link
            href="/#work"
            className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em] text-muted transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={13} strokeWidth={1.5} />
            {language === 'en' ? 'Return to all work' : '返回全部作品'}
          </Link>
        </div>
      </article>
    </main>
  )
}
