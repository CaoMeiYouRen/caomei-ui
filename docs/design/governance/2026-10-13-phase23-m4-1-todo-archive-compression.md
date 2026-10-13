# Phase 23 M4-1：归档载体压缩（Phase 13 ~ 17 迁深度归档）

> 阶段 / 条目：Phase 23 M4-1（归档载体压缩）。
> 裁定依据：[下一阶段范围评估（第七轮）](./2026-10-12-next-stage-scope-evaluation-7.md) §8.1 **D6**——归档载体**压缩近线窗口（更早阶段迁深度归档）**。
> 关联：[todo-archive.md 主窗口口径](../../plan/todo-archive.md)、[深度归档索引](../../plan/archive/index.md)。

## 1. 背景与触发

`docs/plan/todo-archive.md` 为**只增不减**的归档载体，由 `docs:check:line-count` 按「主窗口只保留近线阶段窗口与归档索引」监控（warn > 400 / error > 600）。自 2026-09-30 **首次压缩**（Phase 0 ~ Phase 12 迁深度归档，主窗口由 594 行回落）后，主窗口随 Phase 18 ~ Phase 22 归档再次累积至 **574 行**（warn 区间）。按 D6 执行**二次压缩**：把更早阶段块迁入深度归档，主窗口只留**近线窗口 + 归档索引**。

## 2. 压缩口径

- **近线窗口 = 最近 5 个已完成阶段**（本次为 **Phase 18 ~ Phase 22**）。
- **迁出范围 = Phase 13 ~ Phase 17**（5 个完整归档块），迁入新深度归档文件 [`phase-13-17.md`](../../plan/archive/phase-13-17.md)。
- **触发规则（写入主窗口口径句）**：主窗口累计超过 warn 阈值（400 行）时，把最早的阶段块迁入深度归档。
- **时间序不变**：主窗口保留块的原有先后顺序不动（Phase 18 ~ Phase 22 保持时间序）；迁出块在深度归档文件内同样保持原顺序。
- **归档块事实零改写**：迁移为**机械操作**，正文一字不改，仅调整相对链接深度。

## 3. 迁移的机械调整（唯一改动面）

链接深度 `../` → `../../`（深度归档文件位于 `docs/plan/archive/`，比主窗口深一层）：

| 原形态（主窗口） | 新形态（深度归档） | 处数 |
|:---|:---|:---|
| `](../design/...` | `](../../design/...)` | 37 |
| `](../standards/...` | `](../../standards/...)` | 11 |
| `](./backlog.md`) | `](../backlog.md`) | 14 |
| `](./recurring.md`) | `](../recurring.md`) | 6 |

合计 **68 处**链接目标改写，是本次迁移的**唯一**改动面；正文其余内容（含各阶段交付、提交号、质量门数值、Review Gate 结论、遗留与后续候选、点时快照）**逐字保留**。

## 4. 结果与可追溯性

- **主窗口行数**：574 → **314** 行（`docs:check:line-count` 判 **ok**，脱离 warn 区间）。
- **迁出块行数**：262 行正文 + 文件头 7 行 = 新文件 269 行（+ 结尾换行）。
- **零改写实证**：以压缩前基线 `git show 5d0496b:docs/plan/todo-archive.md` 取原 Phase 13 ~ 17 段（44 ~ 305 行），按上表机械替换后与新文件正文 `diff` → **零差异**（正文逐字相同）。
- **可追溯**：① 主窗口口径句点名三个深度归档文件与收录范围；② [深度归档索引](../../plan/archive/index.md) 的文件表 + 「迁出时点」记录本批（2026-10-13、行数、口径、迁出范围）；③ 主窗口「归档索引」表新增 Phase 13 ~ 17 五行，逐行指向 `phase-13-17.md`；④ Phase 13 ~ 17 的权威记录仍是各自治理记录（见[治理索引](./index.md)），深度归档只存正文。

## 5. 载体同步

