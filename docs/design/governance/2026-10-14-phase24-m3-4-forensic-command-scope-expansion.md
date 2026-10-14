# Phase 24 M3-4：取证命令守卫扩面（`rev-list` / `reflog`）

> 创建时间：2026-10-14
> 阶段条目：Phase 24 M3-4（主线 M3）
> 登记依据：[第八轮范围评估](./2026-10-13-next-stage-scope-evaluation-8.md) N6（该轮 Review Gate `RG-W02` 的登记面）

## 1. 结论摘要

- **扩面**：`check-docs-git-revision` 的受检子命令由 `log` / `show` / `diff` / `grep` 扩至含 **`rev-list`** / **`reflog`**。
  此前 `rev-list` 的**区间端点**不受约束：以 `origin/master` 这类**移动 ref** 作端点的领先计数
  在提交落地后**不可复算**，而守卫扫不到——第八轮评估正是据此登记本条目。
- **新增规则 T6 `unlabeled-transient`**：`reflog` 读的是**本机日志**（`<ref>@{n}` 本质**不可跨机器复算**），
  故其 ref 参数与子命令（`show` / `expire` / `delete` / `exists`）**豁免持久性判定**，代之以**同一行标注**「本地瞬态」——
  未标注即判 `unlabeled-transient`。标注口径写入 [AI 协作规范 §9](../../standards/ai-collaboration.md)。
- **存量处置**：扩面后扫出 **9 处**（写录时点快照）以 `origin/master` 为端点的 `rev-list` 命令，分布于 8 份治理记录；
  逐处把端点**钉为同行载明的解析哈希**（读数不变）。**既有 `reflog` 两处已自带「本地瞬态」标注**，无需改动。
- **受检面下界**：命中命令数随扩面上升，下界同步上调（取值与口径见守卫文件头，本记录不复述）。
- **可测性**：CLI 增加 `--root`（缺省仍为 `docs/`），使负向对照可**以真实进程 exit 1 取证**，而非只做模块级断言。

## 2. 扩面后的判别面（增量）

| 项 | 内容 |
|:---|:---|
| 新增受检子命令 | `rev-list`（区间端点须为持久 ref / 提交哈希）、`reflog`（标注约束，见下） |
| 新增规则 | **T6 `unlabeled-transient`**——`reflog` 命令的**源行**（围栏行 / 行内码所在行）须含标记 `本地瞬态`；**受检面含无参形态**（该族不适用「零 rev 作用于工作区」的既有边界，连 prose 提及也须标注——取舍由规范 §9 明文承担）；标注匹配为**启发式**：拒绝紧邻否定前缀（`(?<!非)`），复杂否定表述仍可绕过（由 Review Gate 必查项兜底） |
| `reflog` 为何不判持久性 | reflog 是**本机瞬态**事实源：`HEAD@{1}` / `<ref>@{2.hours.ago}` 在任何其他机器上**语义不成立**，判「须钉持久 ref」会把该族**全部禁用**；正确做法是**允许但强制标注**，使其结论只能作时点佐证、不得当跨机证据 |
| 引号内 HEAD 的例外扩展 | `findQuotedHead` 对 `reflog` 一并返回 `null`（`'HEAD@{1}'` 是 reflog **原生**语法，非绕过形态） |
| 概不覆盖的形态 | `reflog` 的 ref 与子命令不是 revision 候选（`revisionCandidates` 该族返回空集）；不改 `log` / `show` / `diff` / `grep` 既有口径 |

## 3. 存量端点钉定（读数不变）

判定依据：扩面后 `scripts/governance/check-docs-git-revision.mjs` 的实跑输出（本记录只记**处置动作**，不复述命令输出计数）。
钉定口径沿用仓库既有做法（[第八轮范围评估 §1](./2026-10-13-next-stage-scope-evaluation-8.md)：「领先计数取**解析后的哈希**作端点……**不写 `origin/master` 引用名**」）：

