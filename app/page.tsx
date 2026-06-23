'use client'

import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hls from 'hls.js'
import { ArrowRight, ExternalLink, Mail } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CONTACT_EMAIL,
  CONTACT_LINK,
  HLS_SOURCE,
  copy,
  explorations,
  journalItems,
  stats,
  workItems,
  type Language,
} from '@/content/portfolio'

function useHlsVideo(videoRef: React.RefObject<HTMLVideoElement>, source: string) {
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let hls: Hls | null = null

    if (Hls.isSupported()) {
      hls = new Hls()
      hls.loadSource(source)
      hls.attachMedia(video)
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source
    }

    return () => {
      hls?.destroy()
    }
  }, [source, videoRef])
}

function LoadingScreen({ onComplete, language }: { onComplete: () => void; language: Language }) {
  const [count, setCount] = useState(0)
  const [wordIndex, setWordIndex] = useState(0)
  const words = copy[language].loading.words

  useEffect(() => {
    let frame = 0
    const start = performance.now()
    const duration = 2700

    const update = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const nextCount = Math.round(progress * 100)

      setCount(nextCount)

      if (progress < 1) {
        frame = requestAnimationFrame(update)
      } else {
        window.setTimeout(onComplete, 400)
      }
    }

    frame = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frame)
  }, [onComplete])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setWordIndex((current) => (current + 1) % words.length)
    }, 900)

    return () => window.clearInterval(timer)
  }, [words.length])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-bg"
      exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } }}
    >
      <motion.div
        className="absolute left-6 top-6 text-xs uppercase tracking-[0.3em] text-muted md:left-10 md:top-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {copy[language].loading.label}
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={words[wordIndex]}
            className="font-display text-4xl italic text-text-primary/80 md:text-6xl lg:text-7xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {words[wordIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-9 right-6 font-display text-6xl tabular-nums text-text-primary md:right-10 md:text-8xl lg:text-9xl">
        {String(count).padStart(3, '0')}
      </div>

      <div className="absolute bottom-0 left-0 h-[3px] w-full bg-stroke/50">
        <div
          className="accent-gradient h-full origin-left"
          style={{
            transform: `scaleX(${count / 100})`,
            boxShadow: '0 0 8px rgba(137, 170, 204, 0.35)',
          }}
        />
      </div>
    </motion.div>
  )
}

