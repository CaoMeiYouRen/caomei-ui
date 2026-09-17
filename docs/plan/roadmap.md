# caomei-ui 项目路线图

本文档展示 caomei-ui 的发展路线与阶段规划。任务执行状态见 [待办事项](./todo.md)，长期候选见 [Backlog](./backlog.md)，周期性治理见 [长期任务](./recurring.md)，已完成阶段见 [待办归档](./todo-archive.md)。

> 定位：caomei-ui 是一个基于 Vue 3 + Reka UI 的自建组件库，用于替代多个下游项目中的 PrimeVue，规避 PrimeUI 商业许可风险。

## 1. 现状与背景

- Phase 0（立项与 POC）、Phase 1（Tier 0 组件）、Phase 2（Tier 1 组件）、Phase 3（Tier 2 组件）、Phase 4（Tier 3 稳定批组件）、Phase 5 第一阶段（文档站增强：docs 质量护栏 / 站内搜索 / 站点 i18n）、Phase 6（组件库补全与规范化）、Phase 7 第一阶段（迁移就绪，momei 优先）、**Phase 9（发布前收口：文档站与代码质量）与 Phase 10（国际化与移动端适配）已完成并归档**；Phase 5 第二阶段（首版发布 / 首个下游接入）待外部前置；Phase 7 第二阶段（momei 迁移闭环 + P1 增强）范围已登记、待启动；Phase 8（下游兼容性回归）未启动；首版尚未发布。
- 技术栈：Vite + Vue 3 + TypeScript，单仓库单包；组件库构建用 tsdown。
- 已落地组件：Tier 0（Button、Input、Textarea、InputNumber、Tag、Badge、Select、Dialog、Toast、Card、Checkbox、DataTable 含 `DataTableColumn` 列定义类型）、Tier 1（Avatar、Paginator、Message、ProgressSpinner、ConfirmDialog 含 `useConfirm`、Password、MultiSelect，以及预落地的 Switch）、Tier 2（Tabs、Accordion、DropdownMenu、SelectButton、Image、FileUpload）、Tier 3 稳定批（RadioGroup、Slider、ToggleButton、Toolbar、Skeleton、ProgressBar、Popover）、Phase 6 补全（Divider、InputGroup、FloatLabel、ButtonGroup、AutoComplete、Stepper；Button 形态增强与 DataTable 列 / 排序 / 选择 / 分页 / 冻结列能力增强）与 Phase 7 第一阶段（DatePicker（含面板内时间选择）/ Calendar、Drawer、SplitButton、ColorPicker、DataView；Select 家族对象选项映射 / `showClear` / `#option`、Tag `rounded`、Message `simple` / `size`、InputNumber 分组与小数位、Textarea `autoResize`、Password `feedback`）。
- 已落地能力：组件 i18n 注入机制（`CaomeiConfigProvider` / `provideLocale` / `useLocale`，22 个命名空间 × 23 个消费组件）、`caomei-ui/nuxt` 模块（组件与 composables 自动导入、样式注入、主题与 SSR）、`caomei-ui/resolver`、主题预设（caomei / momei）与暗色机制。
- 目标下游：afdian-linker、caomei-auth、momei、rss-impact-next、dependfix/apps/platform。
- 目标组件集（按下游使用面统计）：Tier 0（9 个核心组件，已完成）+ Tier 1（含 Switch 共 8 个，已完成）+ Tier 2（6 个，已完成）+ Tier 3 稳定批（7 个，已完成）+ Phase 6 补全（Divider / InputGroup / FloatLabel / ButtonGroup / AutoComplete / Stepper 共 6 个，已完成）+ Phase 7 补全（DatePicker / Calendar、Drawer、SplitButton、ColorPicker、DataView 共 5 个，已完成）。

## 2. 阶段规划

