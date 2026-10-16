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
| Select `null` 选项开发期告警 | momei 迁移反馈 2026-09-25 §1.2 | **条件候选**：`optionValue` 解析为非 `string` / `number` 的选项静默丢弃属**已声明契约**（[设计规范 §7](../design/design-spec.md)）；候选为开发期对 `null` / `undefined` 值告警 | 低 |

### 1.2 长尾组件候选（Tier 3）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|:-:|
| Sidebar | momei 使用面（标签级统计未命中，待复核） | — 。**下游反馈（2026-09-22，dependfix `1a73abc`）**：`apps/platform` 1 处用 `Sidebar`，其迁移评估确认可由 `CaomeiDrawer` 机械承接（`v-model:open` + `title` / `#header` + `position="right"`），**不构成阻塞**。触发条件：出现 Drawer 语义不适配的用例 | 低 |
| ScrollPanel 型滚动面板 | dependfix 迁移反馈 | **评估结论：不自研**。下游 2 处（`repo-history-dialog.vue` / `run-detail-dialog.vue`，取证 2026-09-22）均为 `height: 200px` 固定高度日志区，原生滚动容器 + CSS 足以覆盖。触发条件：出现视口检测 / 滚动条定制 / 虚拟滚动等原生无法覆盖的用例。采纳「不自研」时须同步 [组件设计 §5](../design/components.md) 的 `ScrollArea` 候选行，避免两处口径并存 | 低 |
| `Form` / `FormItem`（表单容器与校验） | 三仓实测（2026-10-13，[范围扩展评估](../design/governance/2026-10-13-phase24-scope-extension-evaluation.md) §3.1） | `timing-push-admin` 用 `el-form` / `el-form-item`、`timing-push-web` 用 `v-form`，`rss-impact-web` 有自建 `CrudForm.vue`；本库为**字段组件 + 外部表单**形态。**须先出专项评估**（校验规则 / 布局 / 与字段契约的耦合 / 与既有 `FieldProps` 家族的关系）再定实现形态 | 低 |
| `BackTop`（回到顶部） | 三仓实测（同上） | `rss-impact-web` 用 `el-backtop` 1 处。触发条件 = 下游迁移排期出现 | 低 |
| `Rating`（评分） | 三仓实测（同上） | `timing-push-web` 用 `v-rating` 1 处（该仓为 Vue 2 / gitee 停更仓，仅作缺口面参考）。触发条件 = 下游迁移排期出现 | 低 |
| `TimePicker`（独立时间选择） | 三仓实测（同上） | `timing-push-web` 用 `v-time-picker` 2 处；本库 `DatePicker` 面板内已含时间选择。触发条件 = 出现「只要时间、不要日期」的独立用例 | 低 |

### 1.3 不纳入自研的能力（外购建议）

> **本组暂无在册候选**：原「图表库封装」行已于 2026-10-13 随 Phase 24 范围变更**纳入阶段**（裁定取「轻量封装 + 依赖作可选 peer」，触发条件「出现真实用例」已由 `rss-impact-web` 的图表页成立），决策与登记见[范围扩展评估](../design/governance/2026-10-13-phase24-scope-extension-evaluation.md) §10。

### 1.4 国际化候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 语言矩阵 - 长期 | 用户需求 | **收敛为二期语言集**：`it-IT` / `nl-NL` / `pl-PL` / `tr-TR` / `vi-VN` / `th-TH` / `id-ID`（2026-10-13 由「追加俄、法、德、西、葡」修订——该 5 语已上收为一期候选（见本组「已纳入阶段」注）） | 低 |
| RTL（阿拉伯语）支持 | 用户需求 | 风险高，单独立项谨慎评估 | 低 |
| locale 组织与注册治理 | 用户需求 | 语言数量增长后的目录组织、注册表、按需加载。**已由 Phase 25「国际化深化一期」实质承接**（目录组织与注册表 / 按需加载 = 包形态条目；台账与守卫 = 对齐条目）；**是否从候选池移出待用户裁定** | 低 |
> **本组一处已纳入阶段**：原「国际化深化（一期 5 语 + 分包方案 A）」行已于 2026-10-16 随 [Phase 25 登记](../design/governance/2026-10-16-phase25-registration.md) **纳入阶段**（范围与验收口径以该记录为准）。


