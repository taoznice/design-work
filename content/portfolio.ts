export type Language = 'en' | 'zh'
export type LocalizedText = Record<Language, string>

export const CONTACT_EMAIL = 'hello@design-workbench.top'
export const CONTACT_LINK = `mailto:${CONTACT_EMAIL}`

export const HLS_SOURCE = 'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8'

export const copy = {
  en: {
    loading: {
      label: 'Portfolio',
      words: ['Design', 'Create', 'Inspire'],
    },
    nav: {
      items: [
        { label: 'Home', target: 'home' },
        { label: 'Work', target: 'work' },
        { label: 'Resume', target: 'resume' },
      ],
      contact: 'Contact',
      languageLabel: 'Switch language',
    },
    hero: {
      eyebrow: '2026 Portfolio',
      title: 'Project Showcase',
      rolePrefix: 'A ',
      roleSuffix: ' shaping design and product practice in Beijing.',
      description:
        'Focused on experience design, AI-native tools, and digital product expression, turning abstract ideas into interfaces people can use, understand, and remember.',
      primaryCta: 'View Work',
      secondaryCta: 'Contact',
      scroll: 'Scroll',
    },
    work: {
      eyebrow: 'Selected Work',
      title: 'Selected',
      italic: 'Projects',
      text: 'A collection of design systems, AI tools, product prototypes, and experience strategy projects I have led or helped shape.',
      cta: 'View All Work',
      hoverPrefix: 'View',
    },
    journal: {
      eyebrow: 'Journal',
      title: 'Recent',
      italic: 'Thinking',
      text: 'Notes on design judgment, AI workflows, product systems, and creative practice in motion.',
      cta: 'View All',
    },
    explorations: {
      eyebrow: 'Explorations',
      title: 'Visual',
      italic: 'Lab',
      text: 'A living set of images, motion studies, and interaction fragments for testing style, rhythm, and new forms of expression.',
      cta: 'Open Moodboard',
      openAria: 'Open',
      closeAria: 'Close image',
    },
    footer: {
      marquee: 'Make Ideas Real • ',
      eyebrow: 'Contact',
      titlePrefix: 'Let us build something truly',
      italic: 'useful',
      titleSuffix: '.',
      status: 'Open to new collaborations',
      socials: ['WeChat', 'Xiaohongshu', 'Jike', 'GitHub'],
    },
    roles: ['Experience Designer', 'Full-stack Maker', 'Product Explorer', 'Content Creator'],
  },
  zh: {
    loading: {
      label: '作品集',
      words: ['设计', '创造', '启发'],
    },
    nav: {
      items: [
        { label: '首页', target: 'home' },
        { label: '作品', target: 'work' },
        { label: '履历', target: 'resume' },
      ],
      contact: '联系我',
      languageLabel: '切换语言',
    },
    hero: {
      eyebrow: '2026 作品集',
      title: '项目展示',
      rolePrefix: '一名',
      roleSuffix: '，在北京做设计与产品实践。',
      description: '关注 AI 时代的体验设计、工具系统与数字产品表达，把抽象想法打磨成可被使用、被理解、被记住的界面。',
      primaryCta: '看作品',
      secondaryCta: '联系我',
      scroll: '下滑',
    },
    work: {
      eyebrow: '精选作品',
      title: '精选',
      italic: '项目',
      text: '这里收录我参与和主导过的设计系统、AI 工具、产品原型与体验策略项目。',
      cta: '查看全部作品',
      hoverPrefix: '查看',
    },
    journal: {
      eyebrow: '札记',
      title: '近期',
      italic: '思考',
      text: '关于设计判断、AI 工作流、产品系统和创作方法的阶段性记录。',
      cta: '查看全部',
    },
    explorations: {
      eyebrow: '探索',
      title: '视觉',
      italic: '实验场',
      text: '一组持续更新的图像、动效和交互碎片，用来沉淀风格，也用来验证新的表达可能。',
      cta: '查看灵感库',
      openAria: '打开',
      closeAria: '关闭图片',
    },
    footer: {
      marquee: '把想法做成现实 • ',
      eyebrow: '联系',
      titlePrefix: '一起做点真正',
      italic: '有用',
      titleSuffix: '的东西。',
      status: '可合作新项目',
      socials: ['公众号', '小红书', '即刻', 'GitHub'],
    },
    roles: ['体验设计师', '全栈实践者', '产品探索者', '内容创作者'],
  },
} as const

export const workItems = [
  {
    title: { en: 'Automotive Motion System', zh: '车载动效系统' },
    span: 'md:col-span-12',
    aspect: 'h-[340px] sm:h-[380px] md:h-[430px] lg:h-[520px]',
    image:
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: { en: 'Urban Interface Space', zh: '城市空间界面' },
    span: 'md:col-span-6',
    aspect: 'h-[360px] sm:h-[400px] md:h-[380px] lg:h-[500px]',
    image:
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1100&q=80',
  },
  {
    title: { en: 'User Perspective Research', zh: '用户视角研究' },
    span: 'md:col-span-6',
    aspect: 'h-[360px] sm:h-[400px] md:h-[380px] lg:h-[500px]',
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1100&q=80',
  },
  {
    title: { en: 'Brand Experience Identity', zh: '品牌体验识别' },
    span: 'md:col-span-12',
    aspect: 'h-[340px] sm:h-[380px] md:h-[430px] lg:h-[520px]',
    image:
      'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1400&q=80',
  },
]

export const journalItems = [
  {
    title: { en: 'Designing With Slower Attention', zh: '用更慢的注意力做设计' },
    date: '2026.03.18',
    readTime: { en: '6 min read', zh: '6 分钟阅读' },
    image:
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: { en: 'Quiet Interfaces as Product Strategy', zh: '安静界面，也是一种产品策略' },
    date: '2026.03.02',
    readTime: { en: '8 min read', zh: '8 分钟阅读' },
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: { en: 'Keeping Motion Systems Handcrafted', zh: '让动效系统保留手工感' },
    date: '2026.02.21',
    readTime: { en: '5 min read', zh: '5 分钟阅读' },
    image:
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: { en: 'Notes on Cinematic Digital Presence', zh: '关于电影感数字现场的笔记' },
    date: '2026.02.09',
    readTime: { en: '7 min read', zh: '7 分钟阅读' },
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=400&q=80',
  },
]

export const explorations = [
  {
    title: { en: 'Soft Machine', zh: '柔性机器' },
    image:
      'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: { en: 'Glass Material Study', zh: '玻璃质感研究' },
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: { en: 'Signal Room', zh: '信号房间' },
    image:
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: { en: 'Motion Poster', zh: '动态海报' },
    image:
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: { en: 'Night Archive', zh: '夜间档案' },
    image:
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: { en: 'Human Scale', zh: '人的尺度' },
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
  },
]

export const stats: Array<[string, LocalizedText]> = [
  ['10+', { en: 'Years of design practice', zh: '年设计经验' }],
  ['30+', { en: 'Projects shipped', zh: '项目实践' }],
  ['200%', { en: 'Iterative energy', zh: '持续迭代热情' }],
]
