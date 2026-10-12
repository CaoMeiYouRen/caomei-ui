# Phase 22 归档批次记录

> 创建时间：2026-10-12
> 关联：**Phase 22（机制真实贯通、依赖安全与升级治理、治理与测试收口）阶段归档**——用户指令「开始归档」
> 依据：[规划规范 §7 / §8](../../standards/planning.md)（状态同步 / 归档清理 / 长期任务触发义务）、[Session Wisdom 蒸馏机制](../../standards/session-wisdom-distillation.md)
> 范围依据：[下一阶段范围评估（第六轮）](./2026-10-10-next-stage-scope-evaluation-6.md) §8
> **本记录是 Phase 22 归档批次的唯一口径载体**：归档块与治理索引条目只引用本记录，不复写易变计数（见 §8 的单点来源界定）。

---

## 1. 归档动作清单

| 动作 | 载体 | 结果 |
|:---|:---|:---|
| 归档块 | `docs/plan/todo-archive.md` | 新增「Phase 22」块（授权与范围 / 非目标 / M1 ~ M6 逐条 / 附带交付 / 阶段总结 / 归档批次 Review Gate）；主窗口口径句更新为「Phase 13 ~ Phase 22」 |
| 清空当前阶段 | `docs/plan/todo.md` | 重写为「当前无进行中阶段 + 下一阶段授权规则 + 未完成项汇总」（移除全部条目行、阶段摘要与非目标段；**无 `Mx-y` 残留**） |
| 阶段表与状态 | `docs/plan/roadmap.md` | 阶段表 Phase 22 行补「2026-10-12 完成并归档」；§1 现状句补 Phase 22 归档；§5 归档索引补 Phase 22；状态行改「当前无进行中阶段」并补 Phase 8 / 视觉基线的两条落定说明；规划纪律注补 Phase 22 归档时点与 Phase 8 首次真实触发贯通 |
| 长期任务 | `docs/plan/recurring.md` | §2「上次执行」列更新为第 25 轮；§3 新增第 25 轮行；触发义务注追加第 25 轮 |
| 候选池复核 | `docs/plan/backlog.md` | 复核 Phase 22 交付项**无残留**（在册的 6 行为 M1-1 / M1-2 / M2-3 / M6-5 的 **follow-up 候选**，非已交付条目）；「归档载体行数超阈压缩」行的计数同步（值见 §8） |
| wisdom | `.session/wisdom.md`（git-ignored） | **3 条活跃**（阈值 20）→ **未达阈值、不蒸馏** |
| 本记录 + 索引 | 本文件 + `docs/design/governance/index.md` | 登记 |
| 指针回扫（同批） | `check:governance-records` 机检面 + 人工面 | 机检改指前 **7 处 `stale-planning-pointer`** → 改指后 **0 处**；**主动改指** 6 份 Phase 22 记录的规划指针共 **8 处**（见 §4） |
| `.session` 阶段态 | `.session/current-task.yaml` / `runtime-state.json`（git-ignored） | 同步为「当前无进行中阶段」（收尾触发点） |

## 2. 阶段交付与提交对账（Phase 22）

- **提交对账命令**：`git log --oneline e48834e..422bc20 | wc -l` → **12**（下界 = Phase 21 归档批次提交 `e48834e`，上界 = 本阶段末条记录提交 `422bc20`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。
- **构成**（逐项相加 = 12）：

| 分类 | 提交数 | 提交 |
|:---|:-:|:---|
| 阶段登记与范围评估 | **1** | `11f9955`（Phase 22 登记 + 第六轮下一阶段范围评估） |
| Phase 22 本体 | **10** | M1 2（`28b4873` / `422bc20`）；M2 3（`6e80f9a` / `50caea7` / `e01f301`）；M6 5（`86caf15` / `e93c557` / `5012d94` / `47e2084` / `59c1073`） |
| 附带交付 | **1** | `56aea73`（M2-2 后续：`simple-git` 跨大版本升级 + 兼容补丁） |

- **归档批次自身提交不计入上式**（本记录 + 归档块 + 载体同步 + 索引为归档批次，另计）。

## 3. 阶段交付摘要（逐主线）

