# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前阶段

> **Phase 9：发布前收口（文档站与代码质量）** — 2026-09-16 经用户授权启动；范围来自 [下一阶段评估记录](../design/governance/2026-09-16-pre-release-stage-evaluation.md)。
>
> **阶段目标**：在首版发布前，把对外呈现（文档站信息架构、默认外观、演示体验）与内部质量（复用度、类型与 lint 门禁）收敛到可发布水平。
>
> **阶段非目标**：实际发布动作与 npm 凭据（[Phase 5 第二阶段](./roadmap.md)）；momei 迁移闭环与 P1 增强（[Phase 7 第二阶段](./roadmap.md)，按用户决策「先收口再迁移」排在本阶段之后）；文档站观感美化（保留 [Backlog](./backlog.md) 待专项评估）；移动端 / 响应式与多语种翻译。
>
> **用户决策（2026-09-16）**：范围取 M1 ~ M5；默认主色采用实测达标建议值（亮 `#2563eb` / 暗 `#60a5fa`）；能力说明归位取方案 B；补 zh 组件总览页；站点观感保留 Backlog。

### 主线 M1：文档站信息架构重构

- 执行范围：`/components/` 侧栏改为 6 分组 + 组内字母序；「能力说明」三页迁至 `/components/composables` / `/components/icons` / `/components/locale` 并同步 en 镜像；新增 zh 组件总览页。
- 非目标：组件页正文改写；画廊与缩略图（属「站点观感」，待专项评估）。
- 最小验收标准：中英组件侧栏 6 个组件分组名称一一对应且组序一致、45 个组件 slug 逐项同序，且两侧均有组件总览入口；`docs:check:links`（含相对链接与锚点）与 `docs:check:i18n-routing` 通过；旧路径零残留（绝对路径归零 **且** 相对链接引用点逐项更新）；`routingPages` 覆盖新 en 路径。
- 条目：
  - [x] 侧栏分组与排序（6 组 + 组内字母序，中英同步）
  - [ ] 能力说明归位方案 B（三页迁移 + en 镜像 + 引用点与 `check-i18n-routing` 用例同步）
  - [ ] zh 组件总览页（分组导航 + 一句话说明，含侧栏总览入口，与 en 侧 `Overview` 对称）

### 主线 M2：默认主题主色改蓝

- 执行范围：`src/styles/theme.css` 默认 `--caomei-color-primary` / `-foreground` / `-solid`（亮暗两态，暗色两处块当前均未覆盖 primary）；实底配对整改（Tag / Badge / Message 的 `--solid` 变体与 ConfirmDialog danger 确认按钮改配 `--caomei-color-on-solid`，为「亮暗两态 ≥4.5:1」的必要条件）；同步 design-spec §2.2 与 §3.2 的例外措辞及 Backlog 指针；`caomei` / `momei` 预设品牌色保持不变。
- 非目标：预设品牌色调整；新增 `--caomei-color-accent`。
- 最小验收标准：亮 / 暗两态 primary 前景对比度实测 ≥ 4.5:1 并留证据；文档站默认外观改前 / 改后对照；`pnpm check:design` 与全量测试通过。
- 条目：
  - [x] token 与默认外观改造（`theme.css` 亮暗两态，亮 `#2563eb` / 暗 `#60a5fa`）
  - [x] 规范与文档同步（design-spec §2.2 值表与 §3.2 例外措辞、`-foreground` 覆盖指引与语义别名评估、theming.md、README、getting-started 中英、architecture；对比度实测证据）

### 主线 M3：文档站演示动画 opt-in

- 执行范围：`docs/.vitepress/theme/` 新增 demo 动画恢复层（与既有 `motion.css` 合并整理），覆盖 Drawer、Accordion、DatePicker 面板、DropdownMenu、Popover、Toast、Image 与 AutoComplete / Button 的加载指示（逐个恢复入场 / 退出动画的 duration 与 iteration）；作用域按可达性分两类——容器内可达元素用 `.vitepress-demo-plugin__container` 作用域（运行时预览区类名为 `.vitepress-demo-plugin-preview`，嵌于 `__container` 内），经 Portal 挂载到 `<body>` 的面板（Drawer / Toast / Popover / DropdownMenu / DatePicker）结构上无法用容器作用域命中，改按组件选择器恢复。
- 非目标：不改组件库（组件库继续尊重 `prefers-reduced-motion`）；不恢复全站 `transition-duration`。
- 最小验收标准：模拟 reduced-motion 时 demo 内 Drawer 入场实测 0.2s 且位移可见，demo 外仍为 1ms（对照）；文档写明取舍。
- 条目：
  - [x] demo 动画恢复层（逐项恢复入场 / 退出动画并与 `motion.css` 整理）
  - [x] 取舍文档与验证（说明「演示区 opt-in 覆盖系统偏好、站点其余部分与 transition 仍尊重偏好（加载指示全站恢复为既有例外）」+ reduced-motion 对照证据）

