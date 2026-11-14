# 下一阶段范围评估（第十八轮）：Tooltip 提示体系、协作测试 T3 / T4、质量门禁与发布收口

> 创建时间：2026-11-14
> 触发：用户指令「开始规划下阶段待办」（Phase 33 归档、`1.3.0` 发布后，当前无进行中阶段）。
> 依据：[规划规范 §3（含第 10 条决策提问纪律）/ §4 / §6 / §9](../../standards/planning.md)（评估 → Backlog → 用户决策 → 登记；**编号只在授权启动时分配**）。
> 本文档只产出候选与建议，**不分配阶段编号、不登记 `todo.md`、不改 `backlog.md` 行、不启动任何批次**。

## 1. 事实盘点

### 1.1 候选池（`docs/plan/backlog.md` §1，只计数据行）

| 分组 | 条数 | 备注 |
|:---|:-:|:---|
| §1.1 组件增强 | 3 | Tooltip 增强（方案 C，中）/ DataTable `scrollable`（低，条件）/ DataTable 全表全选契约（低，条件） |
| §1.2 长尾组件 | 5 | Sidebar / ScrollPanel / BackTop / Rating / TimePicker，均低 |
| §1.3 不纳入自研 | 0 | — |
| §1.4 国际化 | 2 | 语言矩阵二期 / RTL，均低 |
| §1.5 移动端与响应式 | 2 | 滚动容器键盘聚焦 / Toolbar 769–1023 档，均低 |
| §1.6 基建与治理 | 12 | 含协作测试 T3（中）/ T4（低）与 7 项条件触发候选 |
| §1.7 服务层 | 1 | `useDialog`（评估结论：暂不实现） |
| §1.8 下游协同 | 1 | momei 侧迁移（等待外部反馈） |
| §1.9 图标体系 | 1 | I5 运行时 `@iconify/vue` peer（条件触发） |
| §1.10 动效体系 | 0 | A1 ~ A8 已全部登记并交付 |
| **合计** | **27** | 2026-11-14 读数（`awk` 按 `### 1.x` 分节计数据行） |

### 1.2 仓库与下游状态（2026-11-14 写录时点快照）

- `master` HEAD `6426046`（依赖同步批次）：**Test / Security Alerts / Pages / TODO / Push on master 全部 success**（`gh run list --limit 8`）。
- 版本面：`latest = 1.3.0`（tag `v1.3.0`，GitHub Release 到位）；`next` 仍为 `v1.0.0-rc.1`（未启用）。
  - `git rev-list --count v1.3.0..HEAD` → **9** 个提交，其中 `feat` **0** 个（`chore(deps)` 4 / `fix(release)` 2 / `docs` 3；`git log --pretty=%s v1.3.0..HEAD`）。
- 对外面：open PR **0** / open issue **0**（`gh pr|issue list --state open`）；Code Scanning open **0**；Dependabot open **1**（#69 `deepmerge` low，无 patched version；接受依据见[依赖告警处置记录](./2026-11-04-phase27-m4-4-dependency-alerts.md)，不在 Backlog）。
  - Phase 33 归档 §8 第 2 条记录的三个「许可证台账标题导致 Quality 红」的依赖 PR 已全部合并（`5eb3562` / `aa363fe` / `d7170d5` / `6426046`），当前无待处理项。
- 依赖大版本：`pnpm check:outdated-major` → 直接依赖落后项 **2** 项（`conventional-changelog` 7.2.1 → 8.1.3、`typescript` 6.0.3 → 7.0.2），**均为已登记的条件触发 / 阻塞项**，本轮无新增可升级项。
- 长期任务：待执行批次 **0** 项；未达门槛 → 条件触发 **1** 项（表单控件公共 props 契约后续候选）；已判定不纳入 **5** 项维持（[长期任务](../../plan/recurring.md) §2）。
- `.session/wisdom.md`：活跃 **12** 条（< 20，未达蒸馏阈值）。
- 下游：dependfix `1.0.0` / caomei-auth `1.2.0` / momei `1.0.0`；`1.3.0` 兼容矩阵 run `43590922508` 三仓 success，事后周回归 `43591838970` 三 job success。

