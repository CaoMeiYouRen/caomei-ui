# Phase 23 M2-1：下游兼容检查判别力补齐（显式版本入参分支）

> 创建时间：2026-10-13
> 阶段条目：Phase 23 M2-1（主线 M2 下游兼容检查判别力）
> 前序：[Phase 22 M1-1 记录](./2026-10-12-phase22-m1-1-downstream-compat-first-run.md)（run #1：管道贯通；**未覆盖** = 显式版本入参分支 / tag 触发分支 / 版本差判别力）

## 1. 结论摘要

- **交付**：`Downstream Compat` 的**显式版本入参分支首次真实执行**——`workflow_dispatch` 传 `caomei-ui-version=0.5.0`（**与下游锁定版本 `0.6.0` 不同**），run `38332448537` **success**：12 个编号步骤（含 `Set up job`）全 success、其中实质步骤 **11** 项，耗时 **1 分 55 秒**，下游归因 `dependfix/dependfix @ edbe5e04…`。
- **本轮相对 run #1 的进展**：run #1 是**同版本重装**（下游已锁 `0.6.0`、目标也是 `0.6.0`），**不构成判别力证据**；本轮为**版本差重装**（目标 `0.5.0` ≠ 下游锁 `0.6.0`），override 步骤实测变更计数 **`+1 −1`**（替换 1 个依赖）→ **「override 确实会改变被安装版本」这一判别力前提成立**。
- **仍不等价于「回归判别力」**：真正的「新版本不破坏下游」需**被测版本比下游锁定版本更新**（即发布后由 tag 触发），届时才是版本差 + 语义方向的完整证据。**口径已写入 §5 与 [发布指南 §10](../../guide/release.md)**。
- **受检清单（接入即登记）维护**：`dependfix` 在册且已跑通两条分支（latest / 显式版本）；`momei`（根包，已消费 `0.6.0`）**未接入**，原因与触发条件见 §4（**单条阻塞**：`nuxt build` 在上游 runner 的无凭据可行性未验证；原稿误记的「add 步骤需支持根包」已在 §4 修正）——**显式登记而非静默省略**。
- **未新增 workflow 改动**：本批**不改** `.github/workflows/downstream-compat.yml`。拟加的「校验实际安装版本」步骤属**未验证的 workflow 改动**（只能在真实 run 中验证，而当前 D2 裁定不推送），故**登记为 Backlog 候选**（触发条件 = 下次发布前后可在真实 run 中验证时），避免把未执行过的 workflow 变更入库。
- **附带登记（流程类，来自本批 Review Gate）**：本批 R3 判出「修复未 `git add` → 索引版与工作区不一致、复审读旧快照」这一**已知复发类（历史）** finding，按 AI 协作规范 §3.5 的「转机检约束」方向登记 Backlog §1.6 候选「暂存区卫生机检（拒绝 `AM` / `MM` 提交）」（触发条件 = 下一次治理装置批次）。

## 2. run 事实（可复算）

| 项 | 值 |
|:---|:---|
| run id | `38332448537`（`gh run view 38332448537`） |
| 触发 | `workflow_dispatch`（`master` @ `28b4873`；**使用远端工作流版本**，本地未推送提交不参与） |
| 结论 | **success**；作业 `Compat / dependfix` |
| 耗时 | `01:30:27Z` → `01:32:22Z` ≈ **1 分 55 秒** |
| 步骤 | 作业共 **17** 个步骤项（编号 1–12 + 4 个 `Post …` + `Complete job`）；**12 个编号步骤**（含 `Set up job`）全 success，其中**实质步骤 11 项**：Checkout ×2 / Setup pnpm / Setup Node.js / Resolve target version / Record downstream revision / Install / **Override** / Setup build chain / Typecheck / Build |
| 被测版本 | **`0.5.0`**（显式入参：日志 `INPUT_VERSION: 0.5.0` → `target caomei-ui version: 0.5.0`） |
| 下游归因 | **`dependfix/dependfix @ edbe5e04a7b75f0ae7989654b8be52dbd10bb779`**（job summary + 日志） |
| override 实测 | `pnpm --filter @dependfix/platform add "caomei-ui@0.5.0"` → 变更计数 **`+1 −1`** |

