# Phase 21 归档批次记录

> 创建时间：2026-10-10
> 关联：**Phase 21（下游回归机制启动、发布流统一与视觉基线落地）阶段归档**——用户指令「归档」
> 依据：[规划规范 §7 / §8](../../standards/planning.md)（状态同步 / 归档清理 / 长期任务触发义务）、[Session Wisdom 蒸馏机制](../../standards/session-wisdom-distillation.md)
> 范围依据：[下一阶段范围评估（第五轮）](./2026-10-10-next-stage-scope-evaluation-5.md) §8
> **本记录是 Phase 21 归档批次的唯一口径载体**：归档块与治理索引条目只引用本记录，不复写易变计数（见 §8 的单点来源界定）。

---

## 1. 归档动作清单

| 动作 | 载体 | 结果 |
|:---|:---|:---|
| 归档块 | `docs/plan/todo-archive.md` | 新增「Phase 21」块（授权与范围 / 非目标 / M1 ~ M4 逐条 / 附带交付 / 阶段总结 / 归档批次 Review Gate）；主窗口口径句更新为「Phase 13 ~ Phase 21」 |
| 清空当前阶段 | `docs/plan/todo.md` | 重写为「当前无进行中阶段 + 下一阶段授权规则 + 未完成项汇总」（移除全部条目行、阶段摘要与非目标段） |
| 阶段表与状态 | `docs/plan/roadmap.md` | 阶段表 Phase 21 行补「完成并归档」；§1 现状句补 Phase 21 归档；§5 归档索引补 Phase 21；状态行改「当前无进行中阶段」；规划纪律注补 Phase 21 归档时点 |
| 长期任务 | `docs/plan/recurring.md` | §2「上次执行」列更新为第 24 轮；§3 新增第 24 轮行；触发义务注追加第 24 轮 |
| 候选池复核 | `docs/plan/backlog.md` | **新增 1 行**（§1.8「下游兼容检查首次真实贯通验证」——M1-2 移出为遗留项）；复核其余 Phase 21 交付项**无残留** |
| wisdom | `.session/wisdom.md`（git-ignored） | **0 条活跃**（阈值 20）→ **未达阈值、不蒸馏** |
| 本记录 + 索引 | 本文件 + `docs/design/governance/index.md` | 登记 |
| 指针回扫（同批） | `check:governance-records` 机检面 + 人工面 | 机检 **0 处 `stale-planning-pointer`**（该守卫只识别「链接文字含编号」形态）；**主动改指** 7 份 Phase 21 记录表头的散文指针（链接文字「待办事项」、编号在链接之外）→ `todo-archive.md`（见 §4） |
| `.session` 阶段态 | `.session/current-task.yaml` / `runtime-state.json`（git-ignored） | 同步为「当前无进行中阶段」（Step 3.5 归档触发点） |

## 2. 阶段交付与提交对账（Phase 21）

- **提交对账命令**：`git log --oneline ba9587f..61129de | wc -l` → **10**（下界 = Phase 20 归档批次提交 `ba9587f`，上界 = 本阶段末条记录提交 `61129de`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。
- **构成**（逐项相加 = 10）：

| 分类 | 提交数 | 提交 |
|:---|:-:|:---|
| 阶段登记与范围评估 | **1** | `ffbb9fc`（Phase 21 登记 + 第五轮下一阶段范围评估） |
| Phase 21 本体 | **8** | M1 2（`abd55d8` 初版 reusable / `66822e3` 形态变更）；M2 2（`05d830c` / `4392309`）；M3 2（`88452e1` / `d5bc5c0`）；M4 2（`734ed19` / `5b94b09`） |
| 附带交付（回填） | **1** | `61129de`（回填[形态变更记录](./2026-10-10-phase21-m1-form-change-upstream-executed.md)的 Review Gate 结论） |

- **归档批次自身提交不计入上式**（本记录 + 归档块 + 载体同步 + 索引为归档批次，另计）。

## 3. 阶段交付摘要（逐条）

- **M1 下游回归机制启动（Phase 8）（2 条；1 条交付、1 条移出）**：M1-1 交付**上游执行的下游兼容检查 workflow**（`.github/workflows/downstream-compat.yml`；**2026-10-10 同日形态变更**：由 reusable workflow `compat-check.yml` 改为「上游触发 + 上游执行」，删除旧文件；发布 tag `v*` / 手动触发；上游 checkout 下游源码跑 install + 版本覆盖 + `typecheck` + `build`；`matrix` 登记受检清单；记录下游 SHA）；**本地等价命令链全链 exit 0**。**M1-2 移出为遗留项**（首次 GitHub 真实触发待推送，转 [Backlog](../../plan/backlog.md) §1.8）。
- **M2 发布流统一（2 条）**：统一手动发布流单入口脚本（`scripts/release/manual-release.mjs` / `pnpm release:manual`，7 步编排；不引入新依赖；发布批次纯净；变更型步骤 `--yes` / `--dry-run` 门禁；`sync` 守卫前置 + 独立提交；不自动 push）+ `scripts/shared/version-statements.mjs`（版本声明句锚点单一事实源）+ 单测 16 例；发布指南 §3 重写为脚本编排说明面（含 3 次提交与发布元数据豁免边界）。
- **M3 视觉基线落地（2 条）**：Playwright `toHaveScreenshot` 装置与首批 16 张冻结基线（独立 config + 固定环境 + 双轴容差 + 串行不重试；受检面登记 + 下界守卫 + 负向对照）；CI 先非阻断接入（`regression-weekly.yml`）+ 测试规范 / 开发指南文档同步 + Backlog 登记「视觉基线转阻断评估」。
- **M4 治理口径收口（2 条）**：发布指南 §10 下游清单口径修正（接入即登记；状态改「已启动」；受检面收敛为「工作流 `matrix` 登记」；中英同步 + `architecture.md §7` 同步）；归档载体超阈维持留痕（Backlog 候选行补维持理由 + 再评估触发 + 计数口径）。

