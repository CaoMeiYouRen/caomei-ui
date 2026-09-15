# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前阶段

> 当前**无已授权启动的阶段**。Phase 7 第一阶段（迁移就绪，momei 优先）已完成并归档（见 [待办归档](./todo-archive.md)）；下一阶段需经需求评估与用户明确决策后按 [规划规范 §3](../standards/planning.md#3-新需求处理原则hard-requirement) 登记，本文档不提前登记下一阶段待办。

## 阶段验收通则

完成条件见 [路线图 §4](./roadmap.md)；每个原子条目收尾必须经 `@code-reviewer` Review Gate，涉及界面或样式时另经 `@ui-validator` 验证。

## 完成情况概览

> 本节仅汇总未完成项以供跨阶段可见，**不构成阶段待办登记**（登记需用户明确决策）。

- 已归档：Phase 0 ~ Phase 4、Phase 5 第一阶段、Phase 6、Phase 7 第一阶段。
- 进行中：无。
- 未启动 / 未完成：Phase 5 第二阶段（首版发布 / 首个下游接入，待外部前置）、Phase 7 第二阶段（momei 迁移闭环 + P1 增强，待用户决策）、Phase 8（下游兼容性回归，稳定后启用）；范围见 [路线图](./roadmap.md)。
- Phase 7 第一阶段遗留与偏差：首版发布链路协调（归属 Phase 5 第二阶段）、DatePicker 范围选择与 Select `filter` 的迁移决策、各组件有意行为差异与未实现项、规模偏差等，清单见 [待办归档](./todo-archive.md)。
- 未纳入任何阶段的候选：P1 增强（延至 Phase 7 第二阶段）、P2 低频增强、组件国际化多语种与 RTL、移动端与响应式、Button 角标（`:badge`）等，见 [Backlog](./backlog.md) 与 [Phase 7 第一阶段评估记录](../design/governance/2026-09-14-phase7-first-stage-evaluation.md)。