### 1.3 条件触发项（本轮仍不构成可执行批次）

| 项 | 触发条件 | 现状 | 取证位置 |
|:---|:---|:---|:---|
| `glob` 跨 major 覆盖（GHSA-3g3m-2fjr-6pw4） | 上游支持 `glob ≥ 14.0.2` 且 `lint:md` / `docs:build` / `test:nuxt-smoke` 全绿 | 未满足 | [Backlog §1.6](../../plan/backlog.md) 行内公告编号；依赖链 `pnpm why glob` |
| `typescript` 7 | `vue-tsc` / `tsdown` 声明并实测支持 TS 7 原生 API | 未满足（包根导出仍缺 `createProgram` / `sys`） | [直接依赖大版本升级评估](./2026-11-13-dependency-major-evaluation.md)；`pnpm check:outdated-major` |
| `conventional-changelog` 8 | preset 发布 > 3.0.0 且模板 API 兼容 writer 9 | 未满足（preset 仍 3.0.0） | 同上评估记录；复跑判据 = `pnpm changelog` 无 `headerPartial is not a function` |
| CI 运行器镜像迁移（`ubuntu-26.04`） | 周级 e2e `Set up job` 的 `Image:` 命中 | 未命中 | [Phase 24 归档块](../../plan/todo-archive.md)（M2-1 检测义务）；run `43591838970` |
| 国际化二期 / RTL | 语言集扩容决策 / RTL 立项 | 未决策 | [Backlog §1.4](../../plan/backlog.md) 两行 |
| 长尾组件（Sidebar / ScrollPanel / BackTop / Rating / TimePicker） | 下游迁移排期出现真实用例 | 未出现 | [Backlog §1.2](../../plan/backlog.md) 各行；dependfix 迁移反馈快照 |
| DataTable `scrollable` / 全表全选契约 | 出现原生容器 / 父级受控无法覆盖的用例 | 未出现 | [Backlog §1.1](../../plan/backlog.md) 两行（下游 `env-events.vue` 1 处） |
| dev 形态 hydration 守护 | 首页结构 / 主题层新增客户端状态，或再现 hydration 可疑反馈 | 未触发 | [Backlog §1.6](../../plan/backlog.md) 行；[M2-2 记录](./2026-11-13-phase32-m2-2-home-hydration.md) §5 |
| 文档站示例外链守卫扩展 | 出现合法非图片外链用例 | 未满足 | [Backlog §1.6](../../plan/backlog.md) 行；[第八轮评估](./2026-10-13-next-stage-scope-evaluation-8.md) §3.9 |
| I5 运行时 `@iconify/vue` peer | 出现必须运行时按字符串加载的下游用例 | 未出现 | [Backlog §1.9](../../plan/backlog.md) 行；[图标体系调研](./2026-11-07-phase28-m4-1-icon-system-research.md) §5 |

### 1.4 本轮新候选（尚未登记载体）

| 编号 | 候选 | 来源 | 说明 |
|:---|:---|:---|:---|
| **N1** | 嵌套遮罩层级评估 | [遮罩协作调研](./2026-11-14-overlay-collaboration-research.md) §4.1（缺陷面）；2026-11-14 裁定「单独立项评估」的载体 = [治理索引](./index.md) 该调研摘要（评估时点另见 Backlog 的协作测试条目，已随登记移出） | **评估时点无 Backlog 载体行**（仅协作测试条目内的依赖注记）——属悬空指针，须登记。评估面 = 固定档位（overlay 1000 / content 1001）vs per-instance 层级栈；影响 z-index token 语义、既有视觉基线与 a11y。只评估，不含实现 |
| **N2** | `release.yml` 周回归结论机检接入 | [1.3.0 就绪度记录](./2026-11-14-phase33-m5-1-release-readiness.md) §7「待定」+ [Phase 33 归档](./2026-11-14-phase33-archive.md) §8 第 3 条 | 当前「发布前当周周回归须为绿」靠人工执行，`verify` 链不含 `test:visual`。候选 = 发布工作流触发前查询最近一次 `regression-weekly` run 结论，非 success 即中止（需 `actions: read`）。**会改变 `release.yml` 既有语义，须用户裁定** |