## 4. 归档后回扫（三段式）

> 口径与示例见 [规划规范 §7](../../standards/planning.md)（回扫结论须按机检面 / 人工面 / 未处理面记录）。

- **① 机检面**：清空 `todo.md` 阶段段落后复跑 `pnpm check:governance-records` → **0 处 `stale-planning-pointer`**（该守卫只识别「链接文字含编号」形态；本批未命中）；复跑 **exit 0**（**148** 记录与索引一致 / **338** md 指针无失效）。本阶段**新增载体**（本记录 + 归档块）逐条核对「链接文字内含编号」形态。
- **② 人工面**：枚举指向 `docs/plan/todo.md` 的链接（含「链接文字为载体名、编号写在链接之外」的散文形态）——改指前 **75 处 / 37 文件**（命令：`rg -o '\]\((\.\./)*plan/todo\.md\)' docs -g '*.md' | wc -l` → 75；`rg -l … | wc -l` → 37；均排除 `docs/.vitepress/dist`，含本记录与归档块自引用）；其中 **7 份 Phase 21 记录表头**（M1-1 / M1 形态变更 / M2-1 / M2-2 / M3-1 / M3-2 / M4-1，形态为「链接文字为『待办事项』、编号写在链接之外」）**已主动改指 `todo-archive.md`**，**改指后 68 处 / 30 文件**；其余为**登记动作的时点陈述**（点时记录），本批不回改。
- **③ 未处理面**：更早历史记录中指向 `docs/plan/todo.md` 的散文指针沿用既有边界（属登记动作的时点陈述），**本批不回改、亦未登记为待办**；深度归档文件内的同类指针随迁入保留。

## 5. 长期任务门槛复核（第 24 轮）

- **触发**：Phase 21 收口前（用户指令「归档」），规划清理域，属**门槛复核轮**。
- **结论**：两组任务**待执行批次 0 项**；未达门槛 → **条件触发 1 项维持**（表单控件公共 props 契约后续候选）；**已判定不纳入 5 项维持**。
- **计数**：与第 23 轮**逐项一致（无漂移）**——`useLabelAttrs` 15 / `labelAttrs` 10 / 模板级 `:aria-label="label"` 0 / 继承公共契约 12 / 含内联同名字段 32 / `useFocusControl` 4 / `useAttrs()` 11 / 数值钳位 2 处；§2.2 复跑 `field-shell-overlap.mjs`（四组件共有声明 **0**）；`capture:styles` 采样面 **308 项** 0 差异。Phase 21 零 `src/**` 改动，与之一致。
- **落点**：[长期任务](../../plan/recurring.md) §3 第 24 轮（证据与复算命令见该行）。

## 6. wisdom 蒸馏与 Backlog

- **wisdom**：`pnpm distill:wisdom --check` → **`WISDOM_OK: 0 active entries (threshold 20)`**——**未达阈值，本轮不蒸馏**（无批次段新增）；`check:distill-archive` 段数见 §8。
- **Backlog**：**新增 1 行**（§1.8「下游兼容检查首次真实贯通验证」）；其余 Phase 21 交付项逐行复核**无残留**。

## 7. 规模（唯一口径）

- 归档批次文件（见 §1）：`todo-archive.md`（新增 Phase 21 块 + 主窗口口径句）/ `todo.md`（重写）/ `roadmap.md` / `recurring.md` / `backlog.md`（新增 1 行）/ 本记录 / `index.md` / 规划指针回扫文件（见 §4①）。**零 `src/**` 改动、零 `test/**` 改动**。
- 归档块行数、`check-docs-git-revision` 计数与 `check:governance-records` 计数**只在本记录 §8 声明**（漂移高发项）。

## 8. 质量门

> **单点来源范围**：**`todo-archive.md` 行数**、**`check-docs-git-revision` 的 md / 命令计数**与 **`check:governance-records` 的记录 / 指针计数**只在本节声明——归档块与治理索引条目**不复写**、仅引用本节（该几项随文档增删变化，是漂移高发项）。
> **时点口径**：数值为**本批终态时点**（工作区含本批文档；已 `git add` 的受版本控制 md 计入）。

