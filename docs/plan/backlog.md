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
|------|------|------|:-:|
| Rating 半星以外的评分形态 | Phase 35 M3-1 记录 §2 非目标 | `CaomeiRating` 当前只做整星 / 半星、无自定义图标集。**触发条件** = 出现半星以外的评分形态（如十分制、心形图标集）。**表单集成已登记 Phase 37 M4** | 低 |

### 1.2 长尾组件候选（Tier 3）

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|:-:|
| Sidebar | momei 使用面（标签级统计未命中，待复核） | — 。**下游反馈（2026-09-22，dependfix `1a73abc`）**：`apps/platform` 1 处用 `Sidebar`，其迁移评估确认可由 `CaomeiDrawer` 机械承接（`v-model:open` + `title` / `#header` + `position="right"`），**不构成阻塞**。触发条件：出现 Drawer 语义不适配的用例 | 低 |
| ScrollPanel 型滚动面板 | dependfix 迁移反馈 | **评估结论：不自研**。下游 2 处（`repo-history-dialog.vue` / `run-detail-dialog.vue`，取证 2026-09-22）均为 `height: 200px` 固定高度日志区，原生滚动容器 + CSS 足以覆盖。触发条件：出现视口检测 / 滚动条定制 / 虚拟滚动等原生无法覆盖的用例。采纳「不自研」时须同步 [组件设计 §5](../design/components.md) 的 `ScrollArea` 候选行，避免两处口径并存 | 低 |

> BackTop / TimePicker 已于 2026-11-14 登记 Phase 34；Rating 已于 2026-11-15 登记 Phase 35（见[登记批次](../design/governance/2026-11-15-phase35-registration.md) §2）；本表只保留尚未登记的候选。

### 1.3 不纳入自研的能力（外购建议）

> **本组暂无在册候选。**

### 1.4 国际化候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 语言矩阵 - 二期 LTR | 用户需求 | **收敛为二期语言集**：`it-IT` / `nl-NL` / `pl-PL` / `tr-TR` / `vi-VN` / `th-TH` / `id-ID`（2026-10-13 修订）。[调研记录](../design/governance/2026-11-18-i18n-component-and-mobile-research.md) §3.2 建议把「下限」表述为 **17 门 LTR**（现有 10 门 + 二期 7 门），`hi` 视下游补到 18。**触发条件 = 用户裁定语言集扩容** | 低 |
| 语言矩阵 - 长期 | 用户需求 | 二期之后是否继续扩容，按下游语言需求逐项判定，不追头部 43 ~ 72 门。**触发条件 = 出现新的下游语言需求** | 低 |
| 复数与插值能力 | [调研记录](../design/governance/2026-11-18-i18n-component-and-mobile-research.md) §3.3 | 现插值仅单键 `replace`；新增带计数文案在 `ru` / `pl` 上会出错。**触发条件 = 出现第一条带计数的内建文案** | 低 |
| RTL（阿拉伯语）支持 | 用户需求 | **2026-11-18 用户裁定**：成本大收益低，**不随二期语言批量落地**，须单独立项评估（`dir` 贯通 / 18 个组件文件的物理方向属性 / 图标镜像 / RTL 回归基线）；RTL 语种不计入语言数量下限。**触发条件 = RTL 专项立项或出现 RTL 语种下游需求** | 低 |

### 1.5 移动端与响应式候选

