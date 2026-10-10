# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前状态

当前进行中阶段：**Phase 22（机制真实贯通、依赖安全与升级治理、治理与测试收口）**，2026-10-10 用户就关键决策点裁定后登记（已有最大编号 21 + 1）。**3 条主线 / 10 条原子条目**（机制真实贯通 2 / 依赖安全与升级治理 3 / 治理与测试收口 5）；取向为用户选定的**组合 A + B + C**（= M1 + M2 + M6）。逐条裁定——**D2** 运行时安全告警**立即插队处置**；**D4** 大版本升级**逐项评估、达标即升**（`vite 5→8` 单独评估延后）；**D8** 归档载体**维持**（接受 warn）；**D9** M6 除归档载体外纳入 **`locale` 守卫能力演进（B19）/ 计数对账守卫（B22）/ 文档站遗留项（B16 / B17）**；其余按默认落定（D3 dev 告警 critical/high 优先、D5 `workflow_dispatch` 提前触发、D6 视觉基线首跑后评估转阻断、D7 受检面维持、D10 ~ D14 维持登记 / 阶段末统一收口）。范围依据见[下一阶段范围评估（第六轮）](../design/governance/2026-10-10-next-stage-scope-evaluation-6.md) §8。**登记 = 范围授权**，逐条实施以「开工」指令为准。

## Phase 22 原子条目

| 编号 | 主线 | 原子条目 | 验收标准 | 状态 |
|------|------|----------|----------|------|
| M1-1 | 机制真实贯通 | **下游兼容检查首次真实触发**：以 `workflow_dispatch` 触发 `.github/workflows/downstream-compat.yml`（dependfix 试点，按需传被测版本），确认 Actions 运行时（表达式求值 / checkout 权限 / 缓存 / 下游复刻构建链）无缺陷，并将结论回传治理记录 | 一次真实 run 跑通 `typecheck` + `build` 并回传结论；记录下游 SHA 归因；受检清单按「接入即登记」维护（[发布指南 §10](../guide/release.md)） | 待执行 |
| M1-2 | 机制真实贯通 | **视觉基线首个 CI run 复核与转阻断评估**：触发 `regression-weekly.yml`（`workflow_dispatch` 或下次定时）产生视觉基线首个 `ubuntu-latest` run，复核跨环境渲染一致性（字体 / 抗锯齿），按 D6 给出转阻断判定 | 首个 CI run 结论落到治理记录；转阻断 / 维持二选一并写明理由与再评估触发；涉及渲染走 `@ui-validator` | 待执行 |
| M2-1 | 依赖安全与升级治理 | **运行时安全告警插队处置**：`source-map-js`（high，锁定修复 `1.2.2`）修复（`pnpm-workspace.yaml` 的 `overrides`），`pnpm-lock.yaml` 同提交 | 告警关闭（`gh api .../dependabot/alerts` 复核）；`pnpm verify` exit 0；库产物冒烟。**本地已锁定修复到 `1.2.2`、`pnpm verify` exit 0；告警关闭待推送后由 Dependabot 复算** | 已完成 |
| M2-2 | 依赖安全与升级治理 | **开发作用域安全告警盘点与分批处置**：15 项（**critical 5 / high 4 / medium 4 / low 2**）逐项给「修复版本 + 结论」，**critical/high 优先**；`node-forge`（无修复版本）单列结论 | 每条有复算值 + 修复版本 + 结论；可修复者处置到位；不可修复者留痕。**已修复 10 / 受阻 4（`simple-git` 系列）/ 无补丁 1（`node-forge`）**；告警关闭待推送后由 Dependabot 复算 | 已完成 |
| M2-3 | 依赖安全与升级治理 | **依赖大版本升级逐项评估与达标升级**：`vitest 3→4` / `typescript 5.9→6.0` / `conventional-changelog 7→8` 等逐项评估，达标者升级；**`vite 5→8`（Rolldown）单独评估延后**；处置 7 个 open PR | 每项有迁移记录 + `pnpm verify` exit 0；不达标 / 延后者登记 Backlog。**结果：达标即升 3（`vue` / `@lucide/vue` / `typescript`〔含 tsconfig 迁移〕）+ 陈旧 PR 2（`vite` / `vitest`，本仓已达标）+ 延后 2（`reka-ui` / `conventional-changelog`，已登记 Backlog §1.6）** | 已完成 |
| M6-1 | 治理与测试收口 | **归档载体维持的载体留痕**：`todo-archive.md` 行数超阈（warn）按 D8 **维持**，在 [Backlog](./backlog.md) 对应行同步当前计数（527 行）与维持裁定 + 再评估触发（达 error 阈值 600） | Backlog 计数与 `docs:check:line-count` 一致；维持裁定与再评估触发留痕 | 待执行 |
| M6-2 | 治理与测试收口 | **`locale` 守卫能力演进**（B19）：扩展键集合守卫的解析器能力（如容忍注释等） | 守卫有判别力（负向对照）；`check:locale-keys` / `check:locale-ledger` 全绿 | 待执行 |
| M6-3 | 治理与测试收口 | **治理索引与记录计数对账守卫**（B22）：对治理索引摘要与记录本体的 e2e / 测试计数做对账机检；**须先定告警面与误报口径**（原判「高误报 / 高过拟合」） | 误报口径经实测标定（误报 0 / 负向对照命中）；接入 `governance:check` | 待执行 |
| M6-4 | 治理与测试收口 | **文档站演示动画遗留项**（B16）：keyframes 副本一致性、示例样式纳入 stylelint 面 | 副本一致性可复算；示例样式纳入 lint 面且不漏 | 待执行 |
| M6-5 | 治理与测试收口 | **文档站示例外部图片依赖**（B17）：消除 `picsum.photos` 外链风险（本地占位 / 数据 URI） | 示例无外链依赖；`docs:check` 全绿、无网络 404 | 待执行 |