### 主线 M4：公共逻辑抽取（发布前）

- 执行范围：按「同一模式 ≥3 处且语义一致」门槛抽取——locale 文本解析（39 处）、attrs 透传统一（58 / 37 / 9 落差）、浮层样式与 token（含阴影 / 遮罩 13 处 / 10 文件）、选项列表渲染（3 份）。
- 非目标：为抽取而重构；数值钳位（2 份）与焦点模式（4 + 2 + 2）不单列。
- 最小验收标准：每批独立提交且全量测试通过；组件对外行为与 DOM 结构不变（既有单测 + 定向浏览器抽验）；`check:design` 通过。
- 条目：
  - [ ] locale 文本解析抽取（39 处）
  - [ ] attrs 透传统一（58 / 37 / 9 收敛到 `useAttrForwarding`）
  - [ ] 浮层样式与 token（含阴影 / 遮罩 13 处 / 10 文件迁移）
  - [ ] 选项列表渲染抽取（Select / MultiSelect / AutoComplete）

> 计数口径与快照日期见 [评估记录](../design/governance/2026-09-16-pre-release-stage-evaluation.md) §3「M4 公共逻辑抽取」小节与同节末尾的「取证口径」块（2026-09-16 快照）。

### 主线 M5：ESLint 严格化与导出类型（发布前）

- 执行范围：① 启用显式类型族（`explicit-module-boundary-types` 实测 1 处、`no-explicit-any` 0 处）；② 收敛 type-aware unsafe 族（`no-unsafe-argument` 146 / `no-unsafe-call` 22 / `no-unsafe-member-access` 20）与 `explicit-function-return-type`（src 内约 126 处，严格预设中该规则为 off），随后整体切 `eslint-config-cmyr/vue/strict` 并收紧 `--max-warnings`。
- 非目标：为过规则而改组件行为；不引入新的 lint 依赖。
- 最小验收标准：`pnpm lint:check` 零 error 且 warning 阈值下调有据；`pnpm verify` 全链路通过；`dist/index.d.ts` 冒烟通过。
- 条目：
  - [ ] 启用显式类型族并收紧 `--max-warnings`
  - [ ] 收敛 unsafe 族与 `explicit-function-return-type`（实现与测试分批）
  - [ ] 切换 `vue/strict` 并固化门禁（verify 全绿 + 类型产物冒烟）

> 计数口径与快照日期见 [评估记录](../design/governance/2026-09-16-pre-release-stage-evaluation.md) §3「M5 ESLint 严格化与导出类型」小节与同节末尾的「取证口径」块（2026-09-16 快照）。

> **M6（暂不纳入）文档站观感美化**：按用户决策保留 [Backlog](./backlog.md) 待专项评估，本阶段仅作为尾部再评估点。

## 阶段验收通则

完成条件见 [路线图 §4](./roadmap.md)；每个原子条目收尾必须经 `@code-reviewer` Review Gate，涉及界面或样式时另经 `@ui-validator` 验证。

## 完成情况概览

> 本节仅汇总未完成项以供跨阶段可见，**不构成阶段待办登记**（登记需用户明确决策）。

- 已归档：Phase 0 ~ Phase 4、Phase 5 第一阶段、Phase 6、Phase 7 第一阶段。
- 进行中：Phase 9（发布前收口：文档站与代码质量）。
- 未启动 / 未完成：Phase 5 第二阶段（首版发布 / 首个下游接入，待外部前置）、Phase 7 第二阶段（momei 迁移闭环 + P1 增强，按用户决策排在本阶段之后）、Phase 8（下游兼容性回归，稳定后启用）；范围见 [路线图](./roadmap.md)。
- Phase 7 第一阶段遗留与偏差：首版发布链路协调（归属 Phase 5 第二阶段）、DatePicker 范围选择与 Select `filter` 的迁移决策、各组件有意行为差异与未实现项、规模偏差等，清单见 [待办归档](./todo-archive.md)。
- 未纳入任何阶段的候选：P2 低频增强、组件国际化多语种与 RTL、移动端与响应式、Button 角标（`:badge`）、文档站观感美化、wisdom 蒸馏原文留痕等，见 [Backlog](./backlog.md)。
