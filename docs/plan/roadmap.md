# caomei-ui 项目路线图

本文档展示 caomei-ui 的发展路线与阶段规划。任务执行状态见 [待办事项](./todo.md)，长期候选见 [Backlog](./backlog.md)，已完成阶段见 [待办归档](./todo-archive.md)。

> 定位：caomei-ui 是一个基于 Vue 3 + Reka UI 的自建组件库，用于替代多个下游项目中的 PrimeVue，规避 PrimeUI 商业许可风险。

## 1. 现状与背景

- Phase 0（立项与 POC）、Phase 1（Tier 0 组件）、Phase 2（Tier 1 组件）、Phase 3（Tier 2 组件）、Phase 4（Tier 3 稳定批组件）、Phase 5 第一阶段（文档站增强：docs 质量护栏 / 站内搜索 / 站点 i18n）与 Phase 6（组件库补全与规范化）已完成并归档；Phase 5 第二阶段（首版发布 / 首个下游接入）待外部前置；Phase 7 第一阶段（迁移就绪，momei 优先）已授权启动；Phase 7 第二阶段（momei 迁移闭环）、Phase 8（下游兼容性回归）未启动；首版尚未发布。
- 技术栈：Vite + Vue 3 + TypeScript，单仓库单包；组件库构建用 tsdown。
- 已落地组件：Tier 0（Button、Input、Textarea、InputNumber、Tag、Badge、Select、Dialog、Toast、Card、Checkbox、DataTable 含 `DataTableColumn` 列定义类型）、Tier 1（Avatar、Paginator、Message、ProgressSpinner、ConfirmDialog 含 `useConfirm`、Password、MultiSelect，以及预落地的 Switch）、Tier 2（Tabs、Accordion、DropdownMenu、SelectButton、Image、FileUpload）、Tier 3 稳定批（RadioGroup、Slider、ToggleButton、Toolbar、Skeleton、ProgressBar、Popover）与 Phase 6 补全（Divider、InputGroup、FloatLabel、ButtonGroup、AutoComplete、Stepper；Button 形态增强与 DataTable 列 / 排序 / 选择 / 分页 / 冻结列能力增强）。
- 目标下游：afdian-linker、caomei-auth、momei、rss-impact-next、dependfix/apps/platform。
- 目标组件集（按下游使用面统计）：Tier 0（9 个核心组件，已完成）+ Tier 1（含 Switch 共 8 个，已完成）+ Tier 2（6 个，已完成）+ Tier 3 稳定批（7 个，已完成）+ Phase 6 补全（Divider / InputGroup / FloatLabel / ButtonGroup / AutoComplete / Stepper 共 6 个，已完成）。

## 2. 阶段规划

| 阶段 | 时间 | 目标 | 核心交付 |
|------|------|------|----------|
| **Phase 0** | — | 立项与 POC | 名称冻结（caomei-ui）；tsdown + Vue SFC + Reka UI + 子路径导出 POC；tokens 草案；仓库与基建 |
| **Phase 1** | — | Tier 0 组件 | Button / Input / Select / Dialog / Toast / Card / Checkbox / Tag / DataTable（9 个） |
| **Phase 2** | — | Tier 1 组件（Nuxt 模块延后，见 [Backlog](./backlog.md)） | Message / Password / ProgressSpinner / MultiSelect / ConfirmDialog / Avatar / Paginator（7 个；Switch 已先行落地） |
| **Phase 3** | — | Tier 2 组件 | Tabs（含 TabList/TabContent）/ Accordion / DropdownMenu / Image / SelectButton（SegmentedControl）/ FileUpload（6 个） |
| **Phase 4** | — | Tier 3 稳定批组件 | RadioGroup / RadioButton、Slider、ToggleButton、Toolbar、Skeleton、ProgressBar、Popover（7 个；Alpha、其余自建件与低优先候选按需后置，见 [Backlog](./backlog.md)） |
| **Phase 5** | — | 文档站 + 首个下游接入（两段式；第一阶段已完成归档） | 第一阶段：docs 质量护栏、站内搜索、站点 i18n（本仓库可独立闭环）；第二阶段：semantic-release 发布、dependfix/platform 接入验证（待 npm 凭据与下游授权）；文档站版本化后置，见 [文档与演示站](../design/documentation-site.md) |
| **Phase 6** | — | 组件库补全与规范化（momei 迁移就绪；**已完成并归档**） | 下游使用复核与缺口清单；设计规范 + 可验证脚本；caomei / momei 双主题预设（含暗色）；缺口组件补全与关键增强（Button / DataTable + Divider / InputGroup / FloatLabel / ButtonGroup / AutoComplete / Stepper；Panel 由 Card 承载）；第三方许可声明（见 [待办归档](./todo-archive.md)） |
| **Phase 7** | — | 下游迁移（momei 优先，两段式） | 第一阶段（进行中）：迁移就绪——消费路径与 Nuxt 接入（本地 link 先行）、组件 i18n 注入机制、P0 增强、5 个延后组件（见 [Phase 7 第一阶段评估记录](../design/governance/2026-09-14-phase7-first-stage-evaluation.md)）；第二阶段：momei 迁移闭环 + P1 增强，再推 caomei-auth / rss-impact-next / afdian-linker |
| **Phase 8** | — | 下游兼容性回归机制（稳定后启用） | 已接入下游清单 + 跨仓库 CI 触发；仅在稳定使用且组件库改动时启用 |

