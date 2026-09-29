# 长期规划与 Backlog

本文档记录**仍待用户决策**的候选与长期主线；候选准入、优先级与插队例外规则见 [规划规范 §3](../standards/planning.md)，本文档不重述。

> **文档结构**
>
> - §1 候选池：仅收录**尚未进入阶段**的候选（待决策，以及已决策但尚未登记到当前阶段的过渡态）。
> - §2 维护约定。
> - §3 已评估、不纳入（结论留档）：已判定**不进入候选池**的下游诉求与理由。
>
> 已交付与已归档条目随阶段迁入 [待办归档](./todo-archive.md)，本表不保留。

## 1. 候选池（待用户决策）

### 1.1 组件增强候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| ColorPicker 色板导航增强 | M4 条目 5 follow-up | 色板改为 `radiogroup` + `aria-checked` 并补 roving tabindex。触发条件：下游启用 `swatches` 且出现键盘密集使用场景。**2026-09-20 M2-1 判定：不达标** | 低 |
| DatePicker 范围选择 | M4 条目 2 范围收敛 | 候选补 `selectionMode="range"`。触发条件：下游出现日期区间筛选真实用例 | 低 |
| DataTable 滚动高度（`scrollable` / `scrollHeight`） | dependfix 迁移反馈 | **条件候选**：下游 `env-events.vue` 1 处用 `scrollable` + `scroll-height`；本仓可用容器 + CSS 承接（不构成阻塞）。触发条件：出现原生容器无法覆盖的用例（如固定表头 + 自适应高度） | 低 |
| Paginator 页码报表（`CurrentPageReport` 等价物） | dependfix 迁移反馈 | **条件候选**：下游 3 处（`import-repos-dialog.vue` / `scans.vue` / `repo-history-dialog.vue`）用 `template` + `current-page-report-template`；本仓可用 `v-model:page`（1 基）+ `rowsPerPageOptions` 自渲染承接（不构成阻塞）。触发条件：出现必须内建模板的真实用例 | 低 |
| Select 字段层 class 透传（`fieldClass`） | momei 迁移反馈 2026-09-25 §1.1 | **条件候选**：`class` 经 `$attrs` 落触发器、`--caomei-select-max-width` 宿主为字段外层，组件上写宽度类静默无效。先补文档；出现文档无法覆盖的真实用例再评估 `fieldClass` | 低 |
| Select `null` 选项开发期告警 | momei 迁移反馈 2026-09-25 §1.2 | **条件候选**：`optionValue` 解析为非 `string` / `number` 的选项静默丢弃属**已声明契约**（[设计规范 §7](../design/design-spec.md)）；候选为开发期对 `null` / `undefined` 值告警 | 低 |
| Button `iconOnly` 示例形态与默认插槽语义 | 2026-09-29 缺陷复核 | **缺陷 + 待决策**：`docs/examples/button/icon-only.vue` 的 22 个按钮把图标放在**默认插槽**，而 `iconOnly` 按既有契约（单测「`iconOnly` 时不渲染默认插槽内容」锁定）不渲染默认插槽、图标只走 `#icon` → 文档站「纯图标按钮」节渲染空白方块。**待调研后二选一**：对比 PrimeVue 等组件库的纯图标用法（`icon` prop / `#icon` 插槽 / 默认插槽取图标）的优劣，再在「改示例」与「放宽组件语义」间决策；放宽语义需同批改单测、`types.ts` JSDoc 与中英组件页。**2026-09-29 仅登记，不修**（当轮授权范围为选择器拼写修复） | 中 |

### 1.2 长尾组件候选（Tier 3）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|:-:|
| Sidebar | momei 使用面（标签级统计未命中，待复核） | — 。**下游反馈（2026-09-22，dependfix `1a73abc`）**：`apps/platform` 1 处用 `Sidebar`，其迁移评估确认可由 `CaomeiDrawer` 机械承接（`v-model:open` + `title` / `#header` + `position="right"`），**不构成阻塞**。触发条件：出现 Drawer 语义不适配的用例 | 低 |
| ScrollPanel 型滚动面板 | dependfix 迁移反馈 | **评估结论：不自研**。下游 2 处（`repo-history-dialog.vue` / `run-detail-dialog.vue`，取证 2026-09-22）均为 `height: 200px` 固定高度日志区，原生滚动容器 + CSS 足以覆盖。触发条件：出现视口检测 / 滚动条定制 / 虚拟滚动等原生无法覆盖的用例。采纳「不自研」时须同步 [组件设计 §5](../design/components.md) 的 `ScrollArea` 候选行，避免两处口径并存 | 低 |

### 1.3 不纳入自研的能力（外购建议）

| 能力 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 图表库封装 | 用户 2026-09-29 口径 | 维持**外购不自研**（候选 ECharts 等）；**暂未使用**，等出现真实用例后再按「外购不自研 + 先暗色 / 国际化联动、后兼容主题」同口径评估（口径来源见[下一阶段范围评估](../design/governance/2026-09-30-next-stage-scope-evaluation.md) §3.3 / §8.1 D5） | 低 |