- 复算命令：`gh run view 38332448537 --json status,conclusion,jobs`；`gh run view 38332448537 --log`（本次取数落盘 `test-results/` 之外的本地态路径，不入库）。
- **下游为移动目标**：本次 SHA `edbe5e04…` 与 run #1 的 `46c6fb61` **不同**（下游已推进）——按工作流注释与指南口径，红/绿均须先按该 SHA 归因。

## 3. 显式入参分支证据（三条独立读数）

1. **入参生效**：`Resolve target version` 步骤日志打印 `target caomei-ui version: 0.5.0`（环境变量 `INPUT_VERSION: 0.5.0`），且未回落到 `npm view` 分支。
2. **版本差成立**：目标 `0.5.0` ≠ 下游 `apps/platform` 锁定 `0.6.0`——**该锁定值为 2026-10-12 快照（下游 SHA `46c6fb61`）**，本 run 的下游 SHA 已推进至 `edbe5e04…`，故版本差另由第 3 条读数独立支撑（两者互不依赖）。
3. **override 实际改动依赖**：`Override caomei-ui to target version` 步骤变更计数 **`+1 −1`**（替换 1 个依赖），与该命令的语义（把 1 个依赖从 `0.6.0` 换成 `0.5.0`）一致。

## 4. 受检清单维护（接入即登记）

| 下游 | 状态 | 依据 |
|:---|:---|:---|
| `dependfix`（`apps/platform`） | **已接入**（matrix 登记 `repository` / `target-package` / `setup-command` / `typecheck-command` / `build-command`） | 两条分支均已跑通：registry latest（run #1）与显式版本（本 run） |
| `momei`（根包） | **已消费未接入** | 已消费 `caomei-ui@0.6.0`（根包）；**单条阻塞**：`momei` 的 `build` = `cross-env NODE_OPTIONS=--max-old-space-size=6144 nuxt build`，**在上游 runner 的无凭据可行性未验证**（`typecheck` = `nuxt typecheck` 相对轻量）。**触发条件** = 该验证通过，或用户指定。**修正（2026-10-13，Review Gate 复核）**：原稿另记一条阻塞「根包下游无 `--filter` 目标 → 需参数化 `add-command`」，经复核**不成立**——pnpm `--filter <name>` 可**按根包名选中根工程**（pnpm 官方 filtering 文档 + 审计方两组独立实测：`pnpm --filter momei exec …` 选中根工程；临时 workspace 实测 `pnpm --filter rootpkg add …` 写入根 `package.json`），现有硬编码 `--filter` **可直接复用、无需参数化** |
| `caomei-auth` / `rss-impact-next` / `afdian-linker` | 零消费，未接入 | 接入后增量登记（沿用既有口径） |

- 同步位置：工作流注释的「受检清单」段（未改动）+ [发布指南 §10](../../guide/release.md)（本批更新现状与 momei 行）+ 本记录。
- **不新增 workflow 改动**的理由见 §1（未验证的 workflow 变更不入库）。

## 5. 判别力口径（管道贯通 vs 回归判别力）

| 口径 | 含义 | 本阶段状态 |
|:---|:---|:---|
| **管道贯通** | Actions 运行时无缺陷、步骤可执行、结论可归因（下游 SHA + 被测版本） | **已成立**（run #1 + 本 run） |
| **重装生效** | override **确实改变**了被安装的 `caomei-ui` 版本 | **已成立**（本 run：版本差 + `+1 −1`） |
| **回归判别力** | 结论能区分「新版本破坏下游」与「不破坏」 | **未成立**（需**被测版本新于下游锁定版本**：发布后由 tag 触发；或负向对照——安装一个已知会破坏下游的版本） |

- **再评估/补跑触发**：① 下一次 `caomei-ui` 发布（tag 自动触发，被测版本 = 新版本 > 下游锁定版本）；② 用户指定补一次负向对照（安装已知不兼容版本，期望**红**）。
- 口径已写入 [发布指南 §10](../../guide/release.md) 与本节，避免后续 session 把「绿 run」读成「兼容性已验证」。

## 6. 未覆盖边界（显式登记）

