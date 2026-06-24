# Agent Instructions

请始终使用简体中文回复用户。

## 首先阅读

执行任何修改前，先阅读：

1. `PROJECT_CONTEXT.md`
2. `docs/portfolio-content-guide.md`，仅当任务涉及内容或素材替换时阅读

`PROJECT_CONTEXT.md` 是本项目的单一上下文事实源。不要把旧工作区 `/Users/zhudi/Documents/XiangMu-codex` 当作本项目主路径；当前项目主路径是 `/Users/zhudi/Desktop/design-work`。

## 修改前检查

每次实际修改前先执行：

```bash
git status --short --branch
```

如果发现用户或其他 Agent 留下的新改动，不要覆盖、回滚或删除。先理解这些改动，再在其基础上继续。

## 项目定位

- 项目名：`design-work`
- 类型：个人/设计师作品集单页站点
- 技术栈：Next.js App Router、React 18、TypeScript、Tailwind CSS、Framer Motion、GSAP、HLS.js、Lucide React
- 默认语言：英文
- 语言切换：保留 `EN / 中`
- 生产域名：`https://www.design-workbench.top/`
- Vercel 默认域名：`https://design-work-green.vercel.app/`
- GitHub 仓库：`https://github.com/taoznice/design-work`

## 常用命令

```bash
npm run dev -- -H 127.0.0.1 -p 3000
npm run build
git status --short --branch
```

如果本地 Next.js 出现旧 chunk、manifest 或缓存异常，可以清理后重启：

```bash
rm -rf .next
npm run dev -- -H 127.0.0.1 -p 3000
```

## 编辑边界

- 文案、项目数据、图片 URL、视频 URL：优先改 `content/portfolio.ts`
- 页面结构和交互：改 `app/page.tsx`
- 全局样式：改 `app/globals.css`
- SEO 与根布局：改 `app/layout.tsx`
- 素材替换说明：维护 `docs/portfolio-content-guide.md`
- 总上下文：维护 `PROJECT_CONTEXT.md`

## 部署与安全

- Vercel 会跟随 GitHub `main` 自动部署。
- 提交前确认不要包含 `.next/`、`node_modules/`、token、私钥、`.env*.local`。
- 用户曾提供过 Vercel token。不要写入文件、不要提交、不要在回复中复述。
- 线上问题优先检查生产域名是否 200、构建是否切换、浏览器控制台是否报错。

## 当前设计状态

用户已明确要求：保留中英文切换，其他额外创意动效回到上一版本。因此不要重新加入以下已回退效果，除非用户再次明确要求：

- 精选项目图片滚动视差
- 精选项目辅助线/编号入场动画
- 中英文切换时的整页 blur/fade 包裹