### 1.4 国际化候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 语言矩阵 - 长期 | 用户需求 | 追加俄语、法语、德语、西班牙语、葡萄牙语 | 低 |
| RTL（阿拉伯语）支持 | 用户需求 | 风险高，单独立项谨慎评估 | 低 |
| locale 组织与注册治理 | 用户需求 | 语言数量增长后的目录组织、注册表、按需加载 | 低 |

### 1.5 移动端与响应式候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 滚动容器键盘聚焦「无条件完整可见」 | 实测发现 | Chromium 焦点滚动机制限制；触发条件：下游无障碍审计提出 | 低 |
| 触摸目标增强（≥44px 命中区） | 用户决策 | 用户裁定**暂不提升**，维持现状 | 低 |

### 1.6 基建与治理候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 对比度遗留项盘点（维持项 + 新增候选） | **维持（用户 2026-09-28 裁定 D2「预设品牌色不变」）**：`caomei` 预设 `danger` `#ef4444` 作前景（纯白底 3.76:1 / soft 现值 **3.39:1**，改前 12% 底为 3.23:1）与预设 `primary-solid` `#e63946` 4.17:1。**新增候选（2026-09-28 M2-1 复算发现，待裁定）**：默认预设 soft 变体 `danger` 4.28:1 / `neutral` 4.39:1（8% 底）与 `caomei` / `momei` 预设 primary soft 3.73:1 / 4.32:1 仍 < 4.5:1。复算口径与逐条裁定见 [M2 对比度与配色口径收口记录](../design/governance/2026-09-28-m2-contrast-and-pairing.md) | 低 |
| 计算样式采样面扩展（toast / switch 回退色） | 2026-09-28 M2 发现：`capture:styles`（245 项）不含 toast / switch，二者回退色变化（toast 中性描边 / 图标、switch 滑块 `primary-foreground`）无计算样式回归保护，仅由 token 级复算承载。候选：把两组件纳入采样 fixture | 低 |
| a11y 同类悬空引用的后续处置 | 2026-09-26 M1 同类扫描发现（判定与证据见[该批治理记录](../design/governance/2026-09-26-m1-a11y-exception-disposal-and-surface.md) §6.5）：① `CaomeiDropdownMenuGroup` / `CaomeiDropdownMenuRadioGroup` 无内嵌 `CaomeiDropdownMenuLabel` 时 `aria-labelledby` 悬空（需 slot 形态在位检测，拟将 Stepper 机制下沉 `_shared/`）；② `CaomeiAccordion` 折叠触发器关闭态 `aria-controls=""`、展开后收起时悬空（Reka `Collapsible` 同类时序，需独立设计）。**触发条件**：受检面扩面到相关形态，或下游反馈命中 | 低 |
| Toast 焦点哨兵与 `aria-hidden-focus` 规则冲突 | Reka `Toast/FocusProxy` 的 `VisuallyHidden tabindex="0"` 焦点哨兵（上游有意模式）。**2026-09-25 用户裁定 D2③：维持现状仅更新记录**（不引入定向豁免机制）；候选处置为上游反馈或 `inert` 可行性 | 低 |
| 文档站多版本托管 | 历史版本站点 / 版本切换器。**触发条件：同时维护 ≥2 个对外版本，或下游按版本 pin 并要求旧版文档**。**2026-09-22 用户裁定 D1-B**：因「文档站与工作区源码强绑定」的架构约束暂不启动，形态与多源核对见[形态再评估](../design/governance/2026-09-22-docs-versioning-reevaluation.md) | 低 |
| 文档站演示动画遗留项 | keyframes 副本一致性、示例样式不入 stylelint | 低 |
| 文档站示例的外部图片依赖 | `picsum.photos` 外链风险 | 低 |
| 直连 Reka 触发器的机检守卫 | 存在本库包装（`CaomeiPopoverTrigger` / `CaomeiDropdownMenuTrigger` 等）时，组件内直连 Reka 同型触发器应告警；否则「单点生效」收益只能靠人工记忆维持（2026-09-21 触发器收敛后新增） | 低 |
| ui-validator 资产 follow-up | agent/skill 定义优化 | 低 |
| locale 守卫能力演进 | 解析器容忍注释等 | 低 |
| 文档站首页 hydration mismatch | 待定位是否上游行为 | 低 |
| 文档站主题 CSS 的 lint 覆盖 | `lint:css:check` 的 glob 为 `src/**/*.{html,css,scss,sass,vue}`，`docs/.vitepress/theme/**` 的 CSS / SFC 样式不在 stylelint 面内（2026-09-22 实测：文档站窄档收敛规则只能靠人工与浏览器验证）。候选：把文档站主题样式纳入 stylelint 或独立规则面 | 低 |
| @iconify/vue 可选接入 | 字符串图标名 escape hatch | 低 |
| 视觉回归基线 | Playwright 截图比对 | 低 |
| 浮层交互 E2E 规格 | ConfirmDialog / Dialog 焦点落位、滚动锁复位 | 低 |
| 全量首跑 flaky（`generate-changelog` git fixture） | 2026-09-28 归档批次实测：`scripts/release/generate-changelog.test.mjs > readPackageField`（git fixture 子进程）在 88 文件并行负载下 5s 超时；隔离重跑 816ms 通过、二次全量 1837 例全通过，与当批 docs-only 改动无因果。**条件候选**：按「多次出现再处理」跟踪——再次出现（任意环境 / 任意批次）时定位根因并修 | 低 |
| Tailwind preset（可选） | 为 Tailwind 用户提供 token 映射 | 低 |
| Storybook 组件工坊 | 暂不启用 | 低 |
| 执行层规则重述与失效引用收敛 | code-reviewer SKILL.md 重述收敛 | 低 |
| CHANGELOG 生成器健壮性收口 | 无 remote 降级、语言源自 root；**空 `# Unreleased` 段**（`outputUnreleased: true` 在无未发布提交时仍输出标题，2026-09-22 0.2.0 / 2026-09-24 0.3.0 发布会后实测） | 低 |
| 组件设计一致性回归扩展（样式 + 交互） | 用户 2026-09-29 口径：「确保每个组件按预定设计的样式展现、提供符合设计的交互，减少样式错误造成的问题」。**现状**：常驻装置已覆盖声明层（源码契约单测）/ 计算样式层（`capture:styles` 冻结基线）/ 几何层（字段族 E2E 等）/ 可访问性（`test:a11y`）/ 焦点与动效（`focus-and-motion.e2e.ts`）；**缺口**：[设计规范 §6](../design/design-spec.md) 的组件约定（尺寸档位 / 变体 / 状态 / 交互反馈）尚未逐组件转为可执行断言，交互面尤甚。**已裁定（2026-09-29）**：**应当评估**，**列入待办、等待后续阶段执行**——先出评估（范围 / 收益 / 误报边界），把 §6 约定按「可机检性」分级（能断言的落单测 / E2E 含负向对照，不可机检的显式登记为人工验收项）。**不纳入当前阶段**；按 [规划规范 §3.2](../standards/planning.md) 在后续阶段授权时登记为 `todo.md` 条目 | 中 |

