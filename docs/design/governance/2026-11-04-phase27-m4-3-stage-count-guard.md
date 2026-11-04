# Phase 27 M4-3 阶段构成计数跨载体机检交付记录

> 创建时间：2026-11-04
> 依据：[Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §2 的 M4-3；范围依据见[第十一轮范围评估](./2026-11-03-next-stage-scope-evaluation-11.md) §2 D-3。
> 定位：Phase 27「机制与质量收口」第 3 条的交付记录；本记录是该守卫的规则、判别力与未覆盖边界的唯一载体。

## 1. 交付范围

- 新增 `scripts/governance/check-stage-counts.mjs` 与 `check-stage-counts.test.mjs`（覆盖 9 类失败码、分支边界与两条正向对照）。
- 新增 `pnpm check:stage-counts`，接入 `governance:check`（紧随 `check:governance-counts`）。
- 零运行时改动、零文档口径改动；守卫只读 `docs/plan/todo.md` 与 `docs/plan/roadmap.md`。

## 2. 判别规则

| 载体 | 读取面 | 对账项 |
| :--- | :--- | :--- |
| `docs/plan/todo.md` | 「当前进行中阶段：Phase N」；当前状态段**首个**「N 条主线 / M 条原子条目」与**首个**「构成对账 a + b + …… = M」；`## Phase N 原子条目` 表格行 | 计数 / 对账式 / 行数 / 主线前缀数 / 逐主线分布 / 载体数 |
| `docs/plan/roadmap.md` | §1 当前态句；阶段表 `**Phase N**` 行（**首个**计数与对账式） | 阶段提及 / 计数 / 对账式 / 阶段表最大编号 / 载体数 |

- **三处一致**：主线数、原子条目数、对账分量个数、分量之和、对账结果。
- **逐主线分布**：条目编号按首次出现顺序（`M1` / `M2` ……）与对账分量按位置对齐，逐项比较行数（位置约定写在脚本文件头）。
- **表内**：条目编号的唯一主线前缀数（`M1` / `M2` ……）必须等于主线数。
- **阶段表**：最大编号必须等于当前进行中阶段，防止「表里还挂着旧阶段」。
- **历史快照**：`原登记 N 条主线 / M 条原子条目为 …时点值` 靠「当前状态段内首个匹配」跳过，不做语义解析（登记时的时点值不回改）。
- **受检面下界**：`SCOPE_FLOOR.carriers = 2`（由成功解析的载体数累加）、`SCOPE_FLOOR.itemRows = 1`；解析被削弱时不会「零命中即通过」。

## 3. 失败码

`io-error` / `missing-field` / `phase-mismatch` / `count-mismatch` / `sum-mismatch` / `part-mismatch` / `row-count-mismatch` / `main-line-mismatch` / `scope-narrowed`。

## 4. 负向对照（单测）

- 计数不一致 → `count-mismatch`；
- 对账式算错 / 结果与原子条目数不符 / 含空分量 → `sum-mismatch`；
- 对账分量与逐主线行数不符 → `part-mismatch`；
- 条目行数不符 → `row-count-mismatch`；
- 主线前缀数不符 → `main-line-mismatch`；
- §1 未提及当前阶段 / 阶段表最大编号不符 / 阶段行缺失 → `phase-mismatch`；
- 缺计数声明 / 缺当前阶段声明 → `missing-field`；
- 条目表为空 → `scope-narrowed`；
- 阶段行缺失时载体数降为 1 → `scope-narrowed`（载体维度的负向断言）；
- 载体缺失 → `io-error`；CLI 参数非法 / 目录不存在 → exit 2；
- **正向对照**：当前阶段之前的旧 `## Phase N 原子条目` 段与「修订记录」段存在时，只读当前状态段与当前阶段的表（不会被旧段带偏）。

## 5. 验证证据

- `pnpm exec vitest run scripts/governance/check-stage-counts.test.mjs` → **21 passed**（9 类失败码 + 分支边界 + 两条正向对照）。
- `node scripts/governance/check-stage-counts.mjs` → **exit 0**：当前阶段 6 条主线 / 18 条原子条目（条目行 18，载体 2）。
- **真实内容负向对照**：复制两份规划载体后把 `roadmap` 的 `= 18` 改为 `= 17` → **exit 1**，报 `sum-mismatch`（分量和 18 与写明 17 不符、结果 17 与原子条目数 18 不符）。
- `pnpm governance:check` → **exit 0**（含新守卫）。

## 6. Review Gate

- **audit-depth**：`standard`（新增守卫 + 单测 + 门禁接线、零运行时改动）；R2 / R3 为 `quick` delta。时间盒：R1 ≤ 8 分钟，delta ≤ 4 分钟。
- **R1（`standard`）：`Pass`**（0 blocker / 3 warning / 5 suggest）——warning：`carriers` 字面量恒为 2、计数按全文首个匹配与口径不一致、索引摘要复述「15 例」；suggest：逐主线分布、空分量、分支覆盖、规范锚点、格式耦合边界。
- **R2（`quick` delta）：`Reject`**（1 blocker / 1 warning / 3 suggest）——blocker：本记录 §1 仍写「15 例」与 §5 的 `21 passed` 矛盾；warning：真实负向对照多报 `count-mismatch`；suggest：JSDoc 缺 `invalid`、§2 表格未列逐主线分布 / 载体数、`itemRows` 判别力偏弱。W1 / W2 / W3 与 S1 ~ S5 均已关闭。
- **R3（`quick` delta）：`Pass`**（0 blocker / 0 warning；R2 的 1 blocker / 1 warning / 3 suggest 全部关闭或按声明结项）。
- **用时实测（宿主时钟）**：R1 发起 `2026-11-04T12:29:47Z`、返回 `12:35:14Z` ≈ **5 分 27 秒**（≤ 8 分钟）；R2 发起 `12:57:56Z`、返回 `12:59:49Z` ≈ **1 分 53 秒**（≤ 4 分钟）；R3 发起 `13:00:43Z`、返回 `13:01:27Z` ≈ **44 秒**（≤ 4 分钟）。
- **复查基线**：`scripts/governance/check-stage-counts.mjs`、`check-stage-counts.test.mjs`、`package.json`、`docs/standards/planning.md` §7、本记录、`docs/design/governance/index.md`。

## 7. 未覆盖边界

- 只对账「当前进行中阶段」；`todo-archive.md`、归档块与历史治理记录不在面内。
- 不校验条目状态（已完成 / 待执行）与正文交付面内容。
- 不解析「时点值」语义；历史括注依赖「当前状态段内首个匹配」的位置约定。
- 不覆盖 `roadmap.md` 阶段表以外的主线描述（如 §2 表中的核心交付正文）。
- **格式耦合（fail-closed）**：`## 当前状态`、`## Phase N 原子条目`、阶段表 `**Phase N**` 粗体与 §1 的 `Phase N` 字面号是硬依赖；形态被破坏时直接报错，不做模糊匹配。
- 逐主线分布按「条目编号首次出现顺序 ↔ 对账分量位置」对齐；若未来调整条目排列顺序而不调整对账分量顺序，会报 `part-mismatch`（有意如此，避免静默漂移）。
- `SCOPE_FLOOR.itemRows` 的判别力偏弱（`row-count-mismatch` 已覆盖多数收窄）；后续再动本守卫时可评估是否并入 `carriers` 单一维度。