| 阶段 | 时间 | 目标 | 核心交付 |
|------|------|------|----------|
| **Phase 0** | — | 立项与 POC | 名称冻结（caomei-ui）；tsdown + Vue SFC + Reka UI + 子路径导出 POC；tokens 草案；仓库与基建 |
| **Phase 1** | — | Tier 0 组件 | Button / Input / Select / Dialog / Toast / Card / Checkbox / Tag / DataTable（9 个） |
| **Phase 2** | — | Tier 1 组件 | Message / Password / ProgressSpinner / MultiSelect / ConfirmDialog / Avatar / Paginator（7 个；Switch 已先行落地；Nuxt 模块已由 Phase 7 第一阶段交付） |
| **Phase 3** | — | Tier 2 组件 | Tabs（含 TabList/TabContent）/ Accordion / DropdownMenu / Image / SelectButton（SegmentedControl）/ FileUpload（6 个） |
| **Phase 4** | — | Tier 3 稳定批组件 | RadioGroup / RadioButton、Slider、ToggleButton、Toolbar、Skeleton、ProgressBar、Popover（7 个；其余长尾候选见 [Backlog](./backlog.md)，依赖 Reka Alpha primitive 的 `DatePicker / Calendar`、`ColorPicker` 已在 Phase 7 第一阶段交付） |
| **Phase 5** | — | 文档站 + 首个下游接入（两段式；第一阶段已完成归档） | 第一阶段：docs 质量护栏、站内搜索、站点 i18n（本仓库可独立闭环）；第二阶段：semantic-release 发布、dependfix/platform 接入验证（待 npm 凭据与下游授权）；文档站版本化后置，见 [文档与演示站](../design/documentation-site.md) |
| **Phase 6** | — | 组件库补全与规范化（momei 迁移就绪；**已完成并归档**） | 下游使用复核与缺口清单；设计规范 + 可验证脚本；caomei / momei 双主题预设（含暗色）；缺口组件补全与关键增强（Button / DataTable + Divider / InputGroup / FloatLabel / ButtonGroup / AutoComplete / Stepper；Panel 由 Card 承载）；第三方许可声明（见 [待办归档](./todo-archive.md)） |
| **Phase 7** | — | 下游迁移（momei 优先，两段式） | 第一阶段（**已完成并归档**）：迁移就绪——消费路径与 Nuxt 接入（本地 link 先行）、组件 i18n 注入机制、P0 增强、5 个延后组件（见 [待办归档](./todo-archive.md)）；第二阶段（**范围已登记 2026-09-17，待启动**）：momei 迁移闭环 + P1 增强，再推 caomei-auth / rss-impact-next / afdian-linker（用户决策 2026-09-16 定为排在 Phase 10 之后，Phase 10 已于 2026-09-17 归档） |
| **Phase 8** | — | 下游兼容性回归机制（稳定后启用） | 已接入下游清单 + 跨仓库 CI 触发；仅在稳定使用且组件库改动时启用 |
| **Phase 9** | — | 发布前收口：文档站与代码质量（**已完成并归档**） | 文档站信息架构重构（6 分组 + 能力说明归位 + zh 总览页）、默认主题主色改蓝、演示动画 opt-in、公共逻辑抽取、ESLint 严格化与导出类型（条目见 [待办归档](./todo-archive.md)，范围依据见 [下一阶段评估记录](../design/governance/2026-09-16-pre-release-stage-evaluation.md)） |
| **Phase 10** | — | 国际化与移动端适配（**已完成并归档 2026-09-17**） | 语言矩阵 - 中期（内建 zh-TW / ja-JP / ko-KR 三语文案 + 键集合一致性守卫；译文复核完成）、移动端与响应式（规范补充 + 3 个分批小屏适配批次 + 常驻 Playwright 多视口用例与基线归档）；尾部再评估点：momei 迁移可行性评估（结论「可行（有条件）」）；交付见 [待办归档](./todo-archive.md)，范围依据见 [语言矩阵 - 中期评估记录](../design/governance/2026-09-16-language-matrix-midterm-evaluation.md) |

> **规划纪律（2026-09-16 用户决策，规则见 [规划规范 §4](../standards/planning.md)）**：阶段编号只在**授权启动**时分配（取已有最大编号 +1），未经授权不再为将来可能做的工作预留编号、也不提前把未授权范围登记为独立阶段——**未规划过的条目不获得阶段编号**，以保证编号随时间单调递增。表中未启动的 **Phase 5 第二阶段 / Phase 7 第二阶段**属已授权阶段内部的分段（沿用既有约定），**Phase 8** 为规则确立前的历史预留编号；三者范围均须在启动前单独评估并获得授权。

> **Phase 6 已完成并归档**（2026-09-14）：范围来自全量 [Backlog](./backlog.md) 的整体评估（需求 1~7），经用户决策收敛为 4 条主线（需求 1 / 2 / 3 / 4 / 7）——M1 下游使用复核、M2 设计规范与主题预设、M3 组件补全、M4 依赖许可合规；组件国际化（需求 5）与移动端 / 响应式（需求 6）延后，退回 Backlog。阶段记录见 [待办归档](./todo-archive.md)。