### 1.5 移动端与响应式候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 滚动容器键盘聚焦「无条件完整可见」 | 实测发现 | Chromium 焦点滚动机制限制；触发条件：下游无障碍审计提出 | 低 |
| 触摸目标增强（≥44px 命中区） | 用户决策 | 用户裁定**暂不提升**，维持现状；**2026-10-16 实测复核**给出逐组件清单与 **P0 / P1 / P2 分级建议**（[记录](../design/governance/2026-10-16-phase25-m2-2-touch-target-audit.md)），提升与否待后续裁定 | 低 |
| Toolbar 在 769–1023px 的容器收敛档 | 实测发现 | 与 ButtonGroup 同源的 md 档空档（换行 + `max-width: 100%` 均在 `@media (width <= 768px)` 内）；该区间内容超宽时同会溢出容器，本批夹具内容可容未致溢出；触发条件：出现真实溢出用例或用户裁定同档位补齐（口径与登记方式见[响应式设计 §2](../design/responsive.md)） | 低 |
> **本组一处已纳入阶段**：原「移动端与响应式优化（三项）」行已于 2026-10-16 随 [Phase 25 登记](../design/governance/2026-10-16-phase25-registration.md) **纳入阶段**（范围与验收口径以该记录为准）。


### 1.6 基建与治理候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| Toast 焦点哨兵与 `aria-hidden-focus` 规则冲突 | Reka `Toast/FocusProxy` 的 `VisuallyHidden tabindex="0"` 焦点哨兵（上游有意模式）。**2026-09-25 用户裁定 D2③：维持现状仅更新记录**（不引入定向豁免机制）；候选处置为上游反馈或 `inert` 可行性 | 低 |
| 文档站多版本托管 | 历史版本站点 / 版本切换器。**触发条件：同时维护 ≥2 个对外版本，或下游按版本 pin 并要求旧版文档**。**2026-09-22 用户裁定 D1-B**：因「文档站与工作区源码强绑定」的架构约束暂不启动，形态与多源核对见[形态再评估](../design/governance/2026-09-22-docs-versioning-reevaluation.md) | 低 |
| ui-validator 资产 follow-up | agent/skill 定义优化 | 低 |
| 文档站首页 hydration mismatch | 待定位是否上游行为 | 低 |
| @iconify/vue 可选接入 | 字符串图标名 escape hatch | 低 |
| Tailwind preset（可选） | 为 Tailwind 用户提供 token 映射 | 低 |
| Storybook 组件工坊 | 暂不启用 | 低 |
| CHANGELOG 生成器健壮性收口 | 无 remote 降级、语言源自 root；**空 `# Unreleased` 段**（`outputUnreleased: true` 在无未发布提交时仍输出标题，2026-09-22 0.2.0 / 2026-09-24 0.3.0 发布会后实测） | 低 |
| 提交驱动 CI 自动发布 | 发布机制评估（[2026-10-08](../design/governance/2026-10-08-release-flow-and-version-strategy-evaluation.md) §4）建议的演进形态——放开 `release.yml` publish + semantic-release + npm **Trusted Publisher（OIDC）**；Phase 21 D8 **维持手动**、本轮仅做统一手动流脚本编排；风险：breaking 提交会直接升 `1.0.0`、发布不可逆 | 低 |
| 进入 1.x 的版本策略与冻结面确认 | 发布机制评估（[2026-10-08](../design/governance/2026-10-08-release-flow-and-version-strategy-evaluation.md) §4.2 / §4.5）——Phase 21 D7 **暂不进入 1.x**，维持 0.x + 既有冻结窗口；进入闸门 = 下游全量稳定消费 + 冻结面逐项确认 + 自动化发布就绪（须先定「意外升 `1.0.0`」策略 / 拦截） | 低 |
| 下游兼容检查：校验实际安装版本步骤 | Phase 23 M2-1 follow-up | 工作流的 override 步骤当前**不校验实际安装版本**（本仓 run #2 只能由「版本差 + `+1 −1` + 命令语义」推断重装生效）。候选为在 override 后断言 `caomei-ui` 实际版本 == 目标版本（fail-closed）并把结果写入 job summary。**触发条件 = 下次发布前后可在真实 run 中验证时**（workflow 改动只能在真实 run 中验证，未验证前不入库） | 低 |
| `reka-ui` 补丁升级（2.10.5 / 2.11.0） | Phase 22 M2-3 follow-up（Phase 23 M3-2 复核） | 2.10.5 起致 `CaomeiInputNumber` 步进模型 emit 回归；本仓维持 **2.10.4**（精确钉定）。**2026-10-13 实测复核**：以 `reka-ui@2.11.0` 覆盖后 `pnpm vitest run src/components/input-number/input-number.test.ts` **4 例失败 / 45 例通过** → 回归未消除（失败面 = 点击增加按钮按 step 步进并应用 precision / 点击减少按钮按 step 步进并钳制 / `step` 非正时回退为 1 / 步进按 step 累加且不被吸附到 step 整数倍）。**触发条件（可判定）= 在 `reka-ui` ≥ `2.11.0` 下该命令 4 例全过**，**或**本仓显式适配其步进行为变更 | 低 |
| `conventional-changelog` 8 升级 | Phase 22 M2-3 follow-up（Phase 23 M3-2 复核） | v8 拉入 `conventional-changelog-writer@9`，与 preset `conventional-changelog-cmyr-config@3.0.0`（仅支持 writer `^8.4.0`）模板 API 不兼容（`headerPartial is not a function`）；本仓维持 **7.2.0**。**2026-10-13 复核**：`npm view conventional-changelog-cmyr-config version` 仍为 **3.0.0**（未发布支持 writer 9 的新版）。**触发条件（可判定）= 该命令返回值 > 3.0.0 且其模板 API 兼容 writer 9**（届时复跑 `pnpm changelog` 无 `headerPartial is not a function`） | 低 |
| 文档站示例外链守卫漏判面扩展 | Phase 23 M5-1 follow-up（第八轮 N2） | 现行守卫为**整文件 fail-closed**（`docs/**/examples/**` 出现 `http(s)://` 即判 `external-image-source` 失败），无法区分「图片源」与「合法非图片外链」。**触发条件 = 出现合法非图片外链用例**（如示例中引用外部 API / 文档链接）时需重新划面；**复算 = `pnpm docs:check:demo-external-images`**（受检面 363 个示例文件 / 下界 `MIN_SCANNED_EXAMPLES = 300`，含中英两侧示例目录覆盖断言）；取证与判定见[第八轮范围评估](../design/governance/2026-10-13-next-stage-scope-evaluation-8.md) §3.9 | 低 |
> **本组一处已纳入阶段**：原「归档载体行数再评估」行已于 2026-10-16 随 [Phase 25 登记](../design/governance/2026-10-16-phase25-registration.md) **纳入阶段**（触发条件已命中：主窗口 404 行越 warn 阈值）。


