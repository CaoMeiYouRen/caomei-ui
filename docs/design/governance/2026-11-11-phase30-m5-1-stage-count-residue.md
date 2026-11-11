# Phase 30 M5-1 当前状态段残留机检交付记录

> 创建时间：2026-11-11
> 依据：[Phase 30 登记批次记录](./2026-11-10-phase30-registration.md) §2 的 M5-1（用户裁定 D4 ①）。
> 前置：守卫本体、判别规则与既有失败码见 [阶段构成计数守卫记录](./2026-11-04-phase27-m4-3-stage-count-guard.md)；无进行中阶段时跳过的扩展见 [发布收口记录](./2026-11-07-phase27-m5-1-1.1.0-release.md) §5。本记录只承载本次新增的两项残留断言。

## 1. 交付范围

| 载体 | 动作 |
|:---|:---|
| `scripts/governance/check-stage-counts.mjs` | 「无进行中阶段」跳过分支新增两项断言：当前状态段**不得出现阶段编号**、**不得链接待办归档**；新增失败码 `phase-state-residue`；当前状态段标题收敛为单一常量（解析与残留校验共用） |
| `scripts/governance/check-stage-counts.test.mjs` | 两条形态各一例负向单测 + 一例 CLI 负向（`exit 1` 并输出失败码）+ 一例受检面边界正例（汇总段残留不判） |
| `docs/standards/planning.md` §7 | 该守卫条目补「该段须为纯状态指针」与失败码锚点 |
| 本记录 + 治理索引 | 交付与结论的唯一载体 |

零运行时改动、零依赖、零 UI；`governance:check` 的接入方式不变（既有 `check:stage-counts` 已在链内）。

## 2. 判别规则

| 残留形态 | 判据 | 失败码 |
|:---|:---|:---|
| 阶段编号形态 | `todo.md` 的 `## 当前状态` 段出现 `Phase` + 阿拉伯数字（历史写法与前瞻写法**一视同仁**） | `phase-state-residue` |
| 归档载体提及 | 同段出现 `todo-archive.md` 子串即命中（相对 / 绝对链接、行内代码、纯文本均算；`*.bak` 一类后缀同样命中，属 fail-closed） | `phase-state-residue` |

- **只在跳过分支生效**：仅当 `todo.md` 显式声明「当前无进行中阶段」且文件中无「当前进行中阶段：Phase N」声明时进入；进行中阶段的对账分支口径不变（登记期在状态句点名阶段是合法形态）。
- **受检面止于当前状态段**：段边界沿用既有实现（标题到下一个二级标题）。「未完成项汇总」不在面内——该段允许保留「等待外部反馈」类状态指针。
- **为何只拦这两项**：归档后 `todo.md` 只承载「当前阶段状态 + 未完成项汇总」（[规划规范 §7](../../standards/planning.md)）。把上一阶段的编号或归档链接写进状态段，会让下一个 session 依据「上次交付在这里」把历史阶段当作现行恢复起点；交付信息唯一去处是[待办归档](../../plan/todo-archive.md)与 git 历史。
- **与时点记录的边界**：`todo-archive.md` 归档块、历史治理记录中的阶段编号属点时快照，不在面内。

## 3. 负向对照

| 对照 | 构造 | 结果 |
|:---|:---|:---|
| 单测 · 阶段编号 | 无阶段声明 + 状态段写「上一阶段（Phase 9）已交付并归档」 | 判 `phase-state-residue` |
| 单测 · 归档链接 | 无阶段声明 + 状态段写「上一批交付见[待办归档](../../plan/todo-archive.md)」 | 判 `phase-state-residue` |
| CLI · 阶段编号 | 同上形态落临时目录后执行脚本 | `exit 1`，stderr 含 `phase-state-residue` |
| 正向对照 · 合法指针 | 无阶段声明 + 状态段仅写「下一阶段待授权后登记」 | `skipped: true`，`exit 0`，无问题 |
| 正向对照 · 受检面边界 | 状态段干净 + 「未完成项汇总」写阶段编号与归档链接 | `skipped: true`，无问题（受检面止于当前状态段） |

- 临时夹具均在仓库外（`/tmp/opencode/` 下），不进入受检面。

## 4. 验证证据

