# 下一阶段范围评估（第十七轮）：依赖工具链升级、下游适配、组件增强与质量守卫、发布收口

> 创建时间：2026-11-13
> 触发：用户指令「开始下阶段规划」（Phase 32 归档后，当前无进行中阶段）。
> 依据：[规划规范 §3（含第 10 条决策提问纪律）/ §4](../../standards/planning.md)（评估 → Backlog → 用户决策 → 登记；**编号只在授权启动时分配**）。
> 本文档只产出候选与建议，**不分配阶段编号、不登记 `todo.md`、不修改 `backlog.md` 行、不启动任何批次**。

## 1. 事实盘点

### 1.1 候选池（`backlog.md` §1，只计数据行）

| 分组 | 条数 | 备注 |
|:---|:-:|:---|
| §1.1 组件增强 | 6 | 含 2026-11-13 新增「DataTable 分页状态保持」（下游实测，优先级中） |
| §1.2 长尾组件 | 5 | Sidebar / ScrollPanel / BackTop / Rating / TimePicker，均低 |
| §1.3 不纳入自研 | 0 | — |
| §1.4 国际化 | 2 | 二期语言集 / RTL，均低 |
| §1.5 移动端与响应式 | 2 | 滚动容器键盘聚焦 / Toolbar 769–1023 档 |
| §1.6 基建与治理 | 14 | 含 2026-11-13 新增 5 项直接依赖大版本（`eslint` 10 / `vitest` 5 / `stylelint` 18 / `fontkit` 3 / `typescript` 7） |
| §1.7 服务层 | 1 | `useDialog`（评估结论：暂不实现） |
| §1.8 下游协同 | 1 | momei 侧迁移（等待外部反馈） |
| §1.9 图标体系 | 1 | I5 运行时 `@iconify/vue` peer（条件触发） |
| §1.10 动效体系 | 0 | A1 ~ A8 已全部登记并交付 |
| **合计** | **32** | 2026-11-13 读数（26 + DataTable 分页 1 + 依赖大版本 5） |

### 1.2 仓库与下游状态

- `master` HEAD `48fcbfa`（Phase 32 归档批次）：**Test / Security Alerts / CodeQL / Pages / TODO 全部 success**；全量单测 3153 passed / 162 文件（写录时点快照，`pnpm test`）。
- 版本面：`latest = 1.2.0`（2026-11-08 发布）；`git rev-list --count v1.2.0..48fcbfa` → **84** 个提交（写录时点快照；含依赖自动合并、Phase 31 / 32 交付与文档站改动；其中 `feat` 20 个）。
- 对外面：open PR **0** / open issue **0** / Code Scanning **0**；Dependabot open **1**（#69 `deepmerge` low，无 patched version，已接受登记）。
- 下游：dependfix `1.0.0` / caomei-auth `1.2.0` / momei `1.0.0`（2026-11-12 读数）；扩容后兼容矩阵 run `43211984429` 三仓 success。
- 文档站：`pnpm docs:check:links` / `pnpm docs:check:integrity` 全绿；axe 抽检矩阵 5 页 / 2 条规则；`docs:build` 与视觉基线在 Phase 32 内均通过。
- 长期任务：待执行批次 **0 项**；条件触发 **1 项**（表单控件公共 props 契约后续候选）；已判定不纳入 5 项维持；wisdom 活跃 9 条（< 20）。

### 1.3 条件触发项（本轮不构成可执行批次）

| 项 | 触发条件 | 现状 |
|:---|:---|:---|
| `glob` 跨 major 覆盖（GHSA-3g3m-2fjr-6pw4） | 上游支持 `glob ≥ 14.0.2` 且 `lint:md` / `docs:build` / `test:nuxt-smoke` 全绿 | 未满足 |
| `typescript` 7 | `vue-tsc` / `tsdown` 声明并实测支持 TS 7 原生 API | 未满足（包根导出缺 `createProgram` / `sys`） |
| `conventional-changelog` 8 | preset 发布 > 3.0.0 且模板 API 兼容 writer 9 | 未满足（preset 仍 3.0.0） |
| CI 运行器镜像迁移（`ubuntu-26.04`） | 周级 e2e `Set up job` 的 `Image:` 命中 | 未命中 |
| 国际化二期 / RTL | 语言集扩容决策 / RTL 立项 | 未决策 |
| 长尾组件（Sidebar / BackTop / Rating / TimePicker） | 下游迁移排期出现真实用例 | 未出现 |

## 2. 候选逐条落点

> 落点 = 本建议中是否纳入；未纳入者保留在 Backlog（不改行）。「维持」= 结论不变、仍待触发或待决策；「可选」= 质量主线备选，未纳入推荐组合，仍留 Backlog（本轮修订后已无此档）。

