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

export type WorkContentBlock =
  | {
      id: string
      type: 'heading' | 'text'
      content: LocalizedText
    }
  | {
      id: string
      type: 'image'
      layout: 'wide'
      src: string
    }
  | {
      id: string
      type: 'image'
      layout: 'triple'
      srcs: [string, string, string]
    }

export interface WorkDetail {
  /** 页面按数组顺序连续渲染的自由内容流 */
  blocks: WorkContentBlock[]

  /** 以下字段保留以兼容早期内容，详情页不再固定渲染它们 */
  overview?: LocalizedText
  role?: LocalizedText
  duration?: LocalizedText
  strategies?: Array<{
    title: LocalizedText
    description: LocalizedText
    image?: string
  }>
  effectImages?: string[]
  outcomes?: Array<{
    metric: string
    label: LocalizedText
  }>
  summary?: LocalizedText
}

export interface WorkItem {
  slug: string
  title: LocalizedText
  tagline?: LocalizedText
  span: string
  aspect: string
  image: string
  detail?: WorkDetail
}

export const workItems: WorkItem[] = [
  {
    slug: 'checkout-order-experience',
    title: {
      en: 'Checkout & Order Experience',
      zh: '结算与履约体验升级',
    },
    tagline: {
      en: 'Redesigned core transaction flow — half-sheet checkout, delivery progress tracking, reduced cognitive load.',
      zh: '重构交易主链路结算与订单页，半屏浮窗降低操作感知，履约进度节点强化掌控感。',
    },
    span: 'md:col-span-12',
    aspect: 'h-[340px] sm:h-[380px] md:h-[430px] lg:h-[520px]',
    image: '/assets/work/checkout-order/hero.png',
    detail: {
      blocks: [
        {
          id: 'context',
          type: 'text',
          content: {
            en: 'The checkout and order tracking pages are critical touchpoints in the core transaction flow of a large-scale food delivery platform. Over years of iteration, the pages accumulated complex information hierarchies, inconsistent interaction patterns, and rising customer complaints. This project aimed to fundamentally reimagine both pages — simplifying structure, strengthening fulfillment transparency, and elevating the end-to-end transaction experience.',
            zh: '结算页与订单详情页是大型即时配送平台交易主链路上的关键环节，经过长期迭代，页面积累了复杂的信息层级、不一致的交互模式和持续上升的客诉。本项目旨在从根本上重新设计这两个页面——简化结构、强化履约透明度、提升端到端的交易体验。',
          },
        },
        {
          id: 'hero-image',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/checkout-order/hero.png',
        },
        {
          id: 'architecture-title',
          type: 'heading',
          content: {
            en: 'Restructure page architecture',
            zh: '重构页面架构',
          },
        },
        {
          id: 'architecture-copy',
          type: 'text',
          content: {
            en: 'Transformed the checkout from a full-page takeover into a lightweight half-sheet overlay, reducing perceived operational cost. Reordered information blocks based on user priority research and card-sorting analysis, consolidating scattered elements into a streamlined flow that balances user needs with business requirements from multiple stakeholder teams.',
            zh: '将结算页从全屏独立页面改造为轻量半屏浮窗，降低用户操作感知成本。基于用户优先级调研和卡片分类分析重新排列信息模块，将分散的元素整合为简洁流程，在满足多个业务方需求的同时兼顾用户体验。',
          },
        },
        {
          id: 'architecture-image',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/checkout-order/strategy-architecture.png',
        },
        {
          id: 'transparency-title',
          type: 'heading',
          content: {
            en: 'Enhance fulfillment transparency',
            zh: '强化履约信息透传',
          },
        },
        {
          id: 'transparency-copy',
          type: 'text',
          content: {
            en: 'Conducted a full-state audit of the order tracking page, redefining display priorities for delivery status. Added progress nodes to give users a sense of control over the delivery process. Refined status copy and escalation visibility to proactively manage user expectations and resolve pain points that previously generated complaints.',
            zh: '对订单追踪页进行全状态盘点，重新定义配送状态的展示优先级。新增履约进度节点，让用户对配送流程有更强的掌控感。优化状态文案和异常提醒可见性，主动管理用户预期，解决此前产生客诉的痛点。',
          },
        },
        {
          id: 'transparency-image',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/checkout-order/strategy-transparency.png',
        },
        {
          id: 'flow-title',
          type: 'heading',
          content: {
            en: 'Streamline information flow',
            zh: '整合信息动线',
          },
        },
        {
          id: 'flow-copy',
          type: 'text',
          content: {
            en: 'Unified inconsistent element styles, eliminated redundant visual layers, and standardized the reading flow across both pages. Redefined display rules to group related fields, simplify controls, and ensure edge cases render correctly — improving overall information acquisition efficiency.',
            zh: '统一不一致的元素样式，消除冗余视觉层级，规范两个页面的阅读动线。重新定义展示规则以分组关联字段、简化控件，并确保边界场景正确渲染——整体提升信息获取效率。',
          },
        },
        {
          id: 'output-title',
          type: 'heading',
          content: {
            en: 'Design output',
            zh: '设计产出',
          },
        },
        {
          id: 'output-01',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/checkout-order/effect-1.png',
        },
        {
          id: 'output-02',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/checkout-order/effect-2.png',
        },
        {
          id: 'output-04',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/checkout-order/effect-4.png',
        },
        {
          id: 'output-05',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/checkout-order/effect-5.png',
        },
        {
          id: 'result-title',
          type: 'heading',
          content: {
            en: 'Results',
            zh: '项目成果',
          },
        },
        {
          id: 'result-copy',
          type: 'text',
          content: {
            en: 'Customer complaint rate decreased by -n%; checkout conversion increased by +npp; and order completion improved by +npp.',
            zh: '客诉率降低 -n%，结算转化率提升 +npp，完单率提升 +npp。',
          },
        },
        {
          id: 'summary-title',
          type: 'heading',
          content: {
            en: 'Reflection',
            zh: '总结',
          },
        },
        {
          id: 'summary-copy',
          type: 'text',
          content: {
            en: 'By restructuring the page architecture, refining fulfillment communication, and streamlining information design, the project delivered measurable improvements in conversion, completion, and user satisfaction while maintaining alignment with 10+ business teams\' requirements.',
            zh: '通过重构页面架构、优化履约信息传达和简化信息设计，项目在转化率、完单率和用户满意度上取得了可量化的提升，同时与 10+ 业务团队的需求保持一致。',
          },
        },
      ],
      overview: {
        en: 'The checkout and order tracking pages are critical touchpoints in the core transaction flow of a large-scale food delivery platform. Over years of iteration, the pages accumulated complex information hierarchies, inconsistent interaction patterns, and rising customer complaints. This project aimed to fundamentally reimagine both pages — simplifying structure, strengthening fulfillment transparency, and elevating the end-to-end transaction experience.',
        zh: '结算页与订单详情页是大型即时配送平台交易主链路上的关键环节，经过长期迭代，页面积累了复杂的信息层级、不一致的交互模式和持续上升的客诉。本项目旨在从根本上重新设计这两个页面——简化结构、强化履约透明度、提升端到端的交易体验。',
      },
      role: {
        en: 'Lead UX Designer — Responsible for interaction design, information architecture, cross-team coordination with 10+ business teams',
        zh: '主设计师 — 负责交互设计、信息架构、与 10+ 业务团队的跨团队协调',
      },
      duration: {
        en: 'Approx. 6 months (research to launch)',
        zh: '约 6 个月（调研到上线）',
      },
      strategies: [
        {
          title: {
            en: 'Restructure Page Architecture',
            zh: '重构页面架构',
          },
          description: {
            en: 'Transformed the checkout from a full-page takeover into a lightweight half-sheet overlay, reducing perceived operational cost. Reordered information blocks based on user priority research and card-sorting analysis, consolidating scattered elements into a streamlined flow that balances user needs with business requirements from multiple stakeholder teams.',
            zh: '将结算页从全屏独立页面改造为轻量半屏浮窗，降低用户操作感知成本。基于用户优先级调研和卡片分类分析重新排列信息模块，将分散的元素整合为简洁流程，在满足多个业务方需求的同时兼顾用户体验。',
          },
          image: '/assets/work/checkout-order/strategy-architecture.png',
        },
        {
          title: {
            en: 'Enhance Fulfillment Transparency',
            zh: '强化履约信息透传',
          },
          description: {
            en: 'Conducted a full-state audit of the order tracking page, redefining display priorities for delivery status. Added progress nodes to give users a sense of control over the delivery process. Refined status copy and escalation visibility to proactively manage user expectations and resolve pain points that previously generated complaints.',
            zh: '对订单追踪页进行全状态盘点，重新定义配送状态的展示优先级。新增履约进度节点，让用户对配送流程有更强的掌控感。优化状态文案和异常提醒可见性，主动管理用户预期，解决此前产生客诉的痛点。',
          },
          image: '/assets/work/checkout-order/strategy-transparency.png',
        },
        {
          title: {
            en: 'Streamline Information Flow',
            zh: '整合信息动线',
          },
          description: {
            en: 'Unified inconsistent element styles, eliminated redundant visual layers, and standardized the reading flow across both pages. Redefined display rules to group related fields, simplify controls, and ensure edge cases render correctly — improving overall information acquisition efficiency.',
            zh: '统一不一致的元素样式，消除冗余视觉层级，规范两个页面的阅读动线。重新定义展示规则以分组关联字段、简化控件，并确保边界场景正确渲染——整体提升信息获取效率。',
          },
        },
      ],
      outcomes: [
        {
          metric: '-n%',
          label: {
            en: 'Customer complaint rate reduction',
            zh: '客诉率降低',
          },
        },
        {
          metric: '+npp',
          label: {
            en: 'Checkout conversion uplift',
            zh: '结算转化率提升',
          },
        },
        {
          metric: '+npp',
          label: {
            en: 'Order completion rate improvement',
            zh: '完单率提升',
          },
        },
      ],
      effectImages: [
        '/assets/work/checkout-order/effect-1.png',
        '/assets/work/checkout-order/effect-2.png',
        '/assets/work/checkout-order/effect-3.png',
        '/assets/work/checkout-order/effect-4.png',
        '/assets/work/checkout-order/effect-5.png',
      ],
      summary: {
        en: 'By restructuring the page architecture, refining fulfillment communication, and streamlining information design, the project delivered measurable improvements in conversion, completion, and user satisfaction while maintaining alignment with 10+ business teams\' requirements.',
        zh: '通过重构页面架构、优化履约信息传达和简化信息设计，项目在转化率、完单率和用户满意度上取得了可量化的提升，同时与 10+ 业务团队的需求保持一致。',
      },
    },
  },
  {
    slug: 'urban-interface-space',
    title: {
      en: 'Urban Interface Space',
      zh: '城市空间界面',
    },
    span: 'md:col-span-6',
    aspect: 'h-[360px] sm:h-[400px] md:h-[380px] lg:h-[500px]',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1100&q=80',
  },
  {
    slug: 'user-perspective-research',
    title: {
      en: 'User Perspective Research',
      zh: '用户视角研究',
    },
    span: 'md:col-span-6',
    aspect: 'h-[360px] sm:h-[400px] md:h-[380px] lg:h-[500px]',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1100&q=80',
  },
  {
    slug: 'brand-experience-identity',
    title: {
      en: 'Brand Experience Identity',
      zh: '品牌体验识别',
    },
    span: 'md:col-span-12',
    aspect: 'h-[340px] sm:h-[380px] md:h-[430px] lg:h-[520px]',
    image: 'https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1400&q=80',
  },
]

export const journalItems = [
  {
    title: { en: 'Redesigning Trust in Transaction Flows', zh: '重构交易链路中的信任感' },
    date: '2026.04.12',
    readTime: { en: '7 min read', zh: '7 分钟阅读' },
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80',
  },
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