> **非目标**：不启用定时（cron）自动发布、不放开 `release.yml` publish、不进入 1.x（B27 / B28 维持登记）；不纳入组件能力与长尾（B1 ~ B7，维持条件触发）、国际化与 RTL（B9 ~ B11，维持登记）、`useDialog` / Toast 焦点哨兵 / 多版本托管 / Storybook / Tailwind preset 等（维持裁定）；不压缩归档载体；不为未接入目标下游建机制；不改组件公共 API、不做破坏性变更；不重写已发布 tag；不引入 Tailwind / UnoCSS。

## 未完成项汇总

> 本节仅为**状态指针**，用于跨阶段可见性，不构成条目登记、不构成启动授权。

- **等待外部反馈**：dependfix `apps/platform`（消费 `0.5.0`、可升级 `0.6.0`）与 momei 第六十八阶段的迁移由对应仓库执行、本仓等待反馈；两仓当前均无未回传本仓的新反馈（2026-10-10 实测）。
- **条件触发候选**（触发后按「条件触发 → 再评估 → 决策」处理，不自动进入阶段）：组件增强与长尾（ColorPicker 色板导航 / DatePicker 范围选择 / DataTable 滚动高度 / Paginator 页码报表 / `Select` `null` 开发期告警 / Sidebar / ScrollPanel）、Toast 焦点哨兵与 `aria-hidden-focus` 冲突、文档站多版本托管 / 首页 hydration、语言矩阵长期与 RTL、locale 组织治理、`@iconify/vue` 可选接入、CHANGELOG 生成器健壮性收口、视觉基线受检面扩面、提交驱动 CI 自动发布、进入 1.x 的版本策略与冻结面确认等；逐条触发条件、复算值与取证入口见 [Backlog](./backlog.md)。
- **已发布版本**：registry `latest` = **0.6.0**（2026-10-08 发布；`time['0.6.0']` = `2026-10-08T13:08:41Z`）。**git 侧提交与 tag 均已推送**（`origin/master` = HEAD = `e48834e`、远端 `v0.1.0` ~ `v0.6.0` **6 个** annotated tag）；**GitHub Release 已回填** `v0.1.0` ~ `v0.6.0`（`v0.6.0` = Latest）。**本阶段若产生 `src/**` 行为变更，阶段末统一收口时再登记发布条目（D14）**。
- **长期任务待执行批次**：见[长期任务](./recurring.md) §2（**第 24 轮门槛复核已于 2026-10-10 执行**〔Phase 21 收口前〕：两组任务均无待执行批次；条件触发 1 项与已判定不纳入 5 项维持。**Phase 22 收口前须再触发一轮**）。
- **未纳入任何阶段的候选**：见 [Backlog](./backlog.md)（组件增强、长尾组件、国际化与 RTL、移动端与响应式、基建与治理、服务层、下游协同等分组）。
- **已完成阶段的遗留项与已知偏差**：见[待办归档](./todo-archive.md)各归档块（含[深度归档](./archive/)）的「遗留与后续候选」与「已知观察」段，其中仍待决策者已在 [Backlog](./backlog.md) 在册。