| 候选 | 落点 |
|:---|:---|
| §1.1 DataTable 分页状态保持（`autoResetPageIndex`） | **纳入（推荐）**：下游实测需求 + 改动面小 + 无技术前置；默认值待 D2 裁定 |
| §1.1 Select `null` 选项开发期告警 | **纳入（推荐）**：开发期 `warnDev` 告警，零运行时行为变更 |
| §1.1 ColorPicker 色板导航增强 | **纳入（推荐）**：色板改 `radiogroup` + `aria-checked` + roving tabindex；无障碍语义增强，无 TypeScript 公共 API 变更。**依据：用户指令扩大范围（2026-11-13），原触发条件（下游启用 `swatches` 且键盘密集场景）与 2026-09-20「不达标」判定由 D0 裁定覆盖** |
| §1.1 Paginator 页码报表 | **纳入（推荐）**：新增 `#report` 插槽（作用域 `page / pages / total`），承接下游 4 处模板报表；属公共 API **增量**。**依据：用户指令扩大范围（2026-11-13），原触发条件「必须内建模板」由 D0 裁定覆盖** |
| §1.1 DataTable `scrollable` / 全表全选契约 | 维持（条件候选：原生容器 / 父级受控可承接） |
| §1.2 长尾组件 5 项 | 维持（无真实用例） |
| §1.4 国际化 2 项 | 维持（未决策） |
| §1.5 移动端 2 项 | 维持（触发条件未满足） |
| §1.6 `eslint` 10 升级 | **纳入（推荐）**：最小探针已过，配置链 peer 允许 `^10` |
| §1.6 `vitest` 5（含 coverage 5） | **纳入（推荐）**：Node / Vite 前置满足，未发现受影响 API |
| §1.6 `stylelint` 18（配对 config 1.1） | **纳入（推荐）**：最小探针已过，须同批升级 config |
| §1.6 `fontkit` 3 升级 | **纳入（推荐）**：唯一调用面 `test/visual/font-coverage.ts`；安装须官方 registry |
| §1.6 Calendar / RTE 交互边界对比度 | **纳入（推荐）**：两者加入 `preset-contrast.e2e.ts` 边界矩阵并按 3:1 断言；**本轮即构成该行触发条件所指的「下一轮颜色 / 非文本对比度治理」** |
| §1.6 ui-validator 资产 follow-up | 维持（描述未具体化，需先评估再定批次） |
| §1.6 文档站示例外链守卫扩展 | 维持（触发条件未满足） |
| §1.6 多版本托管 / Storybook / Tailwind preset | 维持 |
| §1.6 `typescript` 7 / `glob` override / CI 镜像 / `conventional-changelog` 8 | 维持（条件触发，见 §1.3） |
| §1.7 `useDialog` | 维持 |
| §1.8 momei 侧迁移 | 维持（等待外部反馈） |
| §1.9 I5 `@iconify/vue` peer | 维持（条件触发） |
| **N1（新候选）文档站 transition 副本守卫** | 来源：[M3-1 记录](./2026-11-13-phase32-m3-1-demo-transition.md) §4.2——demo 层 25 条 transition 是组件源的手工副本，无守卫。建议**登记并纳入**质量主线（对齐 `check:demo-keyframes` 的机检形态） |
| **N2（新候选）dev 形态 hydration 守护** | 来源：[M2-2 记录](./2026-11-13-phase32-m2-2-home-hydration.md) §5 第 3 条——生产构建无告警，dev 真机对照是一次性流程。建议**仅登记**，触发条件 = 首页结构或主题层新增客户端状态 |
> **候选覆盖声明**：§1.1 6 + §1.2 5 + §1.3 0 + §1.4 2 + §1.5 2 + §1.6 14 + §1.7 1 + §1.8 1 + §1.9 1 + §1.10 0 = **32 条，逐条均有落点，无静默豁免**；另 N1 / N2 为新候选（单列，不计入 32）。按组合并的行已逐项列名，可单独检索：§1.2 = Sidebar / ScrollPanel / BackTop / Rating / TimePicker；§1.4 = 语言矩阵二期 / RTL；§1.5 = 滚动容器键盘聚焦 / Toolbar 769–1023 档；§1.6 聚合行 = 多版本托管 / Storybook / Tailwind preset 与 `typescript` 7 / `glob` override / CI 镜像 / `conventional-changelog` 8。


## 3. 主线草案与推荐组合