## 2. 候选逐条落点

> 落点 = 本建议中是否纳入；未纳入者保留在 Backlog（不改行）。「维持」= 结论不变、仍待触发或待决策。

| 候选 | 落点 |
|:---|:---|
| §1.1 Tooltip 增强（方案 C，U1 ~ U4） | **纳入（推荐）**：2026-11-14 用户已裁定采用方案 C；前置（Button / Tag / DataTable / Breadcrumb / Menu 缺截断 CSS）属本阶段内可交付项，无外部阻塞 |
| §1.1 DataTable `scrollable` / `scrollHeight` | 维持（条件候选：容器 + CSS 可承接） |
| §1.1 DataTable 全表 / 服务端全选契约 | 维持（条件候选：父级受控可承接） |
| §1.2 长尾组件 5 项 | 维持（无真实用例） |
| §1.4 国际化 2 项 | 维持（未决策） |
| §1.5 移动端 2 项 | 维持（触发条件未满足） |
| §1.6 文档站多版本托管 | 维持（2026-09-22 裁定暂不启动） |
| §1.6 ui-validator 资产 follow-up | 维持（描述未具体化，需先评估再定批次） |
| §1.6 Tailwind preset / Storybook | 维持（暂不启用） |
| §1.6 `conventional-changelog` 8 | 维持（条件触发，见 §1.3） |
| §1.6 文档站示例外链守卫扩展 | 维持（条件触发，见 §1.3） |
| §1.6 CI 运行器镜像迁移检测 | 维持（检测点未命中） |
| §1.6 `typescript` 7 | 维持（条件触发，见 §1.3） |
| §1.6 `glob` 跨 major 覆盖 | 维持（条件触发，见 §1.3） |
| §1.6 dev 形态 hydration 守护 | 维持（条件触发，见 §1.3） |
| §1.6 协作测试 T3：嵌套与焦点（C6 ~ C9） | **纳入（推荐）**：P0（T1 / T2）已于 Phase 33 交付，`overlay-collaboration.e2e.ts` 已存在；T3 = 同文件扩展，成本低于新建装置。C6 依赖 N1 结论（见 D2） |
| §1.6 协作测试 T4：打开态 axe（C10） | **纳入（推荐，待 D4）**：`scripts/docs/check-docs-axe.mjs` 已有页面矩阵 + 规则面 + 下界三层结构，扩打开态属既有装置演进 |
| §1.7 `useDialog` | 维持 |
| §1.8 momei 侧迁移 | 维持（等待外部反馈） |
| §1.9 I5 `@iconify/vue` peer | 维持（条件触发） |
| **N1（新候选）嵌套遮罩层级评估** | **建议登记并纳入**为评估条目（B1）；若 D2 改选「直接实现」，则登记后拆为「评估 + 实现」两条 |
| **N2（新候选）`release.yml` 周回归机检** | **建议登记**；是否纳入本阶段见 D4（不纳入亦保留候选行） |

> **候选覆盖声明**：§1.1 3 + §1.2 5 + §1.3 0 + §1.4 2 + §1.5 2 + §1.6 12 + §1.7 1 + §1.8 1 + §1.9 1 + §1.10 0 = **27 条，逐条均有落点，无静默豁免**；另 N1 / N2 为新候选（单列，不计入 27）。按组合并的行已逐项列名，可单独检索：§1.2 = Sidebar / ScrollPanel / BackTop / Rating / TimePicker；§1.4 = 语言矩阵二期 / RTL；§1.5 = 滚动容器键盘聚焦 / Toolbar 769–1023 档；§1.6 = 多版本托管 / ui-validator follow-up / Tailwind preset / Storybook / `conventional-changelog` 8 / 外链守卫扩展 / CI 镜像检测 / `typescript` 7 / `glob` override / dev hydration 守护 / T3 / T4。

## 3. 主线草案与推荐组合