- **M1 机制真实贯通（2 条，全部交付）**：① **下游兼容检查首次真实触发**（`28b4873`）——`workflow_dispatch` 触发 run #1（`38238208301`）成功，作业 `Compat / dependfix` 1 分 46 秒、12 步骤全 success，被测 `caomei-ui@0.6.0`、下游归因 `dependfix @ 46c6fb61`；未覆盖边界如实登记（入参分支 / tag 分支 / **版本差判别力**——下游已锁同版本故为同版本重装）。② **视觉基线首个 CI run 复核与转阻断**（`422bc20`）——首个真实 run `38246131758` 全绿，跨环境渲染一致性经**三次探针**取证达「逐字节相同」，判定**转阻断**（移除 `continue-on-error`）、**不需重冻结基线**；运行器镜像取「不钉 + 迁移即重冻结」。
- **M2 依赖安全与升级治理（3 条 + 1 附带）**：① 运行时告警 `source-map-js`（high）经 `overrides` 锁定修复（`6e80f9a`）；② dev 作用域告警 15 项盘点分批处置（`50caea7`）——修复 10 / 受阻 4 / 无补丁 1（`node-forge`），后续以 `simple-git` 4.0.2 + 兼容补丁解除受阻（`56aea73`）→ 收敛为修复 14 / 无补丁 1；③ 依赖大版本升级逐项评估与达标即升（`e01f301`）——升 3（`vue` / `@lucide/vue` / `typescript` 含 tsconfig 迁移）、陈旧 PR 2、延后 2（`reka-ui` / `conventional-changelog`）并登记 Backlog。
- **M6 治理与测试收口（5 条，全部交付）**：① 归档载体维持留痕（`86caf15`）；② `locale` 守卫解析器容忍注释（`e93c557`）；③ **治理索引与记录计数对账守卫** `check-governance-counts`（`5012d94`，误报实测 0、下界守卫、11 例单测）；④ 文档站 keyframes 副本守卫 + stylelint 受检面扩入示例（`47e2084`）；⑤ 文档站示例外链图片依赖消除（`59c1073`）。
- **零 `src/**` 行为改动、零 `test/**` 业务改动**（本阶段全部为依赖 / CI / 治理守卫 / 文档站示例）→ **未发布新版本**（`latest` 仍为 0.6.0），按 D14 无需登记发布条目。

## 4. 归档后回扫（三段式）

> 口径与示例见 [规划规范 §7](../../standards/planning.md)（回扫结论须按机检面 / 人工面 / 未处理面记录）。

- **① 机检面**：清空 `todo.md` 阶段段落后复跑 `pnpm check:governance-records` → **改指前 7 处 `stale-planning-pointer`**（全部在 Phase 22 记录：`phase22-m2-2-dev-alerts-remediation` / `phase22-m2-2-simple-git-override-upgrade` / `phase22-m2-3-major-upgrades` / `phase22-m6-3-governance-counts-guard` 各 1 处、`phase22-m1-2-visual-baseline-first-ci-run` 2 处、`phase22-m1-1-downstream-compat-first-run` 1 处）；**改指后 0 处**，复跑 **exit 0**（**156** 记录与索引一致 / **346** md 指针无失效；**含本批自身新增的归档记录与索引条目**）。触发机制：`todo.md` 的 Phase 22 段被清空后，链接文字含 `Mx-y` 的指针目标已无该标识。
- **② 人工面**：枚举指向 `docs/plan/todo.md` 的链接（含「链接文字为载体名、编号写在链接之外」的散文形态）——改指前 **77 处 / 36 文件**（命令：`rg -o '\]\((\.\./)*plan/todo\.md\)' docs -g '*.md' | wc -l` → 77；`rg -l … | wc -l` → 36；均排除 `docs/.vitepress/dist`）；其中 **6 份 Phase 22 记录**共 **8 处**（形态为「范围 / 依据 / 载体同步表」中指回当前阶段条目）**已主动改指 `todo-archive.md`**，**改指后 69 处 / 30 文件**；其余为**登记 / 评估动作的时点陈述**（点时记录），本批不回改。
- **③ 未处理面**：更早历史记录（Phase 21 及以前）与阶段评估记录中指向 `docs/plan/todo.md` 的散文指针沿用既有边界（属登记动作的时点陈述），**本批不回改、亦未登记为待办**；深度归档文件内的同类指针随迁入保留。

## 5. 长期任务门槛复核（第 25 轮）

- **触发**：Phase 22 收口前（用户指令「开始归档」），规划清理域，属**门槛复核轮**。
- **结论**：两组任务**待执行批次 0 项**；未达门槛 → **条件触发 1 项维持**（表单控件公共 props 契约后续候选）；**已判定不纳入 5 项维持**。
- **计数**：与第 24 轮**逐项一致（无漂移）**——`useLabelAttrs` 15 / `labelAttrs` 10 / 模板级 `:aria-label="label"` 0 / 继承公共契约 12 / 含内联同名字段 32 / `useFocusControl` 4 / `useAttrs()` 11 / 数值钳位 2 处；§2.2 复跑 `field-shell-overlap.mjs`（各组件 shell 声明 `input 0 / textarea 1 / input-number 0 / tags-input 16`、四组件共有声明 **0**）；`capture:styles` 采样面 **308 项** 0 差异。Phase 22 零 `src/**` 改动，与之一致。
- **落点**：[长期任务](../../plan/recurring.md) §3 第 25 轮（证据与复算命令见该行）。

