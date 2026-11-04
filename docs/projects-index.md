# 作品集项目总索引

> 这是所有作品集项目的全局进度表。任何新对话开始时，先读本文件恢复上下文。
> 工作流：一个项目一个独立对话 → 边聊边整理 → 用户确认后沉淀到 Wiki（文案权威版本）→ 登记到下表 → 批量修改阶段直接改 Wiki → 发布时从 Wiki 转成 `content/portfolio.ts` 条目并 push 上线。

## 状态流转

`讨论中` → `已沉淀`（Wiki 链接已登记）→ `待修改`（批量打磨阶段）→ `已上线`（已 push，线上可见）

## 项目列表

| # | 项目 | slug | Wiki | 状态 | 备注 |
|---|------|------|------|------|------|
| 1 | 外卖桌面小组件情感化设计 | `waimai-desktop-widget` | [2775021758](https://km.sankuai.com/collabpage/2775021758) / [2732773887](https://km.sankuai.com/collabpage/2732773887) / [2778694517](https://km.sankuai.com/collabpage/2778694517)（素材来源，非沉淀稿） | 已上线（本地，待 push） | 详情页已完成，无数据纯情感化叙事 |
| 2 | Checkout & Order Experience | `checkout-order-experience` | — | 已上线（本地，待 push） | 有详情页 |
| 3 | Urban Interface Space | `urban-interface-space` | — | 讨论中 | 仅有列表条目，无详情页 |
| 4 | User Perspective Research | `user-perspective-research` | — | 讨论中 | 仅有列表条目，无详情页 |
| 5 | Brand Experience Identity | `brand-experience-identity` | — | 讨论中 | 仅有列表条目，无详情页 |

## 规则

1. 新增项目：用户在独立对话中发起讨论，确认后更新本表（补 Wiki 链接、改状态）。
2. 项目的 Wiki 文档是文案唯一权威版本；`portfolio.ts` 是发布快照，以 Wiki 为准。
3. 讨论中间稿如需落盘，放 `content/drafts/<slug>.md`（沉淀到 Wiki 后可删）。
4. 图片素材：讨论阶段用户提供桌面文件夹；沉淀时压缩（sips -Z 1600）存入 `public/assets/work/<slug>/`，未被 `portfolio.ts` 引用不会上线。
5. 项目排序 = `portfolio.ts` 中 workItems 顺序，首页导航列表按此渲染。
