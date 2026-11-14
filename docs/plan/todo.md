# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前状态

**当前进行中阶段：Phase 34**（Tooltip 提示体系、协作测试 T3 与质量门禁）。**3 条主线 / 13 条原子条目**（构成对账 8 + 3 + 2 = 13）；范围与验收口径的唯一载体见 [Phase 34 登记批次](../design/governance/2026-11-14-phase34-registration.md)。本阶段**不发布**（`latest` 维持 `1.3.0`）；在册候选见 [Backlog](./backlog.md)，周期性治理见 [长期任务](./recurring.md)。

## Phase 34 原子条目

| 编号 | 主线 | 条目 | 验收状态 |
|:---|:---|:---|:---|
| M1-1 | Tooltip 提示体系 | `useOverflowTooltip` + `CaomeiTooltipText` + `tooltip` 契约 + Provider 缺失策略 + Button（icon-only / overflow + 截断 CSS + 视觉基线） | 待执行 |
| M1-2 | Tooltip 提示体系 | P0 其余：Toolbar / Paginator / SplitButton 图标触发器接入 | 待执行 |
| M1-3 | Tooltip 提示体系 | P0 关闭按钮：Dialog / Drawer 接入 | 待执行 |
| M1-4 | Tooltip 提示体系 | P1 icon-only 第一批：Select 族清除、InputNumber 步进、Password 显隐 | 待执行 |
| M1-5 | Tooltip 提示体系 | P1 icon-only 第二批：Calendar / FileUpload / ColorPicker / DatePicker / Image / Alert·Message | 待执行 |
| M1-6 | Tooltip 提示体系 | P1 overflow 面 + 截断前提：DataTable / Tag / Breadcrumb / Menu（源码与测试，文档见 M1-8） | 待执行 |
| M1-7 | Tooltip 提示体系 | 文档站 Provider 放置、中英示例、迁移说明与能力清单标注 | 待执行 |
| M1-8 | Tooltip 提示体系 | 组件页说明：DataTable / Tag / Breadcrumb / Menu 长文本截断与 tooltip（中英） | 待执行 |
| M2-1 | 协作测试 T3 | 嵌套遮罩层级评估（只评估，零代码 / 零 token 改动） | 待执行 |
| M2-2 | 协作测试 T3 | C7 Toast 层叠 / C8 焦点陷阱 + portal / C9 CDP 触摸滚动 | 待执行 |
| M2-3 | 协作测试 T3 | C6 嵌套 Dialog / Drawer→Dialog（依赖 M2-1 结论） | 待执行 |
| M3-1 | 质量门禁与 a11y | 打开态 axe（T4）：页面矩阵 +1、规则白名单、最小适用节点下界 | 待执行 |
| M3-2 | 质量门禁与 a11y | `release.yml` 周回归机检（N2）：发布前置查询 run 结论，fail-closed | 待执行 |

## 未完成项汇总

> 本节仅为**状态指针**，用于跨阶段可见性，不构成条目登记、不构成启动授权。条件触发候选、已发布版本、长期任务与归档遗留均以各自单一载体为准，本节不再复写。

- **等待外部反馈**：momei 侧迁移由对应仓库执行、本仓等待反馈；三仓 `caomei-ui` 锁定版本读数（2026-11-12，仓库 HEAD）：dependfix **`1.0.0`** / caomei-auth **`1.2.0`** / momei **`1.0.0`**。`v1.2.0` 已通过（run 42441345211）；扩容后首跑（`caomei-auth` / `momei` 纳入矩阵）run `43211984429` 三仓 success，被测版本 `1.2.0`；`1.3.0` 发布后 run `43590922508`（2026-11-14）三仓 success，被测版本 `1.3.0`。升级护航的版本快照与 momei 页面级反馈缺口见[升级护航交付记录](../design/governance/2026-11-04-phase27-m3-2-1.0-upgrade-escort.md) §2 / §5；面向消费方的升级注意与对外 7 条见[升级到 1.0](../guide/upgrade-to-1.0.md)。
