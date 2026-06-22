# Project Context

最后更新：2026-06-22

## 当前项目身份

- 项目名：`design-work`
- 当前实际路径：`/Users/zhudi/Desktop/design-work`
- GitHub 仓库：`https://github.com/taoznice/design-work`
- 生产域名：`https://www.design-workbench.top/`
- Vercel 默认域名：`https://design-work-green.vercel.app/`
- 本地预览：`http://127.0.0.1:3000/`

重要约定：后续读取、修改、部署都以桌面路径 `/Users/zhudi/Desktop/design-work` 为准。旧路径 `/Users/zhudi/Documents/XiangMu-codex` 是另一个工作区上下文，不再作为这个作品集项目的主路径。

## 本轮对话目标

用户希望把原来的 `design-strategy-os` 改造成一个可线上展示的个人/设计作品集 landing page，并且希望项目文件夹结构更清楚，后续可以替换素材、上传 GitHub、自动部署到线上域名。项目清理后，包名已收敛为 `design-work`。

整个过程中用户的关键诉求包括：

- 按用户粘贴的 landing page prompt 改造项目。
- 打开本地预览并多次重试确认效果。
- 页面内容改为中文，随后增加中英文切换，默认英文。
- 首屏标题从“朱迪的作品集”改为“项目展示”，英文版为 `Project Showcase`。
- 判断项目是否被“计费中心”感知。用户后续说明是“记忆中心”打错字。
- 整理项目文件夹，让素材替换方式更清楚。
- 将项目整体迁移到桌面路径，后续读取路径都指向桌面。
- 解释项目为什么有 800 多 MB，区分真实上传大小和本地依赖/缓存体积。
- 走通 GitHub 和 Vercel 上传部署流程，让线上直接生效。
- 排查线上 `Application error: a client-side exception has occurred` 和本地“页面加载失败”提示。

## 已完成的产品改造

首页已经改成作品集型单页 landing page，核心文件：

- 页面结构和交互：`app/page.tsx`
- 全局布局和 SEO 标题：`app/layout.tsx`
- 样式：`app/globals.css`
- 文案、项目列表、图片、视频、邮箱等可替换内容：`content/portfolio.ts`
- 运行时错误页：`app/error.tsx`

当前页面能力：

- 默认英文展示。
- 提供 `EN / 中` 切换。
- 英文首屏标题：`Project Showcase`
- 中文首屏标题：`项目展示`
- 包含导航、首屏、精选项目、札记、视觉实验、统计数据、联系区等模块。
- 使用视频/HLS 背景和作品集视觉素材。
- 增加了友好的中文运行时错误页，提示用户刷新或重新加载。

## 素材和内容替换方式

已经新增素材目录：

```txt
public/assets/portfolio/
├── hero/
├── work/
├── journal/
└── explorations/
```

日常替换原则：

1. 文案、项目数据、图片 URL、视频 URL 优先改 `content/portfolio.ts`。
2. 首页结构和动效才改 `app/page.tsx`。
3. 首页固定模块素材放在 `public/assets/portfolio/hero`、`work`、`journal`、`explorations`。
4. 如果后续某个项目要做详情页，再单独建 `public/assets/projects/{project-id}/`。

详细替换说明已写入：

- `docs/portfolio-content-guide.md`

## 部署状态

GitHub 和 Vercel 已经走通过：

- GitHub 仓库：`https://github.com/taoznice/design-work`
- 线上域名：`https://www.design-workbench.top/`
- Vercel 默认域名：`https://design-work-green.vercel.app/`

最近关键提交：

- `828ed2e feat: redesign portfolio landing page`
- `1af1b88 fix: use public npm registry for deployment`
- `250f484 chore: add friendly runtime error page`
- `9ae73af fix: force reload from runtime error page`
- `c560d26 feat: enlarge selected works showcase`
- 待本次提交：清除旧设计工作台页面、API、记忆系统、旧文档和冗余依赖，项目收敛为作品集站点。

Vercel 失败原因曾经是 `package-lock.json` 中部分依赖的 `resolved` 指向了内网/公司 npm 源 `r.npm.sankuai.com`，Vercel 无法解析，报 `ENOTFOUND r.npm.sankuai.com`。后来已改成 `https://registry.npmjs.org/...` 并重新部署成功。

注意：用户曾提供过 Vercel token 用于排查部署日志。该 token 属于敏感信息，不要写入项目文件、不要提交、不要在回复里复述。

## 本地预览和排障记录

本地开发服务器命令：

```bash
npm run dev -- -H 127.0.0.1 -p 3000
```

如果本地 Next.js 出现 manifest、chunk、旧脚本缓存或“页面加载失败”，优先执行：

```bash
rm -rf .next
npm run dev -- -H 127.0.0.1 -p 3000
```

最近一次验证结果：

- `http://127.0.0.1:3000/` 返回 200。
- 页面标题为 `Project Showcase`。
- 内置浏览器打开 `http://127.0.0.1:3000/?v=20260622` 后页面正常。
- 控制台没有 error/warn。
- 页面 DOM 能看到 `Project Showcase` 和作品集内容。