| 项 | 结果 |
|:---|:---|
| `npx vitest run scripts/governance/check-stage-counts.test.mjs` | 通过（新增四例 + 既有跳过 / 冲突 / 对账用例全绿） |
| `node scripts/governance/check-stage-counts.mjs` | `exit 0`：当前阶段走对账分支，构成计数无差异（跳过分支的改动不影响进行中阶段） |
| 负向复现（仓库外夹具） | 阶段编号与归档链接两种形态均 `exit 1`；合法状态指针 `exit 0` |
| `pnpm typecheck` | 通过（无 TS 源码改动；脚本为 `.mjs`，由 `eslint` 与定向单测覆盖） |
| `pnpm lint:check` / `pnpm lint:md:check` | 通过 |
| `pnpm governance:check` | 通过 |

## 5. Review Gate

- **audit-depth**：`standard`（治理守卫的分支判定语义 + 单测 + 规范锚点；零运行时 / 零依赖 / 零 UI / 零发布面，但「配置 / 工具链类至少 standard」——正确性取决于生效性）。时间盒 ≤ 10 分钟。
- **R1（按 `quick` 执行；调用方初版声明即 `quick`）**：`Pass`（0 blocker / 1 warning / 3 suggest）。R1 实测 4 分 45 秒 ≤ 5 分钟；本条改按 `standard` 记档后时间盒 10 分钟同样满足。
  - **W1 档位声明偏低**：`quick` 与 [AI 协作规范 §3.1](../../standards/ai-collaboration.md) 的「配置 / 工具链类至少 `standard`」不符。**已采纳**：本条改按 `standard` 记档，生效性核验（定向单测 + 仓库外三处夹具）在 R1 前已完成并随 prompt 提交。
  - **S1 记录 §2 / §6 的边界表述与实现不一致**（实现按任意 `Phase` + 数字与任意 `todo-archive.md` 文本判定，记录写作「历史阶段编号」）。**已修**：§2 表格与 §6 统一为「历史 / 前瞻一视同仁」与「不限链接语法」。
  - **S2「未完成项汇总不在面内」缺正例锁定**。**已补**：新增一例正向对照（状态段干净、汇总段含编号与归档链接仍 `skipped`），把受检面边界变成可回归契约。
  - **S3 §4 未列 `pnpm typecheck`**。**已补**。
- **R2（`quick` delta；≤ 5 分钟）**：`Pass`（0 blocker / 0 warning / 3 suggest；实测约 3 分钟）。三条 suggest 均采纳为文案精度修正，不触代码：
  - **S1 R1 行的时间盒口径与档位不匹配**（`standard` 记档却写「未超 ≤ 5 分钟」）：已改为「R1 按 `quick` 执行、4 分 45 秒 ≤ 5 分钟；改按 `standard` 记档后 10 分钟同样满足」。
  - **S2 用例枚举漏记边界正例**（§1 与索引摘要停留于三例）：已按新增四例同步。
  - **S3「按路径尾段判定」强于实现**（实为正则子串匹配）：已改为子串表述并注明 `*.bak` 一类后缀同样命中、方向仍为 fail-closed。
- **复查基线**：本记录 §2 / §3；`scripts/governance/check-stage-counts.mjs` 的跳过分支与文件头「有意边界」；`check-stage-counts.test.mjs` 的跳过 / 残留 / 边界正例 / CLI 用例；`docs/standards/planning.md` §7 的该守卫条目。

## 6. 未覆盖边界

- **「未完成项汇总」不在面内**：该段允许出现阶段编号（如等待外部反馈时点名历史阶段），本次未收紧；若需要「全文不得残留编号」，应另立条目并先取证存量。
- **只认 `Phase` + 阿拉伯数字**：中文序数写法（如「第三十阶段」）不命中，属有意（与既有守卫的编号形态一致）。
- **不跳过围栏与行内代码**：当前状态段内若贴入含 `Phase N` 或 `todo-archive.md` 的示例文本会被判失败（fail-closed）；该段本就是纯状态指针，出现示例文本本身即异常。
- **归档载体改名需同步常量**：文本判定按子串 `todo-archive.md`（`TODO_ARCHIVE_FILE` 只用于问题详情文案），载体改名后须同步 `STALE_ARCHIVE_LINK_RE`。
- **不区分历史 / 前瞻写法**：任何 `Phase` + 阿拉伯数字都判失败（状态段只应写指针，前瞻句也不带编号）。
