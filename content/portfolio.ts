export type Language = 'en' | 'zh'
export type LocalizedText = Record<Language, string>

export const CONTACT_EMAIL = 'taoznice@gmail.com'
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
  /** CMS 隐藏标记：true 时前台列表不展示该作品 */
  hidden?: boolean
}

export const workItems: WorkItem[] = [
  {
    slug: 'waimai-desktop-widget',
    title: {
      en: 'Emotional Design for a Food-Delivery Widget',
      zh: '外卖桌面小组件情感化设计',
    },
    tagline: {
      en: 'Turning a home-screen utility entry into a daily companion — a scene-based content system and a cross-brand IP collaboration.',
      zh: '把功能入口变成桌面上长期陪伴的「老朋友」——场景化内容矩阵与一次跨品牌 IP 联动。',
    },
    span: 'md:col-span-12',
    aspect: 'h-[340px] sm:h-[380px] md:h-[430px] lg:h-[520px]',
    image: '/assets/work/waimai-desktop-widget/hero.png',
    detail: {
      blocks: [
        {
          id: 'context',
          type: 'text',
          content: {
            en: 'A home-screen widget is a true zero-level entry: it stays visible without the app ever being opened. For a high-frequency service like food delivery, the opportunity is bigger than a shortcut — it is a surface for long-running content. But research also flagged the risk: purely functional or promotional information fatigues quickly, and a fatigued widget gets deleted. The design question became: how can a marketing widget survive on the home screen through emotional content?',
            zh: '桌面小组件是手机上的「0 级入口」——用户不打开 App，也能长期看到它。对于外卖这样高频刚需的业务，这个位置的机会不只是一个快捷跳转入口，更是一个可以长期运营内容的触点。但调研也指出了风险：如果展示的只是功能和利益信息，用户很容易视觉疲劳，最终把组件从桌面删掉。这个项目的核心命题因此变成——如何让一个营销属性的组件，靠情感化内容在用户的桌面上活下去。',
          },
        },
        {
          id: 'hero-image',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-desktop-widget/hero.png',
        },
        {
          id: 'persona-title',
          type: 'heading',
          content: {
            en: 'From shortcut to an old friend',
            zh: '从快捷入口到「桌面上的老朋友」',
          },
        },
        {
          id: 'persona-copy',
          type: 'text',
          content: {
            en: 'The design personifies the widget as a trendy, witty, living old friend. The kangaroo mascot is the protagonist of this small card: it has expressions, moods, and states, and it speaks in a caring, teasing, sometimes coquettish tone. The copy never shouts slogans or stacks incentives — it reads like a message from a friend: "A hard week deserves a good meal tonight." "Haven’t seen you in days — how about a bowl of noodles?" The widget shifts from an ad slot pushed onto the home screen into a character that checks in on you.',
            zh: '设计上把组件人格化为一个「潮、有趣、有梗、有活人感的老朋友」。袋鼠 IP 是这张小卡片的主角：它有表情、有情绪、有状态，会用关心的、撒娇的、调侃的语气和你说话。文案不喊口号、不堆利益点，而是像朋友发来的消息——「辛苦了一周，今晚吃点好的」「4 天都没见，不如吃碗面」。组件由此从一个被推送到桌面的广告位，变成一个主动关心你的角色。',
          },
        },
        {
          id: 'matrix-title',
          type: 'heading',
          content: {
            en: 'A content matrix that follows the day',
            zh: '跟着用户的一天和情绪走的内容矩阵',
          },
        },
        {
          id: 'matrix-copy',
          type: 'text',
          content: {
            en: 'The content system is built around scenes and emotions, growing into dozens of widget states: meal-time nudges, afternoon tea and late-night cravings by time of day; rain, snow, heatwave and typhoon care by weather; streak encouragement, win-back pleas for lapsed users, and unused-coupon reminders by behavior. Each state combines a scene illustration, a witty one-liner, and a soft incentive hook, so the widget says the right thing at the right moment — "The best thing about a rainy day is a steaming hot meal," or on a Friday night, "Late-night happiness starts with a coupon."',
            zh: '内容体系围绕「场景 × 情绪」搭建，持续产出数十种组件状态：按时间，有饭点提醒、下午茶、深夜宵夜；按天气，有下雨、下雪、高温、台风天的应景关怀；按行为，有连续下单的鼓励、久未下单的撒娇式挽回、未使用红包的提醒。每一种状态都由「场景插画 + 一句有梗的文案 + 利益钩子」构成，让组件在正确的时间说正确的话——下雨天说「最美不是下雨天，是热腾腾的美食」，周五深夜说「深夜的快乐，从用个红包开始」。',
          },
        },
        {
          id: 'matrix-image',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-desktop-widget/content-matrix.png',
        },
        {
          id: 'visual-title',
          type: 'heading',
          content: {
            en: 'Visual language: pop, yet unmistakable',
            zh: '视觉语言：一眼跳脱，一眼认得',
          },
        },
        {
          id: 'visual-copy',
          type: 'text',
          content: {
            en: 'Each card uses a saturated gradient to match its mood — deep blue for late night, hot orange-red for heatwaves, pale blue for snow. The kangaroo fully acts out every scene: soaking in a noodle bowl, lying on the moon, wiping sweat, wrapped in a blanket. The coupon capsule recurs as a visual anchor that carries the incentive. Among a grid of app icons, the widget has to pop instantly while staying unmistakably on-brand.',
            zh: '每张卡片用高饱和的渐变底色匹配情绪氛围——宵夜的深蓝、高温的橙红、雪天的浅蓝；袋鼠在每个场景里「入戏」：泡进面碗、躺在月亮上、热到扶额、裹进被子；红包则作为反复出现的视觉锚点，串联起利益信息。在桌面一众 App 图标之间，组件既要足够跳脱吸引目光，又要保持一眼可识别的品牌感。',
          },
        },
        {
          id: 'collab-title',
          type: 'heading',
          content: {
            en: 'A cross-brand collaboration',
            zh: '一次跨界联动',
          },
        },
        {
          id: 'collab-copy',
          type: 'text',
          content: {
            en: 'The Duolingo collaboration pushed the emotional design into meme territory: Duo the owl and the kangaroo became an official pair — "one feeds your brain, the other feeds your stomach." The two mascots’ personalities collide on each card: Duo nags you to eat with its signature passive-aggressive temper while the kangaroo plays the caring one. Lines like "Not eating on time? Duo is upset" borrow Duolingo’s native meme culture, giving the widget content organic reach on social platforms.',
            zh: '与多邻国的联动把情感化推向 meme 化：多儿 Duo 和袋鼠组成「一个管脑，一个管胃」的官方 CP。两个 IP 的性格在卡片上对撞——Duo 带着它标志性的傲娇小脾气催你吃饭，袋鼠在一旁贴心补位。「吃饭不积极，Duo 有小脾气」这类文案借多邻国自带的梗文化，让组件内容具备了在社交场自传播的潜力。',
          },
        },
        {
          id: 'collab-image',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-desktop-widget/duolingo-collab.png',
        },
        {
          id: 'reflection-title',
          type: 'heading',
          content: {
            en: 'Reflection',
            zh: '设计思考',
          },
        },
        {
          id: 'reflection-copy',
          type: 'text',
          content: {
            en: 'A widget lives by a simple rule: it stays on the home screen only if it is delightful to look at. In this project, emotional design is not decoration — it is the retention mechanism that turns an entry point into companionship. When content follows the rhythm, weather, and mood of the person holding the phone, every glance becomes less an impression and more a greeting.',
            zh: '小组件有一个朴素的生存法则：好看、有趣，才会被留在桌面上。所以在这个项目里，情感化不是装饰，而是留存机制——它让组件从「入口」变成「陪伴」。当内容开始跟着用户的作息、天气和情绪走，每天解锁手机时的一眼，就不再是一次曝光，而是一次打招呼。',
          },
        },
      ],
    },
    hidden: true,
  },
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
    hidden: true,
  },
  {
    slug: 'waimai-homepage-traffic',
    title: {
      en: 'Food-Delivery Homepage: Rebalancing Traffic',
      zh: '外卖首页流量分发架构演进',
    },
    tagline: {
      en: 'Reading the homepage as a traffic distribution system — layered by user intent, designed with restraint, and leaving controlled room for new businesses.',
      zh: '把首页当作流量分发系统来设计——按意图分层、以克制为立场，并在成熟动线之上为新业务留出空间。',
    },
    span: 'md:col-span-12',
    aspect: 'h-[340px] sm:h-[380px] md:h-[430px] lg:h-[520px]',
    image: '/assets/work/waimai-homepage-traffic/before-after.png',
    detail: {
      blocks: [
        {
          id: 'context',
          type: 'text',
          content: {
            en: 'A food-delivery homepage is rarely just a page. The question it answers every day is how to allocate a limited screen across users with very different intentions. At any moment, a user opens the homepage in one of three states: knows exactly what to eat, has a rough direction, or has no idea at all. Search, category icons, and the feed serve these three states respectively. This simple layering defines the underlying order of homepage design: the clearer the intent, the shorter the path should be; the vaguer the intent, the more it needs stimulation. Almost every trade-off made over the past decade can be traced back to this order.',
            zh: '外卖首页很难被当作一个普通页面来对待。它每天要回答的问题是：把有限的屏幕空间，分配给意图各不相同的用户。用户打开首页时大致处于三种状态之一，已经想好吃什么，大概知道方向，或者完全没想法。搜索、金刚、列表分别承接这三种状态。这个简单的分层决定了首页设计的底层秩序：意图越明确，路径应该越短；意图越模糊，越需要被激发。后来十年里的几乎所有取舍，都能从这个秩序里找到出处。',
          },
        },
        {
          id: 'evolution-title',
          type: 'heading',
          content: {
            en: 'Evolution: From Stacking to Precision',
            zh: '演进：从堆叠到精准',
          },
        },
        {
          id: 'evolution-1',
          type: 'text',
          content: {
            en: 'The early homepage was a fully functional tool page, plain and direct. The real shift began with a supply explosion: as merchants and dishes multiplied, users paradoxically found it harder to decide what to eat. The platform took over the role of a shopping guide — promotional tiles, themed floors, and campaign sections filled the page. But human curation had a structural limit: with no way to tell one user from another, a single product could sit on the homepage for weeks, and everyone saw the same page. The space was maxed out, yet the efficiency never followed.',
            zh: '早期的首页是一个功能齐全的工具页，简单直接。真正的变化始于供给爆发：商家和商品多了，用户反而不知道吃什么，平台于是接管了「导购」的角色，运营瓷片、主题楼层、活动会场轮番上阵，把首页填得很满。但人工导购有天然的局限：没有策略识别每个人的差异，一个商品推上首页可能一放数周，所有人看到的都是同一页。空间被占尽了，效率却上不去。',
          },
        },
        {
          id: 'evolution-2',
          type: 'text',
          content: {
            en: 'Recommendation systems changed all of it. Personalized distribution based on user profiles, scenarios, time of day, and past preferences gradually replaced manual curation; the tiles were removed and the feed became the main stage for recommendations. As recommendation accuracy reached a new level and the user base shifted toward existing users, the tension shifted again: stimulation-driven design was yielding diminishing returns, and stacking more only diluted the value of every impression. What had become truly scarce was user trust.',
            zh: '推荐系统改变了这一切。基于人群、场景、时段、历史偏好的个性化分发，逐步取代了人工排布，瓷片被收回，列表成为推荐的主场。而当推荐命中率到了一个新的水位、用户结构转向存量为主时，矛盾再次转移：激发型设计的边际收益在下降，继续堆叠只会摊薄每一次曝光的价值。此时真正稀缺的资源，是用户的信任。',
          },
        },
        {
          id: 'before-after-image',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-homepage-traffic/before-after.png',
        },
        {
          id: 'stance-title',
          type: 'heading',
          content: {
            en: 'A Stance of Restraint and Nativeness',
            zh: '设计立场：克制与原生',
          },
        },
        {
          id: 'stance-0',
          type: 'text',
          content: {
            en: 'Every design decision in this stage was built on an understanding of trust. The longer users live on the internet, the stronger their immunity to marketing tactics — the heavier the packaging, the more it looks like an ad, the faster it gets scrolled past. Conversely, content that resembles a genuine recommendation is far more likely to be taken seriously. Three practices followed from this.',
            zh: '这个阶段的全部设计判断，都建立在对信任的理解上。用户在互联网里泡得越久，对营销套路的免疫力越强，包装越重，越像广告，越容易被划过去。反过来，越接近一个真实推荐结果的内容，越容易被认真对待。由此推出三条做法。',
          },
        },
        {
          id: 'stance-1',
          type: 'text',
          content: {
            en: 'First, return space to where it performs better. Search is the clearest-intent entry on the page, yet the suggestion terms under the search box were doing stimulation work in the clearest place — serving the wrong audience. Removing them meant one less layer of noise for users with a clear goal, and the freed space let the feed surface one more card. The category icons followed the same logic: the third row was rarely reached, so it was folded into two, giving the inefficient space back to the feed.',
            zh: '第一，把空间还给更高效的区域。搜索是意图最明确的入口，而搜索框下方的推荐词，是在最明确的地方做最不明确的激发，服务错了对象。去掉它，有明确目标的用户少一层干扰，腾出的位置让列表多露出一张卡片。金刚做了同样的判断：第三排品类入口已经很少被走到，收为两排，把低效空间还给列表。',
          },
        },
        {
          id: 'stance-2',
          type: 'text',
          content: {
            en: 'Second, govern the expression layer systematically. Sharper design rules, a steadier layout rhythm, and one consistent visual language across all modules; legacy heavy-operations expressions — tinted backgrounds, decorative atmosphere, marketing copy — were cleaned out one by one, bringing the page back to what a recommendation result naturally looks like.',
            zh: '第二，表达层做系统性治理。设计规则更清晰，排版更有规律，同一套设计语言贯穿所有模块；历史遗留的强运营表达，底色、氛围、营销话术，逐一清理，让页面回到「推荐结果本来的样子」。',
          },
        },
        {
          id: 'stance-3',
          type: 'text',
          content: {
            en: 'Third, every subtraction shared one bottom line: never touch the mature pathways of existing users. Restraint begins with knowing what must not be touched.',
            zh: '第三，所有减法共享一条底线：不动已有用户的成熟动线。克制的前提是清楚什么不能碰。',
          },
        },
        {
          id: 'feed-title',
          type: 'heading',
          content: {
            en: 'Feed: From Packaging to Native',
            zh: '列表：从包装到原生',
          },
        },
        {
          id: 'feed-1',
          type: 'text',
          content: {
            en: 'The evolution of the feed is a continuous process of unwrapping. Early recommendation results were wrapped in layers of themed cards — users had to read the packaging before reaching the content. Later the packaging peeled away, and recommendations returned to native cards. The next step was letting merchant cards expose a limited set of dishes, so users could sense what a store mainly sells without entering it. How much to expose and how large the images should be was a repeated trade-off between information transparency and card efficiency, finally settling at a point where one extra glance informs and one fewer glance costs nothing.',
            zh: '列表的演进是一条不断「去包装」的路。早期的推荐结果被主题卡片层层包裹，用户要先看懂包装、才看得到内容；后来包装被逐层褪去，推荐还原为原生卡片。再往后一步，是让商家卡片有限地外露商品，用户不进店，就能感知这家店的主营品类。外露多少、图片多大，是信息透明度和卡片坪效之间的反复权衡，最终停在「多一眼即懂、少一眼不亏」的位置。',
          },
        },
        {
          id: 'feed-2',
          type: 'text',
          content: {
            en: 'We also tested a more aggressive option: item mode. Organizing traffic as a merchandise pool, exposing more categories within a store and passing through low-priced entry items. Its advantage was clear, and so was its cost — it consumed a lot of screen efficiency, and for high-frequency regulars who already knew the neighborhood supply, a price-focused presentation meant little; what it truly served were new users unfamiliar with the supply. Item mode therefore ended up inside scenario-based entries like Special Deals, instead of replacing the main feed.',
            zh: '我们也验证过更激进的方案：商品模式。以货盘的思路组织流量，直接曝光店内更多品类、透传引流商品。它的优势明确，代价也明确，对坪效的占用很高，而对高频复购、熟悉商圈供给的老客，突出性价比的意义有限；它真正适合的，是对供给还不熟悉的新客。所以商品模式最终收进「特价外卖」这样的场景化入口，没有取代主列表。',
          },
        },
        {
          id: 'list-modes-image',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-homepage-traffic/list-modes.png',
        },
        {
          id: 'feed-3',
          type: 'text',
          content: {
            en: 'The exploration confirmed the stance itself: when recommendations are already accurate, knowing where to stop matters more than knowing where to go.',
            zh: '这轮探索反过来印证了立场本身：当推荐已经精准，知道在哪里停下，比知道往哪里走更重要。',
          },
        },
        {
          id: 'showcase-title',
          type: 'heading',
          content: {
            en: 'Showcase Windows: Telling a Business in Minimal Space',
            zh: '橱窗：小空间传达业务特征',
          },
        },
        {
          id: 'showcase-1',
          type: 'text',
          content: {
            en: 'Amid stock competition, the homepage had to answer another question: where does growth come from. One line of exploration worked on user pathways (such as the second floor, covered in a separate case); the other line incubated new businesses — supply like flash-deal meals, healthy options, and single-person meals needed room to grow on the homepage without sacrificing mature pathways. The showcase window was the answer to this brief.',
            zh: '存量竞争之下，首页还要回答另一个问题：增量从哪里来。一条线是动线层面的探索（如二楼，另案详述）；另一条线是新业务扶持，神抢手、健康、一人食这样的新供给，需要在首页获得生长空间，又不能以牺牲成熟动线为代价。橱窗就是这个命题下的解法。',
          },
        },
        {
          id: 'showcase-2',
          type: 'text',
          content: {
            en: 'The design started with organizing demands. Despite their differences, businesses in the exploration stage shared four types of needs: brand and value-proposition communication, supply exposure, marketing claims, and livestream content. Since demands could be grouped, expression could be framed. The final structure has two layers: a business-mind zone carrying the brand and two lines of value proposition, answering what the business does; and a supply zone presenting supply in fixed information slots, where each business differentiates within a consistent structure — restraint and white space for quality, price-tag claims for deals, content-first for livestream — all standing on the same skeleton.',
            zh: '设计从整理诉求开始。各业务在探索期的诉求其实高度相似，可以归为四类：品牌及价值主张的宣导、供给外露、营销诉求、直播内容透传。既然诉求可归组，表达就可以框架化。最终的结构分两层：业务心智区放品牌和两行价值主张，回答「你是做什么的」；业务供给区用固定的信息位呈现供给，各业务在结构一致的前提下做差异化，品质向的克制留白、优惠向的价签主张、直播向的内容前置，同一个骨架里各自成立。',
          },
        },
        {
          id: 'showcase-3',
          type: 'text',
          content: {
            en: 'Beyond the frame came supporting mechanisms: access and exit rules that keep showcase windows a rotating position rather than a permanent booth; an independent template preserved for strategic businesses; and motion — sliding livestream expansion, rotating supply — to compensate for the space a unified frame compresses.',
            zh: '框架之外还有配套机制：业务的准入与退出规范，保证橱窗是流动的位置而非永久摊位；对战略级业务保留独立的模板形态；用直播滑动展开、供给轮播这类动效，弥补统一框架带来的空间压缩。',
          },
        },
        {
          id: 'showcase-framework-image',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-homepage-traffic/showcase-framework.png',
        },
        {
          id: 'showcase-4',
          type: 'text',
          content: {
            en: 'The later refinement of the flash-deal window validated the flexibility of this framework, and pushed the understanding one layer deeper: after de-marketing the title zone — removing tinted backgrounds and subtitles — the content became more credible. A well-matched supply beats a marketing action. That line later became the underlying judgment for all showcase design.',
            zh: '神抢手橱窗后来的精细化迭代，验证了这个框架的弹性，也把认知再推进了一层：对标题区的底色、副标题做去营销化处理后，内容反而更可信。供给的命中，比营销的动作更有效。这句话后来成了整个橱窗设计的底层判断。',
          },
        },
        {
          id: 'reflection-title',
          type: 'heading',
          content: {
            en: 'Reflections',
            zh: '认知沉淀',
          },
        },
        {
          id: 'reflection-1',
          type: 'text',
          content: {
            en: 'The object of homepage design is an attention-allocation system. A module\'s value is determined by the clarity of intent it serves; before any module expands, it must first answer whether it deserves the space.',
            zh: '首页设计的对象是注意力分配系统。模块的价值由它承接的意图明确度决定，任何一个模块想扩张，先要回答它配不配占这个位置。',
          },
        },
        {
          id: 'reflection-2',
          type: 'text',
          content: {
            en: 'The more accurate the recommendation, the further design should step back. A designer\'s restraint clears the way for the algorithm\'s precision; the most expensive thing on the page is trust, and trust does not survive packaging.',
            zh: '推荐越精准，设计越要退后。设计师的克制，是给算法的准确让路；页面里最贵的东西是信任，而信任经不起包装。',
          },
        },
        {
          id: 'reflection-3',
          type: 'text',
          content: {
            en: 'Space given to new businesses must come with boundaries and exit mechanisms. The hard part of incremental exploration has never been whether to give, but how to give — and when to take back.',
            zh: '给新业务的空间必须有边界和退出机制。增量探索的难点从来在于怎么给、什么时候收回。',
          },
        },
      ],
    },
    hidden: true,
  },
  {
    slug: 'waimai-second-floor',
    title: {
      en: 'The Second Floor: Building New Space',
      zh: '外卖二楼：在成熟产品上造一个新空间',
    },
    tagline: {
      en: 'Building a new space beyond the homepage that users voluntarily pull down to enter — with deals as the anchor and the gesture as the narrative.',
      zh: '存量时代，在首页之外造一个用户愿意主动下拉进入的新空间——锚点是优惠，叙事是手势。',
    },
    span: 'md:col-span-12',
    aspect: 'h-[340px] sm:h-[380px] md:h-[430px] lg:h-[520px]',
    image: '',
    detail: {
      blocks: [
        {
          id: 'context',
          type: 'text',
          content: {
            en: 'After recommendation systems pushed the food-delivery homepage to peak efficiency, a harder question emerged: efficiency preserves the existing user base, but it cannot create growth. Throughout 2023, the team spent a full year exploring "new pathways" — a term with two layers: building new spaces users want to stay in, and building the elevators that take them there. The second floor was the first answer on the space side.',
            zh: '推荐系统把外卖首页的效率推向高位之后，一个更难的问题浮出来：效率能守住存量，撑不起增量。2023 年起，团队用一整年探索「新动线」，它包含两层含义——造用户愿意待的新空间，修把用户送过去的新电梯。二楼，是新空间方向最先落地的答案。',
          },
        },
        {
          id: 'question-1',
          type: 'text',
          content: {
            en: 'The homepage cannot answer the question of growth. Every inch of its space already has an owner; adding a new business means squeezing out an old one, and that equation has no solution. The way out lies beyond the homepage.',
            zh: '首页无法回答增长的问题。它的每一寸空间都有明确的归属，塞进新业务就要挤掉旧业务，这个方程无解。出路在首页之外。',
          },
        },
        {
          id: 'cb61d6c7-7eb8-445c-906b-9d7046662959',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-second-floor/1793845881154.mp4',
        },
        {
          id: 'question-title',
          type: 'heading',
          content: {
            en: 'Where Does Growth Space Come From',
            zh: '命题：增量空间从哪里来',
          },
        },
        {
          id: 'question-2',
          type: 'text',
          content: {
            en: 'The pull-down-to-second-floor gesture became widely familiar during the pandemic. But across the industry, second floors are mostly built as feature hubs or ad placements — users swipe in and see shelves. The food-delivery second floor was looking for a third form: a space with a clear business proposition (deals) that never looks like an ad, an operations space that deserves voluntary visits.',
            zh: '下拉进二楼的手势在疫情期间被广泛普及，用户已经熟悉这个动作。但行业里，下拉二楼大多被做成功能聚合页或者广告位，用户划进去，看到的是货架。外卖二楼要找的是第三种形态：它有明确的业务主张（优惠），却不能长得像广告；它是运营空间，却要值得用户主动来访。',
          },
        },
        {
          id: 'challenge-title',
          type: 'heading',
          content: {
            en: 'Three Kinds of Vagueness',
            zh: '难在哪：三重模糊',
          },
        },
        {
          id: 'challenge-1',
          type: 'text',
          content: {
            en: 'This project had almost no stones to step on. The goal was vague — a brand-new function with no historical data and no direct competitor. The standard was vague — the product side kept stressing "expressiveness", yet everyone understood the word differently, and design reviews easily turned into parallel monologues. The implementation was vague — real-time gesture-driven motion is nothing like ordinary tap feedback: animation timelines are complex, the experience depends heavily on real devices, and debugging costs far exceed a typical project.',
            zh: '这个项目几乎没有可以踩着的石头。其一，目标模糊——全新功能，没有历史数据，没有直接竞品；其二，标准模糊——产品侧反复强调「表现力」，但每个人对这两个字的理解都不一样，方案评审很容易变成各说各话；其三，实现模糊——跟手的实时交互动效与常规点击反馈完全不同，动画节点复杂、高度依赖真机体验，调试成本远超一般项目。',
          },
        },
        {
          id: 'method-title',
          type: 'heading',
          content: {
            en: 'Making the Vague Clear',
            zh: '方法：把模糊做清楚',
          },
        },
        {
          id: 'method-1',
          type: 'text',
          content: {
            en: 'Three kinds of vagueness, three solutions.\n\nA vague goal was given shape through co-creation: at the stage when the requirement could barely be articulated, product and design first aligned on product positioning and design keywords, so the requirement had a direction before entering design. A vague standard was turned from an adjective into nouns: an internal working session broke "expressiveness" into three shareable focuses — the dividend of motion, delight and playfulness, creative ingenuity — giving reviews a common coordinate system. A blank competitive field called for references beyond the industry: studying cross-domain cases along four directions — element and gesture interplay, breaking the edges of the interface, playful feedback, parallax transitions. The rest was left to real devices: frame-by-frame joint debugging of gesture-driven motion, polishing rhythm and speed.',
            zh: '三个模糊，三种解法。\n\n目标模糊，靠共创长出轮廓：在需求还说不清的阶段，产品与设计先就产品定位和设计关键词达成一致，需求在进入设计之前先有了方向。标准模糊，把「表现力」从形容词变成名词：组内务虚会把表现力拆成三个可共识的发力点——动效红利、惊喜趣味、创意巧思，评审从此有了共同的坐标系。竞品空白，就跳出行业找参照：从关键词出发研究跨界案例，元素与手势的互动、打破界面边缘、趣味性反馈、视差转场，四个方向拓宽了二楼可以长什么样的想象。剩下的交给真机：跟手动效逐帧联调，节奏与倍速反复打磨。',
          },
        },
        {
          id: 'expression-title',
          type: 'heading',
          content: {
            en: 'Deals Worth a Pull',
            zh: '心智与表达：让优惠值得一次下拉',
          },
        },
        {
          id: 'expression-1',
          type: 'text',
          content: {
            en: 'As a new space, the second floor had to answer its first question: why would users come. The answer was pinned on a single anchor: deals. Users believe they can find deal assets here, and get deal-driven recommendations — that trust is the entire source of willingness. The anchor had to be singular: deal aggregation, deal-driven recommendations, deal expression — everything on the second floor exists around it.',
            zh: '二楼作为新空间，第一个要回答的问题是用户凭什么来。答案钉在一个锚点上：优惠。用户相信在这里能找到优惠资产，也能基于优惠获得推荐，这个信任是主动性的全部来源。锚点必须唯一——优惠聚合、优惠推荐、优惠表达，二楼的一切都围绕它成立。',
          },
        },
        {
          id: 'expression-2',
          type: 'text',
          content: {
            en: 'The second question follows immediately: how to make deals felt. Perception does not come from claims; it comes from the right moment and the right magnitude — transmit too little and expectation never builds; too much and the second floor slides back into an ad page.',
            zh: '第二个问题紧随其后：怎么让用户感知到优惠。感知不来自宣称，来自恰当的环节和恰当的幅度——透传太少，拉不起期待；透传太多，二楼就滑回广告页。',
          },
        },
        {
          id: 'expression-3',
          type: 'text',
          content: {
            en: 'Design handed both questions to the same carrier: the pull-down gesture. As users drag down, the red packet on top grows larger and the rice grains pile up — the sense of deals grows along with the gesture, linking "my action" directly to "my gain". It is a metaphor, and it builds a mindset: come to the second floor, and the act itself pays off.',
            zh: '设计把这两个问题交给了同一个载体：下拉的手势。用户向下拖动时，顶部的红包越来越大、米粒越积越多，优惠的感知跟着手势一起生长——「我的动作」和「我的获得」被直接关联起来。这是一个隐喻，也是一次心智的建立：来二楼，动作本身就有回报。',
          },
        },
        {
          id: 'expression-4',
          type: 'text',
          content: {
            en: 'An IP companion turned the journey into a story. The kangaroo pulling down the second floor has expressions and behaviors; during the pull it picks up the red packet and slots it into the second floor, connecting motion and scene seamlessly. The emotional interaction adds memorability and recognition, and dissolves the distance of a new function. The whole pull-down therefore feels pleasant and smooth.',
            zh: 'IP 让这段旅程有了陪伴。袋鼠拉动二楼的过程带着表情和行为，下拉时它接过红包、把它插进二楼，动作与场景自然衔接。情感化的互动增加了记忆和认知，也消解了新功能的距离感。整个下拉过程因此是愉悦的、顺畅的。',
          },
        },
        {
          id: 'expression-5',
          type: 'text',
          content: {
            en: 'Once the experience was set, complexity was distilled into capability: every motion node was fully defined through real-device joint debugging, and the entry was templated — a business configures one slot and one color to get a custom design. The second floor went from a piece of work to a production line that keeps running.',
            zh: '体验定型之后，复杂被沉淀为能力：动效节点经真机联调被完整定义，入口模板化，业务配置一个资源位、一个颜色，就能得到一套定制设计。二楼从一件作品，变成了一条可持续运转的生产线。',
          },
        },
        {
          id: '90c8ebad-b2e2-4122-a508-37bc6b82c284',
          type: 'image',
          layout: 'triple',
          srcs: [
            '/assets/work/waimai-second-floor/1793795605041.mp4',
            '/assets/work/waimai-second-floor/1793795699293.mov',
            '/assets/work/waimai-second-floor/1793795668800.mp4',
          ],
        },
        {
          id: 'reflection-title',
          type: 'heading',
          content: {
            en: 'Reflections',
            zh: '认知沉淀',
          },
        },
        {
          id: 'reflection-1',
          type: 'text',
          content: {
            en: 'The essence of growth is a new chance to meet. The value of the second floor lies in one extra touchpoint between platform and user — and it arrives as incremental traffic that squeezes nothing out of existing pathways.',
            zh: '增量的本质是新的见面机会。二楼的价值在于平台与用户之间多出的一次触达，且这次触达以增量流量的形态存在，不挤压原有动线。',
          },
        },
        {
          id: 'reflection-2',
          type: 'text',
          content: {
            en: 'A new space must pin down one anchor. There can be only one reason for users to come voluntarily; the second floor pinned it on deals. Design\'s job is to transmit that anchor into felt experience at the right moments and in the right magnitude.',
            zh: '新空间要先钉死一个锚点。用户主动来访的理由只能有一个，二楼把它钉在优惠上；设计的工作，是在恰当的环节、以恰当的幅度，把这个锚点透传成可感知的体验。',
          },
        },
        {
          id: 'reflection-3',
          type: 'text',
          content: {
            en: 'The gesture is the narrative. Gesture-following feedback links user action directly to gain, and the IP\'s emotional presence dissolves the distance of a new function — a good new space makes the act of exploring rewarding in itself.',
            zh: '手势即叙事。跟手的反馈把用户动作与优惠获得直接关联，IP 的情感化互动消解功能的距离感——好的新空间，让探索这个动作本身有回报。',
          },
        },
        {
          id: 'reflection-4',
          type: 'text',
          content: {
            en: 'Insight is fulfilled by design. A deep understanding of the requirement completes only half the work; only when design carries it into concrete experience does the project close its loop.',
            zh: '洞察由设计承接。对需求的深刻理解只完成一半，用设计手段把它承接成具体体验，项目才算闭环。',
          },
        },
      ],
    },
    hidden: true,
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