用户看到的“页面加载失败，点击重新加载无效”大概率是浏览器仍保留旧客户端运行时状态。错误页按钮目前更偏向 React 错误边界 reset，不一定能清除旧 chunk 或浏览器缓存。后续可考虑把错误页按钮改成真正的 `window.location.reload()`，以便强制重新加载页面资源。

2026-06-22 后续处理：已经把 `app/error.tsx` 的按钮改成“强制重新加载”，点击后会尝试清理浏览器 Cache Storage，并给当前 URL 增加 `reload={timestamp}` 参数后 `window.location.replace(...)`。该修复已提交并推送，线上构建标识从 `6uGsIu6DBWuKT7sR9zQGj` 更新为 `CXCHfG0OrVB61nqzevOHo`，错误页 chunk 更新为 `app/error-927d144ce7e57f1e.js`。浏览器级验证 `https://www.design-workbench.top/` 正常，无 `Application error`，控制台无 error/warn。

2026-06-22 视觉调整：用户反馈“精选项目模块呈现不佳，过小”。已将精选项目模块从小图网格调整为更大的作品展示版式：容器从 `max-w-[1200px]` 放大到 `max-w-[1600px]`，第一/第四个项目在桌面端横向占满 12 栏，中间两个项目各占 6 栏；项目标题改为常驻显示在图片底部，并保留 hover 查看状态。排查时发现 `tailwind.config.js` 未扫描 `content/portfolio.ts`，导致放在内容配置里的动态布局类无法生成 CSS，这是项目卡片显得异常小的重要原因。已补充 `./content/**/*.{js,ts,jsx,tsx,mdx}` 到 Tailwind content 扫描路径。验证结果：`npm run build` 通过；本地桌面视口 947px 下卡片约为 852x539、414x470、414x470、852x539；移动端 390px 下卡片约为 343x420、343x500、343x500、343x420，无横向溢出，控制台无 error/warn。

2026-06-22 二次视觉调整：用户反馈放大后“又太大了”。已将精选项目模块回收到中等尺寸：容器从 `max-w-[1600px]` 调整为 `max-w-[1400px]`，区域间距从 `py-16 md:py-24` 调整为 `py-14 md:py-20`，卡片高度改为固定中等高度。验证结果：`npm run build` 通过；本地桌面视口 947px 下四张卡片约为 852x430、416x380、416x380、852x430；移动端 390px 下约为 343x340、343x360、343x360、343x340，无横向溢出，控制台无 error/warn。

## 文件体积说明

项目文件夹看起来有 800 多 MB，主要原因通常是：

- `node_modules/`
- `.next/`
- 本地缓存和构建产物

这些默认不应上传 GitHub，也不应参与 Vercel 源码部署。真正上传到 GitHub 的核心源码远小于本地完整文件夹体积。

提交/部署前重点检查：

```bash
git status --short
git check-ignore node_modules .next
```

## 清理记录

2026-06-22 清理旧内容：用户确认清除原来的设计工作台内容。已删除旧页面 `aesthetic-collection`、`ai-radar`、`chat`、`knowledge`、`memory`、`proposal-review`、`strategy-lab`、`translation`；删除旧 API 路由 `app/api/*`；删除旧组件、Hook、Store、Lib、API 配置文档、代理文档、旧 Cursor 规则、自动 push 脚本和空文件。已卸载不再使用的 AI/API/上传/PDF/RSS/Zustand 等依赖，保留作品集首页实际需要的 `framer-motion`、`gsap`、`hls.js`、`lucide-react`、`next`、`react`、`react-dom`。

当前源码结构应保持轻量：

```txt
app/
├── error.tsx
├── globals.css
├── layout.tsx
└── page.tsx
content/
└── portfolio.ts
docs/
└── portfolio-content-guide.md
public/assets/portfolio/
```

## 项目内已有文档

- `PROJECT_CONTEXT.md`：当前项目总上下文，后续接手优先阅读。
- `docs/portfolio-content-guide.md`：作品集内容和素材替换指南。

## 后续 Agent 接手注意事项

1. 默认使用简体中文和用户沟通。
2. 修改前先执行 `git status --short --branch`，避免覆盖用户或其他 Agent 的改动。
3. 不要回滚用户已有改动。
4. 这个项目当前主路径是 `/Users/zhudi/Desktop/design-work`。
5. 若继续处理线上问题，先验证 `https://www.design-workbench.top/` 和静态资源是否 200，再看浏览器控制台。
6. 若继续部署，先本地 `npm run build`，再提交、推送，最后观察 Vercel 部署。
7. 不要提交 `.next/`、`node_modules/`、token、私钥或本地环境文件。

## 可能的下一步

- 为项目根目录补一个简洁 README，说明如何本地运行、替换内容、部署。
- 将 `content/portfolio.ts` 进一步拆分为 `copy`、`projects`、`media`，如果后续内容规模变大。
- 为作品详情页建立 `app/work/[slug]/page.tsx` 和 `public/assets/projects/{slug}/` 结构。
