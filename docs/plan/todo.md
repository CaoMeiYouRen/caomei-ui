# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前状态

**当前进行中阶段：Phase 36**（浮层隔离扩面、DataTable 列宽拖拽与虚拟滚动评估、质量治理、选择器空值诊断）。**4 条主线 / 12 条原子条目**（构成对账 5 + 3 + 2 + 2 = 12；原登记 8 条为 2026-11-17 时点值，同日追加 2 条后为 10 条，再经插队追加 2 条后为 12 条，见[登记记录](../design/governance/2026-11-17-phase36-registration.md) §6.1 / §6.2）；范围与验收口径的唯一载体见 [Phase 36 登记批次](../design/governance/2026-11-17-phase36-registration.md)。本阶段**不发布**（`latest` 维持 `1.3.0`）；在册候选见 [Backlog](./backlog.md)，周期性治理见 [长期任务](./recurring.md)。

## Phase 36 原子条目

| 编号 | 主线 | 条目 | 验收状态 |
|:---|:---|:---|:---|
| M1-1 | 无障碍扩面 | 隔离工具的多浮层边界收口 | 已交付（2026-11-17，[交付记录](../design/governance/2026-11-17-phase36-m1-1-multi-overlay-isolation.md)） |
| M1-2 | 无障碍扩面 | MultiSelect / AutoComplete 打开态补 `inert` | 已交付（2026-11-17，[交付记录](../design/governance/2026-11-17-phase36-m1-2-combobox-open-inert.md)） |
| M1-3 | 无障碍扩面 | DatePicker / ColorPicker 打开态补 `inert` | 已交付（2026-11-17，[交付记录](../design/governance/2026-11-17-phase36-m1-3-date-color-picker-inert.md)） |
| M1-4 | 无障碍扩面 | 全库浮层回归与边界记录 | 已交付（2026-11-18，[交付记录](../design/governance/2026-11-18-phase36-m1-4-overlay-regression.md)） |
| M1-5 | 无障碍扩面 | DropdownMenu / Popover 打开态补 `inert` | 已交付（2026-11-18，[交付记录](../design/governance/2026-11-17-phase36-m1-5-dropdown-popover-inert.md)） |
| M2-1 | DataTable 交互 | 列宽拖拽手柄 | 待执行 |
| M2-2 | DataTable 交互 | 虚拟滚动可行性评估（只评估） | 已交付（2026-11-17，[评估记录](../design/governance/2026-11-17-phase36-m2-2-virtual-scroll-evaluation.md)） |
| M2-3 | DataTable 交互 | 列宽持久化示例与契约说明 | 已交付（2026-11-17，[交付记录](../design/governance/2026-11-17-phase36-m2-3-column-sizing-persist-example.md)） |
| M3-1 | 质量治理 | Rating 文档站 a11y 抽检 | 已交付（2026-11-17，[交付记录](../design/governance/2026-11-17-phase36-m3-1-rating-docs-axe.md)） |
| M3-2 | 质量治理 | 依赖告警复核 | 已交付（2026-11-17，[交付记录](../design/governance/2026-11-17-phase36-m3-2-dependency-alert-review.md)） |
| M4-1 | 选择器空值诊断 | 空串选项值不再透传（Select / MultiSelect / AutoComplete） | 已交付（2026-11-17，RG R1 `standard` Pass → R2 `quick` Pass） |
| M4-2 | 选择器空值诊断 | 空串契约声明（中英组件页 + 设计规范 §7） | 已交付（2026-11-17，RG R1 `quick` Pass → R2 `quick` Pass → R3 `quick` Pass） |

## 未完成项汇总

> 本节仅为**状态指针**，用于跨阶段可见性，不构成条目登记、不构成启动授权。条件触发候选、已发布版本、长期任务与归档遗留均以各自单一载体为准，本节不再复写。

- **等待外部反馈**：momei 侧迁移由对应仓库执行、本仓等待反馈。**下游锁定版本复核（2026-11-16，取各仓 `pnpm-lock.yaml` 解析值，仓库 HEAD：dependfix `fd52273` / caomei-auth `d117ed1` / momei `3bf2eb7`）**：dependfix **`1.2.0`**（声明 `1.2.0`）/ caomei-auth **`1.3.0`**（声明 `1.3.0`）/ momei **`1.2.0`**（声明 `^1.2.0`）；对比 2026-11-12 读数（`1.0.0` / `1.2.0` / `1.0.0`）三仓均上调，momei 已由 `1.0.0` 升至 `1.2.0`，`1.3.0` 目前仅 caomei-auth 采用。兼容矩阵最近成功 run `43590922508`（2026-11-14，三仓 success，被测 `1.3.0`）。**momei 页面级反馈仍未提供**，本指针维持；复核细节见[第二十轮范围评估](../design/governance/2026-11-16-next-stage-scope-evaluation-20.md) §1。升级护航的版本快照与 momei 页面级反馈缺口见[升级护航交付记录](../design/governance/2026-11-04-phase27-m3-2-1.0-upgrade-escort.md) §2 / §5；面向消费方的升级注意与对外 7 条见[升级到 1.0](../guide/upgrade-to-1.0.md)。