## 6. wisdom 蒸馏与 Backlog

- **wisdom**：`pnpm distill:wisdom --check` → **`WISDOM_OK: 3 active entries (threshold 20)`**——**未达阈值，本轮不蒸馏**（无批次段新增）；`check:distill-archive` 段数见 §8。
- **Backlog**：Phase 22 交付项逐行复核**无残留**；在册 6 行（`视觉基线受检面扩面` / `CI 运行器镜像钉定` / `文档站示例外链图片守卫` / `reka-ui` 补丁升级 / `conventional-changelog` 8 升级 / 归档载体行数超阈压缩）均为 **follow-up 候选**（非已交付条目），其中归档载体行计数已同步（值见 §8）。

## 7. 规模（唯一口径）

- 归档批次文件（见 §1）：`todo-archive.md`（新增 Phase 22 块 + 主窗口口径句）/ `todo.md`（重写）/ `roadmap.md` / `recurring.md` / `backlog.md` / 6 份 Phase 22 记录的规划指针改指（见 §4②）/ 本记录 / `index.md`。**零 `src/**` 改动、零 `test/**` 改动。**
- 归档块行数、`check-docs-git-revision` 计数与 `check:governance-records` 计数**只在本记录 §8 声明**（漂移高发项）。

## 8. 质量门

> **单点来源范围**：**`todo-archive.md` 行数**、**`check-docs-git-revision` 的 md / 命令计数**与 **`check:governance-records` 的记录 / 指针计数**只在本节声明——归档块与治理索引条目**不复写**、仅引用本节（该几项随文档增删变化，是漂移高发项）。
> **时点口径**：数值为**本批终态时点**（工作区含本批文档；已 `git add` 的受版本控制 md 计入）——**记录 / 指针计数含本批自身新增的归档记录与索引条目**（自引用计数陷阱：归档记录与索引条目**写盘后**即计入受检集——计数守卫按**工作区文件系统**遍历、不读 git 暂存区，故须在全部产物写盘后复算）。

| 项 | 实测（2026-10-12 本批） | 复算命令 |
|:---|:---|:---|
| `pnpm verify` | **exit 0** | `pnpm verify` |
| `pnpm test` / `test:a11y` | **117 文件 / 2301 例** / **59 例** | `pnpm test` / `pnpm test:a11y` |
| `pnpm test:e2e` | **318 例** | `pnpm test:e2e --workers=2` |
| `pnpm test:visual` | **17 例**（16 截图 + 1 下界守卫） | `pnpm test:visual` |
| `capture:styles` | **308 项 0 差异** | `pnpm capture:styles` |
| `docs:check` | **11 段链全绿**（`integrity` 报 1 条预期告警：`todo.md` H1/H2 由 3 降 2，属归档正常移除面） | `pnpm docs:check` |
| `todo-archive.md` 行数 | **574 行**（主窗口；超 warn 下界 400、未达 error 600） | `pnpm docs:check:line-count`（**以此脚本口径为准**） |
| `check-docs-git-revision` | **308 md / 171 条取证命令** revision 均持久 ref（代码区行数随本文增删变化，非终端指标） | `node scripts/governance/check-docs-git-revision.mjs` |
| `check:governance-records` | **156 记录与索引一致 / 346 md 指针无失效 / `stale-planning-pointer` 0 处** | `pnpm check:governance-records` |
| `distill:wisdom --check` | **3** 活跃条目（阈值 20） | `pnpm distill:wisdom --check` |
| `check:distill-archive` | **12** 段 reconciled | `pnpm check:distill-archive` |
| `docs:build` | **exit 0** | `pnpm docs:build` |

## 9. 边界与未覆盖

