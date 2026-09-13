# caomei-ui 项目路线图

本文档展示 caomei-ui 的发展路线与阶段规划。任务执行状态见 [待办事项](./todo.md)，长期候选见 [Backlog](./backlog.md)，已完成阶段见 [待办归档](./todo-archive.md)。

> 定位：caomei-ui 是一个基于 Vue 3 + Reka UI 的自建组件库，用于替代多个下游项目中的 PrimeVue，规避 PrimeUI 商业许可风险。

## 1. 现状与背景

- Phase 0（立项与 POC）、Phase 1（Tier 0 组件）、Phase 2（Tier 1 组件）与 Phase 3（Tier 2 组件）已完成并归档；Phase 4 待规划决策启动；首版尚未发布。
- 技术栈：Vite + Vue 3 + TypeScript，单仓库单包；组件库构建用 tsdown。
- 已落地组件：Tier 0（Button、Input、Textarea、InputNumber、Tag、Badge、Select、Dialog、Toast、Card、Checkbox、DataTable 含 `DataTableColumn` 列定义类型）、Tier 1（Avatar、Paginator、Message、ProgressSpinner、ConfirmDialog 含 `useConfirm`、Password、MultiSelect，以及预落地的 Switch）与 Tier 2（Tabs、Accordion、DropdownMenu、SelectButton、Image、FileUpload）。
- 目标下游：afdian-linker、caomei-auth、momei、rss-impact-next、dependfix/apps/platform。
- 目标组件集（按下游使用面统计）：Tier 0（9 个核心组件，已完成）+ Tier 1（含 Switch 共 8 个，已完成）+ Tier 2（6 个，已完成）。

## 2. 阶段规划

| 阶段 | 时间 | 目标 | 核心交付 |
|------|------|------|----------|
| **Phase 0** | — | 立项与 POC | 名称冻结（caomei-ui）；tsdown + Vue SFC + Reka UI + 子路径导出 POC；tokens 草案；仓库与基建 |
| **Phase 1** | — | Tier 0 组件 | Button / Input / Select / Dialog / Toast / Card / Checkbox / Tag / DataTable（9 个） |
| **Phase 2** | — | Tier 1 组件（Nuxt 模块延后，见 [Backlog](./backlog.md)） | Message / Password / ProgressSpinner / MultiSelect / ConfirmDialog / Avatar / Paginator（7 个；Switch 已先行落地） |
| **Phase 3** | — | Tier 2 组件 | Tabs（含 TabList/TabContent）/ Accordion / DropdownMenu / Image / SelectButton（SegmentedControl）/ FileUpload（6 个） |
| **Phase 4** | — | 文档站 + 首个下游接入 | 组件文档（见 [文档与演示站](../design/documentation-site.md)；组件页已随 Phase 1 / Phase 2 落地，Phase 4 聚焦搜索 / i18n / 版本化等增强）、semantic-release 发布、dependfix/platform 接入验证 |
| **Phase 5** | — | 其余下游迁移 | caomei-auth / rss-impact-next / momei / afdian-linker |
| **Phase 6** | — | 下游兼容性回归机制（稳定后启用） | 已接入下游清单 + 跨仓库 CI 触发；仅在稳定使用且组件库改动时启用 |

> Phase 6 为**延迟启用**项：需满足「组件库基本可用 + 已接入至少一个下游 + 稳定使用一段时间后出现新改动」三个条件才启动。

> 状态：Phase 0 ~ Phase 3 已完成并归档（见 [待办归档](./todo-archive.md)）；Phase 4 待规划决策启动，见 [待办事项](./todo.md)。

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

已完成阶段记录迁入 [todo-archive.md](./todo-archive.md)：Phase 0（立项与 POC）、Phase 1（Tier 0 组件）、Phase 2（Tier 1 组件，含预落地的 Switch）与 Phase 3（Tier 2 组件）均已归档。