### 1.7 服务层候选（composables）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 通用对话框服务 `useDialog` | 用户需求 | **评估结论：暂不实现**。触发条件：出现非组件上下文的命令式弹窗用例 | 低 |

### 1.8 下游协同候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 下游 0.5.0 升级护航 | **条件候选**：dependfix `apps/platform` 已于 2026-10-01 完成 `caomei-ui` `0.3.0 → 0.5.0` 升级（M34.2 / M34 归档，自行处置未需本仓护航）。**时点快照（不回改历史值）**：2026-10-06 实测 dependfix `0.5.0` / momei `0.3.0`（当时处第六十八阶段迁移实施期）；**2026-10-12 实测两仓均已 `0.6.0`**（dependfix @ `46c6fb61`、momei @ `39e00f21`）。**由此原触发条件「momei 启动 `0.5.0` 升级」已不成立 → 候选处置待一次条件重评估（用户裁定）**；届时按 `CHANGELOG.md` 重取差异清单（隔 `0.4.0` / `0.5.0` / `0.6.0` 三个 minor），产出升级指引 / 回归关注点。取证见 [Phase 22 M1-1 记录](../design/governance/2026-10-12-phase22-m1-1-downstream-compat-first-run.md) §4.5 | 低 |
| momei 根包接入下游兼容检查 | Phase 23 M2-1 follow-up | `momei` 已消费 `caomei-ui@0.6.0`（根包）但**未接入** `downstream-compat.yml` 的 `matrix`。**单条阻塞**：`momei` 的 `build`（`NODE_OPTIONS=--max-old-space-size=6144 nuxt build`）在上游 runner 的**无凭据可行性未验证**（`typecheck` = `nuxt typecheck` 相对轻量；`pnpm --filter <name>` 可**按根包名选中根工程**，override 步骤无需参数化）。**触发条件 = 该验证通过，或用户指定** | 低 |
| momei 侧迁移执行 | **执行主体为 momei 项目**；本仓等待其反馈 | 等待外部反馈 |

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
| App Shell / `Overlay` / `Fab` / `List`（应用外壳与组合件） | 三仓实测（2026-10-13，[范围扩展评估](../design/governance/2026-10-13-phase24-scope-extension-evaluation.md) §3.1 / §3.2） | **不纳入**：`v-app` / `v-main` / `v-toolbar` 属**应用层外壳**（本库以组件为单位提供，`Toolbar` 已覆盖工具栏语义）；`v-overlay` 与既有 Dialog / Drawer / Popover 的遮罩机制重复；`v-fab-transition`（悬浮按钮）与 `v-list`（列表）均可用既有容器 + 样式承接（@lucide/vue 提供图标）。触发条件 = 出现既有能力无法覆盖的真实用例时再评估 |