- [`docs/plan/todo-archive.md`](../../plan/todo-archive.md)：文首**主窗口口径句**更新（近线窗口 = Phase 18 ~ Phase 22 / 最近 5 个已完成阶段 / 迁出触发规则），「归档索引」节更名为 **Phase 0 ~ Phase 17** 并 +5 行。
- [`docs/plan/archive/index.md`](../../plan/archive/index.md)：文件表 +1 行（`phase-13-17.md`），「迁出时点」+1 条（2026-10-13）。
- [`docs/plan/roadmap.md`](../../plan/roadmap.md) §5：深度归档范围由「Phase 0 ~ Phase 12」改为「**Phase 0 ~ Phase 17**」，主窗口保留起点由「Phase 13」改为「**Phase 18**」。
- **Backlog 处置**：候选行「归档载体行数超阈压缩」（B22）已在 Phase 23 登记批次随本条目迁出；本条目**不再回填候选行**——压缩触发规则已写入主窗口口径句（活载体），属归档批次的**标准动作**而非待决策候选。

## 6. 质量门

本批为**纯文档 / 规划载体批次**（零 `src/**` 零 `test/**` 零 `.github/**`）：

- `pnpm lint:md:check` exit 0；`pnpm docs:check` 11 段全绿（其中 `docs:check:line-count` → `todo-archive.md` **314 行 ok**）；
- `pnpm governance:check` exit 0；`pnpm verify` 常驻链。

## 7. 归档后回扫（三段式）

- **① 机检面**：压缩后 `pnpm check:governance-records` 先报 **2 处** `stale-planning-pointer`，**已同批改指**：
  - 1 处 `docs/plan/todo-archive.md:5`（本批新写的口径句）：原稿「Phase 0 ~ 6 见 [phase-00-06.md]、Phase 7 第一阶段 ~ Phase 12 见 [phase-07-12.md]、Phase 13 ~ 17 见 [phase-13-17.md]」中，`Phase 13` 紧邻 `phase-07-12.md` 的链接闭合符 → 判定为该链接的紧邻标识而目标不含该标识。**处置**：改写为「链接 + 括注收录范围」形态（`[phase-00-06.md]（Phase 0 ~ 6）` 等），使每个链接的紧邻标识落在其自身收录范围内。
  - 1 处 `docs/design/governance/2026-09-20-m2-1-component-quality-audit.md:122`：`M3-5` 属迁出的 Phase 14 块 → 链接改指 `../../plan/archive/phase-13-17.md`。
  - 改指后 `pnpm check:governance-records` **exit 0**。
- **② 人工面**：枚举「链接指向 `todo-archive.md` 且同行出现**仅存于深度归档**的编号」这一机检盲区形态，命中 **6 处**。口径分两步——**第 1 步**列宽口径候选行（本批输出 **132 行**，含大量编号跨阶段复用的噪声）：

  ```shell
  rg -n '\[[^]]*\]\((\.\./)*plan/todo-archive\.md\)' docs -g '*.md' | grep -v '^docs/plan/'
  ```

  **第 2 步**与「深度归档独有编号集」取交集——编号集口径 = **在 `phase-13-17.md` 出现、且在 `todo-archive.md` 不再出现**的编号形态（快照 2026-10-13 实测 = `T5 / O1 / W2 / B0 / B4 / M4-3 / M5-1 / M3-4 / M3-5 / M3-6 / M5-2 / M3-7 / M31 / T3 / T4 / T9 / M6-8 / R4`）。**6 处逐条枚举（快照 2026-10-13）**：

  | # | 位置 | 命中编号 | 分类与处置 |
  |:-:|:---|:---|:---|
  | 1 | `docs/design/governance/2026-09-20-m2-1-component-quality-audit.md:122` | `M3-5` | 真实导航指针（迁出的 Phase 14 块）→ **① 已改指** |
  | 2 | `docs/design/governance/2026-09-28-m5-1-contrast-audit.md:120` | `M5-1` | 真实导航指针（迁出的 Phase 15 块）→ **同批改指** `../../plan/archive/phase-13-17.md` |
  | 3 | `docs/design/governance/2026-09-18-m5-b1-dialog-ui-validation.md:3` | `M5-1` / `M5-2` | 实指 **Phase 7 第二阶段**的 M5 批次（**首次压缩**已迁入 `phase-07-12.md`）→ 边界内，不改 |
  | 4 | `docs/design/governance/2026-09-18-m5-b4-toolbar-zones-ui-validation.md:3` | `B4` | 同上（`M5 批次 B4`）→ 不改 |
  | 5 | `docs/design/governance/index.md:242` | `B0` / `B4` | 同上（Phase 7 第二阶段 B 系列；编号与链接在行内不同源）→ 不改 |
  | 6 | `docs/design/governance/index.md:243` | `B4` | 同上 → 不改 |

  第 3 ~ 6 处属机检已声明「**同一编号在不同阶段的复用不另判**」边界（见 `check-governance-records` 头注）。
