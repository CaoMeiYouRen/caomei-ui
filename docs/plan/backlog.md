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

> Paginator 每页条数选择器尺寸已于 2026-11-08 登记 Phase 29（见[Phase 29 登记批次记录](../design/governance/2026-11-08-phase29-registration.md) §2），已从本表移出；其余候选维持。

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| DataTable 滚动高度（`scrollable` / `scrollHeight`） | dependfix 迁移反馈 | **条件候选**：下游 `env-events.vue` 1 处用 `scrollable` + `scroll-height`；本仓可用容器 + CSS 承接（不构成阻塞）。触发条件：出现原生容器无法覆盖的用例（如固定表头 + 自适应高度） | 低 |
| DataTable 全表 / 服务端全选契约（`selectAll` / `selectAllScope`） | 全选作用域收口的 follow-up ④（Phase 26 登记时拆分） | 仅在出现真实下游需求时评估；当前不新增 prop，受控全表选择由父级写 `selection` 承接 | 低 |

### 1.2 长尾组件候选（Tier 3）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|:-:|
| Sidebar | momei 使用面（标签级统计未命中，待复核） | — 。**下游反馈（2026-09-22，dependfix `1a73abc`）**：`apps/platform` 1 处用 `Sidebar`，其迁移评估确认可由 `CaomeiDrawer` 机械承接（`v-model:open` + `title` / `#header` + `position="right"`），**不构成阻塞**。触发条件：出现 Drawer 语义不适配的用例 | 低 |
| ScrollPanel 型滚动面板 | dependfix 迁移反馈 | **评估结论：不自研**。下游 2 处（`repo-history-dialog.vue` / `run-detail-dialog.vue`，取证 2026-09-22）均为 `height: 200px` 固定高度日志区，原生滚动容器 + CSS 足以覆盖。触发条件：出现视口检测 / 滚动条定制 / 虚拟滚动等原生无法覆盖的用例。采纳「不自研」时须同步 [组件设计 §5](../design/components.md) 的 `ScrollArea` 候选行，避免两处口径并存 | 低 |
| `BackTop`（回到顶部） | 三仓实测（同上） | `rss-impact-web` 用 `el-backtop` 1 处。触发条件 = 下游迁移排期出现 | 低 |
| `Rating`（评分） | 三仓实测（同上） | `timing-push-web` 用 `v-rating` 1 处（该仓为 Vue 2 / gitee 停更仓，仅作缺口面参考）。触发条件 = 下游迁移排期出现 | 低 |
| `TimePicker`（独立时间选择） | 三仓实测（同上） | `timing-push-web` 用 `v-time-picker` 2 处；本库 `DatePicker` 面板内已含时间选择。触发条件 = 出现「只要时间、不要日期」的独立用例 | 低 |

### 1.3 不纳入自研的能力（外购建议）

> **本组暂无在册候选。**

### 1.4 国际化候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 语言矩阵 - 长期 | 用户需求 | **收敛为二期语言集**：`it-IT` / `nl-NL` / `pl-PL` / `tr-TR` / `vi-VN` / `th-TH` / `id-ID`（2026-10-13 修订）。**触发条件 = 语言集扩容决策**（如新增二期语言或 RTL 立项） | 低 |
| RTL（阿拉伯语）支持 | 用户需求 | 风险高，单独立项谨慎评估 | 低 |

### 1.5 移动端与响应式候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 滚动容器键盘聚焦「无条件完整可见」 | 实测发现 | Chromium 焦点滚动机制限制；触发条件：下游无障碍审计提出 | 低 |
| Toolbar 在 769–1023px 的容器收敛档 | 实测发现 | 与 ButtonGroup 同源的 md 档空档（换行 + `max-width: 100%` 均在 `@media (width <= 768px)` 内）；该区间内容超宽时同会溢出容器，本批夹具内容可容未致溢出；触发条件：出现真实溢出用例或用户裁定同档位补齐（口径与登记方式见[响应式设计 §2](../design/responsive.md)） | 低 |

