# design-work

设计师个人作品集单页站点。当前站点用于展示项目、视觉实验、设计思考与联系方式。

- 生产域名：<https://www.design-workbench.top/>
- Vercel 默认域名：<https://design-work-green.vercel.app/>
- GitHub 仓库：<https://github.com/taoznice/design-work>

## 技术栈

- Next.js App Router
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- GSAP
- HLS.js
- Lucide React

## 本地运行

```bash
npm install
npm run dev -- -H 127.0.0.1 -p 3000
```

打开：

```txt
http://127.0.0.1:3000/
```

构建检查：

```bash
npm run build
```

## 内容修改入口

日常改文案、图片、项目数据、视频、邮箱，优先改：

```txt
content/portfolio.ts
```

页面结构和交互动效在：

```txt
app/page.tsx
```

全局样式在：

```txt
app/globals.css
```

更完整的素材替换说明见：

```txt
docs/portfolio-content-guide.md
```

## 素材目录

```txt
public/assets/portfolio/
├── hero/
├── work/
├── journal/
└── explorations/
```

当前目录里主要放 `.gitkeep`，首页仍主要使用远程图片和 HLS 视频。后续替换为本地素材时，把文件放进对应目录，再在 `content/portfolio.ts` 中把 URL 改成本地路径，例如：

```ts
image: '/assets/portfolio/work/project-cover.jpg'
```

## 部署

`main` 分支推送到 GitHub 后，Vercel 会自动部署。

部署前建议检查：

```bash
git status --short --branch
npm run build
```

不要提交：

- `node_modules/`
- `.next/`
- `.env*.local`
- token、私钥或其他敏感信息

## 项目上下文

Agent 或后续维护者请先阅读：

```txt
PROJECT_CONTEXT.md
```

给 Codex/通用 Agent 的入口：

```txt
AGENTS.md
```

给 Claude Code 的入口：

```txt
CLAUDE.md
```