> **Phase 6 已完成并归档**（2026-09-14）：范围来自全量 [Backlog](./backlog.md) 的整体评估（需求 1~7），经用户决策收敛为 4 条主线（需求 1 / 2 / 3 / 4 / 7）——M1 下游使用复核、M2 设计规范与主题预设、M3 组件补全、M4 依赖许可合规；组件国际化（需求 5）与移动端 / 响应式（需求 6）延后，退回 Backlog。阶段记录见 [待办归档](./todo-archive.md)。

> **Phase 7 为 momei 优先**（2026-09-14 用户授权调整）：momei 是最复杂下游，先在其闭环迁移，作为其他下游可行性的验证。
>
> **Phase 7 分两段**（2026-09-14 用户授权，评估见 [Phase 7 第一阶段评估记录](../design/governance/2026-09-14-phase7-first-stage-evaluation.md)）：**第一阶段「迁移就绪」** 先打通消费与接入通道、补齐迁移 P0 高频缺口并前置组件 i18n 注入机制；**第二阶段** 执行 momei 迁移闭环（含 P1 增强）与其他下游接入。排序原则为「先改好再迁移」，按优先级 + 依赖关系推进。消费路径为**本地 link 先行**；首版发布仍归属 Phase 5 第二阶段（待外部 npm 凭据），Phase 7 M1 仅作为并行依赖协调、不重复承载。

> **Phase 7 承接的组件补全项**（2026-09-14 用户决策，自 Phase 6 M3 延后，在 **Phase 7 第一阶段 M4** 实现）：`SplitButton`、`DataView`、`DatePicker / Calendar`、`Drawer`、`ColorPicker`。其中 `DatePicker / Calendar`、`Drawer`、`ColorPicker` 依赖 Reka UI **Alpha** primitive：实现时将 `reka-ui` 锁定为精确版本（当前 `2.10.4`），并为这些 primitive 的 API 契约补充回归测试，避免 Alpha API 变动导致静默破坏。

> Phase 8 为**延迟启用**项：需满足「组件库基本可用 + 已接入至少一个下游 + 稳定使用一段时间后出现新改动」三个条件才启动。

> 状态：Phase 0 ~ Phase 4、Phase 5 第一阶段与 Phase 6 已完成并归档（见 [待办归档](./todo-archive.md)）；**Phase 7 第一阶段（迁移就绪，momei 优先）已授权启动**（评估见 [Phase 7 第一阶段评估记录](../design/governance/2026-09-14-phase7-first-stage-evaluation.md)，条目见 [待办事项](./todo.md)）；Phase 5 第二阶段（首版发布 / 首个下游接入）待用户外部前置就绪后决策；Phase 7 第二阶段、Phase 8 未启动。

## 3. 设计依据

- 命名决策：`caomei-ui`（npm 与 GitHub 均未占用，不新建 org，单包发布）。
- 框架与结构：单仓库单包；tsdown 构建；semantic-release 发布；**不引入 Tailwind**。
- 组件清单：详见 [组件设计](../design/components.md) 与 [架构设计](../design/architecture.md)。

## 4. 阶段验收通则

每个阶段的完成必须满足：

1. `docs/plan/todo.md` 中该阶段条目全部标记完成；
2. 质量门通过（lint / typecheck / test / build）；
3. 组件文档与设计文档同步；
4. 经 `@code-reviewer` Review Gate 放行并完成提交。

## 5. 归档索引

已完成阶段记录迁入 [todo-archive.md](./todo-archive.md)：Phase 0（立项与 POC）、Phase 1（Tier 0 组件）、Phase 2（Tier 1 组件，含预落地的 Switch）、Phase 3（Tier 2 组件）、Phase 4（Tier 3 稳定批组件）、Phase 5 第一阶段（文档站增强）与 Phase 6（组件库补全与规范化）均已归档。