> **Phase 7 为 momei 优先**（2026-09-14 用户授权调整）：momei 是最复杂下游，先在其闭环迁移，作为其他下游可行性的验证。
>
> **Phase 7 分两段**（2026-09-14 用户授权，评估见 [Phase 7 第一阶段评估记录](../design/governance/2026-09-14-phase7-first-stage-evaluation.md)）：**第一阶段「迁移就绪」** 先打通消费与接入通道、补齐迁移 P0 高频缺口并前置组件 i18n 注入机制；**第二阶段** 执行 momei 迁移闭环（含 P1 增强）与其他下游接入。排序原则为「先改好再迁移」，按优先级 + 依赖关系推进。消费路径为**本地 link 先行**；首版发布仍归属 Phase 5 第二阶段（待外部 npm 凭据），Phase 7 M1 仅作为并行依赖协调、不重复承载。**第一阶段已于 2026-09-16 完成并归档**（M1 ~ M4 全部交付，交付与遗留偏差清单见 [待办归档](./todo-archive.md)）；**第二阶段顺序经用户决策（2026-09-16）定为「先收口再迁移」——排在 Phase 10 之后**。**前置评估已完成（2026-09-17）：momei 迁移可行性评估结论为「可行（有条件）」**，记录见 [可行性评估](../design/governance/2026-09-17-momei-migration-feasibility.md)。**用户决策（2026-09-17）：按 C3 分批全量执行、B1 库侧补齐先行、B 级 14 项全做、接受 16 条有意差异、回归由每周回归任务跑 momei 测试承载**；范围与批次（B0~B4）见[可行性评估 §6](../design/governance/2026-09-17-momei-migration-feasibility.md)；原子条目与开工顺序在阶段启动时按[规划规范 §4](../standards/planning.md) 拆分。

> **Phase 10 已完成并归档**（2026-09-16 授权启动 / 2026-09-17 收口）：范围取「国际化与移动端适配」——M1 语言矩阵 - 中期（库内建 zh-TW / ja-JP / ko-KR，方案 A；按语种拆三个提交；键集合一致性守卫以 zh-CN 为基准）、M2 移动端与响应式（规范补充 + 3 个分批小屏适配批次 + 常驻多视口测试）；尾部再评估点为 momei 迁移可行性评估（结论「可行（有条件）」，见[可行性评估](../design/governance/2026-09-17-momei-migration-feasibility.md)）。语言矩阵范围依据见 [语言矩阵 - 中期评估记录](../design/governance/2026-09-16-language-matrix-midterm-evaluation.md)；交付与审计见 [待办归档](./todo-archive.md)。

> **Phase 9 已授权启动并于 2026-09-16 完成归档**（以下为启动时的授权留痕）：范围来自 [2026-09-16 下一阶段评估记录](../design/governance/2026-09-16-pre-release-stage-evaluation.md)，取 M1 ~ M5 五条主线；默认主色采用实测达标建议值（亮 `#2563eb` / 暗 `#60a5fa`）；能力说明归位取方案 B；补 zh 组件总览页；文档站观感美化保留 [Backlog](./backlog.md) 待专项评估。本阶段不承担实际发布动作（仍属 Phase 5 第二阶段）。

> **Phase 7 承接的组件补全项**（2026-09-14 用户决策，自 Phase 6 M3 延后，**已于 Phase 7 第一阶段 M4 实现并归档**）：`SplitButton`、`DataView`、`DatePicker / Calendar`、`Drawer`、`ColorPicker`。其中 `DatePicker / Calendar`、`ColorPicker` 依赖 Reka UI **Alpha** primitive：实现时已锁定 `reka-ui@2.10.4` 并补充 API 契约回归测试；`Drawer` 经评估改封装稳定的 Dialog primitive（见 [设计规范 §7](../design/design-spec.md)）。

> Phase 8 为**延迟启用**项（**规则确立前的历史预留编号**，不再新增同类预留）：需满足「组件库基本可用 + 已接入至少一个下游 + 稳定使用一段时间后出现新改动」三个条件才启动；启动前其范围仍须单独评估并登记。

> 状态：Phase 0 ~ Phase 4、Phase 5 第一阶段、Phase 6、Phase 7 第一阶段、Phase 9 与 **Phase 10** 已完成并归档（见 [待办归档](./todo-archive.md)）；**当前无进行中阶段**，下一阶段的范围与启动须由用户明确决策后登记（[规划规范 §3](../standards/planning.md)）。Phase 5 第二阶段（首版发布 / 首个下游接入）待用户外部前置就绪后决策；**Phase 7 第二阶段（momei 迁移闭环）范围已登记（2026-09-17 用户决策）、待启动**；Phase 8 未启动。

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

已完成阶段记录迁入 [todo-archive.md](./todo-archive.md)：Phase 0（立项与 POC）、Phase 1（Tier 0 组件）、Phase 2（Tier 1 组件，含预落地的 Switch）、Phase 3（Tier 2 组件）、Phase 4（Tier 3 稳定批组件）、Phase 5 第一阶段（文档站增强）、Phase 6（组件库补全与规范化）、Phase 7 第一阶段（迁移就绪，momei 优先）与 Phase 9（发布前收口）均已归档。
