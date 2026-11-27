# 待办事项

本文档记录当前阶段状态与未完成项；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)。已交付内容只保留在[待办归档](./todo-archive.md)与 git 历史，本文档不复写。

## 当前状态

**当前进行中阶段：Phase 46（依赖治理与新组件第三批）**（**7 条主线 / 20 条原子条目**；构成对账 2 + 2 + 2 + 4 + 4 + 4 + 2 = 20；本阶段不发布，`1.5.0` 发布收口留在 [Backlog](./backlog.md) 待窗口；范围与验收口径见 [Phase 46 登记批次](../design/governance/2026-11-27-phase46-registration.md)）。

| 大条目 | 小条目 | 状态 | 提交 | 审计 | 容量 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| M1 可选 peer 结构改进 | 0 / 2 | 未开始 | — | — | 2 → 0 |
| M2 许可证策略门禁 | 2 / 2 | 已闭环 | `4daad4aa` | `2026-11-27-phase46-m2-m4-governance-gates.md` | 2 → 0 |
| M3 版本升级影响面评估 | 2 / 2 | 已闭环 | `29535173`、`9467a2fe` | `2026-11-28-phase46-m3-consumer-impact.md` | 2 → 0 |
| M4 浮层与文档收口 | 4 / 4 | 已闭环 | `53782fed`、`252fde87`、`1d8921ec`、`d7ce032b` | `2026-11-27-phase46-m2-m4-governance-gates.md` | 4 → 0 |
| M5 Editable 与 TagGroup | 4 / 4 | 已闭环 | `016ce826`、`d34e5107`、`e4c367ae`、`d0b7b6d0` | `2026-11-28-phase46-m5-editable.md`、`2026-11-28-phase46-m5-tag-group.md` | 4 → 0 |
| M6 TreeVirtualizer 与 Picker | 2 / 4 | 进行中 | `433178b7`、`55103619` | `2026-11-28-phase46-m6-tree-virtualizer.md` | 4 → 2 |
| M7 Sticky | 0 / 2 | 未开始 | — | — | 2 → 0 |

尚未进入阶段的候选见 [Backlog](./backlog.md)，周期性治理见 [长期任务](./recurring.md)。本阶段取向为治理先行、组件随后；`1.5.0` 发布收口按用户裁定留待 2026-11-29 之后。

## Phase 46 原子条目

| 编号 | 主线 | 条目 | 验收状态 |
| :--- | :--- | :--- | :--- |
| M1-1 | 可选 peer 结构改进 | 三路径取证与加载器改造 | 取证完成（见治理记录 §2 ~ §5），改造形态待裁定 |
| M1-2 | 可选 peer 结构改进 | 回归与口径同步 | 待执行 |
| M2-1 | 许可证策略门禁 | SPDX 判定与测试 | 已交付 |
| M2-2 | 许可证策略门禁 | 规范与发布口径 | 已交付 |
| M3-1 | 版本升级影响面评估 | 消费方可见变化清单 | 已交付 |
| M3-2 | 版本升级影响面评估 | 下游回归接入与文档 | 已交付 |
| M4-1 | 浮层与文档收口 | Cascader 面板改 TreeSelect 口径 | 已交付 |
| M4-2 | 浮层与文档收口 | 浮层 `inert` 首击语义 | 已交付 |
| M4-3 | 浮层与文档收口 | 英文总览镜像列表对齐 | 已交付 |
| M4-4 | 浮层与文档收口 | Phase 39 归档块补节与守卫 | 已交付 |
| M5-1 | Editable 与 TagGroup | Editable 实现与测试 | 已交付 |
| M5-2 | Editable 与 TagGroup | Editable 文档与 E2E | 已交付 |
| M5-3 | Editable 与 TagGroup | TagGroup 实现与测试 | 已交付 |
| M5-4 | Editable 与 TagGroup | TagGroup 文档与 E2E | 已交付 |
| M6-1 | TreeVirtualizer 与 Picker | TreeVirtualizer 实现与测试 | 已交付 |
| M6-2 | TreeVirtualizer 与 Picker | TreeVirtualizer 文档与 E2E | 已交付 |
| M6-3 | TreeVirtualizer 与 Picker | Picker 实现与测试 | 待执行 |
| M6-4 | TreeVirtualizer 与 Picker | Picker 文档与 E2E | 待执行 |
| M7-1 | Sticky | 实现与测试 | 待执行 |
| M7-2 | Sticky | 文档与 E2E | 待执行 |

## 未完成项汇总

> 本节仅为**状态指针**，用于跨阶段可见性，不构成条目登记、不构成启动授权。条件触发候选、已发布版本、长期任务与归档遗留均以各自单一载体为准，本节不再复写。

- **`1.5.0` 发布收口**：按用户裁定留在 [Backlog](./backlog.md) §1.6「已决策待窗口」，2026-11-29 之前不列入规划；触发条件 = 到达窗口且用户明确授权发布。
- **真机验收**：iOS `dvh` 真实收缩、触摸滚动惯性、OTP 自动填充与触摸拖拽仍无真机执行，等待设备或真机反馈。
