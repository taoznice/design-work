# 作品集项目总索引

> 这是所有作品集项目的全局进度表。任何新对话开始时，先读本文件恢复上下文。
> 工作流：一个项目一个独立对话 → 边聊边整理 → 用户确认后沉淀到 Wiki（文案权威版本）→ 登记到下表 → 批量修改阶段直接改 Wiki → 发布时从 Wiki 转成 `content/portfolio.ts` 条目并 push 上线。

## 状态流转

`讨论中` → `已沉淀`（Wiki 链接已登记）→ `待修改`（批量打磨阶段）→ `已上线`（已 push，线上可见）

## 项目列表

| # | 项目 | slug | Wiki | 状态 | 备注 |
|---|------|------|------|------|------|
| 1 | 外卖桌面小组件情感化设计 | `waimai-desktop-widget` | [2775021758](https://km.sankuai.com/collabpage/2775021758) / [2732773887](https://km.sankuai.com/collabpage/2732773887) / [2778694517](https://km.sankuai.com/collabpage/2778694517)（素材来源，非沉淀稿） | 已上线（本地，待 push） | 详情页已完成，无数据纯情感化叙事 |
| 2 | Checkout & Order Experience | `checkout-order-experience` | [2054163474](https://km.sankuai.com/collabpage/2054163474)（金筷子奖申报稿） | 已上线 | 有详情页；2026-11 按申报稿优化文案：补骑手/商家状态优先级客诉案例、支付前中后场景区分、研究方法链；删除遗留字段和 Results 段，改为认知沉淀 3 条；两段演示视频（提单页浮窗、头部进度）已补入对应章节 |
| 3 | Urban Interface Space | `urban-interface-space` | — | 讨论中 | 仅有列表条目，无详情页 |
| 4 | User Perspective Research | `user-perspective-research` | — | 讨论中 | 仅有列表条目，无详情页 |
| 5 | Brand Experience Identity | `brand-experience-identity` | — | 讨论中 | 仅有列表条目，无详情页 |
| 6 | 外卖首页流量分发架构演进 | `waimai-homepage-traffic` | [2795749920](https://km.sankuai.com/collabpage/2795749920) | 已上线 | Wiki + 本地 portfolio.ts 双向就绪；图片已入库（before-after / list-modes / showcase-framework）；无数据叙事；自取 tab 不写入；商品模式降级为小案例；二楼为独立项目不在此展开；2026-11 随发布批次放开 hidden |
| 7 | 外卖二楼：新空间探索 | `waimai-second-floor` | [2097225222](https://km.sankuai.com/collabpage/2097225222) | 已录本地站（不沉淀 Wiki） | 范围：白领二楼 + 校园二楼（下拉二楼形态）；校园新首页不写；角色归属不写；新电梯类动线（双橱窗/底tab等）融合进项目 #6；文案已录 portfolio.ts（hidden: true，hero 图为空待补）；素材以视频为主整理中，到位后补 video block（手势红包、袋鼠 IP 两处动态素材位已在条目 TODO 注释标记） |
| 8 | 店铺页升级 | `waimai-store-upgrade` | [2102811414](https://km.sankuai.com/collabpage/2102811414) | 已上线（不沉淀 Wiki） | 范围：装修三档 + 分品类菜单（营销空间、内容化不写）；无数据叙事；角色归属不写；14 张图已入库（五机横排 hero、三档方案页、策略象限、研究墙、素材矩阵、取色指南、尊享版探索、菜单模板）；过程向仅保留取色 + 尊享版三阶段两张；初稿存 content/drafts/waimai-store-upgrade.md；2026-11 随发布批次放开 hidden |

## 规则

1. 新增项目：用户在独立对话中发起讨论，确认后更新本表（补 Wiki 链接、改状态）。
2. 项目的 Wiki 文档是文案唯一权威版本；`portfolio.ts` 是发布快照，以 Wiki 为准。
3. 讨论中间稿如需落盘，放 `content/drafts/<slug>.md`（沉淀到 Wiki 后可删）。
4. 图片素材：讨论阶段用户提供桌面文件夹；沉淀时压缩（sips -Z 1600）存入 `public/assets/work/<slug>/`，未被 `portfolio.ts` 引用不会上线。
5. 项目排序 = `portfolio.ts` 中 workItems 顺序，首页导航列表按此渲染。
