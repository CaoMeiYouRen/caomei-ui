# Phase 22 M6-3：治理索引与记录计数对账守卫

> 阶段：Phase 22（机制真实贯通、依赖安全与升级治理、治理与测试收口）M6-3
> 日期：2026-10-11
> 范围：新增 `scripts/governance/check-governance-counts.mjs` + 单测；`package.json`（接入 `governance:check`）；`docs/standards/ai-collaboration.md` §9（机检面登记）；零 `src/**`
> 依据：范围与验收见 [待办事项 §Phase 22](../../plan/todo.md) M6-3；[AI 协作规范 §9](../../standards/ai-collaboration.md)
> 基线：`e93c557`

## 1. 背景

候选 B22（治理索引与记录计数对账守卫）：历史上（2026-09-30 浮层遮挡修复批次）连续两轮 Review Gate 以「**同一组计数跨载体漂移**」判 blocker——记录本体为修复前快照、索引摘要未同步。原评估结论为「**高误报 / 高过拟合，未实施**」（计数散落在自然语言摘要中，抽取规则易误伤），当时以「改完逐载体 `rg -o` 核对」的流程约束替代。

Phase 22 M6-3 要求把该流程约束**部分机检化**，且验收口径为「**误报口径经实测标定（误报 0 / 负向对照命中）；接入 `governance:check`**」。本记录给出被采纳的**收窄口径**与**误报实测**。

## 2. 口径与设计（收窄以压误报）

- **受检面**：`docs/design/governance/index.md` 的**索引条目**（`- [文字](./记录.md)：摘要`）↔ 其**记录本体**。
- **计数族**（只覆盖可机器识别、两载体惯用同一数值语义者；分隔符容忍 `N 文件 M 例` 与 `N 文件 / M 例` 两种写法）：
  - `test`：`N 文件 / M 例`（`pnpm verify` 测试计数）
  - `e2e`：`N passed` / `N tests`
  - `records`：`N 记录 / M 指针`
  - `mdcmd`：`N md / M 命令`
- **判定规则**：索引条目引用的某族计数，**若记录本体也出现该族计数**，则索引值必须出现在本体值集合中；**本体完全不含该族计数时跳过该族**（无法对账，不判失败）。反向（本体有、索引没有）不判失败（本体可引用历史快照计数）。
- **判别力**：只对「两处都有却互相矛盾」判失败——正是历史 blocker 的精确类别，也是把误报压到 0 的关键；受检面下界 `MIN_RECONCILED = 40` 防静默收窄。

## 3. 误报标定（2026-10-11 实测）

按上述规则在**当前仓库**实测（`node scripts/governance/check-governance-counts.mjs`，**本记录自身索引条目 staged 后**复算）：

| 计数族 | 索引条目引用数 | 本体命中 | 矛盾（失败） |
|:---|:---:|:---:|:---:|
| `test`（文件 / 例） | 19 | 19 | 0 |
| `e2e`（passed / tests） | 47 | 47 | 0 |
| `records`（记录 / 指针） | 1 | 0（本体无该族 → 跳过） | 0 |
| `mdcmd`（md / 命令） | 0 | — | 0 |
| **合计对账** | — | **66** | **0** |

- **误报 = 0**（**66** 条对账全通过；`records` 族的 1 条因本体不含该族计数按规则跳过）。
- **口径容错**：`test` 族容忍 `104 文件 2157 例`（无 `/`）与 `104 文件 / 2157 例` 两种写法——标定中发现 2 份记录本体用前者、索引用后者，规范化后一致（否则会误报 2 条）。
- **自引用口径（[AI 协作规范 §9](../../standards/ai-collaboration.md)）**：守卫对账数**含本记录自身的索引条目**，故必须在**全部产物 staged 后**复算（本条初稿曾按 staged 前的 65 写，RG-B01 判 blocker）。

## 4. 交付物

- `scripts/governance/check-governance-counts.mjs`（新守卫；纯函数 `extractCounts` / `parseIndexEntries` / `checkGovernanceCounts`）。
- `scripts/governance/check-governance-counts.test.mjs`（11 例：计数族提取 / 两种分隔写法 / e2e `N passed` 与 `N tests` / 多位数边界（`119` 不截断为 `11`）/ md / 命令计数 / 索引解析 / 仓库现状 / 矛盾判失败 / 本体无该族跳过 / 受检面下界；含负向对照）。
- `package.json`：新增 `check:governance-counts`，接入 `governance:check` 链（紧随 `check:governance-records`）。
- `docs/standards/ai-collaboration.md` §9：登记机检面。

## 5. 证据（可复现）

- `node scripts/governance/check-governance-counts.mjs` → 通过（对账 **66** 条计数一致）。
- `pnpm exec vitest run scripts/governance/check-governance-counts.test.mjs` → 11 passed。
- 负向对照：夹具 `index` 引用 `115 文件 / 2274 例`、本体为 `115 文件 / 2280 例` → 判失败；本体无该族计数 → 跳过（不判失败）；对账数低于下界 → 判失败。

## 6. 质量门

- `pnpm verify` **exit 0**（117 文件 / 2301 例）。
- `governance:check` exit 0（含 `check:governance-counts`）。
- 零 `src/**` 零 `test/**` 业务改动。

## 7. Review Gate

- audit-depth：`standard`（新增治理守卫 + 配置接线）。时间盒：≤ 10 分钟。
- **R1 `standard`**：`Reject`（1 blocker〔RG-B01 记录 §3/§5 对账计数错值：写 65、实测 66，属「记录自身索引条目 +1」自引用陷阱〕+ 2 warning〔RG-W01 `pnpm verify` 计数陈旧 / RG-W02 单测形态矩阵不全〕+ 4 suggest）。
- **修复**：RG-B01 → 计数改 **66（test 19 / e2e 47）** + §3 增「自引用口径（须 staged 后复算）」；RG-W01 → **117 文件 / 2301 例**；RG-W02 → 补 e2e `N tests` / `mdcmd` / 多位数边界用例；RG-S01 → §9 补实现指针 + 下界；RG-S02 → 文件头披露盲区；RG-S03 → 无动作（`todo.md` M6-2 翻转属基线提交）；RG-S04 → 维持同形返回。
- **R2 `standard`（delta）**：`Reject`（1 blocker〔RG-B02 记录 §4/§5 与索引摘要的单测数写 9、实测 11——RG-B01 同根因复发〕）。
- **修复**：RG-B02 → 三处 **9 → 11**（§4 补枚举）。
- **R3 `standard`（delta，终轮）**：**`Pass`**（0 blocker / 0 warning / 0 suggest；RG-B02 关闭，全量计数逐载体一致：对账 66 / 单测 11 / verify 117 文件 2301 例）。审计工件 `artifacts/review-gate/2026-10-11-phase22-m6-3-governance-counts.md`。
