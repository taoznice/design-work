'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { workItems, type Language, type WorkContentBlock } from '@/content/portfolio'
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
    // 显示裁剪：容器按裁剪区域的比例裁切，媒体放大平移只露出框选部分，素材文件不变
    const crop = block.crop
    const cropMediaStyle: React.CSSProperties | undefined = crop
      ? {
          position: 'absolute',
          left: `${(-crop.x / crop.w) * 100}%`,
          top: `${(-crop.y / crop.h) * 100}%`,
          width: `${100 / crop.w}%`,
          height: `${100 / crop.h}%`,
        }
      : undefined

    if (isVideoSrc(block.src)) {
      // 撑满整行：与横图一致的全宽展示
      if (block.videoFill) {
        return (
          <figure className="pt-10 sm:pt-14">
            {crop ? (
              <div className="relative w-full overflow-hidden rounded-[20px]" style={{ aspectRatio: `${crop.w} / ${crop.h}` }}>
                <video src={block.src} autoPlay loop muted playsInline style={cropMediaStyle} className="max-w-none" />
              </div>
            ) : (
              <video src={block.src} autoPlay loop muted playsInline className="block w-full rounded-[20px] bg-surface" />
            )}
          </figure>
        )
      }
      // 默认：按三图布局单张宽度居中展示，容器背景色可选
      return (
        <figure className="flex justify-center pt-10 sm:pt-14">
          <div
            className={`relative w-[calc((100%-1.5rem)/3)] overflow-hidden rounded-2xl sm:w-[calc((100%-2.5rem)/3)] ${crop ? '' : 'aspect-[9/16]'} ${block.videoBg ? '' : 'bg-surface'}`}
            style={{
              ...(crop ? { aspectRatio: `${crop.w} / ${crop.h}` } : {}),
              ...(block.videoBg ? { backgroundColor: block.videoBg } : {}),
            }}
          >
            <video
              src={block.src}
              autoPlay
              loop
              muted
              playsInline
              style={crop ? cropMediaStyle : undefined}
              className={crop ? 'max-w-none' : 'h-full w-full object-contain'}
            />
          </div>
        </figure>
      )
    }
    if (crop) {
      return (
        <figure className="pt-10 sm:pt-14">
          <div className="relative w-full overflow-hidden rounded-[20px]" style={{ aspectRatio: `${crop.w} / ${crop.h}` }}>
            <img src={block.src} alt="" loading="lazy" style={cropMediaStyle} className="max-w-none" />
          </div>
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
