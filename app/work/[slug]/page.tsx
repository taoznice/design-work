'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { workItems, type Language, type WorkContentBlock } from '@/content/portfolio'
import { CroppedMedia } from '@/components/CroppedMedia'
import { isVideoSrc } from '@/lib/media'

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

function ContentBlock({ block, language }: { block: WorkContentBlock; language: Language }) {
  if (block.type === 'heading') {
    return (
      <h2 className="pt-14 text-[21px] font-bold leading-[1.35] text-text-primary sm:pt-16 sm:text-[24px]">
        {block.content[language]}
      </h2>
    )
  }

  if (block.type === 'text') {
    return (
      <p className="whitespace-pre-wrap pt-5 text-[17px] leading-[1.8] text-muted sm:pt-6 sm:text-[21px] sm:leading-[1.72]">
        {block.content[language]}
      </p>
    )
  }

  if (block.type !== 'image') return null

  if (block.layout === 'wide') {
    const crop = block.crop
    const cropRoundedClass = block.cropRounded === false ? '' : 'rounded-[20px]'

    if (isVideoSrc(block.src)) {
      // 撑满整行：与横图一致的全宽展示
      if (block.videoFill) {
        return (
          <figure className="pt-10 sm:pt-14">
            {crop ? (
              <CroppedMedia src={block.src} crop={crop} className={cropRoundedClass} />
            ) : (
              <video src={block.src} autoPlay loop muted playsInline className="block w-full rounded-[20px] bg-surface" />
            )}
          </figure>
        )
      }
      // 默认：背景色带铺满整行内容宽度，视频按三图布局单张宽度居中
      return (
        <figure className="pt-10 sm:pt-14">
          <div
            className={`flex justify-center rounded-[20px] py-10 sm:py-14 ${block.videoBg ? '' : 'bg-surface'}`}
            style={block.videoBg ? { backgroundColor: block.videoBg } : undefined}
          >
            {crop ? (
              <CroppedMedia
                src={block.src}
                crop={crop}
                className={`w-[calc((100%-1.5rem)/3)] sm:w-[calc((100%-2.5rem)/3)] ${block.cropRounded === false ? '' : 'rounded-2xl'}`}
              />
            ) : (
              <video
                src={block.src}
                autoPlay
                loop
                muted
                playsInline
                className="aspect-[9/16] w-[calc((100%-1.5rem)/3)] rounded-2xl object-contain sm:w-[calc((100%-2.5rem)/3)]"
              />
            )}
          </div>
        </figure>
      )
    }
    if (crop) {
      return (
        <figure className="pt-10 sm:pt-14">
          <CroppedMedia src={block.src} crop={crop} className={cropRoundedClass} />
        </figure>
      )
    }
    return (
      <figure className="pt-10 sm:pt-14">
        <img src={block.src} alt="" loading="lazy" className="block w-full rounded-[20px] bg-surface" />
      </figure>
    )
  }

  return (
    <figure className="grid grid-cols-3 gap-3 pt-10 sm:gap-5 sm:pt-14">
      {block.srcs.map((src, index) =>
        isVideoSrc(src) ? (
          <video
            key={`${src}-${index}`}
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className="aspect-[9/16] w-full rounded-2xl bg-surface object-contain"
          />
        ) : (
          <img
            key={`${src}-${index}`}
            src={src}
            alt=""
            loading="lazy"
            className="aspect-[9/16] w-full rounded-2xl bg-surface object-contain"
          />
        ),
      )}
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
      <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[72rem] items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            {language === 'en' ? 'All work' : '全部作品'}
          </Link>
          <LanguageSwitch language={language} setLanguage={setLanguage} />
        </div>
      </header>

      <article className="mx-auto w-full max-w-[72rem] px-6 pb-24 pt-10 sm:pt-14">
        <h1 className="text-[26px] font-extrabold leading-[1.35] tracking-tight text-text-primary sm:text-[32px]">
          {item.title[language]}
        </h1>

        <div className="pt-2">
          {item.detail.blocks.map((block) => (
            <ContentBlock key={block.id} block={block} language={language} />
          ))}
        </div>

        <div className="mt-20 border-t border-stroke pt-6 sm:mt-24">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            {language === 'en' ? 'Return to all work' : '返回全部作品'}
          </Link>
        </div>
      </article>
    </main>
  )
}
