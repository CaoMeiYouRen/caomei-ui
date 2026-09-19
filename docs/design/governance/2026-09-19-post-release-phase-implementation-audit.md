# 发布后阶段规划落地复核（Phase 0 ~ Phase 10 与 Phase 5 第二阶段）

- 类型：发布后规划落地复核（阶段规划实现情况与未做项盘点）
- 触发：2026-09-19 0.1.0 首发后，用户要求评估此前各阶段规划是否实现、还有哪些未做
- 关联：[路线图](../../plan/roadmap.md) ｜ [待办事项](../../plan/todo.md) ｜ [待办归档](../../plan/todo-archive.md) ｜ [Backlog](../../plan/backlog.md) ｜ [长期任务](../../plan/recurring.md)

## 1. 结论

- 所有已授权并完成的阶段（Phase 0 ~ Phase 4、Phase 5 第一 / 第二阶段、Phase 6、Phase 7 第一 / 第二阶段、Phase 9、Phase 10）的**规划范围内条目均已交付并归档**；本次复核未发现「计划过但静默未做」的条目。
- 未做项均属**已登记、已声明**的类别：外部依赖（momei 侧迁移）、条件触发（Phase 8 与部分长期任务候选）、明确不实现（PrimeVue 对齐差异，登记[设计规范 §7](../design-spec.md)）与待决策候选（[Backlog](../../plan/backlog.md)）。
- 当前无进行中阶段；下一阶段范围在未经需求评估与用户明确决策前不登记（[规划规范 §3](../../standards/planning.md)）。

## 2. 逐阶段落地情况

| 阶段 | 规划范围 | 落地结论 | 未做 / 遗留去向 |
|------|----------|----------|------------------|
| Phase 0 | 立项与 POC | 已交付 | `@iconify/vue` 接入 → Backlog；按组件独立 chunk 暂缓（登记架构设计 / 开发规范） |
| Phase 1 | Tier 0 组件 | 已交付 | `docs/**` 纳入 typecheck（Phase 5 第一阶段已做）、a11y / 视觉回归 → Backlog |
| Phase 2 | Tier 1 组件 | 已交付 | Nuxt 模块真实集成（Phase 7 第一阶段已做）、覆盖率门禁等 → Backlog |
| Phase 3 | Tier 2 组件 | 已交付 | 文档站增强 / 首版发布 / 下游接入 → 已由 Phase 5 承接 |
| Phase 4 | Tier 3 稳定批组件 | 已交付 | 文档站增强 / 首版发布 / 下游接入顺延 Phase 5（已承接） |
| Phase 5 第一阶段 | 文档站增强 | 已交付 | 组件内建文案 locale 注入（Phase 7 第一阶段已做）、文档站版本化 → Backlog |
| Phase 5 第二阶段 | 首版发布（本地手动 0.x） | 已交付（F5-1 ~ F5-4） | 下游接入验证后置（外部反馈驱动） |
| Phase 6 | 组件库补全与规范化 | 已交付 | Button `badge`（回写 Backlog，后由 Phase 7 第二阶段交付）与延后的 5 个组件（Phase 7 第一阶段交付） |
| Phase 7 第一阶段 | 迁移就绪（momei 优先） | 已交付 | 首版发布链路 → Phase 5 第二阶段（已交付） |
| Phase 7 第二阶段 | 库侧迁移就绪与交接计划 | 已交付（33 条） | momei 侧迁移由 momei 仓库执行、本仓等待反馈 |
| Phase 9 | 发布前收口 | 已交付（14 条） | 见 [Phase 9 收口与遗留清单](./2026-09-16-phase9-closure.md) / Backlog |
| Phase 10 | 国际化与移动端适配 | 已交付 | 后续语种 / RTL、常驻 E2E 接入门禁等 → Backlog |

> 取证：各阶段的「交付」与「交付与遗留偏差清单」以[待办归档](../../plan/todo-archive.md)对应阶段块为准。

## 3. 未做项汇总（均为已登记，非遗漏）

1. **未启动阶段**：Phase 8（下游兼容性回归机制，稳定使用后启用）——范围见[路线图](../../plan/roadmap.md)。
2. **外部依赖（等待反馈）**：momei 侧迁移（B0b 视觉基线 / B2 / B3 / B4）由 momei 项目在其仓库执行，本仓不触碰 momei 文件。
3. **条件触发候选**：表单控件公共 props 契约后续候选、Input 家族样式层共享等（见[长期任务 §2.1 / §2.2](../../plan/recurring.md)）；AutoComplete 严格选项模式、DatePicker 范围选择等（见 [Backlog §1.1](../../plan/backlog.md)）。
4. **明确不实现（下游零用量，登记[设计规范 §7](../design-spec.md)）**：SplitButton 子菜单 / `url` 等、Drawer 生命周期事件与部分插槽、DatePicker 手键输入、DataView 分页 / 排序 / `lazy` 等 PrimeVue 形态。
5. **治理与基建候选**：组件覆盖率门禁、a11y 自动化回归、视觉回归基线、常驻 / 浮层 E2E 接入 `pnpm verify` 与 CI、文档翻译治理、README 英文版等（见 [Backlog §1.6](../../plan/backlog.md)）。
6. **长期任务**：两组任务待执行批次 0 项，条件触发 2 项（见[长期任务](../../plan/recurring.md)）。

## 4. 复核口径与边界

- 取证口径：各阶段交付与遗留以[待办归档](../../plan/todo-archive.md)的阶段块为准；候选与条件触发项以 [Backlog](../../plan/backlog.md) 与[长期任务](../../plan/recurring.md)为准。
- 未覆盖：未对每个组件 / 文档页做逐项功能回归（属既有单元测试、发布校验与浏览器验证记录的范围）；未重新验证历史浏览器证据。
- 结论限定：本复核只判断「规划条目是否有遗漏」，不评价各条目的实现质量，也不替代需求评估。

## 5. 状态

2026-09-19：复核完成。未发现静默遗漏的规划条目；未做项均为已登记类别（外部依赖 / 条件触发 / 明确不实现 / 待决策候选）。
