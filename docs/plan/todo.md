# 待办事项

本文档记录当前阶段状态与未完成项；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)。已交付内容只保留在[待办归档](./todo-archive.md)与 git 历史，本文档不复写。

## 当前状态

**当前进行中阶段：Phase 44（新组件批次：引导、二维码与布局交互）**（**5 条主线 / 10 条原子条目**；构成对账 2 + 2 + 2 + 2 + 2 = 10；本阶段不发布，`1.5.0` 发布收口留在 [Backlog](./backlog.md) 待窗口；范围与验收口径见 [Phase 44 登记批次](../design/governance/2026-11-25-phase44-registration.md)）。

| 大条目 | 小条目 | 状态 | 提交 | 审计 | 容量 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| M1 Tour 引导 | 2 / 2 | 已闭环 | `e1ab4a65`、`65057520` | R3 Pass | 2 → 0 |
| M2 QRCode 二维码 | 2 / 2 | 已闭环 | `22e49857`、`f3655364` | R3 Pass | 2 → 0 |
| M3 ContextMenu 右键菜单 | 1 / 2 | 进行中 | `e5ecb6bb` | R1 Pass | 2 → 1 |
| M4 Splitter 分栏 | 0 / 2 | 未开始 | — | — | 2 → 0 |
| M5 Anchor 锚点导航 | 0 / 2 | 未开始 | — | — | 2 → 0 |

尚未进入阶段的候选见 [Backlog](./backlog.md)，周期性治理见 [长期任务](./recurring.md)。本阶段取向为新功能优先、不发布；`1.5.0` 发布收口按用户裁定留待 2026-11-29 之后。

## Phase 44 原子条目

| 编号 | 主线 | 条目 | 验收状态 |
| :--- | :--- | :--- | :--- |
| M1-1 | Tour 引导 | Tour 核心与定位 | 已交付 |
| M1-2 | Tour 引导 | Tour 文档、locale 与回归 | 已交付 |
| M2-1 | QRCode 二维码 | QRCode 实现与可选 peer | 已交付 |
| M2-2 | QRCode 二维码 | QRCode 文档、locale 与 peer 说明 | 已交付 |
| M3-1 | ContextMenu 右键菜单 | ContextMenu 实现与浮层接线 | 已交付 |
| M3-2 | ContextMenu 右键菜单 | ContextMenu 文档、locale 与回归 | 待执行 |
| M4-1 | Splitter 分栏 | Splitter 实现 | 待执行 |
| M4-2 | Splitter 分栏 | Splitter 文档、locale 与回归 | 待执行 |
| M5-1 | Anchor 锚点导航 | Anchor 实现 | 待执行 |
| M5-2 | Anchor 锚点导航 | Anchor 文档、locale 与回归 | 待执行 |
