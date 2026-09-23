# design-work 所见即所得 CMS 方案文档（v2 本地方案）

## 一、背景与目标

当前作品集站点所有内容硬编码在 `content/portfolio.ts`，每次改文案、换图片都要改代码 → push → Vercel 重新构建。目标是加一个本地管理后台，在浏览器中直接编辑内容，保存后自动提交部署。

**核心体验**：编辑界面长得跟项目详情页一模一样（所见即所得），点击文案直接改、点击图片直接换、拖拽调整排序。保存后自动 git push，Vercel 几十秒内上线。

**设计原则**：无数据库、无云鉴权、无暂停风险。编辑器仅 localhost 运行，天然安全。

## 二、架构

```
浏览器编辑器 (localhost:3000/admin)  改文案/换图/拖拽
        │ 点「保存并发布」
        ▼
写本地 content/portfolio.ts + 图片到 assets 仓库
        │ 自动 git commit + push（两个仓库）
        ▼
Vercel 自动构建 → design-workbench.top 上线
```

数据源仍是 `portfolio.ts`，编辑器只是它的可视化读写界面，前台渲染逻辑不动。

## 三、已完成的基建

- GitHub 仓库 `taoznice/design-work-assets`（public）已创建
- 8 张项目图片已推送至 `work/checkout-order/` 目录
- jsDelivr CDN: `https://cdn.jsdelivr.net/gh/taoznice/design-work-assets@main/`
- 本地开发使用 `public/assets/` 下的文件，生产环境可切换 CDN
- git push 连通性已验证（需 unset 代理）

## 四、功能范围

### 4.1 管理后台（/admin）

| 功能 | 说明 |
|------|------|
| 作品列表 | 查看所有作品卡片，拖拽排序，新增/删除/显隐 |
| 作品详情编辑 | 所见即所得，页面布局与前台 `/work/[slug]` 一致 |
| 保存并发布 | 序列化回 portfolio.ts + git commit + push |

### 4.2 作品详情编辑器（核心）

| 区域 | 编辑方式 |
|------|---------|
| 标题 / tagline | 点击文字 inline 编辑，中英双语 tab 切换 |
| Hero 封面图 | hover 显示替换按钮，上传替换 |
| Role / Duration | 点击文字 inline 编辑 |
| Overview / Summary | 点击进入编辑 |
| 策略卡片 | 拖拽排序、编辑标题描述、替换图片、删除、新增 |
| 效果图 | 拖拽排序、替换、删除、新增 |
| 成果数据 | 编辑数值和标签 |

### 4.3 不在范围内（后续迭代）

- 札记、视觉探索、首页文案编辑（P3）
- 多用户 / 版本历史

## 五、技术选型

| 需求 | 方案 |
|------|------|
| 所见即所得编辑 | contentEditable + inline editor |
| 拖拽排序 | @dnd-kit/core |
| 图片上传 | 写入本地 public/assets/ + assets 仓库 |
| 数据持久化 | 序列化写回 portfolio.ts |
| 自动部署 | API Route 调 git commit + push |

## 六、开发计划

| 阶段 | 内容 | 预估改动 |
|------|------|---------|
| P1 编辑器地基 | `/admin` 列表页读 portfolio.ts 展示；`/api/save` 写回 ts + git 提交；跑通「改文本→上线」闭环 | 4-5 文件 |
| P2 所见即所得详情编辑 | `/admin/work/[slug]` inline 编辑、拖拽排序、图片上传 | 6-8 文件 |
| P3 首页文案编辑 | hero/journal/explorations/footer 文案编辑界面 | 2-3 文件 |

## 七、风险与注意

1. **写回 ts 保真度**：序列化对象回 portfolio.ts 需保留类型定义和结构，P1 重点验证
2. **git 冲突**：单人单机基本不会遇到
3. **图片体积**：上传时自动压缩到 1800px 宽度
4. **代理问题**：git push 需 unset 代理，API Route 中处理