### 1.7 服务层候选（composables）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 通用对话框服务 `useDialog` | 用户需求 | **评估结论：暂不实现**。触发条件：出现非组件上下文的命令式弹窗用例 | 低 |

### 1.8 下游协同候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 下游 0.4.0 升级护航 | **条件候选**：dependfix `apps/platform` 与 momei 均锁 `caomei-ui@0.3.0`，本仓 0.4.0 已发布但零下游消费（`iconOnly` 方形几何 / `Select` 非法态聚焦色修复 + soft 与 toast 对比度变更可能影响下游视觉回归基线）。触发条件：某下游启动 0.4.0 升级；届时按需产出升级指引 / 差异清单 / 回归关注点 | 低 |
| momei 侧迁移执行 | **执行主体为 momei 项目**；本仓等待其反馈 | 等待外部反馈 |
| 下游兼容性回归机制 | 见路线图 Phase 8，稳定使用后启用 | 延迟 |

## 2. 维护约定

- 新增候选时注明来源与初步优先级。
- 被否决的候选记录结论与理由（见 §3）。
- 候选状态流转：§1 候选池 → 用户决策后登记到待办事项当前阶段 → 阶段完成后随待办归档迁移；**已交付 / 已归档条目不在本表保留任何内容**。
- **已裁定行的转述边界**：只记载用户裁定原文要点与其可验证语义，不引入未讨论的形态推断（如具体实现分层）或定性升格（如把行为要求升格为契约）；形态边界与兼容语义留待实施批次论证。
- 重复发生或需按期重复执行的治理动作，按规划规范 §8 升级到[长期任务台账](./recurring.md)。

## 3. 已评估、不纳入（结论留档）

> 本节记录**已评估但判定不进入候选池**的下游诉求结论与理由（维护约定「被否决的候选记录结论与理由」的落点）；条目为判定记录，非待决策候选。

| 诉求 | 来源 | 结论与理由 |
|------|------|------------|
| Select 选项 `null` 值支持（以独立哨兵区分「未选择」） | momei 迁移反馈 2026-09-25 §1.2 | **不纳入**：`optionValue` 收窄为 `string \| number` 属有意契约（对齐 Reka 可稳定比较子集），非字符串 / 数字选项不渲染已在[设计规范 §7](../design/design-spec.md) 与 Select 组件页声明；支持 `null` 会改变「未选择」语义，须另立契约。开发期告警已作为条件候选登记于 §1.1，评估见[上游反馈评估](../design/governance/2026-09-25-momei-upstream-feedback-evaluation.md) |