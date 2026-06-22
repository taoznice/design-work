# Portfolio Content Guide

这个项目的首页已经把“可替换内容”和“页面结构”分开：

- 页面结构和动效：`app/page.tsx`
- 首页文案、项目列表、图片、视频、邮箱：`content/portfolio.ts`
- 本地素材目录：`public/assets/portfolio/`

以后日常替换素材时，优先改 `content/portfolio.ts`，尽量不要直接改 `app/page.tsx`。

## 推荐目录

```txt
public/assets/portfolio/
├── hero/            # 首屏和页脚背景视频、海报图
├── work/            # 精选项目封面图
├── journal/         # 文章或札记缩略图
└── explorations/    # 视觉实验、灵感图、动效预览图
```

## 替换首屏背景视频

当前视频源在 `content/portfolio.ts`：

```ts
export const HLS_SOURCE = 'https://...m3u8'
```

如果继续使用在线视频，直接替换这个 URL。

如果改成本地视频，把文件放到：

```txt
public/assets/portfolio/hero/hero-video.mp4
```

然后把配置改成：

```ts
export const HLS_SOURCE = '/assets/portfolio/hero/hero-video.mp4'
```

注意：当前播放逻辑优先按 HLS `.m3u8` 处理。若长期使用 `.mp4`，建议再把视频 Hook 改成同时原生支持 MP4。

## 替换精选项目封面

精选项目在 `content/portfolio.ts` 的 `workItems` 数组里。每个项目建议对应一个稳定 ID 或文件名，例如：

```txt
public/assets/portfolio/work/automotive-motion-system.jpg
public/assets/portfolio/work/urban-interface-space.jpg
```

然后把 `image` 改成本地路径：

```ts
image: '/assets/portfolio/work/automotive-motion-system.jpg'
```

## 按什么维度整理素材

建议采用“页面模块 + 项目 ID”的混合方式：

1. 首页固定模块素材按模块放：`hero/`、`work/`、`journal/`、`explorations/`
2. 如果某个项目后续要做详情页，再单独建项目文件夹：

```txt
public/assets/projects/
└── automotive-motion-system/
    ├── cover.jpg
    ├── gallery-01.jpg
    ├── gallery-02.jpg
    └── demo.mp4
```

首页只引用封面；项目详情页再引用同一个项目文件夹里的更多素材。

## 替换文字

中英文文案都在 `content/portfolio.ts` 的 `copy` 对象里：

- `copy.en`：英文
- `copy.zh`：中文

项目标题、文章标题、统计数字分别在：

- `workItems`
- `journalItems`
- `explorations`
- `stats`

## 推荐图片规格

- `hero` 视频：横版，16:9 或更宽，至少 1920px 宽
- `work` 封面：横版项目用 1400px 宽，竖版项目用 1100px 宽
- `journal` 缩略图：方图，至少 400px
- `explorations`：方图，至少 800px

文件名用英文小写和连字符，例如 `brand-experience-identity.jpg`，不要用空格。