| 候选 | 来源 | 说明 | 优先级 |
|------|------|------|--------|
| 滚动容器键盘聚焦「无条件完整可见」 | 实测发现 | Chromium 焦点滚动机制限制；触发条件：下游无障碍审计提出 | 低 |
| Toolbar 在 769–1023px 的容器收敛档 | 实测发现 | 与 ButtonGroup 同源的 md 档空档（换行 + `max-width: 100%` 均在 `@media (width <= 768px)` 内）；该区间内容超宽时同会溢出容器，本批夹具内容可容未致溢出；触发条件：出现真实溢出用例或用户裁定同档位补齐（口径与登记方式见[响应式设计 §2](../design/responsive.md)） | 低 |
| Picker（滚轮选择器）评估 | [调研记录](../design/governance/2026-11-18-i18n-component-and-mobile-research.md) §5；caomei-todo 架构 §11.5（外部仓库） | 移动端**形态差异件**：滚轮交互 + 触屏可用性，桌面 `Select` / `DatePicker` 无等价形态。**caomei-todo 一期先用 `DatePicker` / `TimePicker`，真机体验差再评估**。触发条件 = iOS 真机反馈或用户裁定启动评估。**2026-11-21 进展**：`TimePicker` 已内置滚轮模式（`mode="wheel"` / `"both"`），本候选收窄为**非时间场景的通用 Picker**；时间选择不再依赖本候选 | 中 |
| Sticky 吸顶工具 | [调研记录](../design/governance/2026-11-18-i18n-component-and-mobile-research.md) §5 | `position: sticky` 仅 DataTable 表头；列表分组头可用原生实现。**caomei-todo 分组列表不构成阻塞（其文档未提出吸顶诉求）**。触发条件 = 出现原生无法覆盖的吸顶用例（与 SafeArea 分列，避免两套口径） | 低 |
| 软键盘遮挡 | [调研记录](../design/governance/2026-11-18-i18n-component-and-mobile-research.md) §5.4 第 4 条 | 库内 `visualViewport` 0 处；当前口径是靠布局与滚动降级，不做视口监听。**caomei-todo 文档未提出该诉求**，真机是否被遮挡未取证。触发条件 = 真机反馈或用户裁定启动评估 | 低 |

### 1.6 基建与治理候选

| 候选 | 说明 | 优先级 |
|------|------|--------|
| 单 Demo 抽屉预览（P2） | [设备预览评估](../design/governance/2026-11-20-docs-device-preview-evaluation.md)：P1 整页预览已纳入 Phase 39（M6-1 / M6-2）；P2 单 Demo 抽屉未纳入本阶段，需 Demo 注册表与预览路由，约 3–4 天。**触发条件 = P1 落地后评估，或用户裁定** | 中 |
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
| `xl` 断点与宽屏布局规则 | [视口扩面评估](../design/governance/2026-11-20-viewport-matrix-expansion-evaluation.md) §4：`Col` 新增 `xl`（建议 ≥1536）并给容器宽度 / 分栏 / 表格密度等规则；属公共 API 增量，约 10–15 文件 / 3–5 天；**未定规则前不加空断点**。**触发条件 = 用户裁定或出现 1536+ 宽屏布局需求** | 中 |
| `conventional-changelog` `!` 补丁撤回 | 来源：issue #73 研判。**触发条件 = 升级 preset 后其 parser `headerPattern` 原生识别 `type(scope)!:`，且 `pnpm exec vitest run scripts/release/generate-changelog.test.mjs` 与 `pnpm changelog` 通过**；动作 = 删除 `generate-changelog.mjs` 的 `headerPattern` 覆盖，复跑定向测试并核对 `CHANGELOG.md` diff | 低 |
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

### 1.11 高级组件候选（管理端与效率向）

> 来源：[国际化、组件缺口与移动端调研](../design/governance/2026-11-18-i18n-component-and-mobile-research.md) §4（2026-11-18）。用户裁定「组件缺口后续列入计划完善」——本组只登记候选，**不立即启动、不分配阶段编号**。Reka 2.11.0 实测已导出对应 primitive（§4.1），封装成本主要在样式与文档。

| 候选 | 依据 | 优先级 |
|------|------|:-:|
| Tree / TreeSelect | 记录 **P1**；五库均有对应件（Vant `tree-select` / Varlet `tree-menu` 为近似件）；Reka `TreeRoot` 为 Alpha，需锁版本与回归 | 中 |
| Tour | 记录 **P2**；Element Plus `tour` / TDesign `guide` | 低 |
| Carousel | 记录 **P2**；五库均有（Vant / Varlet `swipe`、TDesign `swiper`）；已定 embla headless | 低 |
| Watermark | 记录 **P2**；Element Plus / TDesign / Vant / Varlet | 低 |
| Splitter | 记录 **P2**；Element Plus / PrimeVue；Reka `SplitterGroup` 现成 | 低 |
| Anchor | 记录 **P2**；Element Plus / TDesign；PrimeVue 无独立件（`animateonscroll` 为滚动动画指令） | 低 |
| QRCode | 记录 **P2**；仅 TDesign 有独立件，按下游需求再定 | 低 |
| ContextMenu / HoverCard / Menubar / NavigationMenu | 记录 **P2**；Reka 原语现成；PrimeVue 有 `contextmenu` / `menubar`；Varlet 仅有 `hover`，无 ContextMenu / Menubar | 低 |