### 1.6 基建与治理候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 文档站多版本托管 | 历史版本站点 / 版本切换器。**触发条件：同时维护 ≥2 个对外版本，或下游按版本 pin 并要求旧版文档**。**2026-09-22 用户裁定 D1-B**：因「文档站与工作区源码强绑定」的架构约束暂不启动，形态与多源核对见[形态再评估](../design/governance/2026-09-22-docs-versioning-reevaluation.md) | 低 |
| ui-validator 资产 follow-up | agent/skill 定义优化 | 低 |
| Tailwind preset（可选） | 为 Tailwind 用户提供 token 映射 | 低 |
| Storybook 组件工坊 | 暂不启用 | 低 |
| `conventional-changelog` 8 升级 | 来源：Phase 22 M2-3 follow-up（Phase 23 M3-2 复核）；v8 拉入 `conventional-changelog-writer@9`，与 preset `conventional-changelog-cmyr-config@3.0.0`（仅支持 writer `^8.4.0`）模板 API 不兼容（`headerPartial is not a function`）；本仓维持 **7.2.1**（最新 **8.1.3**）。**2026-11-13 复核**：preset 最新仍为 **3.0.0**（未发布支持 writer 9 的新版），见[直接依赖大版本升级评估](../design/governance/2026-11-13-dependency-major-evaluation.md)。**触发条件（可判定）= preset 发布 > 3.0.0 且其模板 API 兼容 writer 9**（届时复跑 `pnpm changelog` 无 `headerPartial is not a function`） | 低 |
| 文档站示例外链守卫漏判面扩展 | 来源：Phase 23 M5-1 follow-up（第八轮 N2）；现行守卫为**整文件 fail-closed**（`docs/**/examples/**` 出现 `http(s)://` 即判 `external-image-source` 失败），无法区分「图片源」与「合法非图片外链」。**触发条件 = 出现合法非图片外链用例**（如示例中引用外部 API / 文档链接）时需重新划面；**复算 = `pnpm docs:check:demo-external-images`**（受检面 363 个示例文件 / 下界 `MIN_SCANNED_EXAMPLES = 300`，含中英两侧示例目录覆盖断言）；取证与判定见[第八轮范围评估](../design/governance/2026-10-13-next-stage-scope-evaluation-8.md) §3.9 | 低 |
| CI 运行器镜像迁移检测（`ubuntu-26.04`） | Phase 24 M2-1 归档后承接的**待触发检测义务**：`ubuntu-latest` 自 2026-10-19 起分批迁移 Ubuntu 26.04；检测点 = 周级 `e2e` 作业 `Set up job` 的 `Image:` 出现 `ubuntu-26.04`；命中后按重冻结 5 步执行视觉基线并留痕。**触发条件 = 该检测点命中** | 中 |
| `typescript` 7 升级（阻塞：工具链 API） | 来源：同上评估（2026-11-13）；当前 **6.0.3**，目标 **7.0.2**。实测 npm 包根导出仅 `version` / `unstable/*`，`createProgram`、`sys` 缺失；`vue-tsc` 3.3.14 入口依赖 `ts.run` / `ts.sys`。**触发条件 = `vue-tsc` 与 `tsdown` 声明并实测支持 TS 7 原生 API**（届时 `pnpm typecheck` / `check:nuxt` / `build` 全绿）；不设时间点，不做试运行分支 | 低 |
| `glob` 跨 major 覆盖（安全公告） | 来源：2026-11-04 依赖告警复核的 `pnpm audit` 新发现（GHSA-3g3m-2fjr-6pw4，moderate；Dependabot 未登记）。`glob >=9.0.0 <=14.0.1` 存在 ReDoS；当前受影响链为 `@lint-md/cli` / `js-beautify` / `@vercel/nft` → 13.0.6、`archiver-utils` → 10.5.0（`commitizen` 的 7.2.3 不在公告区间）。覆盖到 14.0.2 属跨 major（模块形态 / 引擎要求变化）；**触发条件 = 上述上游支持 glob ≥ 14.0.2 且本仓 `lint:md` / `docs:build` / `test:nuxt-smoke` 全绿时**，未验证前不引入 override | 低 |
| dev 形态 hydration 守护 | 来源：Phase 32 M2-2（[M2-2 记录](../design/governance/2026-11-13-phase32-m2-2-home-hydration.md) §5 第 3 条）——生产构建的 Vue 静默修补使告警恒为 0，dev 真机对照为一次性流程。候选 = 把 dev 形态对照固化为命令（或常驻用例）。**触发条件 = 首页结构 / 主题层新增客户端状态，或再次出现 hydration 可疑反馈** | 低 |