function Navbar({
  language,
  onLanguageChange,
}: {
  language: Language
  onLanguageChange: (language: Language) => void
}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const navCopy = copy[language].nav

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 100)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id)
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-3 pt-4 md:pt-6">
      <nav
        className={`inline-flex max-w-[calc(100vw-24px)] items-center rounded-full border border-white/10 bg-surface px-2 py-2 backdrop-blur-md transition-shadow ${
          isScrolled ? 'shadow-md shadow-black/10' : ''
        }`}
      >
        <button
          type="button"
          onClick={() => scrollToSection('home')}
          className="accent-gradient group flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-[1px] transition-transform hover:scale-110"
          aria-label={navCopy.items[0].label}
        >
          <span className="flex h-full w-full items-center justify-center rounded-full bg-bg font-display text-[13px] italic text-text-primary">
            ZD
          </span>
        </button>

        <div className="mx-1 hidden h-5 w-px bg-stroke sm:block" />

        <div className="hidden items-center sm:flex">
          {navCopy.items.map((item) => (
            <button
              key={item.target}
              type="button"
              onClick={() => scrollToSection(item.target)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                item.target === 'home' ? 'bg-stroke/50 text-text-primary' : 'text-muted hover:bg-stroke/50 hover:text-text-primary'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mx-1 hidden h-5 w-px bg-stroke sm:block" />

        <div
          className="ml-1 flex shrink-0 items-center rounded-full border border-stroke bg-bg/60 p-1"
          aria-label={navCopy.languageLabel}
        >
          {(['en', 'zh'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onLanguageChange(option)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors sm:px-3 ${
                language === option ? 'bg-text-primary text-bg' : 'text-muted hover:text-text-primary'
              }`}
              aria-pressed={language === option}
            >
              {option === 'en' ? 'EN' : '中'}
            </button>
          ))}
        </div>

        <a href={CONTACT_LINK} className="gradient-ring group ml-1 hidden rounded-full text-xs sm:inline-flex sm:text-sm">
          <span className="flex items-center gap-1 rounded-full bg-surface px-4 py-2 text-text-primary backdrop-blur-md">
            {navCopy.contact}
            <span aria-hidden="true">↗</span>
          </span>
        </a>
      </nav>
    </header>
  )
}

function HeroSection({ language }: { language: Language }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [roleIndex, setRoleIndex] = useState(0)
  const heroCopy = copy[language].hero
  const roles = copy[language].roles

  useHlsVideo(videoRef, HLS_SOURCE)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRoleIndex((current) => (current + 1) % roles.length)
    }, 2000)

    return () => window.clearInterval(timer)
  }, [roles.length])

  useEffect(() => {
    setRoleIndex(0)
  }, [language])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline
        .fromTo('.name-reveal', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.2, delay: 0.1 })
        .fromTo(
          '.blur-in',
          { opacity: 0, filter: 'blur(10px)', y: 20 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1, stagger: 0.1 },
          0.3,
        )
    })

    return () => ctx.revert()
  }, [])

  return (
    <section id="home" className="relative flex min-h-screen items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <div className="blur-in mb-8 text-xs uppercase tracking-[0.3em] text-muted">{heroCopy.eyebrow}</div>
        <h1 className="name-reveal mb-6 font-display text-5xl italic leading-[0.95] tracking-tight text-text-primary sm:text-6xl md:text-8xl lg:text-9xl">
          {heroCopy.title}
        </h1>
        <p className="blur-in mb-5 text-base text-text-primary md:text-lg">
          {heroCopy.rolePrefix}
          <span key={`${language}-${roleIndex}`} className="inline-block animate-role-fade-in font-display italic text-text-primary">
            {roles[roleIndex]}
          </span>
          {heroCopy.roleSuffix}
        </p>
        <p className="blur-in mb-12 max-w-md text-sm leading-relaxed text-muted md:text-base">{heroCopy.description}</p>
        <div className="blur-in inline-flex flex-wrap justify-center gap-4">
          <a href="#work" className="gradient-ring rounded-full">
            <span className="flex rounded-full bg-text-primary px-7 py-3.5 text-sm text-bg transition-all group-hover:bg-bg group-hover:text-text-primary">
              {heroCopy.primaryCta}
            </span>
          </a>
          <a href={CONTACT_LINK} className="gradient-ring rounded-full">
            <span className="flex rounded-full border-2 border-stroke bg-bg px-7 py-3.5 text-sm text-text-primary transition-transform group-hover:scale-105 group-hover:border-transparent">
              {heroCopy.secondaryCta}
            </span>
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center">
        <div className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">{heroCopy.scroll}</div>
        <div className="relative mx-auto h-10 w-px overflow-hidden bg-stroke">
          <span className="absolute left-0 top-0 block h-5 w-px animate-scroll-down bg-text-primary" />
        </div>
      </div>
    </section>
  )
}

function SectionHeader({
  eyebrow,
  title,
  italic,
  text,
  cta,
}: {
  eyebrow: string
  title: string
  italic: string
  text: string
  cta: string
}) {
  return (
    <motion.div
      className="mb-10 flex flex-col gap-8 md:mb-14 md:flex-row md:items-end md:justify-between"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, margin: '-100px' }}
    >
      <div>
        <div className="mb-6 flex items-center gap-4">
          <span className="h-px w-8 bg-stroke" />
          <span className="text-xs uppercase tracking-[0.3em] text-muted">{eyebrow}</span>
        </div>
        <h2 className="mb-4 text-4xl tracking-tight text-text-primary md:text-6xl">
          {title} <span className="font-display italic">{italic}</span>
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted md:text-base">{text}</p>
      </div>
      <a href="#contact" className="gradient-ring hidden rounded-full md:inline-flex">
        <span className="flex items-center gap-2 rounded-full bg-bg px-6 py-3 text-sm text-text-primary">
          {cta}
          <ArrowRight size={16} />
        </span>
      </a>
    </motion.div>
  )
}

function SelectedWorks({ language }: { language: Language }) {
  const workCopy = copy[language].work

  return (
    <section id="work" className="bg-bg py-14 md:py-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-10 lg:px-14">
        <SectionHeader
          eyebrow={workCopy.eyebrow}
          title={workCopy.title}
          italic={workCopy.italic}
          text={workCopy.text}
          cta={workCopy.cta}
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 lg:gap-6">
          {workItems.map((item, index) => (
            <WorkCard
              key={item.title.en}
              item={item}
              index={index}
              language={language}
              hoverPrefix={workCopy.hoverPrefix}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function WorkCard({
  item,
  index,
  language,
  hoverPrefix,
}: {
  item: (typeof workItems)[number]
  index: number
  language: Language
  hoverPrefix: string
}) {
  const cardRef = useRef<HTMLElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['-5%', '5%'])

  return (
    <motion.article
      ref={cardRef}
      className={`${item.span} ${item.aspect} group relative overflow-hidden rounded-3xl border border-stroke bg-surface`}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      viewport={{ once: true, margin: '-120px' }}
    >
      <motion.img
        src={item.image}
        alt=""
        className="h-[112%] w-full object-cover"
        style={{ y: imageY }}
        whileHover={{ scale: 1.035 }}
        transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
      />
      <div className="halftone pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/15 to-transparent opacity-90" />

      <motion.div
        className="pointer-events-none absolute inset-4 z-10 hidden md:block"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.16, ease: [0.25, 0.1, 0.25, 1] }}
        viewport={{ once: true, margin: '-120px' }}
      >
        <motion.span
          className="absolute left-0 top-0 h-px w-20 origin-left bg-white/35"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true }}
        />
        <motion.span
          className="absolute left-0 top-0 h-20 w-px origin-top bg-white/35"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          transition={{ duration: 0.7, delay: 0.26, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true }}
        />
        <motion.span
          className="absolute bottom-0 right-0 h-px w-20 origin-right bg-white/25"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true }}
        />
        <motion.span
          className="absolute bottom-0 right-0 h-20 w-px origin-bottom bg-white/25"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          transition={{ duration: 0.7, delay: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true }}
        />
      </motion.div>

      <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-6 p-6 sm:p-7 lg:p-8">
        <div className="min-w-0">
          <motion.div
            className="mb-3 text-xs uppercase tracking-[0.24em] text-white/55"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
          >
            {String(index + 1).padStart(2, '0')}
          </motion.div>
          <h3 className="max-w-[720px] font-display text-4xl italic leading-none text-white sm:text-5xl lg:text-6xl">
            {item.title[language]}
          </h3>
        </div>
        <span className="hidden shrink-0 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm text-white backdrop-blur-md transition-colors group-hover:bg-white group-hover:text-bg md:inline-flex">
          {hoverPrefix}
        </span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-bg/65 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100">
        <span className="gradient-ring rounded-full">
          <span className="rounded-full bg-white px-6 py-3 text-sm text-bg">
            {hoverPrefix} <span className="font-display italic">{item.title[language]}</span>
          </span>
        </span>
      </div>
    </motion.article>
  )
}

function Journal({ language }: { language: Language }) {
  const journalCopy = copy[language].journal

  return (
    <section className="bg-bg py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <SectionHeader
          eyebrow={journalCopy.eyebrow}
          title={journalCopy.title}
          italic={journalCopy.italic}
          text={journalCopy.text}
          cta={journalCopy.cta}
        />

        <div className="space-y-4">
          {journalItems.map((item) => (
            <a
              key={item.title.en}
              href="#"
              className="group flex items-center gap-4 rounded-[40px] border border-stroke bg-surface/30 p-4 transition-colors hover:bg-surface sm:rounded-full sm:gap-6"
            >
              <img src={item.image} alt="" className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base text-text-primary md:text-xl">{item.title[language]}</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                  {item.date} / {item.readTime[language]}
                </p>
              </div>
              <ExternalLink className="hidden text-muted transition-colors group-hover:text-text-primary sm:block" size={18} />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function Explorations({ language }: { language: Language }) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const explorationCopy = copy[language].explorations

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      if (contentRef.current && sectionRef.current) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: contentRef.current,
          pinSpacing: false,
        })
      }

      const drift = window.innerWidth < 768 ? 80 : 180

      itemRefs.current.forEach((item, index) => {
        if (!item) return
        gsap.to(item, {
          y: index % 2 === 0 ? -drift : drift,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative min-h-[300vh] bg-bg" id="resume">
      <div ref={contentRef} className="relative z-10 flex h-screen items-center justify-center px-6 text-center">
        <div>
          <div className="mb-6 text-xs uppercase tracking-[0.3em] text-muted">{explorationCopy.eyebrow}</div>
          <h2 className="mb-5 text-5xl tracking-tight text-text-primary md:text-7xl">
            {explorationCopy.title} <span className="font-display italic">{explorationCopy.italic}</span>
          </h2>
          <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-muted md:text-base">{explorationCopy.text}</p>
          <a href="#" className="gradient-ring inline-flex rounded-full">
            <span className="rounded-full bg-bg px-6 py-3 text-sm text-text-primary">{explorationCopy.cta}</span>
          </a>
        </div>
      </div>

      <div className="absolute inset-x-0 top-24 z-20 mx-auto grid w-full max-w-[390px] grid-cols-1 gap-10 px-6 md:max-w-[1400px] md:grid-cols-2 md:gap-40 md:px-16">
        {explorations.map((item, index) => (
          <button
            type="button"
            key={item.title.en}
            ref={(node) => {
              itemRefs.current[index] = node
            }}
            onClick={() => setActiveImage(item.image)}
            className={`group aspect-square w-full max-w-[220px] overflow-hidden rounded-3xl border border-stroke bg-surface md:max-w-[320px] ${
              index % 2 === 0 ? 'justify-self-start rotate-[-4deg]' : 'mt-16 justify-self-end rotate-[5deg] md:mt-40'
            }`}
            aria-label={`${explorationCopy.openAria} ${item.title[language]}`}
          >
            <img src={item.image} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeImage && (
          <motion.button
            type="button"
            className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/80 p-6 backdrop-blur-xl"
            onClick={() => setActiveImage(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-label={explorationCopy.closeAria}
          >
            <motion.img
              src={activeImage}
              alt=""
              className="max-h-[82vh] max-w-[92vw] rounded-3xl object-contain"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
            />
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  )
}

function Stats({ language }: { language: Language }) {
  return (
    <section className="bg-bg py-16 md:py-24">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-5 px-6 md:grid-cols-3 md:px-10 lg:px-16">
        {stats.map(([value, label]) => (
          <div key={value} className="rounded-3xl border border-stroke bg-surface/40 p-8">
            <div className="mb-3 font-display text-6xl italic text-text-primary md:text-7xl">{value}</div>
            <div className="text-xs uppercase tracking-[0.22em] text-muted">{label[language]}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ContactFooter({ language }: { language: Language }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const marqueeRef = useRef<HTMLDivElement | null>(null)
  const footerCopy = copy[language].footer
  const repeated = useMemo(() => Array.from({ length: 10 }, () => footerCopy.marquee).join(''), [footerCopy.marquee])

  useHlsVideo(videoRef, HLS_SOURCE)

  useEffect(() => {
    if (!marqueeRef.current) return

    const tween = gsap.to(marqueeRef.current, {
      xPercent: -50,
      duration: 40,
      ease: 'none',
      repeat: -1,
    })

    return () => {
      tween.kill()
    }
  }, [language])

  return (
    <footer id="contact" className="relative overflow-hidden bg-bg pb-8 pt-16 md:pb-12 md:pt-20">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full scale-y-[-1] object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 overflow-hidden py-8">
        <div
          ref={marqueeRef}
          className="whitespace-nowrap font-display text-6xl italic text-text-primary/15 md:text-9xl"
        >
          {repeated}
          {repeated}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <div className="mb-16 flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-5 text-xs uppercase tracking-[0.3em] text-muted">{footerCopy.eyebrow}</div>
            <h2 className="max-w-2xl text-4xl tracking-tight text-text-primary sm:text-5xl md:text-7xl">
              {footerCopy.titlePrefix} <span className="font-display italic">{footerCopy.italic}</span> {footerCopy.titleSuffix}
            </h2>
          </div>
          <a href={CONTACT_LINK} className="gradient-ring max-w-full rounded-full">
            <span className="flex max-w-full items-center gap-2 rounded-full bg-text-primary px-5 py-3.5 text-sm text-bg sm:px-7">
              <Mail size={16} />
              <span className="break-all">{CONTACT_EMAIL}</span>
            </span>
          </a>
        </div>

        <div className="flex flex-col gap-6 border-t border-stroke pt-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-5">
            {footerCopy.socials.map((item) => (
              <a key={item} href="#" className="transition-colors hover:text-text-primary">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            {footerCopy.status}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [language, setLanguage] = useState<Language>('en')
  const [isLanguageTransitioning, setIsLanguageTransitioning] = useState(false)

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN'
    document.title = language === 'en' ? 'Project Showcase' : '项目展示'
  }, [language])

  const handleLanguageChange = (nextLanguage: Language) => {
    if (nextLanguage === language) return

    setIsLanguageTransitioning(true)
    window.setTimeout(() => {
      setLanguage(nextLanguage)
      window.setTimeout(() => setIsLanguageTransitioning(false), 170)
    }, 120)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-bg text-text-primary">
      <AnimatePresence>{isLoading && <LoadingScreen language={language} onComplete={() => setIsLoading(false)} />}</AnimatePresence>
      <Navbar language={language} onLanguageChange={handleLanguageChange} />
      <div
        className={`transition-[filter,opacity,transform] duration-200 ease-out ${
          isLanguageTransitioning ? 'translate-y-0.5 opacity-80 blur-[3px]' : 'translate-y-0 opacity-100 blur-0'
        }`}
      >
        <HeroSection language={language} />
        <SelectedWorks language={language} />
        <Journal language={language} />
        <Explorations language={language} />
        <Stats language={language} />
        <ContactFooter language={language} />
      </div>
    </main>
  )
}