- **不回改面（有意）**：点时记录（历史治理记录 / 归档块）中的历史版本口径、轮次号与候选池指向——按 [规划规范 §9](../../standards/planning.md)「台账指针的处置判据」保持原样；Phase 21 及更早记录指向 `docs/plan/todo.md` 的散文指针属登记动作时点陈述（§4③）。
- **5 条条目库内无治理记录（已知偏差）**：M2-1 / M6-1 / M6-2 / M6-4 / M6-5 的 Review Gate 结论只存于本地态工件 `artifacts/review-gate/`（git-ignored），**库内无对应治理记录**；本批**不补造路径**，如实登记于归档块「已知观察」②。
- **未跨仓复核**：下游锁定版本（两仓均 `0.6.0`）引自 M1-1 的时点实测（2026-10-12）；外部推进后需重取。
- **主窗口未迁出**：本批主窗口保持 Phase 13 ~ Phase 22（10 个完整块），未把 Phase 13 迁入深度归档——行数仍在 `docs:check:line-count` 的 error 阈值以内（**warn 可接受**）。
- **未穷举**：回扫只覆盖指向 `docs/plan/todo.md` 的链接与治理记录的规划指针；其它文档的 §N 引用未逐条核对。
- **未推送**：Phase 22 末条提交 `422bc20`（M1-2）与**本批归档提交**均**未推送**；`origin/master` = `28b4873`（M1-1 已由用户推送）。

## 10. Review Gate（归档批次）

- audit-depth：`standard`（单分区，归档批次以规划载体为主）。时间盒：≤ 10 分钟。
- **R1 `standard`：`Reject`**（1 blocker / 3 warning / 1 suggest；实测约 9 分钟，未超时间盒）。
  - **RG-B1（blocker）**：§8 单点来源把 `check:governance-records` 写成 **155 / 345**，终态实为 **156 / 346**（自引用计数陷阱：归档记录 + 索引条目写盘后才计入受检集）→ **已修**：§8 / §4① 改终态值 + 时点口径句补防复发说明。
  - **RG-W2（warning）**：索引条目**复写**易变计数 `574`（两处），违反本批自定的单点来源规则 → **已修**：删除并只保留引用措辞（与 Phase 21 条目同口径）。
  - **RG-W3（warning）**：§1 以现在时申报 `.session` 阶段态同步、实测未同步 → **已修**：两文件同步为「当前无进行中阶段」（收尾动作，见 §1）。
  - **RG-W4（warning）**：§8 以现在时申报 `pnpm verify` exit 0、冻结前未复跑 → **已兑现**：本批冻结后复跑（真实结果见 §8）。
  - **RG-S1（suggest）**：§10 / 索引占位待回填（不预写结论）→ 本节与索引条目同批回填。
- **R2 `standard`（delta）**：**`Pass`**（0 blocker；RG-B1 / W2 / W3 / W4 全部关闭；实测约 6 分钟）。
  - **RG-N2（warning，R2 新增）**：§8 新增口径句以「git staging」解释自引用陷阱，与 §11 与守卫实现（按工作区文件系统遍历、`node:fs` 零 git 调用）不一致 → **已修**：改为「写盘后即计入受检集……守卫按工作区文件系统遍历、不读 git 暂存区」。
  - **RG-N1（suggest，R2 新增）**：§1 / §6 复写单点来源值 `574` → **已修**：改为「值见 §8」引用。
  - **RG-N3（suggest，R2 新增）**：`.session` 条目预写「R2 Pass」（R2 结论出具前）→ **已闭合**（R2 实测即 `Pass`，措辞与结论一致）。
- **审计方独立复核通过的关键项**：提交对账 12（构成 1 + 10 + 1，逐 SHA 落位、未用 `HEAD`）；`todo.md` 无 `Mx-y` / 无阶段摘要残留；`backlog.md` 无交付项残留；回扫三段式（机检改指后 0 处 / 156 / 346；人工面 69 处 / 30 文件；6 份记录 8 处改指逐条核对）；长期任务第 25 轮全部计数与第 24 轮逐项一致（含 §2.2 复跑与 `capture:styles` 308 项 0 差异）；wisdom 3 活跃不蒸馏；`check:distill-archive` 12；`docs:check:line-count` 574 行；`check-planning-numbers` 0；5 条无治理记录提交独立核对（`6e80f9a` / `86caf15` / `e93c557` / `47e2084` / `59c1073` 确无记录，未补造路径）；`origin/master` = `28b4873` 与未推送状态。
- **审计方未覆盖边界**：未复跑 `pnpm verify` 聚合链（由调用方冻结后兑现，即 RG-W4）；未复现「改指前 7 处 stale」历史态；未核 `.session/wisdom.md` 与下游两仓。
- **留痕**：`artifacts/review-gate/2026-10-12-phase22-archive.md`（本地态，git-ignored）。

## 11. 回填

- **归档批次提交**：本记录即 Phase 22 归档批次的**唯一口径载体**（**提交号见 git 历史**；本记录与归档块 / 载体同步 / 索引同批提交）。
- **提交后复跑**：`check:governance-records` / `check-docs-git-revision` / `docs:check:line-count` 等守卫按**工作区文件**计数，提交本身不改变计数，与 §8 提交前实测一致。
- **不计入 §2**：归档批次自身提交不计入 §2 的 12 条窗口范围。