| 主线 | 条目 | 规模 | 说明 |
|:---|:---|:---|:---|
| **A 依赖与工具链升级** | 4 | 4 ~ 8 文件 / 批 | `eslint` 10、`vitest` 5、`stylelint` 18（+ config 1.1）、`fontkit` 3；逐条独立提交。**登记前须 `pnpm check:outdated-major` 复算，任一项已不在列则从 A 移除并说明**；验收 = `lint:check` / `test` + `test:coverage` / `lint:css:check` / `test:visual` 零 error、不放宽规则与 ignore |
| **B 下游适配** | 1 | 2 ~ 4 文件 | DataTable `autoResetPageIndex` 透传 + 中英文档口径（受控 page 的刷新语义、数据缩水回收空页）；验收 = 组件单测覆盖默认 / 开关两态、中英文档同批、`capture:styles` 0 差异 |
| **C 组件增强与可访问性** | 3 | ① 3~5 文件 / ② 2~3 文件 / ③ 4~6 文件（单条均 ≤10） | ① ColorPicker 色板 `radiogroup` + `aria-checked` + roving tabindex（方向键 / Home / End），验收 = 键盘交互断言 + a11y 用例 + 组件页与 en-US 同步；② Select 选项解析为 `null` / `undefined` 时**仅开发期** `warnDev`（生产静默、不改变解析结果），验收 = 单测断言告警调用与生产静默；③ Paginator `#report` 插槽（作用域 `page / pages / total`，公共 API 增量），验收 = 插槽作用域 / `total = 0` 空数据 / SSR 用例 + API 表与中英文档同批（含改写既有「不提供插槽」表述） |
| **D 质量守卫与对比度** | 2 | 4 ~ 8 文件 + 可能的 token 修正 | ① N1 transition 副本守卫（数据源 = M3-1 §2 的 25 行清单，比较维度 = 选择器 → 基础层 `transition` 属性名集合，豁免 = `expressive` 专属与 Portal 手势，带负向用例，受检面下界 25）；② Calendar / RichTextEditor 交互边界加入 `preset-contrast.e2e.ts` 边界矩阵并按 3:1 断言，验收 = 改 token 后 **6 预设 × 明暗 × 2 背景全绿**，阈值不放宽 |
| **E 发布收口** | 1 | 发布链 | `1.3.0` 发布（含 Phase 32 累积 + 本阶段变更），按[发布指南](../../guide/release.md)手动触发；判据 = `v1.2.0..48fcbfa` 含 20 个 `feat` 提交（semantic-release 判 minor）；验收 = 发布后校验 + 下游兼容 run success |

**推荐组合（倾向 ①，待 D0 显式授权）**：**A + B + C + D + E = 5 条主线 / 11 条原子条目**（4 + 1 + 3 + 2 + 1）。

- 理由：A 是 2026-11-13 评估已探针验证、零设计取舍的技术债清理；B 有下游实测需求；C 取「用户指定扩充 + 既有契约 / 下游用量」的三项组件增强（色板 a11y / 选项告警 / 分页报表）；D 补 Phase 32 登记的漂移风险与既有对比度缺口；E 让 84 个未发布提交与 Phase 32 改动落地。
- 备选（若希望更小）：**A + B + E**（4 + 1 + 1 = 6 条），C / D 留在 Backlog。
- 不建议：能力扩展（长尾 / i18n 二期 / RTL）——无真实下游用例，且与「质量收口」取向不一致。

## 4. 待用户裁定（D0 ~ D4）

| 编号 | 问题 | 选项 | 默认落定 |
|:---|:---|:---|:---|
| **D0** | 是否授权登记下一阶段 | ① 按推荐组合登记（5 主线 / 11 条）② 取小组合 A + B + E（6 条）③ 仅组件与质量 C + D（5 条；发布转下一阶段，D1 改选 ②）④ 最小组合 A + E（5 条）⑤ 暂不启动，仅保留评估 | **—（授权类不设默认，须用户显式裁定；倾向 ①）** |
| **D1** | 发布节奏 | ① 阶段收口发布 `1.3.0`（含 Phase 32 累积）② 本阶段不发布，继续积累 ③ 阶段中提前发布 | **①**（距上次发布 5 天，`v1.2.0..48fcbfa` 84 个提交；实际发布仍按发布指南手动触发） |
| **D2** | DataTable `autoResetPageIndex` 默认值 | ① 透传开关，默认保持现状（不引入行为变更）② 默认关闭重置（行为变更，需迁移说明） | **①** |
| **D3** | 新候选处置 | ① N1 登记并纳入 **D** 主线，N2 仅登记 ② 两者仅登记 ③ 两者均不登记 | **①** |
| **D4** | 条件触发项与长尾 / 国际化 | ① 全部维持现状 ② 纳入 Sidebar ③ 纳入国际化二期 ④ 纳入 RTL | **①** |

## 5. 风险与前置

