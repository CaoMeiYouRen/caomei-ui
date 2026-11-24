# 待办事项

本文档记录当前阶段状态与未完成项；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)。已交付内容只保留在[待办归档](./todo-archive.md)与 git 历史，本文档不复写。

## 当前状态

**当前进行中阶段：Phase 43（1.5.0 发布、下游覆盖兼容与 Tree / TreeSelect）**（**4 条主线 / 13 条原子条目**，**已交付 10 条 / 待发布收口 3 条**；构成对账 3 + 4 + 1 + 5 = 13；评估见[第二十八轮范围评估](../design/governance/2026-11-24-next-stage-scope-evaluation-28.md)，范围与验收口径见 [Phase 43 登记批次](../design/governance/2026-11-24-phase43-registration.md)）。

| 大条目 | 小条目 | 状态 | 提交 | 审计 | 容量 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| M1 发布收口 | 0 / 3 | 未开始 | — | — | 3 → 0 |
| M2 下游覆盖兼容 | 4 / 4 | 已闭环 | `45b9a762` `9a5dcec4` `bc668b95` `489e1800` | R1/R2 Pass | 4 → 0 |
| M3 语义收口 | 1 / 1 | 已闭环 | `b2325d4a` | R1 Pass | 1 → 0 |
| M4 Tree · TreeSelect | 5 / 5 | 已闭环 | `6c9d23e8` `1b07a672` `2e5993a6` `26b7828c` `4980d843` | R1/R2 Pass | 5 → 0 |

尚未进入阶段的候选见 [Backlog](./backlog.md)，周期性治理见 [长期任务](./recurring.md)。`1.5.0` 的发布时机按用户裁定为 2026-11-29 前后。

> **交付摘要（10 条）**：M2-1 Button 单元素根（含 `CaomeiTooltipText` 同源修复与 Popover / Popconfirm 触发器可解析）· M2-2 `wrap` 换行开关 · M2-3 `@layer` 不落地评估（`docs/design/governance/2026-11-24-phase43-m2-3-layer-strategy.md`）· M2-4 中英「下游样式覆盖指引」· M3-1 `label` 可见标签例外登记 · M4-1 `CaomeiTree` · M4-2 `CaomeiTreeSelect` · M4-3 / M4-4 中英组件页与示例 · M4-5 侧栏 / 总览 / 画廊 / §5 / §11 登记面。**M1 待发布窗口**：M1-1 须补写 1.5.0 升级注意 3 条（Button 根形态、`CaomeiTooltipText` 根形态、Popover / Popconfirm 打开态 `inert` 面收窄，清单见 `2026-11-24-phase43-m2-1-single-root.md` §6）。

## Phase 43 原子条目

| 编号 | 主线 | 条目 | 验收状态 |
| :--- | :--- | :--- | :--- |
| M1-1 | 发布收口 | 发布前门槛复核与升级注意 | 待执行 |
| M1-2 | 发布收口 | `1.5.0` 发布与发布后校验 | 待执行 |
| M1-3 | 发布收口 | 下游兼容复验与适配回收清单 | 待执行 |
| M2-1 | 下游覆盖兼容 | `CaomeiButton` 未启用提示时恢复单元素根 | 已交付 |
| M2-2 | 下游覆盖兼容 | `CaomeiButton` 内容换行开关 | 已交付 |
| M2-3 | 下游覆盖兼容 | `@layer` 策略评估 | 已交付 |
| M2-4 | 下游覆盖兼容 | 下游覆盖指引 | 已交付 |
| M3-1 | 语义收口 | `label` 语义按开发规范 §6 收口 | 已交付 |
| M4-1 | Tree · TreeSelect | Tree 实现与测试 | 已交付 |
| M4-2 | Tree · TreeSelect | TreeSelect 实现与测试 | 已交付 |
| M4-3 | Tree · TreeSelect | Tree 文档与示例 | 已交付 |
| M4-4 | Tree · TreeSelect | TreeSelect 文档与示例 | 已交付 |
| M4-5 | Tree · TreeSelect | 两组件共用登记面 | 已交付 |

## 未完成项汇总

> 本节仅为**状态指针**，用于跨阶段可见性，不构成条目登记、不构成启动授权。条件触发候选、已发布版本、长期任务与归档遗留均以各自单一载体为准，本节不再复写。

- **下游升级反馈（1.4.0）**：三家下游均已升级并留下反馈，研判见[1.4.0 下游升级反馈研判](../design/governance/2026-11-23-caomei-ui-1.4.0-downstream-feedback.md)；P0 已收口，Button 根节点与换行开关在本阶段下游覆盖兼容主线处理。**momei 页面级反馈仍待补**，本指针保留。**下游锁定版本复核（2026-11-24）**：caomei-auth **`1.4.0`**（`2a38f96`）/ dependfix **`1.4.0`**（`c1d72666`）/ momei **`1.4.0`**（`89d436f4`），待本阶段下游兼容复验后更新。
- **真机验收**：Phase 42 已完成浏览器设备视口模拟（非真机）；iOS `dvh` 真实收缩、触摸滚动惯性、OTP 自动填充仍无真机执行，等待设备或真机反馈。
