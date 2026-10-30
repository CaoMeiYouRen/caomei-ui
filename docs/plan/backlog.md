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
| DataTable 全表 / 服务端全选契约（`selectAll` / `selectAllScope`） | 全选作用域收口的 follow-up ④（Phase 26 登记时拆分） | 仅在出现真实下游需求时评估；当前不新增 prop，受控全表选择由父级写 `selection` 承接 | 低 |
| Paginator 页码报表（`CurrentPageReport` 等价物） | dependfix 迁移反馈 | **条件候选**：下游 3 处（`import-repos-dialog.vue` / `scans.vue` / `repo-history-dialog.vue`）用 `template` + `current-page-report-template`；本仓可用 `v-model:page`（1 基）+ `rowsPerPageOptions` 自渲染承接（不构成阻塞）。触发条件：出现必须内建模板的真实用例 | 低 |
| Select `null` 选项开发期告警 | momei 迁移反馈 2026-09-25 §1.2 | **条件候选**：`optionValue` 解析为非 `string` / `number` 的选项静默丢弃属**已声明契约**（[设计规范 §7](../design/design-spec.md)）；候选为开发期对 `null` / `undefined` 值告警 | 低 |

### 1.2 长尾组件候选（Tier 3）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|:-:|
| Sidebar | momei 使用面（标签级统计未命中，待复核） | — 。**下游反馈（2026-09-22，dependfix `1a73abc`）**：`apps/platform` 1 处用 `Sidebar`，其迁移评估确认可由 `CaomeiDrawer` 机械承接（`v-model:open` + `title` / `#header` + `position="right"`），**不构成阻塞**。触发条件：出现 Drawer 语义不适配的用例 | 低 |
| ScrollPanel 型滚动面板 | dependfix 迁移反馈 | **评估结论：不自研**。下游 2 处（`repo-history-dialog.vue` / `run-detail-dialog.vue`，取证 2026-09-22）均为 `height: 200px` 固定高度日志区，原生滚动容器 + CSS 足以覆盖。触发条件：出现视口检测 / 滚动条定制 / 虚拟滚动等原生无法覆盖的用例。采纳「不自研」时须同步 [组件设计 §5](../design/components.md) 的 `ScrollArea` 候选行，避免两处口径并存 | 低 |
| `BackTop`（回到顶部） | 三仓实测（同上） | `rss-impact-web` 用 `el-backtop` 1 处。触发条件 = 下游迁移排期出现 | 低 |
| `Rating`（评分） | 三仓实测（同上） | `timing-push-web` 用 `v-rating` 1 处（该仓为 Vue 2 / gitee 停更仓，仅作缺口面参考）。触发条件 = 下游迁移排期出现 | 低 |
| `TimePicker`（独立时间选择） | 三仓实测（同上） | `timing-push-web` 用 `v-time-picker` 2 处；本库 `DatePicker` 面板内已含时间选择。触发条件 = 出现「只要时间、不要日期」的独立用例 | 低 |
| `Form` / `FormItem` | Phase 26 M1-2 评估（只评估） | **形态已评估、实现后置**：推荐「独立组合层 + 插槽作用域」；1.x 不扩既有字段契约；组型控件用 `aria-labelledby`，`Switch` 暂无校验态。触发条件 = 1.0 后用户决策，或下游出现真实表单编排需求 | 低 |

### 1.3 不纳入自研的能力（外购建议）

> **本组暂无在册候选。**

### 1.4 国际化候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 语言矩阵 - 长期 | 用户需求 | **收敛为二期语言集**：`it-IT` / `nl-NL` / `pl-PL` / `tr-TR` / `vi-VN` / `th-TH` / `id-ID`（2026-10-13 修订） | 低 |
| RTL（阿拉伯语）支持 | 用户需求 | 风险高，单独立项谨慎评估 | 低 |

