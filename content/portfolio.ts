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

/** 媒体显示区域裁剪（0-1 分数坐标：x/y 为起点，w/h 为宽高），只影响展示，不修改素材文件本身 */
export interface MediaCrop {
  x: number
  y: number
  w: number
  h: number
}

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
      /** 视频展示：true=撑满整行；false/缺省=按三图布局单张宽度居中展示 */
      videoFill?: boolean
      /** 视频不撑满时容器的背景色（CSS 颜色值，缺省为默认灰） */
      videoBg?: string
      /** 显示区域裁剪：只展示框选的部分，素材本身不变 */
      crop?: MediaCrop
      /** 裁剪后展示是否带圆角，缺省为 true */
      cropRounded?: boolean
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
            en: 'The checkout page and the order detail page are the two heaviest surfaces in the food-delivery transaction flow: the underlying logic is complex, more than ten business teams compete for space on them, and years of iteration piled up tangled hierarchies, inconsistent styles and recurring complaints. The project started by defining the core problems through scenario analysis, a full heuristic audit, user research, card sorting and competitive analysis at home and abroad, then rebuilt both pages — simplifying structure, strengthening fulfillment transparency, and lifting the end-to-end transaction experience.',
            zh: '结算页与订单详情页是外卖交易主链路上最重的两个页面：底层逻辑复杂，长期迭代叠加了十多个业务团队的流量诉求，页面积累了复杂的信息层级、不一致的交互样式和持续的客诉。项目从场景分析、现状问题走查、用户调研、卡片分类到国内外竞品分析，先定义出核心问题，再对两个页面做整体重构——简化结构、强化履约透明度、提升端到端的交易体验。',
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
            en: 'The checkout moved from a full-page takeover to a lightweight half-sheet overlay, cutting the perceived cost of the operation. Information modules were re-ordered through card-sorting analysis and differentiated across pre-payment, payment, post-payment and fulfillment scenarios, bringing what users actually care about at each moment to the front. The overall structure rebalances the demands of ten-plus business teams against the user experience.',
            zh: '将结算页从全屏独立页面改造为轻量半屏浮窗，降低用户的操作感知成本。基于卡片分类分析重新排列信息模块，并按支付前、支付中、支付后与履约的不同场景区分信息，把每个环节用户真正关心的内容前置。整体信息结构在十多个业务团队的诉求与用户体验之间重新找到平衡。',
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
            en: 'Order detail involves an enormous number of states, and complaints often traced back to state priority. The rider-arrival status used to outrank the merchant preparation status — when a merchant was slow to prepare, the page kept showing that the rider was already waiting, and users directed their frustration at the rider, escalating the conflict. We audited every state, redefined the display priorities of fulfillment information, and refined status copy; then raised the visibility of abnormal reminders to manage expectations, and added delivery progress nodes to strengthen the sense of control over the process and ease the anxiety of waiting.',
            zh: '订单详情的状态逻辑极多，客诉往往出在状态优先级上：骑手到店取餐的状态原本优先于商家出餐展示，商家久未出餐时，页面一直显示骑手已到店，用户把火气撒向骑手，反而激化矛盾。项目对全部状态做了盘点，重新定义履约信息的展示优先级并细化状态与文案表达；再通过提升异常提醒的可见性管理用户预期，新增履约进度节点强化对配送过程的掌控感，缓解等待焦虑。',
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
          src: '/assets/work/checkout-order-experience/1793874717999.png',
        },
        {
          id: 'output-02',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/checkout-order-experience/1793874726873.png',
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
            en: 'The core of transaction-flow design is expectation management. A sense of control comes from honest, predictable information — put what users care about at each moment first, and the anxiety falls away on its own.',
            zh: '交易链路设计的核心是预期管理。掌控感来自信息的诚实与可预期：每个环节把用户真正关心的内容前置，焦虑自然下降。',
          },
        },
        {
          id: 'reflection-2',
          type: 'text',
          content: {
            en: 'Ordering states by priority matters more than polishing copy. The rider-versus-merchant conflict shows that the first questions of communication are who speaks first and what gets said — how to say it comes second.',
            zh: '状态的优先级排序比文案打磨更根本。骑手与商家的冲突场景说明：信息传达的第一性问题是谁先说、说什么，其次才是怎么说。',
          },
        },
        {
          id: 'reflection-3',
          type: 'text',
          content: {
            en: 'Structural changes to a core flow always carry local costs. What matters is making those costs visible, attributable and reversible — absorbing them through continuous tuning rather than hiding from them in the design.',
            zh: '主链路的结构调整必然带来局部代价。关键是让代价可见、可归因、可回调，用持续调优去消化它，而不是在方案里回避它。',
          },
        },
      ],
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
    image: '/assets/work/waimai-homepage-traffic/list-modes.png',
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
    image: '/assets/work/waimai-second-floor/1793845881154.mp4',
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
          videoFill: true,
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
    slug: 'waimai-store-upgrade',
    title: {
      en: 'Store Page Upgrade',
      zh: '店铺页升级',
    },
    tagline: {
      en: 'One template had served every merchant for years. We split it into three tiers of storefront capability — so every store can present itself in its own voice.',
      zh: '一套模板服务了所有商家很多年。我们把它拆成三档装修能力，让每家店都能以自己的样子见人。',
    },
    span: 'md:col-span-12',
    aspect: 'h-[340px] sm:h-[380px] md:h-[430px] lg:h-[520px]',
    image: '/assets/work/waimai-store-upgrade/1793868878449.png',
    detail: {
      blocks: [
        {
          id: 'context',
          type: 'text',
          content: {
            en: 'The store page is one of the oldest surfaces in the app. Brand header, menu list, item detail — a single template has served every storefront, and years of iteration touched only the styling, never the skeleton. The problems hold for all three parties at once: users enter a store and cannot tell what kind of place it is, what its signature dishes are, whether to trust it; merchants want brand presence but have no room to express it, and their operational skills vary wildly; on the platform side, the unified template guarantees efficiency and a floor on experience, at the cost of every store looking alike. The real bottleneck is the word "unified" itself — every local optimization is just another patch on it.',
            zh: '外卖店铺页是美团里最老的一批页面。头部品牌区、菜单列表、商品详情，一套模板服务所有门店，几年下来改动的都是局部样式，骨架没有动过。问题在三个角色身上同时成立：用户进店后看不清这是一家什么样的店，招牌菜是什么，值不值得信任；商家想要品牌感却没有表达空间，装修能力又参差不齐；平台这一侧，统一模板保住了效率和体验下限，代价是页面长得越来越像。真正的症结出在「统一」这两个字上，任何局部优化都在给它打补丁。',
          },
        },
        {
          id: 'img-hero',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-store-upgrade/result-five-versions.png',
        },
        {
          id: 'strategy-title',
          type: 'heading',
          content: {
            en: 'Strategy: Start from How Merchants Differ',
            zh: '策略：从商家的差异出发',
          },
        },
        {
          id: 'strategy-1',
          type: 'text',
          content: {
            en: 'The obvious move is to redesign one better-looking template. Research pointed somewhere else: the relationship between merchants and the platform varies enormously. High-end brands like Da Dong have their own private channels and dine-in business; delivery is a supplement, and their willingness to invest is low. Starbucks wants a consistent experience across the platform, yet many of its brand operations cannot be carried by the platform. Merchants like Jiayibing depend on delivery orders and care deeply about online operations, but lack the ability to build a good storefront. Food-court stalls run small businesses and barely care about storefront decoration at all. One template is a constraint for the first group and an indulgence for the third.',
            zh: '最容易想到的做法，是重做一套更好看的模板。调研的结论把我们引向了另一个方向：商家和平台的关系差别巨大。大董这类头部品牌有自己的私域和堂食阵地，外卖只是补充，上线意愿不高；星巴克希望全平台体验统一，但很多运营手段平台承接不了；甲乙饼这类商家依赖外卖订单、重视线上经营，却没有能力把店铺做好；美食城档口小本买卖，对线上装修基本无感。同一套模板，对第一类是约束，对第三类是放任。',
          },
        },
        {
          id: 'img-strategy',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-store-upgrade/strategy-map.png',
        },
        {
          id: 'strategy-2',
          type: 'text',
          content: {
            en: 'So the strategy shifted from "rebuild one" to "split into three": the Basic tier solves for information efficiency, the Quality tier for decision confidence, and the Premium tier for brand expression. The tiers are drawn along two axes — operational capability and asset quality. Once both were mapped, the tiers stopped being a ranking of good versus poor; each became the right form for its own kind of merchant.',
            zh: '于是策略从「重做一套」转向「分成三档」：基础版解决信息效率，品质版解决决策信心，尊享版解决品牌表达。分档的依据是商家的运营能力和素材水平，两样都摸底之后，档位之间不再是好与差的比较，而是各自的合理形态。',
          },
        },
        {
          id: 'research-title',
          type: 'heading',
          content: {
            en: 'Research: No Direct Benchmark to Copy',
            zh: '研究：没有可以直接对标的竞品',
          },
        },
        {
          id: 'research-1',
          type: 'text',
          content: {
            en: 'The industry offered no ready answer. E-commerce storefront systems are mature, but their category logic is too far from food delivery; the best practices among delivery peers are isolated points that never add up to a method. We widened the lens instead — brand websites, mini programs, marketing materials, physical storefronts, printed menus, side by side — to extract what makes a brand feel credible and what forms of expression hold up across media, then translated those findings back into the language of the store page.',
            zh: '行业里没有现成答案。电商的店铺装修体系成熟，但品类逻辑和餐饮差距太大；餐饮同行里做得好的多是单点，凑不成方法论。我们把研究范围撑开，把品牌官网、小程序、营销物料、线下门店、纸质菜单并排来看，从里面总结「什么样的品牌感是可信的、什么样的表达在别的媒介上成立」，再翻译回店铺页的语言。',
          },
        },
        {
          id: 'img-research',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-store-upgrade/industry-research.png',
        },
        {
          id: 'research-2',
          type: 'text',
          content: {
            en: 'A second critical input was the real state of merchant assets. Merchants fall into three bands by asset quality: ordinary merchants rely on stock images with weak quality and consistency; brand merchants produce high-quality assets and can handle many sizes and formats; large brand merchants go further with a stable visual system. This directly shaped how forgiving each tier had to be: the closer to the Basic tier, the more the design must survive abuse from low-quality assets.',
            zh: '另一条关键输入是商家素材的真实水平。我们把商家按素材质量分成三层：普通商家多用网络图片，品质和一致性都弱；品牌商家素材质量高，能处理多种尺寸和类型；大型品牌商家进一步有稳定的视觉体系。这个认知直接决定了三档方案的宽容度设计：越往基础版走，方案越要经得起低质量素材的折腾。',
          },
        },
        {
          id: 'tiers-title',
          type: 'heading',
          content: {
            en: 'Three Tiers',
            zh: '三档方案',
          },
        },
        {
          id: 'img-premium',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-store-upgrade/premium-version-plan.png',
        },
        {
          id: 'tier-basic',
          type: 'text',
          content: {
            en: 'The Basic tier serves the vast majority of merchants, and its design standard is the safety net: any storefront, however poor its assets or rough its operations, must look more presentable after adopting it than before. Concretely, basic information is regrouped and consolidated in a vertical layout that improves readability and screen efficiency; delivery mode and delivery time are merged into one line, deliberately pulling platform styling back so the store\'s own character can show. This iteration went through three stages — each validated against real merchants, then overturned — before settling into the restrained form of "information to information, platform to platform."',
            zh: '基础版面向绝大多数商家，设计标准是「兜底」：任何一家素材再差、运营再粗放的门店，套用之后也必须比改造前体面。具体做法是把基础信息归类整合，改用上下布局提高易读性和屏幕效率；配送方式和配送时间融合呈现，主动削弱平台样式对店铺个性的干扰。这轮迭代走了三个阶段，每一阶段的方案都在真实商家数据上验证过再推翻，最终收敛到「信息归信息、平台归平台」的克制形态。',
          },
        },
        {
          id: 'img-basic',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-store-upgrade/basic-version.png',
        },
        {
          id: 'tier-quality',
          type: 'text',
          content: {
            en: 'The Quality tier serves mid-market merchants with real operational capability, adding visualization of decision information: achievements like ratings and rankings are consolidated and simplified, helping users compare stores against each other. The key judgment here was restraint. The earliest design gave achievement badges a strong colored treatment; in practice the styling overpowered the page and hurt its overall quality, so it converged back into a unified information layout. The Quality tier also carried the project\'s hardest technical problem, covered separately below.',
            zh: '品质版面向有运营能力的中腰部商家，增加的是决策信息的可视化：评分、榜单这类成就型信息被整合简化，帮用户在门店之间建立对比。这里有一个关键判断是克制。最早的方案给成就信息加了彩色背景的强视觉，试下来样式过强，反而伤害了页面整体的品质，最终收敛为统一的信息布局。品质版还有一个技术上的硬骨头，放在后面单独讲。',
          },
        },
        {
          id: 'img-quality',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-store-upgrade/quality-version.png',
        },
        {
          id: 'tier-premium',
          type: 'text',
          content: {
            en: 'The Premium tier serves top brands, and its core is giving the brand a real space to speak: large brand imagery, a centered layout, and customizable textures and graphics, so that the quality of a physical storefront can travel online. Space allocation was the most contested part of the project — brand expression needs area, decision information needs area, and navigation must survive. The final trade-off: compress the header moderately, keep the tab bar always reachable, and turn textures and graphics into configurable slots. The brand presence stays whole, and commercial slots have somewhere to live.',
            zh: '尊享版面向头部品牌，核心是给品牌一个真正的表达空间：大面积品牌宣传图、居中布局、底纹与图形的定制选项，让头部商家把线下门店的质感带到线上。空间分配是整个项目里最纠结的部分：品牌表达要面积，决策信息要面积，页面的可导航性也要保住。最终的取舍是适当压缩头部空间、保证 tab 常驻可调出，把底纹和图形做成可定制的位置。品牌感因此是完整的，商业化也有处可去。',
          },
        },
        {
          id: 'img-compare',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-store-upgrade/three-tier-compare.png',
        },
        {
          id: 'hardest-title',
          type: 'heading',
          content: {
            en: 'The Two Hardest Problems',
            zh: '攻坚：两个最硬的问题',
          },
        },
        {
          id: 'hardest-color',
          type: 'text',
          content: {
            en: 'Color extraction for the Quality-tier header. The header follows the brand\'s color, but merchant logos and storefront photos vary wildly in quality, and automatic extraction breaks easily — with little industry practice to lean on. We built a color guide: extract the dominant color from the logo, set safe ranges for saturation and brightness, and downgrade unusable assets to a neutral treatment. The deliverable looks like one page of spec; behind it sits group after group of testing against real merchant logos.',
            zh: '品质版的头部取色。品质版头部要跟随品牌色，但商家的 logo 和门头照片质量参差，自动取色很容易翻车，行业内可以直接参考的做法也很少。我们做了一套取色指南：从 logo 提取主色，对饱和度和明度设安全区间，对不可用的素材降级为中性色处理。产出看起来只是一页规范，背后是大量真实商家 logo 的逐组测试。',
          },
        },
        {
          id: 'hardest-premium',
          type: 'text',
          content: {
            en: 'Where does the Premium tier\'s sense of quality come from? Stage one used a centered layout with large brand imagery — the quality landed, but it demanded too much from merchant assets and the results were uncontrollable. Stage two shrank the promotional slots and tried more controllable expressions like theme colors and logo textures, only to squeeze commercial space too hard. Stage three found the compromise: compress the header, keep the tab bar reachable, and open up configurable texture and graphic slots. Across all three stages, the tug-of-war never changed — quality on one end, controllability on the other.',
            zh: '尊享版的品质感从哪来。第一阶段用居中布局加大面积品牌图，质感立得住，但对素材质量要求过高，效果不可控；第二阶段收缩宣传坑位，尝试主题色、logo 纹理这类更可控的品牌表达，又发现把商业化空间压得太紧；第三阶段才找到折中：压缩头部空间、保证 tab 调出、增加底纹和图形定制位。三个阶段来回拉锯的，始终是品质感和可控性这两头。',
          },
        },
        {
          id: 'menu-title',
          type: 'heading',
          content: {
            en: 'Menus by Category',
            zh: '分品类菜单',
          },
        },
        {
          id: 'menu-1',
          type: 'text',
          content: {
            en: 'The menu is another module bruised by the unified template. A bubble-tea menu runs on variants, temperatures and seasonal launches; a fast-food menu runs on combos and add-ons. Forced into one template, both end up awkward. We designed menu templates by category: bubble tea highlights seasonal freshness and recommendation copy, dumplings highlight signature items and filling families, pizza highlights flavor comparison. The templates change nothing about how merchants operate their back office — they simply preset a more sensible information structure per category, letting the menu return to its offline role: helping a guest order a proper meal, quickly.',
            zh: '菜单是另一个被「统一模板」伤到的模块。奶茶店的菜单逻辑是多规格、多温度、季节上新，快餐店是套餐和加料，硬塞进同一个模板，两边都别扭。我们按品类设计菜单模版：奶茶强调当季尝鲜和推荐语，饺子强调招牌和馅料家族，披萨强调口味对比。模版不改变商家后台的操作方式，只在对应品类下预置更合理的信息结构，让菜单回到它在线下的角色：帮客人快速点出一顿合适的饭。',
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
            en: 'When the supply on a platform is radically heterogeneous, "one optimal solution" is a false premise — tiering is the honest answer. The design work begins with a tiering strategy, and only then becomes tiered design.',
            zh: '当平台的供给极度异质时，「一套最优解」是伪命题，分级是最诚实的答案。设计要做的先是分层的策略，然后才是分层的设计。',
          },
        },
        {
          id: 'reflection-2',
          type: 'text',
          content: {
            en: 'The safety net is harder to design than the flagship. The flagship can ask merchants to keep up; the Basic tier must assume the worst assets, the least operations — and still look presentable.',
            zh: '兜底方案比旗舰方案更难设计。旗舰版可以要求商家配合，基础版必须假设最差的素材、最少的运营，还要体面。',
          },
        },
        {
          id: 'reflection-3',
          type: 'text',
          content: {
            en: 'A sense of quality has different sources. In the Quality tier it comes from the credibility of objective platform data; in the Premium tier it comes from the brand\'s own assets. Design\'s job is to give each its right source — one decorative language cannot cover both.',
            zh: '品质感有不同来源。品质版的品质来自平台客观数据的信用，尊享版的品质来自品牌自己的素材。设计的职责是给两种品质感各自安排对来源，一套装饰语言覆盖不了两者。',
          },
        },
        {
          id: 'reflection-4',
          type: 'text',
          content: {
            en: 'Unglamorous engineering problems — color extraction, asset compatibility — decide whether a design actually ships. Spec-type deliverables look plain, yet they are often the only bridge between a proposal and a launch.',
            zh: '取色、兼容这类不起眼的工程问题，决定方案能不能真正落地。规范类产出看着平淡，往往是方案与上线之间唯一的桥。',
          },
        },
      ],
    },
    hidden: true,
  },
  {
    slug: 'waimai-travel-map',
    title: {
      en: 'The Out-of-Town Food Map',
      zh: '异地场景地图',
    },
    tagline: {
      en: 'When users open the app in an unfamiliar city, the platform can do more than deliver food — city landmarks, a map-based store picker and locals\' recommendations help travelers eat a reassuring local meal.',
      zh: '用户身在陌生城市时，外卖平台能做的不止送餐：用城市地标、地图选店和本地人的推荐，让异乡人放心吃一顿当地饭。',
    },
    span: 'md:col-span-12',
    aspect: 'h-[340px] sm:h-[380px] md:h-[430px] lg:h-[520px]',
    image: '/assets/work/waimai-travel-map/landmark-assets-2.0.png',
    detail: {
      blocks: [
        {
          id: 'context',
          type: 'text',
          content: {
            en: 'Every year, a huge number of users open the delivery app in a city they don\'t live in — business trips, vacations, going home for the holidays. The first phase of out-of-town atmosphere building landed positive results, but also exposed two structural problems: decision dimensions were too thin for users to trust unfamiliar merchants, and AOI-based supply limits left many scenarios unserved. This project moves the out-of-town experience forward with a food map, answering three progressive questions: how to make users realize the place 「has local character」, how to help them 「find it」 more easily, and how to make them believe it\'s 「the real thing」.',
            zh: '每年有大量用户在陌生的城市打开外卖：出差、旅行、假期回家。一期异地氛围建设拿到了正向反馈，但也暴露出两个结构性问题：决策维度单一，用户对陌生商家信任不足；AOI 的供给限制，让很多场景承接不住需求。这个项目在此之上推进异地场景地图，回答三个递进的问题：怎么让用户意识到异地「有特色」，怎么让用户更容易「找特色」，怎么让用户相信眼前是「真特色」。',
          },
        },
        {
          id: 'vid-cover',
          type: 'image',
          layout: 'wide',
          videoFill: true,
          src: '/assets/work/waimai-travel-map/cover.mp4',
          crop: {
            x: 0.3899747731539424,
            y: 0.03992538013011605,
            w: 0.5924299906132666,
            h: 0.9539062939422914,
          },
          cropRounded: true,
          videoBg: '#FFFFFF',
        },
        {
          id: 'img-overview',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-travel-map/overview.jpeg',
        },
        {
          id: 's1-title',
          type: 'heading',
          content: {
            en: 'Strategy One: Realize the Place Has Character',
            zh: '策略一：让用户意识到「有特色」',
          },
        },
        {
          id: 's1-text',
          type: 'text',
          content: {
            en: 'For each city we distilled its most recognizable visual symbols — the sandstone peaks of Zhangjiajie, Suzhou garden pavilions, the Chengdu panda, Harbin\'s ice castle — into 3D landmarks placed in the homepage welcome header, accompanied by ambient elements like birds and bamboo leaves that form an environmental motion system, with local dialect worked into dish copy. Before users pick anything, they already know they are not home. Landmarks change with the seasons: Harbin shows the ice world in winter and Saint Sophia Cathedral in summer. The transition into the map follows one continuous story — clouds part, the map surfaces, the location pin drops — helping users understand the shift in the shopping flow.',
            zh: '每个城市提炼辨识度最高的视觉符号——张家界的石峰、苏州的园林亭台、成都的熊猫、哈尔滨的冰雪城堡——做成 3D 地标放进首页欢迎头图，配合飞鸟、竹叶这类氛围元素构成环境动态系统，菜品表达引入方言俚语。用户还没开始选，就已经知道自己不在家。特殊地标随季节变化：哈尔滨冬天是冰雪大世界，夏天换成圣索菲亚教堂。进入地图的转场用「云雾散开—地图浮现—定位落点」的连贯叙事完成，帮助用户理解选购动线的切换。',
          },
        },
        {
          id: 'img-city-xuancheng',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-travel-map/city-xuancheng.jpeg',
        },
        {
          id: 'img-city-suzhou',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-travel-map/city-suzhou.jpeg',
        },
        {
          id: 'img-city-chengdu',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-travel-map/city-chengdu.jpeg',
        },
        {
          id: 'img-city-zhangjiajie',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-travel-map/city-zhangjiajie.jpeg',
        },
        {
          id: 'img-city-beijing',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-travel-map/city-beijing.jpeg',
        },
        {
          id: 'img-more-cities',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-travel-map/more-cities.jpeg',
        },
        {
          id: 'vid-harbin',
          type: 'image',
          layout: 'wide',
          videoFill: true,
          src: '/assets/work/waimai-travel-map/harbin-season.mp4',
        },
        {
          id: 'vid-entry-suzhou',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-travel-map/entry-suzhou.mp4',
        },
        {
          id: 'vid-transition-to-map',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-travel-map/transition-to-map.mp4',
        },
        {
          id: 'vid-transition-page',
          type: 'image',
          layout: 'wide',
          videoBg: '#f0f8ec',
          src: '/assets/work/waimai-travel-map/transition-page.mp4',
        },
        {
          id: 's2-title',
          type: 'heading',
          content: {
            en: 'Strategy Two: Find the Local Character',
            zh: '策略二：让用户更容易「找特色」',
          },
        },
        {
          id: 's2-text',
          type: 'text',
          content: {
            en: 'A new map-based store picker breaks through the LBS radius, and combined with city-wide delivery, expands supply coverage. Merchants return to their real geographic coordinates, so authenticity and immersion are established at the same time. Inside the map, shopping scenarios are subdivided: local specialties, ranked merchants, souvenirs, trendy restaurants — finding a taste mid-trip and picking gifts before the ride home each get a clear entry.',
            zh: '新增地图选店模式，突破 LBS 的范围限制，结合全城送的履约能力把供给覆盖撑开；商家回到真实地理坐标上呈现，真实感和代入感同时成立。地图页内再做导购场景细分：本地特色、上榜商家、伴手礼、网红餐厅，旅行途中找味道、返程前挑手信，各自有明确入口。',
          },
        },
        {
          id: 's3-title',
          type: 'heading',
          content: {
            en: 'Strategy Three: Believe It\'s the Real Thing',
            zh: '策略三：让用户相信是「真特色」',
          },
        },
        {
          id: 's3-text',
          type: 'text',
          content: {
            en: 'Signature dishes come with notes on ingredients, preparation, flavor and cultural background, easing the anxiety of unfamiliar tastes. 「Recommended by locals」 and various rankings are surfaced as authoritative endorsement, and merchant pages carry user-generated notes that mention the store, letting real diners complete the final layer of verification.',
            zh: '特色菜品配上原料做法、口味特点和文化背景的说明，降低对陌生口味的不安；「本地人推荐」和各类榜单前置成权威背书；商家页直接挂出提及本店的 UGC 笔记，用真实消费者的体验帮用户完成最后一层验证。',
          },
        },
        {
          id: 's23-link',
          type: 'text',
          content: {
            en: 'From picking on the map, to the merchant page, to content verification — this is one complete decision chain for an out-of-town user.',
            zh: '从地图选店，到商家承接，再到内容验证，是异地用户一条完整的决策链路。',
          },
        },
        {
          id: 'img-flow-triple',
          type: 'image',
          layout: 'triple',
          srcs: [
            '/assets/work/waimai-travel-map/map-picker.png',
            '/assets/work/waimai-travel-map/merchant-page.png',
            '/assets/work/waimai-travel-map/notes-page.png',
          ],
        },
        {
          id: 'vid-landing-anim',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-travel-map/landing-anim.mp4',
        },
        {
          id: 'assets-title',
          type: 'heading',
          content: {
            en: 'Building the Asset Library',
            zh: '图形资产沉淀',
          },
        },
        {
          id: 'assets-text',
          type: 'text',
          content: {
            en: 'The landmark graphics became a reusable asset library: version 1.0 used a straight-on view to get the flow running, version 2.0 moved to a tilted bird\'s-eye view for better spatial depth on the map, and the cherry-blossom season proved the library could extend to special seasons. What started as one-off needs turned into infrastructure that future out-of-town operations can keep reusing.',
            zh: '地标图形沉淀成资产库：1.0 平视版本先上线跑通链路，2.0 迭代为侧俯视，地图空间感更好；樱花季验证了特殊季节扩展的可能性。资产库成为后续异地运营可以持续复用的基础设施。',
          },
        },
        {
          id: 'img-assets-1',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-travel-map/landmark-assets-1.0.png',
        },
        {
          id: 'img-assets-2',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-travel-map/landmark-assets-2.0.png',
        },
        {
          id: 'vid-sakura',
          type: 'image',
          layout: 'wide',
          src: '/assets/work/waimai-travel-map/sakura-season.mp4',
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
            en: 'Emotional value is not decoration; it is the precondition of trust. Users first need to feel 「I really am in Chengdu」 before they will seriously read a merchant\'s local recommendations. Immersion goes first — only then does information get read.',
            zh: '情绪价值不是装饰，是信任的前置条件。用户先感到「我确实在成都」，才会认真读这家店的本地人推荐；代入感先行，信息才有被阅读的机会。',
          },
        },
        {
          id: 'reflection-2',
          type: 'text',
          content: {
            en: 'Being real matters more than having more. Out-of-town users are not short of supply; they are short of trustworthy filtering. Authoritative endorsement, rankings and UGC each carry a different layer of credibility — piling them together dilutes all of them.',
            zh: '「真」比「多」重要。异地用户不缺供给，缺的是可信的筛选。权威认证、榜单、UGC 各自承担不同层级的背书，堆在一起反而互相稀释。',
          },
        },
        {
          id: 'reflection-3',
          type: 'text',
          content: {
            en: 'A map is spatial storytelling, not just a search tool. Putting merchants back on real geographic coordinates yields three gains from one move: supply coverage, the desire to explore, and a sense of authenticity.',
            zh: '地图是空间叙事，不只是检索工具。把商家放回真实地理坐标，供给覆盖、探索欲和真实感是同一个动作的三份收益。',
          },
        },
        {
          id: 'reflection-4',
          type: 'text',
          content: {
            en: 'Build assets for operations, not illustrations for a requirement. With versioned iterations and seasonal extensions, the landmark library turns one-off needs into a capability that keeps paying off.',
            zh: '为运营建资产，而不是为需求做图。地标资产库按版本迭代、按季节扩展，让一次性需求沉淀成可持续复用的能力。',
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