| 记录 | 原端点 | 钉定后 | 哈希出处 |
|:---|:---|:---|:---|
| `2026-09-30-pre-release-readiness.md` | `origin/master..29a7693` | `e2f2793..29a7693`（并注明 `e2f2793` = 当时 `origin/master`） | 同文「快照」行 |
| `2026-10-01-phase18-m1-3-release-0.5.0.md` | `origin/master..3fcc78f` | `1c9f9b0..3fcc78f` | 同行「推送」单元格 |
| `2026-10-02-next-stage-scope-evaluation.md` | `origin/master..HEAD` | `4a2d910..4a2d910` | 同行 `git rev-parse --short HEAD` |
| `2026-10-07-next-stage-scope-evaluation-4.md` | `origin/master..HEAD` | `83ff5b4..83ff5b4` | 同上 |
| `2026-10-10-next-stage-scope-evaluation-5.md` | `origin/master..HEAD` | `ba9587f..ba9587f` | 同上 |
| `2026-10-10-next-stage-scope-evaluation-6.md` | `origin/master..e48834e` | `e48834e..e48834e` | 同行 `origin/master` = `e48834e` |
| `2026-10-12-next-stage-scope-evaluation-7.md`（2 处） | `origin/master..2849296` | `28b4873..2849296` | 同段 `origin/master` = `28b4873` |
| `2026-10-13-phase23-archive.md` | `origin/master..HEAD` | `28b4873..<本批归档提交哈希>` | 同行 `origin/master` = `28b4873`；末端口为**待产生**的提交，故用占位符 |

- **不改读数**：上表每处的结论值（领先计数 / 同步态）保持原样，只把**移动 ref 端点**换成同行载明的解析值。
- **占位符形态**：末条是「实时为准」的指令式命令，两端都无法预知 → 用文档占位符（守卫的持久形态白名单含 `<...>`）。

## 4. 载体同步

- `scripts/governance/check-docs-git-revision.mjs`：子命令扩面、T6 规则、`reflog` 例外、下界与取值口径、CLI `--root`。
- `scripts/governance/check-docs-git-revision.test.mjs`：新增扩面正例 / 反例、T6 正反例、CLI 负向对照（**真实 exit 1**）、CLI 参数与目录不存在 exit 2；同步更新受改动影响的既有断言（代码区段新增 `source` 字段、子命令清单、豁免条数）。
- `docs/standards/ai-collaboration.md` §9：① 「引用命令须钉持久边界」的枚举补 `git rev-list`；② 把原「**不覆盖 `rev-list`**」条目改写为**扩面后的现行口径**（含 reflog 标注口径的 ①②③④ 四项：区间端点钉哈希 / `reflog` 须同行标注 / 无参形态同样受约束 / **`reflog` 不得作计数依据**）；③ 同节「机检面」句**去掉子命令复述**，改指脚本文件头的 `GIT_SUBCOMMANDS`（**单点定义**，消除「同一事实两处枚举」的漂移面——该句原仍固化四类子命令，由首轮复核判出）。
- `docs/design/governance/experience-archive.md`：对同一条事实**就地标注「该判据已于 2026-10-14 失效」**（**不新增行** —— 该块为受 `distill-wisdom --reconcile` 对账的蒸馏块，新增行会破坏其自述行数）。
- 守卫豁免清单**未改动**（仍 2 条）：首轮尝试为规范 §9 的反例示例串新增豁免，但该反例在复审修复中改为 prose 表述（不再出现字面命令形态），T4 反向校验随即报「不再命中任何命令」——**按设计移除**该豁免，而非放宽匹配（T4 正常工作时无需豁免即绿）。
- `docs/plan/todo.md` / `docs/design/governance/index.md`：状态与登记（与本记录 §6 结论**同批**落地，不早于结论）。

## 5. 质量门

- `pnpm lint:check` / `pnpm lint:md:check` / `pnpm typecheck` / `pnpm governance:check` **exit 0**。
- `pnpm verify` **exit 0**；定向测试 `check-docs-git-revision.test.mjs` 通过。

## 6. 边界

1. **不放宽既有面**：`log` / `show` / `diff` / `grep` 的判定逻辑不变；扩面只**新增**受检面与一条族约束。
2. **`reflog` 结论的证据等级**：标注只解决「不得当跨机证据」，**不**使其成为可复算证据；需要可复算时仍须改用 `rev-list` / `ls-remote`。
3. **`--root` 是测试性入口，用途限定为负向对照**：缺省行为（扫 `docs/`）不变；参数校验为「恰好 `--root <dir>`」+ 目标须为目录（否则 exit 2）。该入口**不提供**下界 / 豁免覆盖，故在「干净合成根」上恒 exit 1（T4 豁免反向校验 + T5 下界）——**需要「通过态」的合成受检面时用模块 API**（`checkDocsGitRevision(root, { exemptions: [], bounds: … })`）。
4. **存量只改端点形态**：不改任何记录的历史结论、不改归档块形态、不重写散文。
5. **T6 的标注检测是启发式**：`(?<!非)` 只挡**紧邻**否定前缀，语义级否定（「并非……本地瞬态」）仍可绕过；规范性由 §9 的必查项承担（机检只能拦形态）。同理，标注**须同行**（不跨行）是**明示取舍**而非能力不足——跨行解析正是同类守卫的实测缺陷来源。

