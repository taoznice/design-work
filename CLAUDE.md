# Claude Code Handoff

请先阅读 `PROJECT_CONTEXT.md`，再进行任何修改。

本项目会由用户在 Claude Code 和 Codex 之间轮流推进。请遵守：

- 默认使用简体中文沟通。
- 修改前先执行 `git status --short --branch`。
- 不要覆盖、回滚或删除用户/另一个 Agent 留下的改动。
- 当前项目主路径是 `/Users/zhudi/Desktop/design-work`。
- 旧路径 `/Users/zhudi/Documents/XiangMu-codex` 不是这个作品集项目的主路径。
- `PROJECT_CONTEXT.md` 是项目事实源；如果你改变了部署、结构、关键文案、素材规则或排障结论，请同步更新它。

## 快速事实

- 项目名：`design-work`
- 线上域名：`https://www.design-workbench.top/`
- GitHub：`https://github.com/taoznice/design-work`
- Vercel 默认域名：`https://design-work-green.vercel.app/`
- 本地预览：`http://127.0.0.1:3000/`
- 默认语言：英文
- 中文切换：导航中的 `EN / 中`

## 常用命令

```bash
npm run dev -- -H 127.0.0.1 -p 3000
npm run build
```

## 文件分工

- `content/portfolio.ts`：文案、项目列表、图片、视频、邮箱
- `app/page.tsx`：首页结构、交互、动效
- `app/globals.css`：全局样式和 Tailwind 基础层
- `app/layout.tsx`：根布局和默认 metadata
- `app/error.tsx`：友好错误页
- `docs/portfolio-content-guide.md`：素材和内容替换指南
- `PROJECT_CONTEXT.md`：项目上下文与交接记录

## 注意事项

不要写入或提交 token、私钥、`.env*.local`、`.next/`、`node_modules/`。

用户已要求当前页面保留中英文切换，但回退额外新增的项目视差、辅助线动画和语言切换 blur/fade 效果。