| 主线 | 条目 | 规模 | 说明 |
|:---|:---|:---|:---|
| **A Tooltip 提示体系（方案 C）** | 5 | A1 ≈ 6 ~ 9 文件（hook 1 + Button 1 + 截断 CSS 1~2 + 视觉基线 PNG 2~4（不计入粒度阈值）+ 单测 1）；其余单条 ≤10 文件 | A1 = `useOverflowTooltip`（溢出判据 `scrollWidth > clientWidth + 1`、`ResizeObserver` + `document.fonts.ready` + slot 变化重测、SSR 降级）+ `CaomeiTooltip` 集成契约（Provider 兜底或迁移前置）+ **Button**（icon-only / overflow + 截断 CSS + 视觉基线）；A2 = P0 其余 Toolbar / Paginator / Dialog·Drawer 关闭 / SplitButton；A3 = P1 **icon-only** 面（Select 族清除、InputNumber 步进、Password 显隐、FileUpload、ColorPicker、DatePicker 触发器、Image 预览、Alert·Message 关闭）；A4 = P1 **overflow** 面 + 截断前提（DataTable / Tag / Breadcrumb / Menu 的 `nowrap + max-width + ellipsis` 与基线重冻结）；A5 = 文档站 Provider 放置、中英示例、迁移说明（接入组件不再透传原生 `title`）。**验收** = 真实 Chromium（几何 + `aria-describedby` + 无 `title` 属性）、未溢出时面板不挂载、`iconOnly` 无 `label` 开发期告警、SSR 不显示、可访问名不变 |
| **B 协作测试 T3（C6 ~ C9）** | 3 | 评估 1 文件；用例约 4 条（并入既有 spec） | B1 = 嵌套遮罩层级评估（只评估，产出结论与判定表）；B2 = C7（Toast 在 Dialog 之上，探针先行）/ C8（焦点陷阱 + portal 浮层）/ C9（CDP 触摸滚动，`hasTouch: true`）；B3 = C6（嵌套 Dialog / Drawer → Dialog，Esc 分层 + body 锁 + 焦点归还），**断言不得假定 z-index 递增**，实现与否则取决于 B1 结论（D2）。**验收** = 真实指针 / 真实触摸事件 + 计算样式 + 命中测试，关键用例配负向对照 |
| **C 质量门禁与 a11y** | 2 | T4 1 文件 + 夹具；N2 1 工作流 + 断言脚本 | C1 = T4 打开态 axe（docs axe 矩阵 +1 页：Dialog + Select 打开态；规则白名单 `aria-hidden-focus` / `aria-dialog-name` / `aria-modal`；最小适用节点下界；打开态交互步骤）；C2 = `release.yml` 周回归机检（触发前查询最近 `regression-weekly` run，非 success 中止；负向验证 = 伪造非 success 结论必须失败）。**C2 仅在 D4 通过时成立** |
| **D 发布收口** | 1 | 发布链 | 阶段收口发布 **预计 `1.4.0`**（A 的 `feat` 提交驱动 minor；当前 `v1.3.0..HEAD` 无 `feat`，**版本号以实际提交为准、不预写**）；按[发布指南](../../guide/release.md)手动触发，发布前执行长期任务门槛复核轮与 API 差分。**验收** = 发布后校验 + 下游兼容 run success |

> **各主线非目标**（[规划规范 §6](../../standards/planning.md)）：A = 不改 Tooltip / Popover 的语义边界、不把标题语义 `title` prop（`Alert` / `Card` / `Dialog` / `Drawer` / `Message` / `Accordion`）纳入提示体系、不为未列入 P0 / P1 的组件补 tooltip；B = 不覆盖 Popover / DropdownMenu / MultiSelect / Toast 的浮层矩阵、不在 happy-dom 做几何断言、不修 §4.1 两项待判定缺陷（只出评估结论）；C = 不宣称「整站 a11y 合规」、不把 `focus-order-semantics` 等 best-practice 规则纳入、不改变 `verify` 链构成（C2 只加发布前置查询）；D = 不启用自动发布、不改变 `release.config.js` 与发布触发模型。