- **不建议纳入**：App Shell（`container` / `aside` / `header`）与 `Overlay` / `Fab` / `List`（结论见 §3）；业务件（`address-*` / `coupon-*` / `contact-*`）与 `TreeTable` / `Knob` / `OrganizationChart`（见 [组件设计 §6](../design/components.md)）。
- **Sticky / SafeArea**：`Sticky` 工具形态仍登记在 §1.5；`SafeArea` 已于 2026-11-20 登记 Phase 38 M1-1 / M1-2，不在本表重复。`Sticky` 若最终按组件实现，再从 §1.5 迁入。
- **文档同步项**：已同批修正 [组件设计 §5](../design/components.md) 的 primitive 清单（补 `FormRoot` / `Field*`、`MonthPicker` / `YearPicker`、`Splitter`、`TreeVirtualizer`、`TagGroup`、`Listbox`），并把候选决策回链本表。

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
| Select 选项 `null` 值支持（以独立哨兵区分「未选择」） | momei 迁移反馈 2026-09-25 §1.2 | **不纳入**：`optionValue` 收窄为 `string \| number` 属有意契约（对齐 Reka 可稳定比较子集），非字符串 / 数字选项不渲染已在[设计规范 §7](../design/design-spec.md) 与 Select 组件页声明；支持 `null` 会改变「未选择」语义，须另立契约。开发期告警已于 2026-11-17 纳入 Phase 36 M4-1（插队）；`''` 的 opt-in 形态见 §1.1，与 `null` 支持属不同值域、同样须另立契约，评估见[上游反馈评估](../design/governance/2026-09-25-momei-upstream-feedback-evaluation.md) |
| App Shell / `Overlay` / `Fab` / `List`（应用外壳与组合件） | 三仓实测（2026-10-13，[范围扩展评估](../design/governance/2026-10-13-phase24-scope-extension-evaluation.md) §3.1 / §3.2） | **不纳入**：`v-app` / `v-main` / `v-toolbar` 属**应用层外壳**（本库以组件为单位提供，`Toolbar` 已覆盖工具栏语义）；`v-overlay` 与既有 Dialog / Drawer / Popover 的遮罩机制重复；`v-fab-transition`（悬浮按钮）与 `v-list`（列表）均可用既有容器 + 样式承接（@lucide/vue 提供图标）。触发条件 = 出现既有能力无法覆盖的真实用例时再评估 |
| 手势交互型移动件（PullRefresh / InfiniteScroll / SwipeCell / 图片捏合预览 / IndexBar / FloatingBubble / Signature） | [调研记录](../design/governance/2026-11-18-i18n-component-and-mobile-research.md) §5.3 C 类；caomei-todo 架构 §11.5 | **不纳入**：与[响应式设计 §1](../design/responsive.md) 的手势非目标一致，且需要独立的交互与测试体系；caomei-todo 明确在应用层用 Pointer Events 实现并保留可见按钮作为兜底与无障碍路径。触发条件 = 用户推翻手势非目标 |
| NumberKeyboard（自定义数字键盘） | [调研记录](../design/governance/2026-11-18-i18n-component-and-mobile-research.md) §5.3 A 类；caomei-todo 需求全文核对（2026-11-20） | **不纳入**：caomei-todo 一期需求未出现金额输入 / 验证码专用键盘条目，`InputNumber` + 系统键盘可覆盖。触发条件 = 出现必须自定义键盘的金额 / 验证码用例 |
| 全量 E2E 矩阵宽屏化（1536 / 1920 进入全量档） | [视口扩面评估](../design/governance/2026-11-20-viewport-matrix-expansion-evaluation.md) §4 | **不纳入**：新增两个全量档会使用例实例接近翻倍，周回归时长与 flaky 风险显著上升；定向档已能覆盖宽屏形态。触发条件 = 定向档连续漏检宽屏回归 |