1. **tag 自动触发分支**仍未执行（需下一次真实发布）——本 run 与 run #1 均为 `workflow_dispatch`。
2. **「实际安装版本」未在 run 内被独立校验**：日志未逐字打印被替换包名，「重装生效」由「版本差 + `+1 −1` + 命令语义」三方推断；拟加的校验步骤登记为 Backlog 候选（§1）。
3. **momei 未接入**（§4 单条阻塞：`nuxt build` 上游无凭据可行性未验证）。
4. **负向对照未执行**（安装已知不兼容版本应报红）——属 §5 的「回归判别力」缺口，触发条件同 §5。

## 7. 载体同步

- [发布指南 §10](../../guide/release.md)（中英）：现状句补本 run 与「版本差重装已生效 / 回归判别力待发布后」口径；受检清单 momei 行补**单条阻塞**与触发条件。
- [Backlog](../../plan/backlog.md)：新增 **3 行**（§1.6「下游兼容检查：校验实际安装版本步骤」、§1.6「暂存区卫生机检（拒绝 `AM` / `MM` 提交）」、§1.8「momei 根包接入下游兼容检查」）→ 在册 29 → **32**。
- `docs/plan/todo.md`：M2-1 状态回填（与本节 Review Gate 结论同批）。
- `docs/design/governance/index.md`：本记录登记。

## 8. 质量门

- 本批**零代码 / 零 workflow / 零 `src/**` / 零 `test/**`**（纯文档 + 外部 run 取证）：`pnpm verify` **exit 0**、`pnpm lint:md:check` exit 0、`pnpm governance:check` exit 0。
- 外部运行证据：run `38332448537` **success**（12 步骤全绿，1 分 55 秒）。

## 9. Review Gate

- audit-depth：`standard`（外部 run 取证 + 跨载体口径）。时间盒：≤ 10 分钟。

### 9.1 结论（2026-10-13）

- **R1 `standard` `Reject`**（**1 blocker / 2 suggest**；实测约 8 分钟，未超时间盒）：blocker = 记录把「根包下游无 `--filter` 目标 → 需参数化 `add-command`」写成既定技术结论（并扩散至发布指南中英 + Backlog），经审计方**独立复算证伪**（pnpm `--filter <name>` 可按根包名选中根工程：官方 filtering 文档 + `pnpm --filter momei exec …` 与临时 workspace 两组实测）→ 该阻塞**不成立**，momei 未接入仅由「`nuxt build` 上游无凭据可行性未验证」独立支撑。suggest = ① 步骤口径（12 实质 vs 枚举 11）② 「下游锁定 `0.6.0`」缺快照时点。
- **处置（同批收口）**：R1 的 4 处载体（记录 §1 / §4、发布指南 §10 中英、Backlog §1.8、索引）改为「**单条阻塞** + 修正说明（无需参数化）」；步骤口径统一为「作业 17 步骤项 / 12 编号步骤 / 11 实质步骤」；「下游锁定 `0.6.0`」标注 2026-10-12 快照（下游 SHA `46c6fb61`）并说明版本差另由 `+1 −1` 独立支撑。
- **R2 `standard` `Reject`**：修复未扫全（记录 §6.3 / §7 仍写「两条阻塞」）+ §1 / 索引仍写「12 个实质步骤」→ 已逐处修正。
- **R3 `standard` `Reject`**：修复落在工作区但**未 `git add`**（`AM` / `MM`，索引版仍为旧快照）→ 已 `git add` 并复核索引版 0 命中；按 AI 协作规范 §3.5 把该**已知复发类** finding 转为机检约束方向（Backlog §1.6 新增「暂存区卫生机检」候选）。
- **R4 `standard` `Pass`**（**0 blocker / 0 warning**，1 条非阻塞 suggest〔「复发类」措辞 → 已改「已知复发类（历史）」〕；实测约 2 分钟）：缩面后只审「暂存区卫生」与「R2 两项在索引版闭合」——`git diff --name-only`（未暂存）为空、索引版两项均 0 命中、5 处载体口径一致、Backlog 在册 **32**（5 / 2 / 1 / 3 / 2 / 15 / 1 / 3）。
- 审计工件：`artifacts/review-gate/2026-10-13-phase23-m2-1-downstream-compat-explicit-version-run.md`（本地态、gitignored）。