### 1.7 服务层候选（composables）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 通用对话框服务 `useDialog` | 用户需求 | **评估结论：暂不实现**。触发条件：出现非组件上下文的命令式弹窗用例 | 低 |

### 1.8 下游协同候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| momei 侧迁移执行 | **执行主体为 momei 项目**；本仓等待其反馈 | 等待外部反馈 |

### 1.9 图标体系候选

> 来源：用户 2026-11-07 指令「图标是无穷无尽的，本项目无法也不应提供所有图标；需要预留接口让第三方图标更好引入，同时预设样式以兼容本项目样式」。**Phase 28 M4-1 已完成调研（2026-11-07，零实现 / 零依赖）**，结论与接口草案见[图标体系调研](../design/governance/2026-11-07-phase28-m4-1-icon-system-research.md)；**I1 ~ I4 已于 2026-11-08 登记 Phase 29**（见[Phase 29 登记批次记录](../design/governance/2026-11-08-phase29-registration.md) §2），本表只保留条件触发项。

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|:-:|
| I5 可选运行时 `@iconify/vue` peer | M4-1 调研 §5 | **条件触发**：仅当出现「必须运行时按字符串加载」的真实下游用例；须同时给出 CSP / 离线 / SSR 指引；默认不引入 | 低 |

### 1.10 动效体系候选

> 来源：用户 2026-11-08 需求「增强组件动画效果，新增以动画优先的动效模式；极简仍只保留必要动画；按反馈与浮层 → 导航与操作 → 表单输入 → 基础与布局 → 选择器 → 数据展示推进；截图不足须设计测试与人工复核」。**评估记录已落盘（2026-11-08，零实现），已通过 Review Gate（R3，仅评估记录）**；结论、现状盘点与候选映射见[动效体系与新动效轴评估](../design/governance/2026-11-08-motion-system-evaluation.md) §1 / §2 / §3 / §8；**A1 / A2 / A3 / A8 已于 2026-11-08 登记 Phase 29**（见[Phase 29 登记批次记录](../design/governance/2026-11-08-phase29-registration.md) §2）；**A4 / A5 / A6 已于 2026-11-10 登记 Phase 30**（见[Phase 30 登记批次记录](../design/governance/2026-11-10-phase30-registration.md) §2）；**A7 已于 2026-11-12 登记 Phase 31**（见[Phase 31 登记批次记录](../design/governance/2026-11-12-phase31-registration.md) §2）。**本组暂无在册候选。**

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
| 上游 standards 骨架接入（`cmyr-skills-agents` 提案草案） | 2026-11-02 提案（草案，未正式发起） | **不采纳**：草案未发起正式提案（dependfix 试点未出结论）；项目 `AGENTS.md` §2 / §8.2 已有等价正文，且 `check:standards-redundant:strict` 禁止规范重复表述，搬运上游正文会直接触发本仓门禁。optOut 已提交上游 §7（commit `3ba71e0`）。复查条件：试点结论出来后只考虑「规范来源可追溯」标注，不搬正文。 |
| Select 选项 `null` 值支持（以独立哨兵区分「未选择」） | momei 迁移反馈 2026-09-25 §1.2 | **不纳入**：`optionValue` 收窄为 `string \| number` 属有意契约（对齐 Reka 可稳定比较子集），非字符串 / 数字选项不渲染已在[设计规范 §7](../design/design-spec.md) 与 Select 组件页声明；支持 `null` 会改变「未选择」语义，须另立契约。开发期告警已作为条件候选登记于 §1.1，评估见[上游反馈评估](../design/governance/2026-09-25-momei-upstream-feedback-evaluation.md) |
| App Shell / `Overlay` / `Fab` / `List`（应用外壳与组合件） | 三仓实测（2026-10-13，[范围扩展评估](../design/governance/2026-10-13-phase24-scope-extension-evaluation.md) §3.1 / §3.2） | **不纳入**：`v-app` / `v-main` / `v-toolbar` 属**应用层外壳**（本库以组件为单位提供，`Toolbar` 已覆盖工具栏语义）；`v-overlay` 与既有 Dialog / Drawer / Popover 的遮罩机制重复；`v-fab-transition`（悬浮按钮）与 `v-list`（列表）均可用既有容器 + 样式承接（@lucide/vue 提供图标）。触发条件 = 出现既有能力无法覆盖的真实用例时再评估 |
