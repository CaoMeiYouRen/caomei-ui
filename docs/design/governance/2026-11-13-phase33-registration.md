# Phase 33 登记批次

> 创建时间：2026-11-13
> 触发：用户就[下一阶段范围评估（第十七轮）](./2026-11-13-next-stage-scope-evaluation-17.md) §4 的 D0 ~ D4 作出裁定：**D0 ① 按推荐组合登记 / D1 ① 阶段收口发布 `1.3.0` / D2 ① 透传开关且默认保持现状 / D3 ① N1 登记并纳入、N2 仅登记 / D4 ① 条件触发项与长尾 / 国际化全部维持**。
> 依据：[规划规范 §3 / §4 / §7](../../standards/planning.md)（阶段编号只在**授权启动**时分配；登记 = 用户决策后同步全部载体）。
> **本记录是该次登记的唯一口径载体**：`todo.md` / `roadmap.md` / `backlog.md` / 治理索引只引用本记录的结论。

## 1. 编号分配与构成

- **编号**：取授权启动时已有最大编号（Phase 32）+ 1 = **Phase 33**。
- **阶段名**：依赖与工具链升级、下游适配、组件增强与质量守卫、发布收口（D0 ① + D1 ①）。
- **构成（5 条主线 / 11 条原子条目）**：依赖与工具链 **4** + 下游适配 **1** + 组件增强与可访问性 **3** + 质量守卫与对比度 **2** + 发布收口 **1**；对账 **4 + 1 + 3 + 2 + 1 = 11**。
- **提名期标签映射**：评估期 A → M1、B → M2、C → M3、D → M4、E → M5。
- **候选池变化**：`backlog.md` §1 由 **32 → 24**（移出 9 行：§1.1 4 行 = ColorPicker / Select 告警 / Paginator 报表 / DataTable 分页状态保持；§1.6 5 行 = `eslint` 10 / `vitest` 5 / `stylelint` 18 / `fontkit` 3 / Calendar-RTE 对比度）；**N1 transition 副本守卫**为本轮新候选、未入池即登记；**N2 dev 形态 hydration 守护**登记为候选（§1.6 +1）。§1.1 6 → 2、§1.6 14 → 10。
- **发布**：本阶段**收口发布 `1.3.0`**（D1 ①）；判据 = `v1.2.0..HEAD` 含 **20 个 `feat`** 提交（semantic-release 判 minor）；发布仍按[发布指南](../../guide/release.md)手动触发，release note 落 `docs/release-notes/1.3.0.md`，发布前执行长期任务门槛复核轮与 API 差分校验。
- **原否定判定与覆盖**：ColorPicker 色板「2026-09-20 M2-1 判定：不达标」、Paginator 报表「条件候选 / 触发条件 = 必须内建模板」两项原判定，均由用户 D0 ① 裁定覆盖后纳入；判定原文保留在[第十七轮评估](./2026-11-13-next-stage-scope-evaluation-17.md) §2。

## 2. 逐条范围与验收口径

