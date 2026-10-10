# 待办事项

本文档记录当前阶段的原子条目与验收状态；准入、命名与阶段衔接规则见 [规划规范](../standards/planning.md)，本文档不重述。

## 当前状态

当前进行中阶段：**Phase 21（下游回归机制启动、发布流统一与视觉基线落地）**，2026-10-10 用户裁定 D1 ~ D15 后登记（已有最大编号 20 + 1）。**4 条主线 / 8 条原子条目**（下游回归机制启动 2 / 发布流统一 2 / 视觉基线落地 2 / 治理口径收口 2）；取向为用户选定的**组合 A + B + C + D**（= 下游回归机制启动 + 发布流统一 + 视觉基线落地 + 治理口径收口）。逐条裁定——**D2** Phase 8 **启动 + B reusable workflow**；**D3** 覆盖**仅 dependfix**（试点）；**D4** 失败语义**沿用 §10「兼容性阻塞」**；**D5** **不取 A**（无需跨仓 token）；**D6** 统一手动流取**脚本编排**；**D7** **暂不进入 1.x**；**D8** 自动化发布**维持手动**；**D9** N/A；**D10** 视觉回归基线**立项落地**；**D11** 归档载体超阈**维持**；**D12 / D13** 组件能力 / 国际化与 RTL **维持登记**；**D14** 其余候选**维持登记**（仅 N5〔发布指南 §10 口径修正〕随 M4 落地）；**D15** **阶段末统一收口**（不预登记发布条目）。范围依据见[下一阶段范围评估（第五轮）](../design/governance/2026-10-10-next-stage-scope-evaluation-5.md) §8。**登记 = 范围授权**，逐条实施以「开工」指令为准。

## Phase 21 原子条目

| 编号 | 主线 | 原子条目 | 验收标准 | 状态 |
|------|------|----------|----------|------|
| M1-1 | 下游回归机制启动（Phase 8） | **跨仓兼容检查 reusable workflow**：caomei-ui 侧新增 `on: workflow_call` 的兼容检查 workflow，执行 `pnpm install --frozen-lockfile` + `typecheck` + `build`，按 ref 版本化（不带 `workflow_dispatch`；人工贯通由下游侧触发，归 M1-2） | 符合 [发布指南 §10](../guide/release.md)（B reusable workflow）；无需跨仓 token；检查范围**最低 `typecheck` + `build`**、不含 e2e / 视觉 / 全量单测；可被下游 `uses:` 调用 | 已完成 |
| M1-2 | 下游回归机制启动（Phase 8） | **下游调用接入与最小贯通验证**：dependfix 仓库新增调用 job（`uses: CaoMeiYouRen/caomei-ui/.github/workflows/<compat>.yml@<ref>`），跑通一次真实触发并回传结论 | 一次真实触发能跑通 `typecheck` + `build`；失败语义沿用 §10「兼容性阻塞」；本仓产出贯通验证治理记录（下游仓库改动与提交在对应仓库执行） | 待执行 |
| M2-1 | 发布流统一 | **统一手动发布流脚本编排**：新增 `scripts/release/manual-release.mjs` / `pnpm release:manual`，单入口串「前置门 → 版本 → CHANGELOG → 发布 → 后校验 → 版本句同步 → GitHub Release」 | 单入口可复算；**不引入新依赖**（复用现有 `scripts/release/*` 与 `gh` / `npm` CLI）；含单测；发布批次保持纯净以命中 `check-review-gate-artifacts` 的发布元数据豁免 | 已完成 |
| M2-2 | 发布流统一 | **发布指南 §3 同步为脚本编排说明面**（runbook 作为其文档面） | §3 与脚本实际步骤一致；tag 落点口径（版本提交 / CHANGELOG 提交）与发布元数据豁免边界写明；`docs:check` 全绿 | 待执行 |
| M3-1 | 视觉基线落地 | **Playwright `toHaveScreenshot` 装置与首批基线**：独立 `playwright.visual.config.ts` + `__screenshots__` 随仓冻结基线 + 固定环境（chromium / 固定 viewport / DPR 1 / locale / tz / `reducedMotion: 'reduce'`）+ 双轴容差（`threshold` + 绝对 `maxDiffPixels`）+ 串行 `workers: 1` / `retries: 0` | 首批范围（按 M7-1 建议）基线入库且可复现；容差经实测标定；负向对照自证判别力；涉及渲染走 `@ui-validator`；不改组件行为 | 待执行 |
| M3-2 | 视觉基线落地 | **CI 接入（先非阻断）与文档**：把视觉基线接入 `regression-weekly.yml`（或独立 workflow）作**非阻断**步骤；测试规范补装置口径 | 首个全绿 run 后可评估转阻断；**不进 `pnpm verify` 常驻链**；文档写明容差 / 阻断策略与转正路径 | 待执行 |
| M4-1 | 治理口径收口 | **发布指南 §10 下游清单口径修正（接入即登记）**：把「已接入下游」改为**实测消费面**（dependfix + momei），零消费目标下游（caomei-auth / rss-impact-next / afdian-linker）标注为「接入后增量登记」 | §10 口径与实测一致；受检清单有唯一事实源 + 「接入即登记」约定；逐载体 `rg` 复核无旧口径残留 | 待执行 |
| M4-2 | 治理口径收口 | **归档载体超阈维持的载体留痕**：`todo-archive.md` 行数超阈（warn）按 D11 **维持**，在 [Backlog](./backlog.md) 对应行同步当前计数（479 行）与维持裁定 | Backlog 计数与 `docs:check:line-count` 一致；维持裁定与其理由留痕 | 待执行 |