**推荐组合（倾向 ①，待 D0 显式授权）**：**A + B + C + D = 4 条主线 / 11 条原子条目**（5 + 3 + 2 + 1）。**该计数按 D1 ~ D4 全部默认落定计算**；任一项改选后按 §4 各选项标注的增减重算。

- 理由：A 是唯一已由用户裁定方向、且无外部前置的内容主线（工具链 / 依赖面本轮无新增可升级项，见 §1.2）；B 复用既有 `overlay-collaboration` 装置，覆盖 Phase 33 明确留后的 P1 风险；C 补发布门禁的人工依赖与文档站打开态 a11y 空白；D 让 A 的 `feat` 提交落地。
- 备选（更小但仍在 §6 容量内）：**A + B + D**（3 主线 / 9 条，C 留 Backlog）；**A + C + D**（3 主线 / 8 条，B 留 Backlog）。
- 不建议：长尾组件 / 国际化二期 / RTL —— 无真实下游用例；DataTable 两项契约 —— 触发条件未满足。

## 4. 待用户裁定（D0 ~ D4）

| 编号 | 问题 | 选项 | 默认落定 |
|:---|:---|:---|:---|
| **D0** | 是否授权登记下一阶段（条数按 D1 ~ D4 默认落定计） | ① 推荐组合 A + B + C + D（4 主线 / 11 条）② A + B + D（3 主线 / 9 条，C 留 Backlog）③ A + C + D（3 主线 / 8 条，B 留 Backlog）④ 暂不启动，仅保留评估 | **—（授权类不设默认，须用户显式裁定；倾向 ①）** |
| **D1** | Tooltip 范围（方案 C 已定，此处只定批次） | ① U1 ~ U4 全量（A1 ~ A5，5 条）② 仅 P0（A1 + A2）+ 文档 A5（3 条；组合合计 −2）③ 仅 U1 探路（1 条；组合合计 −4，其余留 Backlog） | **①**（用户 2026-11-14 已裁定采用方案 C；②/③ 会让「截断前提」长期悬空） |
| **D2** | 嵌套遮罩层级（N1 / C6 前置） | ① 先评估、按结论决定（B1 先行，C6 视结论；若结论为实现则实现转下一阶段）② 直接实现 per-instance 层级栈（改 z-index token 语义 + 基线重冻结；B 由 3 条变 4 条，组合合计 +1）③ 维持固定档位，T3 只做 C7 ~ C9（C6 不做、B1 降级为仅登记；B 由 3 条变 1 条，组合合计 −2） | **①**（层级变更影响 token 语义与全部浮层视觉基线，不宜与 Tooltip 视觉改动同批） |
| **D3** | 发布节奏 | ① 阶段收口发布（版本由 `feat` 实际提交计算，预计 `1.4.0`；无可发布变更则跳过）② 本阶段不发布，继续积累 ③ 阶段中提前发布 | **①**（`1.3.0` 发布于 2026-11-14；本阶段收口按周节奏排期，届时距上次发布 ≥1 周） |
| **D4** | 质量门禁两项 | ① C1（T4 打开态 axe）+ C2（`release.yml` 周回归机检）都纳入 ② 仅 C1（C 由 2 条变 1 条，组合合计 −1）③ 仅 C2（同上 −1）④ 两项仅登记 Backlog，不进本阶段（−2） | **①**（C2 补的是 Phase 33 已登记的人工门禁缺口；若担心改 `release.yml` 语义可选 ②） |

## 5. 风险与前置