| 条目 | 主线 | 范围 | 验收口径 |
|:---|:---|:---|:---|
| **M1-1** | 依赖与工具链 | `eslint` 9.39.2 → **10.14.0**（配置链 peer 已允许 `^10`；移除 eslintrc / 废弃规则 API / RuleTester 收紧） | `pnpm lint:check` 零 error / 零 warning；不放宽规则与 ignore；`eslint-config-cmyr` 不变（除 peer 必需） |
| **M1-2** | 依赖与工具链 | `vitest` 4.1.12 → **5.1.0** + `@vitest/coverage-v8` 同版本 | `pnpm test`、`pnpm test:coverage` 全绿；覆盖率口径与阈值不变；默认清 mock / 未 await 断言的暴露面逐条处置 |
| **M1-3** | 依赖与工具链 | `stylelint` 17.16.0 → **18.0.0** + `stylelint-config-cmyr` **1.1.0**（**必须同批**） | `pnpm lint:css:check` 零 error；受检文件数与 glob 和改动前一致（不缩面）；不放宽规则 |
| **M1-4** | 依赖与工具链 | `fontkit` 2.0.4 → **3.0.0**（ESM-only；唯一调用面 `test/visual/font-coverage.ts`） | `pnpm test:visual` 除既有 6 项字体族失败外**零失败**，且失败集合与改动前一致（基线 36 passed / 6 failed，按实测快照核对）；本地安装走官方 registry |
| **M2-1** | 下游适配 | DataTable 透传 `autoResetPageIndex`（与上游同名，**默认保持现状**，D2 ①）；中英文档补「刷新不保留页码需受控 page + 忽略刷新期间 `update:page`、数据缩水时父级回收空页」与 `v-model:rows` 持久化建议 | 组件单测覆盖默认 / 开关两态；中英文档同批；`capture:styles` 0 差异；无默认行为变更 |
| **M3-1** | 组件增强与可访问性 | ColorPicker 色板改 `radiogroup` + `aria-checked` + roving tabindex（方向键 / Home / End）；无 TypeScript 公共 API 变更 | 键盘交互断言 + a11y 用例；回扫面 = `docs/components/color-picker.md:37`（「不支持方向键 roving 导航（用 Tab 遍历）」）、en-US 同页、`docs/design/design-spec.md:287`（`aria-pressed` 选中态）与 `:326`（自建 `role="group"` + `aria-pressed` 说明）、`docs/design/components.md` 对应行；1.3.0 release note 记录键盘模型变化 |
| **M3-2** | 组件增强与可访问性 | Select 选项解析为 `null` / `undefined` 时**仅开发期** `warnDev`；不改变解析结果与生产输出 | 单测断言告警调用与生产静默；组件页补一句开发期提示 |
| **M3-3** | 组件增强与可访问性 | Paginator 新增 `#report` 插槽（作用域 `page / pages / total`）；公共 API 增量 | 插槽作用域 / `total = 0` 空数据 / SSR 用例；API 表与中英文档同批；回扫面 = `docs/components/paginator.md:45` / `:95`、`docs/i18n/en-US/components/paginator.md:45` / `:95`、`docs/design/design-spec.md:350`（共 5 处「不提供插槽 / 未实现」表述） |
| **M4-1** | 质量守卫与对比度 | N1 transition 副本守卫：数据源 = [M3-1 记录](./2026-11-13-phase32-m3-1-demo-transition.md) §2 的 25 行清单；比较维度 = 选择器 → 组件基础层 `transition` 属性名集合；豁免 = `expressive` 专属与 Portal 手势 | 同名单测 + 负向用例；受检面下界 25 条；接入 `governance:check`；组件新增过渡时守卫可判失败 |
| **M4-2** | 质量守卫与对比度 | Calendar 上 / 下月导航按钮与 RichTextEditor 容器描边加入 `test/e2e/preset-contrast.e2e.ts` 边界矩阵 | 6 预设 × 明暗 × 2 背景全绿；阈值 **3:1 不放宽**；如首次失败按设计裁定改 token |
| **M5-1** | 发布收口 | `1.3.0` 发布（含 Phase 32 累积与本阶段变更）；semantic-release 手动触发 | `latest = 1.3.0`、tag / GitHub Release / 回推提交一致；`docs/release-notes/1.3.0.md` 已落盘并被 `generateNotesCmd` 读取；发布后校验与 API 差分通过；下游兼容 run success |

## 3. 非目标（本阶段）

- 不纳入：DataTable `scrollable` / 全表全选契约、长尾组件（Sidebar / BackTop / Rating / TimePicker）、国际化二期 / RTL、`useDialog`、I5 运行时 `@iconify/vue` peer、§1.5 移动端两项（滚动容器键盘聚焦 / Toolbar 769–1023 档）、§1.8 momei 侧迁移（等待外部反馈）。
- 条件触发项维持不启动：`typescript` 7（工具链 API）、`glob` 跨 major override、`conventional-changelog` 8（preset 3.0.0）、CI 运行器镜像迁移检测。
- 不纳入：文档站多版本托管、Storybook、Tailwind preset、示例外链守卫扩展、ui-validator 资产 follow-up（描述未具体化，需先评估）。
- 破坏性 API 变更（Paginator `#report` 为增量）；新增运行时依赖；放宽 Mergify 条件；修改 `release.config.js` / `release.yml` 的既有语义。