1. **`stylelint` 18 + config 1.1 必须同批**：v18 有 13 项破坏性变更，配置包 peer 为 `^18`；分两次升级会产生不可绿的中间态。
2. **`eslint` 10 的规则与引擎面**：移除 eslintrc、Node 引擎要求提升、RuleTester 断言收紧；验收以 `pnpm lint:check` 零 error / warning 为准，不放宽 ignore 与规则。
3. **`fontkit` 3 的安装源**：本机镜像缺 `dfa@2.0.0`，须走官方 registry；CI 不受影响，但本地验证需确认 `npm_config_registry`。
4. **`vitest` 5 的 mock 语义**：默认每例前清 mock、异步断言未 await 判失败——若存量用例依赖旧语义会暴露，属预期收口。
5. **发布窗口**：`1.3.0` 由 semantic-release 计算（`feat` 提交驱动 minor）；发布前须执行长期任务门槛复核轮与 API 差分校验。
6. **B 的行为面**：`autoResetPageIndex` 与排序 / 筛选 / 分组同源重置，文档须写清「受控 page + 忽略刷新期间 `update:page`」的完整口径，不能只写「刷新」。
7. **C 主线的 API / 行为面**：Paginator `#report` 为公共 API 增量（须 API 差分与中英文档同步），并须**改写组件页既有「分页器不提供内建报表 / 模板插槽」的两处表述与 en-US 对应页**，Backlog 迁出时保留原否定判定；ColorPicker 色板由 `aria-pressed` 改为 `radiogroup` + `aria-checked` 属无障碍语义变更（键盘模型由 Tab 逐项改为 roving tabindex + 方向键），须同步 a11y 用例、组件文档与 1.3.0 release note；Select 告警仅开发期，不得影响生产输出。
8. **D 主线的对比度**：Calendar 导航按钮与 RTE 容器描边当前 < 3:1，纳入矩阵后可能**首次失败**——须按设计裁定改色（token 级），而非放宽阈值。
9. **编号纪律**：本轮不分配编号；授权启动时取当前最大编号 + 1。

## 6. Review Gate

- **audit-depth**：R1 `standard`（规划评估 + 候选盘点 + 决策点，≤10 分钟），R2 `quick`（只复查修复点）。
- **R1**（`standard`）：`Reject`（2 blocker / 7 warning / 6 suggest）。
  - blocker：① §2 缺规划规范 §9 强制的「候选覆盖声明」→ 补逐小节计数 + 聚合行列名 + N1/N2 单列 + 「逐条均有落点，无静默豁免」；② D0 作为授权类决策被赋予默认值 → 改为「不设默认，须显式裁定」。
  - warning：门禁读数口径不明 → 改「命令 + 全绿」并标注写录时点快照；84 提交未钉区间 → 补 `git rev-list --count v1.2.0..48fcbfa`；依据引用不存在的 §10 → 改 §3（含第 10 条）；A 主线缺 `check:outdated-major` 复算前置 → 已补；聚合行不可单独检索 → 覆盖声明逐项列名；§6 占位 → 本段；`.session` 的 `backlog_count` 漂移 26 → 32。
  - suggest：C 主线补数据源 / 比较维度 / 豁免 / 下界；§5 补 `eslint` 10 风险；§2 legend 补「可选」；标题补副标题；索引摘要去掉分组明细；B / C / D 补最小验收标准。
- **R2**（`quick`）：**Pass**（0 blocker / 1 warning / 0 suggest）——R1 两项 blocker 与七项 warning 全部关闭；warning 为 §3 仍写「默认落定」与 D0 口径矛盾 → 已改「倾向 ①，待 D0 显式授权」。
- **R3（范围扩展修订，`standard`）**：`Reject`（2 blocker / 5 warning / 5 suggest）——① D3 ① 仍指向已改名的「C 主线」→ 改为 **D** 主线；② ColorPicker / Paginator 升为「纳入」未记录触发条件覆盖 → 两行补「依据：用户指令扩大范围（2026-11-13），原触发条件由 D0 裁定覆盖」，C 理由同步改为「用户指定扩充 + 既有契约 / 下游用量」。warning：D0 ③ 与 D1 默认发布冲突 → 注明「发布转下一阶段，D1 改选 ②」；C 验收不足以逐条判定 → 拆为三条独立验收（键盘断言 / 生产静默 / 插槽作用域与空数据）；Paginator 未覆盖组件页既有「不提供插槽」结论 → §5.7 补改写要求；D 规模未计 token 修正 → 补「+ 可能的 token 修正」与「6 预设 × 明暗 × 2 背景全绿」；标题未覆盖 C / D → 补副标题。suggest：legend「可选」档、`无 TypeScript 公共 API 变更`、对比度触发说明、C 文件数逐条、§6 回填。
- **R4**（范围扩展修订复审，`quick`）：`Pass`（0 blocker / 0 warning）——R3 两项 blocker 与五项 warning 全部关闭；D0 ③ 与 D1 已自洽、D3 与 §3 一致、标题 / 索引 / §3 / §4 / §5 同口径。
- **复查基线**：本记录 §1 ~ §5；`docs/design/governance/index.md` 新增条目；`.session/runtime-state.json` 的 `backlog_count`（gitignored）。
