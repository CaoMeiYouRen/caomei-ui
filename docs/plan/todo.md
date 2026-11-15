# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前状态

**当前进行中阶段：Phase 34**（Tooltip 提示体系、协作测试 T3、质量门禁、DataTable 数据面与长尾组件）。**5 条主线 / 22 条原子条目**（构成对账 10 + 3 + 2 + 2 + 5 = 22）；范围与验收口径的唯一载体见 [Phase 34 登记批次](../design/governance/2026-11-14-phase34-registration.md)。本阶段**不发布**（`latest` 维持 `1.3.0`）；在册候选见 [Backlog](./backlog.md)，周期性治理见 [长期任务](./recurring.md)。

## Phase 34 原子条目

| 编号 | 主线 | 条目 | 验收状态 |
|:---|:---|:---|:---|
| M1-1 | Tooltip 提示体系 | `useOverflowTooltip` + `CaomeiTooltipText` + `tooltip` 契约 + Provider 缺失策略 + Button（icon-only / overflow + 截断 CSS + 视觉基线） | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m1-1-tooltip-base.md)） |
| M1-2 | Tooltip 提示体系 | P0 其余（Toolbar）：`CaomeiToolbarButton` / `CaomeiToolbarLink` 接入 `tooltip` 契约（含内部 `CaomeiIconTooltip`）；顺带关闭 M1-1 F5（`Passthrough` 抽取） | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m1-2-icon-tooltips.md)） |
| M1-9 | Tooltip 提示体系 | P0 其余（Paginator）：四个图标翻页按钮接入 `tooltip: boolean` | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m1-2-icon-tooltips.md)） |
| M1-10 | Tooltip 提示体系 | P0 其余（SplitButton）：下拉图标按钮接入 `tooltip` 契约 | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m1-2-icon-tooltips.md)） |
| M1-3 | Tooltip 提示体系 | P0 关闭按钮：Dialog / Drawer 接入 | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m1-3-dialog-drawer-tooltip.md)） |
| M1-4 | Tooltip 提示体系 | P1 icon-only 第一批：Select 族清除、InputNumber 步进、Password 显隐 | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m1-4-p1-icon-tooltips.md)） |
| M1-5 | Tooltip 提示体系 | P1 icon-only 第二批：Calendar / FileUpload / ColorPicker / DatePicker / Image / Alert·Message | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m1-5-p1-icon-tooltips-second.md)） |
| M1-6 | Tooltip 提示体系 | P1 overflow 面 + 截断前提：DataTable / Tag / Breadcrumb / Menu（源码与测试，文档见 M1-8） | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m1-6-overflow-surfaces.md)） |
| M1-7 | Tooltip 提示体系 | 文档站 Provider 放置、中英示例、迁移说明与能力清单标注 | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m1-7-docs-provider.md)） |
| M1-8 | Tooltip 提示体系 | 组件页说明：DataTable / Tag / Breadcrumb / Menu 长文本截断与 tooltip（中英） | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m1-8-truncation-docs.md)；F4 四个 guide 文件按 10 文件阈值拆为独立交付同批完成） |
| M2-1 | 协作测试 T3 | 嵌套遮罩层级评估（只评估，零代码 / 零 token 改动） | 已完成（[评估记录](../design/governance/2026-11-15-phase34-m2-1-nested-overlay-layering.md)） |
| M2-2 | 协作测试 T3 | C7 Toast 层叠 / C8 焦点陷阱 + portal / C9 CDP 触摸滚动 | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m2-2-m2-3-overlay-collaboration.md)） |
| M2-3 | 协作测试 T3 | C6 嵌套 Dialog / Drawer→Dialog（依赖 M2-1 结论） | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m2-2-m2-3-overlay-collaboration.md)） |
| M3-1 | 质量门禁与 a11y | 打开态 axe（T4）：页面矩阵 +1、规则白名单、最小适用节点下界 | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m3-1-open-state-axe.md)） |
| M3-2 | 质量门禁与 a11y | `release.yml` 周回归机检（N2）：发布前置查询 run 结论，fail-closed | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m3-2-weekly-regression-gate.md)） |
| M4-1 | DataTable 数据面 | `scrollable` / `scrollHeight`：固定表头 + 自适应高度容器 | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m4-1-data-table-scroll.md)） |
| M4-2 | DataTable 数据面 | 全选作用域契约 `selectAllScope`（默认 `page`，保持现状） | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m4-2-select-all-scope.md)） |
| M5-1 | 长尾组件 | BackTop 实现、导出与自动导入（含行为单测） | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m5-1-back-top.md)） |
| M5-2 | 长尾组件 | TimePicker 实现、导出与自动导入（含行为单测） | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m5-2-time-picker.md)） |
| M5-3 | 长尾组件 | 两组件 10 语 locale 键与台账 / 键集合守卫 | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m5-3-locale-keys.md)） |
| M5-4 | 长尾组件 | BackTop 中英文档、示例、目录 / 画廊登记、E2E 与基线 | 已完成（[批次记录](../design/governance/2026-11-15-phase34-m5-4-back-top-docs.md)） |
| M5-5 | 长尾组件 | TimePicker 中英文档、示例、E2E 与基线 | 待执行 |

## 未完成项汇总

> 本节仅为**状态指针**，用于跨阶段可见性，不构成条目登记、不构成启动授权。条件触发候选、已发布版本、长期任务与归档遗留均以各自单一载体为准，本节不再复写。

- **等待外部反馈**：momei 侧迁移由对应仓库执行、本仓等待反馈；三仓 `caomei-ui` 锁定版本读数（2026-11-12，仓库 HEAD）：dependfix **`1.0.0`** / caomei-auth **`1.2.0`** / momei **`1.0.0`**。`v1.2.0` 已通过（run 42441345211）；扩容后首跑（`caomei-auth` / `momei` 纳入矩阵）run `43211984429` 三仓 success，被测版本 `1.2.0`；`1.3.0` 发布后 run `43590922508`（2026-11-14）三仓 success，被测版本 `1.3.0`。升级护航的版本快照与 momei 页面级反馈缺口见[升级护航交付记录](../design/governance/2026-11-04-phase27-m3-2-1.0-upgrade-escort.md) §2 / §5；面向消费方的升级注意与对外 7 条见[升级到 1.0](../guide/upgrade-to-1.0.md)。