> **非目标**：不启用**定时（cron）自动发布**；**不放开 `release.yml` publish**（提交驱动 CI 自动化维持评估，候选入 Backlog）；**不进入 1.x**（维持 0.x + 既有冻结窗口）；Phase 8 检查范围**不含** e2e / 视觉回归 / 全量单测 / 覆盖率；**不建立实体基线 / 快照库**；不修改下游仓库**业务代码**（dependfix 调用 job 属机制接入）；不为未接入目标下游建机制；**不压缩归档载体**（维持并留观察）、不纳入 B22 / B25 等其余治理候选；不纳入组件能力与长尾（B1 ~ B7）、国际化与 RTL（B9 ~ B11）；不重写已发布 tag；不做破坏性 API 变更；不引入 Tailwind / UnoCSS。

## 未完成项汇总

> 本节仅为**状态指针**，用于跨阶段可见性，不构成条目登记、不构成启动授权。

- **等待外部反馈**：dependfix `apps/platform`（消费 `0.5.0`、可升级 `0.6.0`、当前 M40 规划中）与 momei 第六十八阶段的迁移由对应仓库执行、本仓等待反馈；两仓当前均无未回传本仓的新反馈（2026-10-10 实测）。
- **条件触发候选**（触发后按「条件触发 → 再评估 → 决策」处理，不自动进入阶段）：组件增强与长尾（ColorPicker 色板导航 / DatePicker 范围选择 / DataTable 滚动高度 / Paginator 页码报表 / `Select` `null` 开发期告警 / Sidebar / ScrollPanel）、Toast 焦点哨兵与 `aria-hidden-focus` 冲突、文档站多版本托管 / 演示动画遗留项 / 外链图片 / 首页 hydration、语言矩阵长期与 RTL、locale 组织治理、`@iconify/vue` 可选接入、治理索引计数对账守卫、CHANGELOG 生成器健壮性收口、归档载体行数超阈、提交驱动 CI 自动发布、进入 1.x 的版本策略与冻结面确认等；逐条触发条件、复算值与取证入口见 [Backlog](./backlog.md)。
- **已发布版本**：registry `latest` = **0.6.0**（2026-10-08 发布；`time['0.6.0']` = `2026-10-08T13:08:41Z`）。**git 侧提交与 tag 均已推送**（`origin/master` = HEAD = `ba9587f`、远端 `v0.1.0` ~ `v0.6.0` **6 个** annotated tag）；**GitHub Release 已回填** `v0.1.0` ~ `v0.6.0`（`v0.6.0` = Latest）。**本阶段若产生 `src/**` 行为变更，阶段末统一收口时再登记发布条目（D15）**。
- **长期任务待执行批次**：见[长期任务](./recurring.md) §2（**第 23 轮门槛复核已于 2026-10-09 执行**〔Phase 20 收口前〕：两组任务均无待执行批次；条件触发 1 项与已判定不纳入 5 项维持。**Phase 21 收口前须再触发一轮**）。
- **未纳入任何阶段的候选**：见 [Backlog](./backlog.md)（组件增强、长尾组件、国际化与 RTL、移动端与响应式、基建与治理、服务层、下游协同等分组）。
- **已完成阶段的遗留项与已知偏差**：见[待办归档](./todo-archive.md)各归档块（含[深度归档](./archive/)）的「遗留与后续候选」与「已知观察」段，其中仍待决策者已在 [Backlog](./backlog.md) 在册。