1. **Tooltip 双提示**：接入组件必须剥离原生 `title`（或文档声明不再透传），否则系统 tooltip 与组件 tooltip 并存；下游显式使用 `title` 的页面须给迁移说明（A5）。
2. **Provider 缺失即运行时报错**：组件内建 tooltip 后，未放置 `CaomeiTooltipProvider` 的下游页面会抛错——A1 必须先定「内建 Provider 兜底」或「列为迁移前置」并写进文档站与发布说明。
3. **溢出检测时机**：字体加载、容器 resize、slot 文本变化、`v-if` 挂载都要重测（`ResizeObserver` + `fonts.ready` + `nextTick`）；SSR 一律不显示。
4. **截断前提会改视觉**：Button / Tag / DataTable / Breadcrumb / Menu 补 `nowrap + max-width + ellipsis` 属可见变更，须同批重冻结视觉基线并在 release note 声明。
5. **a11y 边界**：tooltip 不能替代 `aria-label` / 可见文本；`iconOnly` 未传 `label` 时 Button 不补可访问名，须同时加开发期告警；`disabled` 元素不触发 pointer 事件，触发器可能需外层包裹（Reka / Radix 已知边界）；移动端只在键盘 focus 出现。
6. **嵌套层级评估不得顺手改 token**：`--caomei-z-overlay` / `--caomei-z-modal` 的固定档位被 `check:overlay-z-index` 与视觉基线共同约束；B1 只出结论（判定表 + 影响面 + 建议），实现另行登记。
7. **C6 断言口径**：现状无 per-instance 递增，断言不得假定层级递增；若 D2 ③，须把「固定档位」写成现状契约而非缺陷豁免。
8. **T4 的风险是「空检查」**：docs axe 增加打开态后，必须同时给「规则 × 最小适用节点数」下界与页面就绪选择器，否则规则不适用会被当成零违规。
9. **C2 改 `release.yml` 语义**：需要 `actions: read` 权限与网络查询；查询失败必须 fail-closed（不得当作通过），并与「发布前置门禁」文档同批修订。
10. **发布**：预计 `1.4.0`，由 semantic-release 按 `feat` 提交计算；`v1.3.0..HEAD` 当前 `feat` 为 0，若 A 全部为 `fix` / `refactor` 则实际版本可能为 patch——版本号以提交为准，不预写。
11. **编号纪律**：本轮不分配编号；授权启动时取当前最大编号 + 1。

## 6. Review Gate

- **audit-depth**：R1 `standard`（规划评估 + 候选盘点 + 决策点，无代码改动，时间盒 ≤ 10 分钟）、R2 `quick`（只复查修复点，≤ 5 分钟）。
- **R1**（`standard`，实测约 8 分钟，未超时）：`Reject`（1 blocker / 5 warning / 5 suggest）。
  - blocker：D3 默认落定写「距 `1.3.0` 已满一周」，与发布时点（2026-11-14）冲突 → 改为「收口按周节奏排期，届时距上次发布 ≥1 周」的可判定表述。
  - warning：D0 ② 的 A + D 只有 2 条主线，低于[规划规范 §6](../../standards/planning.md) 下限 → 改为 A + B + D / A + C + D 两组 3 主线组合；D1 ~ D4 改选与「11 条」基数未联动 → 各选项标注增减并注明基数按默认落定计算；§3 缺「非目标」→ 补 A ~ D 四段；N1 锚点写作不存在的 `M6 记录 §56` → 改指调研 §4.1 + 索引摘要 + Backlog T3 行；#69 包名在归档与本记录两套口径 → 按 §9「错写于出证时点 → 修」订正归档。
  - suggest：提交构成改为 `chore(deps)` 4 / `fix(release)` 2 / `docs` 3；`1.4.0` 统一为「预计」并以提交为准（索引摘要去掉版本号）；补 A1 文件面估算与基线 PNG 豁免口径；`deepmerge` 接受依据补载体；§1.3 增「取证位置」列。
- **R2**（`quick`，实测约 4 分钟，未超时）：`Pass`（0 blocker / 0 warning / 1 suggest）——R1 一项 blocker、五项 warning 与五项 suggest 全部关闭；新增 suggest 为归档「处置完毕」措辞改写点时记录 → 已改为「归档时点待人工处理 + 指向本记录 §1.2」。
- **复查基线**：本记录 §1 ~ §5；`docs/design/governance/index.md` 首条摘要；`docs/design/governance/2026-11-14-phase33-archive.md` §8 第 2 条；`.session/runtime-state.json` 的 `backlog_count = 27`（gitignored）。
