# 2026-09-16 下一阶段评估记录（发布前收口：文档站与代码质量）

> 状态：评估记录（2026-09-16）。依据当日用户对 6 项新需求的决策，为**下一阶段**给出定位建议、主线拆分、验收标准、容量与风险评估；**本文件不构成阶段登记**——`todo.md` 在用户明确授权前保持「当前无已授权启动的阶段」（[规划规范 §3 第 3 条](../../standards/planning.md#3-新需求处理原则hard-requirement)）。
>
> 关联：[规划规范](../../standards/planning.md) ｜ [路线图](../../plan/roadmap.md) ｜ [Backlog](../../plan/backlog.md) ｜ [待办归档](../../plan/todo-archive.md) ｜ [2026-09-16 新需求评估记录](./2026-09-16-new-requirements-evaluation.md) ｜ [设计规范](../design-spec.md)

## 1. 背景与依据

- Phase 7 第一阶段（迁移就绪，momei 优先）已于 2026-09-16 完成并归档：M1 ~ M4 全部交付，交付与遗留偏差清单见 [待办归档](../../plan/todo-archive.md)。
- 2026-09-16 用户对 6 项新需求作出决策（详见 [新需求评估记录](./2026-09-16-new-requirements-evaluation.md) §8）：**IA 重构采纳 6 分组 + 组内字母序、能力说明归位取方案 B、补 zh 总览页**；**默认主色改蓝**；站点观感**留待专项评估**；文档站演示动画**对 demo 区域 opt-in 恢复**；公共逻辑抽取与 ESLint 严格化**在正式版本发布前完成**。
- 首版发布（Phase 5 第二阶段）仍待外部 npm 凭据；本阶段不重复承载发布动作，只做「发布前收口」。

## 2. 阶段定位建议

建议新设阶段「**发布前收口（Pre-release Hardening）：文档站与代码质量**」，建议编号 **Phase 9**（Phase 8 已预留给下游兼容性回归）。

- **阶段目标**：在首版发布前，把对外呈现（文档站信息架构、默认外观、演示体验）与内部质量（复用度、类型与 lint 门禁）收敛到可发布水平。
- **阶段非目标**：实际发布动作与 npm 凭据（Phase 5 第二阶段）；momei 迁移闭环与 P1 增强（Phase 7 第二阶段）；站点观感美化（用户要求后续专项评估，本阶段不纳入，仅在末尾保留再评估点）。
- **备选定位**：并入 Phase 5 第二阶段作为其前置主线——缺点是该阶段被外部凭据阻塞，会把可立即执行的工作一并挂起，故不推荐。

## 3. 建议主线（5 条）

### M1 文档站信息架构重构

- **执行范围**：`/components/` 侧栏改为 6 分组（基础与布局 / 表单输入 / 选择器 / 反馈与浮层 / 数据展示 / 导航与操作）、组内字母序；「能力说明」三页迁至 `/components/composables`、`/components/icons`、`/components/locale`，并同步 `docs/i18n/en-US/components/*` 镜像；新增 zh `docs/components/index.md` 总览页（分组导航 + 一句话说明）。
- **需同步的引用点清单**（已核实）：`docs/.vitepress/config.ts`（zh 侧栏 3 处 + en 侧栏 3 处）、`docs/guide/getting-started.md` 与 `docs/i18n/en-US/guide/getting-started.md`（相对链接 `./composables.md` 等）、`docs/guide/composables.md`（3 处）与 `docs/i18n/en-US/guide/composables.md`、`docs/guide/locale.md` 与 en 镜像、`docs/components/confirm-dialog.md` 与 en 镜像、`docs/design/components.md`，以及 **`scripts/docs/check-i18n-routing.mjs` 的硬编码用例**（`guide/locale.html` / `en-US/guide/locale.html` 期望回切目标，该文件自带维护契约要求同步）。
- **非目标**：组件页正文改写；画廊与缩略图（属「站点观感」，待专项评估）。
- **最小验收**：中英侧栏同名同序；`docs:check:links`（含相对链接与锚点）与 `docs:check:i18n-routing` 通过；旧路径零残留（绝对路径 `rg '/guide/(composables|icons|locale)'` 归零 **且** 相对链接引用点清单逐项更新）；`routingPages` 自动覆盖新 en 路径（已核实按 `docs/i18n/en-US/**` 收集，无需手工登记）。
- **规模估算**：约 10–14 文件 / ~300 行。
- **依赖**：无。

### M2 默认主题主色改蓝

- **执行范围**：`src/styles/theme.css` 的默认 `--caomei-color-primary` / `-foreground` / `-solid`（亮 / 暗两态——注意暗色两处块 `:is(.dark, [data-theme='dark'])` 与 `@media (prefers-color-scheme: dark)` 当前**均未覆盖 primary**，需两处新增）；同步 [设计规范 §2.2](../design-spec.md) 的 token 表与 **§3.2 对比度要求中的「品牌主色 4.17:1 例外」措辞及其 Backlog 指针**；`caomei` / `momei` 预设品牌色保持不变（下游品牌需求不受影响）。
- **建议取值**（实测对比度）：亮 `#2563eb` + `#fff` = **5.17:1**；暗 `#60a5fa` + `#0b0b0d` = **7.73:1**（现默认为红 `#e63946` + `#fff` = 4.17:1，低于 AA）。实施时若微调，仍以 ≥ 4.5:1 为硬约束。
- **非目标**：预设品牌色调整；新增 `--caomei-color-accent`（仍属 Backlog 未决项）。
- **最小验收**：亮 / 暗两态 primary 前景对比度实测 ≥ 4.5:1 并留证据；文档站默认外观改前 / 改后对照；`pnpm check:design` 与全量测试通过。
- **规模估算**：约 4–6 文件 / ~80 行。
- **依赖**：无（尚未发布，属 1.0 前的可改窗口）。

### M3 文档站演示动画 opt-in

- **执行范围**：`docs/.vitepress/theme/` 新增 demo 动画恢复块，目标容器 `.vitepress-demo-plugin__container` / `-preview`，逐个恢复组件入场 / 退出动画的 `animation-duration` 与 `animation-iteration-count`（Drawer、Accordion、DatePicker 面板、DropdownMenu、Popover、Toast、Image、AutoComplete / Button 加载指示）；与既有 `motion.css` 的加载态恢复合并整理为「demo 动画」层。
- **非目标**：不改组件库（组件库继续尊重 `prefers-reduced-motion`）；不恢复全站 `transition-duration`（站点其余区域保持 VitePress 默认）。
- **最小验收**：模拟 reduced-motion 时，demo 内 Drawer 入场实测 0.2s 且位移可见（x: -420 → 0），demo 外仍为 1ms（对照）；文档写明「仅演示区域覆盖系统偏好」的取舍。
- **规模估算**：约 2–3 文件 / ~50 行。
- **依赖**：与 M1 同属文档站改造，建议紧随其后。

### M4 公共逻辑抽取（发布前）

- **执行范围**（门槛：同一模式 ≥3 处且语义一致）：① locale 文本解析（39 处）；② attrs 透传统一（`inheritAttrs: false` 58 文件 / `v-bind="$attrs"` 37 文件 / `useAttrForwarding` 仅 9 组件）；③ 浮层样式与 token（`bg-elevated` 24 文件；阴影 / 遮罩 13 处 / 10 文件，与既有「阴影与遮罩 token 迁移」合并）；④ 选项列表渲染（3 份）。
- **非目标**：为抽取而重构；数值钳位（2 份）与焦点模式（4 + 2 + 2）未达门槛，不单列。
- **最小验收**：每批独立提交且全量测试通过；组件对外行为与 DOM 结构不变（既有单测 + 定向浏览器抽验）；`check:design` 通过。
- **规模估算**：分 3 批，累计约 15–25 文件。
- **依赖**：建议先于 M5 第二步（否则 type-aware 规则会放大抽取改动面的告警量）。

### M5 ESLint 严格化与导出类型（发布前）

- **执行范围**：
  - **① 显式类型族**：`explicit-module-boundary-types`（实测 **1** 处）与 `no-explicit-any`（**0** 处）可立即启用为 error；`explicit-function-return-type` 在 `eslint-config-cmyr/strict-type-checked` 中为 **off**，显式启用后实测 src 内 **约 126 处**（`.test.*` 121 / 非测试 5）、全仓 134（其余在 `docs/` 的示例与配置），故并入步骤 ② 一并收敛，不单列为「零成本」项。
  - **② type-aware unsafe 族**：分批收敛 `no-unsafe-argument` 146 / `no-unsafe-call` 22 / `no-unsafe-member-access` 20（多在 `.test.ts`）与上述 `explicit-function-return-type`，随后整体切 `eslint-config-cmyr/vue/strict`（该预设试跑基线：67 error / 229 warning，命中 63 文件）；同步收紧 `lint:check` 的 `--max-warnings`。
- **非目标**：为过规则而改组件行为；不引入新的 lint 依赖。
- **最小验收**：`pnpm lint:check` 零 error 且 warning 阈值下调有据；`pnpm verify` 全链路通过；`dist/index.d.ts` 冒烟（`check:build`）通过。
- **规模估算**：约 15–25 文件（不含生成物）。
- **依赖**：与 M4 协同排序（M4 先）。

> 取证口径（2026-09-16 快照，命令与结果一一对应；ESLint 试跑均在项目真实 `ignores` 下、全仓 594 文件，含 `docs/**` 与配置文件）：`rg -o '\?\? locale\.value\.' src/components | wc -l` → 39；`rg -l 'inheritAttrs: false' -g '*.vue' src/components | wc -l` → 58；`rg -l 'v-bind="\$attrs"' src/components | wc -l` → 37；`rg -l 'useAttrForwarding' src/components/*/*.vue | wc -l` → 9；`rg -l 'caomei-color-bg-elevated' src/components | wc -l` → 24；`node scripts/governance/check-design.mjs` → rgb 13 处 / 10 文件；ESLint 严格预设基线经 `eslint-config-cmyr/vue/strict` 试跑 → 67 error / 229 warning / 63 文件（文件总数 ±1 属快照漂移）；`explicit-module-boundary-types` 1、`no-explicit-any` 0、`explicit-function-return-type`（显式启用后）src 内约 126（`.test.*` 121 / 非测试 5）、全仓 134；M3 目标容器类取自 `docs/.vitepress/dist/components/*.html` 产物类名。

> **（暂不纳入）M6 文档站观感美化**：按用户决策留待专项评估，本阶段仅在其尾部署一个再评估点。

## 4. 阶段容量与切分

- 5 条主线符合 [规划规范 §6](../../standards/planning.md) 的 3–6 条容量约束；每条主线均已写明执行范围 / 非目标 / 最小验收标准。
- 推进建议：两条泳道并行——**文档站侧**（M1 → M3，M2 独立可随时插入）与**代码侧**（M4 → M5）；主线内按原子条目（页面 / 组件粒度）独立提交，收尾各走 Review Gate（界面改动另经 `@ui-validator`）。
- 规模合计约 46–73 文件（跨多次提交），单个原子条目仍受 10 文件 / 800 行约束。

## 5. 风险登记

| 风险 | 等级 | 对策 |
| --- | :-: | --- |
| URL 迁移影响外链与语言回切 | 中 | en 镜像同步 + `routingPages` 自动收集（已核实）；`check:links` / `check:i18n-routing` 纳入验收；如需兼容旧链接，另评估 VitePress redirects |
| 主色改蓝属破坏性视觉变更 | 低 | 尚未发布（1.0 前窗口）；同步 design-spec §2.2 与主题文档，并在文档说明默认外观变化 |
| demo 动画覆盖系统偏好引发 a11y 争议 | 低 ~ 中 | 仅限 demo 演示区域；文档写明取舍；保留回退为「显式开关」的选项 |
| M4 / M5 改动面大、易混入行为变更 | 中 | 分批推进（M4 先、M5 分两步），每批独立 Review Gate 与全量测试 |
| 发布凭据未到位 | 中 | 本阶段不依赖发布；发布动作仍留 Phase 5 第二阶段 |

## 6. 用户决策请求

1. 是否授权启动本阶段？采用建议名「发布前收口」与建议编号 **Phase 9**，还是并入 Phase 5 第二阶段？
2. 阶段范围：M1 ~ M5 是否全取？是否把「站点观感美化」（M6）纳入本阶段尾部？
3. 主色取值：直接采用建议值（亮 `#2563eb` / 暗 `#60a5fa`），还是指定品牌蓝？
4. 并行关系：本阶段与 Phase 7 第二阶段（momei 迁移闭环 + P1 增强）并行，还是先收口再迁移？
5. 若授权，`todo.md` 按 5 条主线各拆 2–4 个原子条目登记，是否同意该拆分粒度？