## 7. Review Gate

- audit-depth：`standard`（守卫受检面扩面 + 新增规则 + 存量多载体改动 + CLI 参数变更）。时间盒：≤ 10 分钟。
- **R1（`standard`）`Pass`**（**0 blocker / 2 warning / 5 suggest**）。审计方独立复核：仓库外夹具负向对照（`origin/master` 端点的 `rev-list` → exit 1；未标注 `reflog` → exit 1）、存量 9 处端点**逐处复算读数不变**且哈希真实同源（`git cat-file -t` / `git branch -r --contains`）、豁免 T4 计数（3 条各命中 1 次）、既有 `reflog` 两处同行标注、边界探针（带标注的命令替换仍判 `unverifiable-shape`，T6 未越权放宽）。
  - **RG-W01（warning，首次）**：§9「机检面」句仍固化四类子命令，与同节新增条及代码矛盾 → **同批采纳**：改为不复述、指向脚本文件头 `GIT_SUBCOMMANDS`（单点定义）。
  - **RG-W02（warning，首次）**：`reflog` 未继承「prose 提及」边界，构成新误报面 → **同批采纳**（取审计方给出的方案 a）：§9 §9-③ 就地声明「`reflog` 在 `docs/` 中**一律视为本地瞬态取证**，含无参提及，**不适用** `log` / `show` / `diff` 的零 rev 边界」。
  - **RG-S01（suggest，采纳）**：`reflog` 作计数依据缺约束载体 → 并入 §9 ④「**`reflog` 不得作为计数依据**」并列为 **Review Gate 必查项**（转必查项而非机检：计数工具在管道右侧，守卫按 `|` 截断、不在面内）。
  - **RG-S02（suggest，采纳）**：标注匹配为无边界子串（「非本地瞬态」亦放行）→ 改 `(?<!非)本地瞬态`，并补反例测试；已在守卫文件头声明其为**启发式**。
  - **RG-S03（suggest，采纳）**：T6 只认同行，围栏内上一行注释不认 → 属**明示取舍**（不跨行是同类守卫的既有教训），已在 §9-③ 给出写法要求与「不算」的显式说明。
  - **RG-S04（suggest，采纳）**：CLI `--root` 校验不完整（尾随参数被静默忽略；目标是文件时抛 `ENOTDIR` 栈而非按契约 exit 2）→ 改为**参数恰好 2 个** + `statSync().isDirectory()` 校验，补 exit 2 测试（文件路径 / 尾随参数）。
  - **RG-S05（suggest，采纳）**：记录 §7 待收口 vs `todo` 已回填「已完成」→ 本轮结论落定后**同批**回填本节并按规划规范回填状态（完成态不早于 Gate 结论）。
- **本轮用时**：发起前取戳 `2026-10-14T23:57:28+08:00`；**未在返回时点取戳** → 上界见提交时点，未超 10 分钟时间盒。
- **第 2 轮范围**：仅审上述 6 处修复的 diff（规范 §9 / 守卫 CLI 与标注度量 / 单测 / 本记录）+ 受影响断言，不重读全量。
- **R2（`standard`）`Pass`**（**0 blocker / 0 warning / 2 suggest**；第 1 轮 7 条 findings **全部关闭**，转 follow-up 0 条）。审计方独立复跑仓库外夹具（无参 `reflog` 形态 → exit 1；同行标注 → 放行；围栏内**上一行**注释 → exit 1；「非本地瞬态」→ exit 1；`origin/master` 端点 → exit 1）与 CLI 五形态 exit 码，并核对 6 处修复**全部落在索引版**（工作区 vs 索引 diff 为空）、§9 无第二份现行口径枚举。
  - **RG2-S01（suggest，本轮新范围，已采纳）**：受检面下界断言改为自引用常量后**失去独立钉定**（常量被下调仍绿）→ 补**绝对下界断言**（独立于代码常量）。
  - **RG2-S02（suggest，本轮新范围，已采纳）**：CLI `--root` 在「干净合成根」上恒 exit 1，契约表述需收口 → 守卫文件头**明写用途边界**（负向对照专用；「通过态」合成面用模块 API + `bounds`），本记录 §6.3 同步。
- **采纳时序说明**：两条均为**非阻断 suggest**，在 R2 判 `Pass` 后**同批采纳**（改动为一条断言 + 文件头/记录表述），故**不再起第 3 轮**；本轮结束后的提交态即上述差异，复审可按 §7 两份 `Pass` 基线对账。