## 4. 载体同步与候选移出

| 载体 | 动作 |
|:---|:---|
| `docs/plan/todo.md` | 声明「当前进行中阶段：Phase 33」+ `## Phase 33 原子条目` 段（11 行，状态「待执行」） |
| `docs/plan/roadmap.md` | §1 当前态改为 Phase 33；阶段表新增 Phase 33 行（5 主线 / 11 条 + 对账式） |
| `docs/plan/backlog.md` | 移出 9 行（§1.1 4 / §1.6 5）；新增 N2 行（dev 形态 hydration 守护）；候选池 **32 → 24**，§1.1 6 → 2、§1.6 14 → 10 |
| `docs/design/governance/index.md` | 新增本记录 |
| `.session`（git-ignored） | `current_phase` / `active_plan` / `next_steps` 与 `runtime_state.plan_state` 同批同步 |

## 5. 风险与前置

1. **登记前置复算**：M1 四条依赖候选登记时须 `pnpm check:outdated-major` 复算，任一项已不在列则从本阶段移除并说明（评估记录 §3 已约定）。**2026-11-13 实测四项均在列**：`eslint` 9.39.2 → 10.14.0、`vitest` / coverage 4.1.12 → 5.1.0、`stylelint` 17.16.0 → 18.0.0、`fontkit` 2.0.4 → 3.0.0。
2. **`stylelint` 18 + config 1.1 同批**：分两次升级会产生不可绿的中间态。
3. **`fontkit` 3 安装源**：本机镜像缺 `dfa@2.0.0`，本地验证须走官方 registry。
4. **`vitest` 5 语义收紧**：默认清 mock、未 await 异步断言判失败，可能暴露存量用例。
5. **C 主线的 API / 行为面**：Paginator `#report` 须 API 差分与中英文档同批，并改写组件页既有「不提供插槽」两处表述；ColorPicker 键盘模型变更须同步 a11y 用例与 release note；Select 告警不得影响生产输出。
6. **D 主线对比度**：Calendar / RTE 边界纳入矩阵后可能首次失败，须改 token 而非放宽阈值。
7. **发布**：发布前执行长期任务门槛复核轮（当前第 35 轮已执行，发布前需再执行一轮）与 API 差分；发布失败按发布指南回退，不重试同一构建。

## 6. Review Gate

- **audit-depth**：`standard`（阶段登记：多载体计数 + 候选池变更 + 11 条范围，零代码；≤10 分钟）。
- **R1**（`standard`）：`Pass`（0 blocker / 5 warning / 4 suggest）。
  - warning（均同批收口）：① `.session` 只同步了一半（`next_steps` / `blocked_on` / `decisions` 未更新）→ 已完整同步；② N2 来源锚点 `§5.3` 不存在 → 改「§5 第 3 条」，评估记录同源锚点一并修正；③ M3-1 / M3-3 文档回扫面不全（ColorPicker 另涉 `design-spec` 两处与 `components.md`；Paginator 实为 5 处）→ 逐条列名；④ M1-4 验收字面不可达成（既有 6 项字体族失败）→ 改为「除既有 6 项外零失败且失败集合一致」；⑤ 「Backlog 迁出保留原判定」无可执行载体 → 删除，改在 §1 记录原否定判定与 D0 覆盖。
  - suggest：补 1.3.0 判据（20 feat → minor）、`check:outdated-major` 实测读数、release note 载体 `docs/release-notes/1.3.0.md`、非目标补 §1.5 / §1.8 与 M1-3 受检面基线 → 全部采纳。
- **复查基线**：本记录 §1 / §2 / §4 / §5；`docs/plan/todo.md` 当前状态句与条目表；`docs/plan/roadmap.md` §1 与 Phase 33 行；`docs/plan/backlog.md` §1.1 / §1.6（含 N2 行）；`docs/design/governance/index.md` 新增条目；`.session`（gitignored）。