- **③ 未处理面（显式声明，**不**等于「已全量回扫」）**：
  - **跨分隔符散文指针**：编号与链接之间有散文相隔者，机检不覆盖；沿用既有边界，按[规划规范 §7](../../standards/planning.md) 属「登记动作的时点陈述」，**不回改、不登记为待办**。
  - **「阶段限定 + 复用编号」形态**：链接闭合符后**紧邻**（≤ 4 个非 `)` 字符）出现 `Phase 13` ~ `Phase 17`，即形如 `条目登记：[待办归档](../../plan/todo-archive.md) Phase 13 M1-1`、`[待办归档](../../plan/todo-archive.md)（Phase 14 块 M2）`。口径（可复现，本批实测 **14 处 / 13 文件**，快照 2026-10-13）：

    ```shell
    rg -n '\[[^]]*\]\((\.\./)*plan/todo-archive\.md\)' docs -g '*.md' | grep -v '^docs/plan/' | grep -E 'todo-archive\.md\)[^)]{0,4}\(?Phase 1[3-7]'
    ```

    **本批不回改**：主窗口「归档索引」表对**全部迁出阶段**提供逐阶段行摘要 + 深度归档链接，故此类指针**仍可达**（多一跳）；其编号在主窗口索引表内以行摘要形式存在，机检按「同一编号在不同阶段复用不另判」边界放行。逐条改指属**跨库一致性排查**，按 [AI 协作规范 §3.4](../../standards/ai-collaboration.md) 记 **follow-up**（不作本轮阻断面），不由本条目承载。

## 8. Review Gate

R1 `standard` **`Pass`**（0 blocker / 1 warning / 1 suggest）。两条 findings **均同批采纳**，记「已修复未复审」：

- **RG-W01**（warning，首次）§7② 的「可复现口径」不完整——单跑给出的命令输出 **132 行**候选，而记录声明「命中 6 处」（6 来自与编号集的人工交集，未给交集步骤与清单）。**处置**：§7② 改为两步口径（第 1 步宽口径候选行 + 第 2 步编号集交集口径），并**逐条枚举 6 处**（位置 + 编号 + 分类与处置）——满足 AI 协作规范 §9「『N 处』类计数只能由钉边界的命令输出或逐条枚举清单求和得出」。
- **RG-S01**（suggest，首次）§7② 的人工面口径窄于 [规划规范 §7](../../standards/planning.md)，未覆盖「**阶段限定 + 复用编号**」子类（如 `[待办归档](../../plan/todo-archive.md) Phase 13 M1-1`），读者会误读为「已全量回扫」。**处置**：§7③ 显式补列该子类——给出可复现口径与实测计数（**14 处 / 13 文件**），并说明**本批不改**的理由（主窗口归档索引对全部迁出阶段提供行摘要 + 深度归档链接，指针仍可达；逐条改指属跨库一致性排查，按 AI 协作规范 §3.4 记 follow-up）。

**实测用时 ≤ 7 分 57 秒**（宿主计时：发起 `12:43:21`，审计返回后首次计时 `12:51:18`），未超 10 分钟时间盒。审计工件：`artifacts/review-gate/2026-10-13-phase23-m4-1-todo-archive-compression.md`（本地态、git-ignored）。