| 项 | 实测（2026-10-10 本批） | 复算命令 |
|:---|:---|:---|
| `pnpm verify` | **exit 0** | `pnpm verify` |
| `pnpm test` / `test:a11y` | **115 文件 / 2274 例** / **59 例** | `pnpm test` / `pnpm test:a11y` |
| `pnpm test:e2e` | **318 例** | `pnpm test:e2e --workers=2` |
| `pnpm test:visual` | **17 例**（16 截图 + 1 下界守卫） | `pnpm test:visual` |
| `capture:styles` | **308 项 0 差异** | `pnpm capture:styles` |
| `docs:check` | **11 段链全绿**（`integrity` 报 1 条预期告警：`todo.md` H1/H2 由 4 降 3，属归档正常移除面） | `pnpm docs:check` |
| `todo-archive.md` 行数 | **527 行**（主窗口；超 warn 下界 400、未达 error 600） | `pnpm docs:check:line-count`（**以此脚本口径为准**） |
| `check-docs-git-revision` | **300 md / 164 条取证命令** revision 均持久 ref（代码区行数随本文增删变化，非终端指标） | `node scripts/governance/check-docs-git-revision.mjs` |
| `check:governance-records` | **148 记录与索引一致 / 338 md 指针无失效 / `stale-planning-pointer` 0 处** | `pnpm check:governance-records` |
| `distill:wisdom --check` | **0** 活跃条目（阈值 20） | `pnpm distill:wisdom --check` |
| `check:distill-archive` | **12** 段 reconciled | `pnpm check:distill-archive` |
| `docs:build` | **exit 0** | `pnpm docs:build` |

## 9. 边界与未覆盖

- **不回改面（有意）**：点时记录（历史治理记录 / 归档块）中的历史版本口径、轮次号与候选池指向——按 [规划规范 §9](../../standards/planning.md)「台账指针的处置判据」保持原样。
- **未跨仓复核**：下游锁定版本（dependfix `0.5.0` / momei `0.3.0`）引自既有治理记录；升级或迁移触发时重取。
- **主窗口未迁出**：本批主窗口保持 Phase 13 ~ Phase 21（9 个完整块），未把 Phase 13 迁入深度归档——行数仍在 `docs:check:line-count` 的 error 阈值以内（**warn 可接受**）。
- **未穷举**：回扫只覆盖指向 `docs/plan/todo.md` 的链接与治理记录的规划指针；其它文档的 §N 引用未逐条核对。
- **未推送**：Phase 21 全部提交（10 个）**未推送**；M1-2 真实贯通验证待推送（转 Backlog）。

## 10. Review Gate（归档批次）

- **结论**：R1 `standard`（单分区）**`Pass`**（0 blocker / 2 warning / 1 suggest）。
- **轮次 / 范围**：第 1 轮，审本批 7 文件（规划载体 + 归档批次记录 + 索引）。
- **findings 处置**：
  - **RG-W1（warning）**：归档块「已知观察 ⑤」与本记录 §1 断言了一处**未发生**的 `stale-planning-pointer` 报告与同批改指；真实存在的是 **7 份 Phase 21 记录表头**的散文指针（机检不命中）→ **已修**：⑤ 与 §1 改为与实测一致（机检 **0 stale**；**主动改指** 7 份表头）；§4② 补处数 / 文件枚举与命令。
  - **RG-W2（warning）**：§4② 人工面未给处数 / 文件数与命令结果 → **已修**：补 `rg` 命令、改指前 **75 处 / 37 文件**、改指后 **68 处 / 30 文件**。
  - **RG-S1（suggest）**：`61129de` 被双重归类（本体 M1 3 + 附带交付）→ **已修**：§2 构成改为「登记 1 + 本体 8 + 附带回填 1 = 10」（分类互斥），归档块同步。
- **审计核验**：提交对账 10（构成 1 + 8 + 1，逐条 SHA 落位）；`todo-archive.md` 527；`check:governance-records` 148 / 338 / 0；`check:planning-numbers` 0；`check:distill-archive` 12；`distill:wisdom --check` 0；`todo.md` 无 `Mx-y` / 无「进行中」残留；单点来源 §8 数值与实测逐项一致。
- **未覆盖边界**：未重跑全量 `verify` / `e2e` / `test:visual` / `docs:build`（采信调用方已查证证据）；未逐条语义核对 8 条原子条目的验收断言与实现；未验证 `.session/`（git-ignored）阶段态。
- **留痕**：`artifacts/review-gate/2026-10-10-phase21-archive.md`（本地态，git-ignored）。

## 11. 回填

- **归档批次提交**：本记录即 Phase 21 归档批次的**唯一口径载体**（**提交号见 git 历史**；本记录与归档块 / 载体同步 / 索引同批提交）。
- **提交后复跑**：`check:governance-records` / `check-docs-git-revision` / `docs:check:line-count` 等守卫按**工作区文件**计数，提交本身不改变计数，与 §8 提交前实测一致。
- **不计入 §2**：归档批次自身提交不计入 §2 的 10 条窗口范围。