### 1.5 移动端与响应式候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 滚动容器键盘聚焦「无条件完整可见」 | 实测发现 | Chromium 焦点滚动机制限制；触发条件：下游无障碍审计提出 | 低 |
| 手机端优先 / 密度轴（`data-density="touch"`） | 用户 2026-10-25 评估要求 | 评估结论：`data-preset` 不承载手机端预设（会与品牌 / 明暗正交冲突，且无法解决命中区与断点）；候选为独立 **`data-density="touch"`** 轴（控件高度 36/44/52、字号 14/16/18、宽度上限 `none`）+ **`--caomei-hit-target-min`** 不可见命中区（icon 按钮 / Checkbox / Radio / Switch）。**时点裁定（2026-10-26）：不影响 1.0，1.0.0 `latest` 发布后作为 1.1.0 实现**；用户提前裁定除外。依据见[评估记录 §8](../design/governance/2026-10-25-mobile-first-preset-evaluation.md#_8-1-0-发布影响与实现时点) | 中 |
| 触摸目标增强（≥44px 命中区） | 用户决策 | 用户裁定**暂不提升**，维持现状；**2026-10-16 实测复核**给出逐组件清单与 **P0 / P1 / P2 分级建议**（[记录](../design/governance/2026-10-16-phase25-m2-2-touch-target-audit.md)），提升与否待后续裁定 | 低 |
| Toolbar 在 769–1023px 的容器收敛档 | 实测发现 | 与 ButtonGroup 同源的 md 档空档（换行 + `max-width: 100%` 均在 `@media (width <= 768px)` 内）；该区间内容超宽时同会溢出容器，本批夹具内容可容未致溢出；触发条件：出现真实溢出用例或用户裁定同档位补齐（口径与登记方式见[响应式设计 §2](../design/responsive.md)） | 低 |

### 1.6 基建与治理候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 阶段构成计数跨载体一致机检 | **无机检的复发族**（2026-09-30 两批 + 2026-10-14 + 2026-10-16，共 3 次判 Review Gate blocker）：`todo.md` 的当前状态句 / 条目表 与 `roadmap.md` 的 §1 当前态句 / 阶段表行 是**多处独立口径**，改阶段构成或计数时只改一处即形成「同载体两套口径」。触发条件 = 用户指定或下次同族复发时；守卫须带负向对照与受检面下界。**用户 2026-10-16 裁定：记录在册、等待后续修复** | 低 |
| Toast 焦点哨兵与 `aria-hidden-focus` 规则冲突 | Reka `Toast/FocusProxy` 的 `VisuallyHidden tabindex="0"` 焦点哨兵（上游有意模式）。**2026-09-25 用户裁定 D2③：维持现状仅更新记录**（不引入定向豁免机制）；候选处置为上游反馈或 `inert` 可行性 | 低 |
| 文档站多版本托管 | 历史版本站点 / 版本切换器。**触发条件：同时维护 ≥2 个对外版本，或下游按版本 pin 并要求旧版文档**。**2026-09-22 用户裁定 D1-B**：因「文档站与工作区源码强绑定」的架构约束暂不启动，形态与多源核对见[形态再评估](../design/governance/2026-09-22-docs-versioning-reevaluation.md) | 低 |
| ui-validator 资产 follow-up | agent/skill 定义优化 | 低 |
| 文档站首页 hydration mismatch | 待定位是否上游行为 | 低 |
| @iconify/vue 可选接入 | 字符串图标名 escape hatch | 低 |
| Tailwind preset（可选） | 为 Tailwind 用户提供 token 映射 | 低 |
| Storybook 组件工坊 | 暂不启用 | 低 |
| CHANGELOG 生成器健壮性收口 | 无 remote 降级、语言源自 root；**空 `# Unreleased` 段**（`outputUnreleased: true` 在无未发布提交时仍输出标题，2026-09-22 0.2.0 / 2026-09-24 0.3.0 发布会后实测） | 低 |
| 发布时 API 表面差分（根导出 + 组件声明面） | Phase 26 登记时评估（只评估） | 推荐形态：发布 preflight 对比上一已发布版本的 `dist/*.d.ts`（根导出名 + 组件 props / events / slots / exposed，归一化后比较；删除 / required 收紧 = breaking，类型变化 = warning）。触发条件 = 发布链路 `--tag` 落地后，或用户指定 | 中 |
| 提交驱动 CI 自动发布 | 发布机制评估（[2026-10-08](../design/governance/2026-10-08-release-flow-and-version-strategy-evaluation.md) §4）+ 2026-10-31 `release.yml` 现状差距分析。**现状**：workflow 只跑质量门（`pnpm verify` → `test:coverage` → `check:coverage`），publish 步骤仍为注释；`@semantic-release/npm@13.1.5` 已支持 Trusted Publisher，job 已有 `id-token: write`。**拟立项验收（待用户裁定）= 8 项全绿 + 一次 dry-run 演练**：① npm trusted publisher 注册或 `NPM_TOKEN`；② `@semantic-release/git` 推送凭据（`persist-credentials: false` 下不会自动注入）；③ **版本句同步**（README 中英 + roadmap，经 `@semantic-release/exec`，否则发布后 `docs:check:version` 立刻红）；④ publish 前接入安全告警门禁（[安全规范 §2.1](../standards/security.md#_2-1-发布前安全告警门禁)）；⑤ publish 后校验（dist-tag / shasum / 解包 README / `exports` / API 差分）；⑥ 触发模型决策（push `master` 自动发 vs `workflow_dispatch`）与预发布 `next` 通道；⑦ 发布审批（`environment:`）；⑧ **事件链**：GitHub 的 `GITHUB_TOKEN` 事件排除规则使回推的 tag / release 不触发其它工作流，故 `v*` tag 触发的 `downstream-compat` 不会自动跑（`release.yml` 自身只监听 `master` push，不会因回推 tag 重跑）——需 PAT / GitHub App token 或显式 `workflow_dispatch` 编排。Phase 21 D8 / Phase 26 D2 均**维持手动**，1.0 后单独立项；风险：breaking 提交直接升 major、发布不可逆 | 低 |
| 下游兼容检查：校验实际安装版本步骤 | Phase 23 M2-1 follow-up | 工作流的 override 步骤当前**不校验实际安装版本**（本仓 run #2 只能由「版本差 + `+1 −1` + 命令语义」推断重装生效）。候选为在 override 后断言 `caomei-ui` 实际版本 == 目标版本（fail-closed）并把结果写入 job summary。**触发条件 = 下次发布前后可在真实 run 中验证时**（workflow 改动只能在真实 run 中验证，未验证前不入库） | 低 |
| `reka-ui` 补丁升级（2.10.5 / 2.11.0） | Phase 22 M2-3 follow-up（Phase 23 M3-2 复核） | 2.10.5 起致 `CaomeiInputNumber` 步进模型 emit 回归；本仓维持 **2.10.4**（精确钉定）。**2026-10-13 实测复核**：以 `reka-ui@2.11.0` 覆盖后 `pnpm vitest run src/components/input-number/input-number.test.ts` **4 例失败 / 45 例通过** → 回归未消除（失败面 = 点击增加按钮按 step 步进并应用 precision / 点击减少按钮按 step 步进并钳制 / `step` 非正时回退为 1 / 步进按 step 累加且不被吸附到 step 整数倍）。**触发条件（可判定）= 在 `reka-ui` ≥ `2.11.0` 下该命令 4 例全过**，**或**本仓显式适配其步进行为变更 | 低 |
| `conventional-changelog` 8 升级 | Phase 22 M2-3 follow-up（Phase 23 M3-2 复核） | v8 拉入 `conventional-changelog-writer@9`，与 preset `conventional-changelog-cmyr-config@3.0.0`（仅支持 writer `^8.4.0`）模板 API 不兼容（`headerPartial is not a function`）；本仓维持 **7.2.0**。**2026-10-13 复核**：`npm view conventional-changelog-cmyr-config version` 仍为 **3.0.0**（未发布支持 writer 9 的新版）。**触发条件（可判定）= 该命令返回值 > 3.0.0 且其模板 API 兼容 writer 9**（届时复跑 `pnpm changelog` 无 `headerPartial is not a function`） | 低 |
| 文档站示例外链守卫漏判面扩展 | Phase 23 M5-1 follow-up（第八轮 N2） | 现行守卫为**整文件 fail-closed**（`docs/**/examples/**` 出现 `http(s)://` 即判 `external-image-source` 失败），无法区分「图片源」与「合法非图片外链」。**触发条件 = 出现合法非图片外链用例**（如示例中引用外部 API / 文档链接）时需重新划面；**复算 = `pnpm docs:check:demo-external-images`**（受检面 363 个示例文件 / 下界 `MIN_SCANNED_EXAMPLES = 300`，含中英两侧示例目录覆盖断言）；取证与判定见[第八轮范围评估](../design/governance/2026-10-13-next-stage-scope-evaluation-8.md) §3.9 | 低 |
| Calendar / RichTextEditor 交互边界对比度 | Phase 26 G1-F §6。Calendar 上 / 下月导航按钮与 RichTextEditor 容器描边属**可交互边界**，当前 < 3:1，未纳入 G1-F 的 4 条边界断言面。**触发条件 = 下一轮颜色 / 非文本对比度治理，或下游报可读性问题时**；收口须把两者加入 `test/e2e/preset-contrast.e2e.ts` 边界矩阵并以 3:1 断言 | 低 |
| 品牌预设的 `-solid` 对比度缺口 | Phase 26 G1-F §6 / M5-4 §2。`momei` 亮色 `success` 默认 / hover / active = 2.279 / 2.643 / 3.045（均 < 4.5:1），`caomei` `primary-solid` = 4.17；G1-F 只动文本与控件边界角色（6 预设 × 明暗已在常驻矩阵内），`-solid` 配对仅做不回退核对，`caomei` `primary-solid` 为既有品牌裁定保留项。**触发条件 = 调整品牌预设 `-solid` 取值时，或下游报可读性问题时**；收口须把三态对比度断言面从默认预设扩到全部预设 | 中 |
| 文档站 a11y 抽检矩阵外示例 | 2026-10-27 axe 抽检脚本落地时发现 | `docs/examples/input-group/with-select.vue` 的 `CaomeiSelect` 仍以 placeholder 代替可访问名，所在 `/components/input-group` 不在 `check-docs-axe` 的 5 页矩阵内，门禁不会发现（`float-label/*` 经可见 `<label for>` 关联，暂不计）。**触发条件 = 用户指定或扩面到该页时**；处置为补 `label` 并把页面加入 `PAGES` | 低 |

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
