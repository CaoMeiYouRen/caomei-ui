# Phase 19 归档批次记录

> 创建时间：2026-10-07
> 关联：**Phase 19（设计一致性口径落地、组件文档去重与观感缺陷处置）阶段归档**——用户指令「开始归档」
> 依据：[规划规范 §7 / §8](../../standards/planning.md)（状态同步 / 归档清理 / 长期任务触发义务）、[Session Wisdom 蒸馏机制](../../standards/session-wisdom-distillation.md)
> 范围依据：[下一阶段范围评估（第三轮）](./2026-10-02-next-stage-scope-evaluation.md) §8
> **本记录是 Phase 19 归档批次的唯一口径载体**：归档块与治理索引条目只引用本记录，不复写易变计数（见 §8 的单点来源界定）。

---

## 1. 归档动作清单

| 动作 | 载体 | 结果 |
|:---|:---|:---|
| 归档块 | `docs/plan/todo-archive.md` | 新增「Phase 19」块（授权与范围 / 非目标 / M1 ~ M7 逐条 / 附带交付 / 阶段总结 / 归档批次 Review Gate） |
| 清空当前阶段 | `docs/plan/todo.md` | 重写为「当前无进行中阶段 + 未完成项汇总」（移除全部条目行与交付摘要） |
| 阶段表与状态 | `docs/plan/roadmap.md` | 阶段表 Phase 19 行补「完成并归档」；§1 现状句补 Phase 19 归档；§5 归档索引补 Phase 19；状态行改「当前无进行中阶段」；规划纪律注补 Phase 19 归档时点 |
| 长期任务 | `docs/plan/recurring.md` | §2「上次执行」列更新为第 21 轮；§3 新增第 21 轮行；触发义务注追加第 21 轮 |
| 候选池复核 | `docs/plan/backlog.md` | 逐行复核确认 Phase 19 交付项**无残留**（不新增、不删除候选行）；顺带把 §1.6 新增候选正文中的里程碑编号写法改为能力名（[规划规范 §7](../../standards/planning.md)「条件候选不写 `Mx-y`」） |
| wisdom | `.session/wisdom.md`（git-ignored） | `--check` 阈值判定见 §6；归档段对账维持通过 |
| 本记录 + 索引 | 本文件 + `docs/design/governance/index.md` | 登记 |
| 指针回扫（同批） | 9 份 Phase 18 治理记录（机检命中）+ 14 份 Phase 19 治理记录（主动） | 表头「关联条目」由指向 `docs/plan/todo.md` 改指 `todo-archive.md`——`check:governance-records` 报 9 处 `stale-planning-pointer`，改指后复跑 exit 0；Phase 19 记录一并预防性改指 |
| 顺带修正 | `docs/plan/todo-archive.md` | 主窗口阶段块顺序修正为时间序（原 Phase 18 块误置于 Phase 17 之前），现为 13 → 14 → 15 → 16 → 17 → 18 → 19 |

---

## 2. 阶段交付与提交对账（Phase 19）

- **提交对账命令**：`git log --oneline c69b3e3..1ff2757 | wc -l` → **28**（下界 = Phase 18 归档批次末条提交 `c69b3e3`，上界 = 本阶段末条实现 / 记录提交 `1ff2757`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。
- **构成**（逐项相加 = 28）：

| 分类 | 条数 | 提交 |
|:---|:-:|:---|
| Phase 19 本体（原子条目） | **17** | M1 8（`db342c3` / `89c4d82` / `1728a0f` / `8288638` / `222cee7` / `86f1cad` / `ecf019e` / `522befe`）；M2 3（`7139efe` / `5d36c3a` / `cf38ca8`）；M3 3（`7b71b2e` / `35c6731` / `7a70134`）；M4 1（`70a7eb7`，M4-1 / M4-2 同提交）；M6 1（`46cfe17`）；M7 1（`1ff2757`） |
| 阶段登记与范围评估 | **2** | `7cf0747`（规划编号守卫豁免进行中阶段条目表）/ `9613eb5`（Phase 19 登记 + 第三轮下一阶段范围评估） |
| 附带交付（非阶段条目，本窗口内） | **9** | `135d632`（文档开发命令）/ `dae0b62` + `dad3e91`（RichTextEditor 下拉留白归因与收窄）/ `568b042` + `53976ac`（TabList 纵向滚动条修复与回填）/ `f41a2e2`（Accordion 示例修复）/ `449068e` + `c88e6d3`（DataTable 排序指示条列宽稳定与回填）/ `4a2d910`（DataView 迁移映射合并 + 跨组件专项评估 + Backlog 登记） |

- **归档批次自身提交不计入上式**（本记录 + 归档块 + 同步载体为归档批次，另计）。

---

## 3. 阶段交付摘要（逐条）

- **M1 设计一致性口径裁定与守卫落地（4 条）**：设计规范 §6 措辞与计数对齐实现（D1 禁用态计数 35 / D2 `invalid` 语义 / D5 Tag 字号 / D7 Card 三变体）；§6 涉及实现对齐（D3 浮层背景 `bg-elevated` 覆盖 **11 面** / D4 Popover 圆角 `lg` / D6 AutoComplete 阴影 token 化，真实 Chromium **44/44**、负向对照 **11/11** 失败）；P1 + P2 装置三子批（采样面 **262 → 270 → 297 → 302**，负向对照逐组命中）；P3 几何 / 交互层装置（新增 **54 例常驻 E2E**，修复 Drawer reduced-motion 特异性缺陷）。
- **M2 组件文档一致性整改（迁移映射去重，3 条）**：中英 12 页（ColorPicker / DatePicker / Drawer / Message / SplitButton / Tag）删除中段 `> 迁移映射` 正文块并折入迁移节，M2 终态中英命中 **各 0 页**；独有信息无丢失并逐批留痕。
- **M3 组件观感缺陷处置（3 条）**：Tab 激活指示条裁剪修复（视觉变更，逐行像素前后对照 + 常驻契约 / E2E）；RichTextEditor 下拉留白文档站作用域隔离（零 `src/**`）；Button `iconOnly` 示例改走 `#icon` 插槽（零 `src/**`）。
- **M4 治理约束载体落地（2 条）**：`.session` 阶段态同步触发点（skill Step 3.5）与 `todo.md` 完成态回填次序（skill Step 1.7）固化到 `todo-manager` skill。
- **M6 下游协同口径消缺（1 条）**：按 dependfix 实测重写 Backlog §1.8「下游 0.5.0 升级护航」行并回扫同类版本口径；旧口径零残留。
- **M7 国际化调研（1 条）**：语言覆盖与文案分包 / 体积调研（纯调研、未改代码），给出 A/B 工程路线与 RTL 判据。

---

## 4. 归档后回扫（三段式）

> 口径与示例见 [规划规范 §7](../../standards/planning.md)（回扫结论须按机检面 / 人工面 / 未处理面记录）。

- **① 机检面**：清空 `todo.md` 阶段段落后复跑 `pnpm check:governance-records` → **先报 9 处 `stale-planning-pointer`**（均为 Phase 18 记录表头「关联条目」指向 `docs/plan/todo.md`、且其后紧邻 `Phase 18` 标识的形态——归档后 `todo.md` 已无「Phase 18」字面量），**已同批改指 `todo-archive.md`**；另**主动**把 14 份 Phase 19 记录表头的同类指针（当前因 `todo.md` 状态句含「Phase 19」而暂未命中机检，下次归档将失效）一并改指 `todo-archive.md`。改指后复跑 **exit 0**（**124** 记录与索引一致 / **314** md 指针无失效，`stale-planning-pointer` **0 处**）。本阶段**新增载体**（本记录 + 归档块 + Phase 19 既有治理记录）逐条核对「链接文字内含编号」形态，无失效指针。
- **② 人工面**：枚举指向 `docs/plan/todo.md` 的链接（含「链接文字为载体名、编号写在链接之外」的散文形态）——`rg -o "\[[^]]*\]\((\.\./)*plan/todo\.md\)" docs -g '*.md' | wc -l` → **68 处**；`rg -l ... | wc -l` → **30 文件**；逐条判定为**登记动作的时点陈述**（本批不改）。
- **③ 未处理面**：更早历史记录中指向 `docs/plan/todo.md` 的散文指针沿用既有边界（属登记动作的时点陈述），**本批不回改、亦未登记为待办**；深度归档文件内的同类指针随迁入保留。

---

## 5. 长期任务门槛复核（第 21 轮）

- **触发**：Phase 19 收口前（用户指令「开始归档」），规划清理域，属**门槛复核轮**。
- **结论**：两组任务**待执行批次 0 项**；未达门槛 → **条件触发 1 项维持**（表单控件公共 props 契约后续候选）；**已判定不纳入 5 项维持**。
- **计数**：与第 20 轮**逐项一致（无漂移）**——`useLabelAttrs` 15 / `labelAttrs` 10 / 模板级 `:aria-label="label"` 0 / 继承公共契约 12 / 含内联同名字段 32 / `useFocusControl` 4 / `useAttrs()` 11 / 数值钳位 2 处；§2.2 复跑 `field-shell-overlap.mjs`（四组件共有声明 **0**）。
- **落点**：[长期任务](../../plan/recurring.md) §3 第 21 轮（证据与复算命令见该行）。

---

## 6. wisdom 蒸馏与 Backlog

- **wisdom**：`pnpm distill:wisdom --check` → **`WISDOM_OK: 15 active entries (threshold 20)`**——**未达阈值（>= 20）**，本轮**不执行蒸馏**（[规划规范 §7](../../standards/planning.md)）；`.session/wisdom.md` 活跃条目留存供后续蒸馏。`pnpm check:distill-archive` → **`WISDOM_ARCHIVE_OK: 11 archive sections reconciled`**（未新增段）。
- **Backlog**：逐行复核 Phase 19 交付项**无残留**（`iconOnly` 示例 / 迁移映射去重 / 设计一致性可机检项 / 国际化调研均在登记批次或交付批次迁出，且未回流；M3-2 新增「文档站浮层泄漏的常驻浏览器断言」为**该批交付产生的合法新候选**，保留）；本批不新增候选行；顺带修正 §1.6 候选正文中的里程碑编号写法（见 §1）。

---

## 7. 规模（唯一口径）

- 归档批次文件（见 §1）：`todo-archive.md`（新增 Phase 19 块 + 顺序修正）/ `todo.md`（重写）/ `roadmap.md` / `recurring.md` / `backlog.md`（一处措辞修正）/ 本记录 / `index.md`。**零 `src/**` 改动、零 `test/**` 改动**。
- 归档块行数与 `check-docs-git-revision` 计数**只在本记录 §8 声明**（漂移高发项）。

---

## 8. 质量门

> **单点来源范围**：**`todo-archive.md` 行数**与 **`check-docs-git-revision` 的 md / 命令计数**只在本节声明——归档块与治理索引条目**不复写**、仅引用本节（该两项随文档增删变化，是漂移高发项；Phase 17 归档批次曾连续三轮因「同一计数跨载体漂移」被判 Reject）。
> **时点口径**：数值为**本批终态时点**（工作区含本批文档；已 `git add` 的受版本控制 md 计入）。

| 项 | 实测（2026-10-07 本批） | 复算命令 |
|:---|:---|:---|
| `pnpm verify` | **exit 0** | `pnpm verify` |
| `pnpm test` / `test:a11y` | **110 文件 / 2203 例** / **59 例** | `pnpm test` / `pnpm test:a11y` |
| `pnpm test:e2e --workers=2` | **195 例** | `pnpm test:e2e --workers=2` |
| `capture:styles` | **302 项 0 差异** | `pnpm capture:styles` |
| `docs:check` | **11 段链全绿** | `pnpm docs:check` |
| `todo-archive.md` 行数 | **423 行**（主窗口；超 warn 下界 400、未达 error 600） | `pnpm docs:check:line-count`（**以此脚本口径为准**；`wc -l` 因末行换行少 1） |
| `check-docs-git-revision` | **276 md / 37671 代码区行 / 147 条取证命令**（**代码区行数随本批文档增删变化**，非终端指标） | `node scripts/governance/check-docs-git-revision.mjs` |
| `check:governance-records` | **124 记录与索引一致 / 314 md 指针无失效 / `stale-planning-pointer` 0 处**（改指 9 份 Phase 18 + 14 份 Phase 19 记录表头后） | `pnpm check:governance-records` |
| 回扫人工面 | **68 处 / 30 文件** | `rg -o "\[[^]]*\]\((\.\./)*plan/todo\.md\)" docs -g '*.md' \| wc -l` / `rg -l ... \| wc -l` |
| `distill:wisdom --check` | **15** 活跃条目（阈值 20） | `pnpm distill:wisdom --check` |
| `check:distill-archive` | **11** 段 reconciled | `pnpm check:distill-archive` |
| `docs:build` | exit 0 | `pnpm docs:build` |

---

## 9. 边界与未覆盖

- **不回改面（有意）**：点时记录（历史治理记录 / 归档块）中的历史版本口径、轮次号与候选池指向——按 [规划规范 §9](../../standards/planning.md)「台账指针的处置判据」保持原样。
- **未跨仓复核**：下游锁定版本（dependfix `0.5.0` / momei `0.3.0`）引自既有治理记录；下游升级护航触发时重取。
- **未穷举**：回扫只覆盖指向 `docs/plan/todo.md` 的链接与治理记录的规划指针；其它文档的 §N 引用未逐条核对（既有机检 + 人工复核面）。`backlog.md` §1.1 少数候选行仍在「来源」列写早前阶段的出处（如 `M4 条目 5 follow-up` / `2026-09-20 M2-1 判定`）——属**点时出处**，非当前候选的实现条目编号，按 [规划规范 §9](../../standards/planning.md)「出证时点正确、后被迁出」判据不回改；本批只修正 §1.6 中会被读作「当前条目编号」的 `M3-2` 写法。
- **`check-docs-git-revision` 的「代码区行」随本批文档增删变化**：该计数按代码区**段落**（围栏行 + 行内代码段）统计，编辑记录内的行内代码会改变其值，属**非终端指标**；§8 声明值为本批终态时点，复算命令随附。
- **设计规范 §6 七项口径漂移已由 Phase 19 M1 处置**；M1-4 的容量取舍项（禁用态 7 组件 / 焦点可见 5 组件）为已声明边界。

## 10. Review Gate（归档批次）

- **R1（第 1 轮，`standard`，单分区）`Reject`**：1 blocker / 1 warning / 3 suggest。本地留痕 `artifacts/review-gate/2026-10-07-phase19-archive.md`。
  - **RG-B1（blocker）**：本记录 §4① 的**描述性样例**（把「待办事项链接指向 `docs/plan/todo.md`、其后紧邻 `Phase 18` 标识」写成真实 markdown 链接 + 紧邻标识）自身命中 `stale-planning-pointer`——`check-governance-records` 的紧邻标识判定（`MD_LINK_RE` + `TRAILING_ID_RE`）把它当成真实失效指针，使 `check:governance-records` **exit 1** → `governance:check` 与 `pnpm verify` 必失败，与本批「verify exit 0 / `stale-planning-pointer` 0 处」声明直接矛盾。修复：§4① 改为「指向 `docs/plan/todo.md` 且其后紧邻 `Phase 18` 标识」的纯叙述（不含真实 markdown 链接）；复跑 `check:governance-records` → OK。
  - **RG-W1（warning，已回填）**：§8 声明的易变计数与终态不自洽（`check-docs-git-revision` 写 37607、实测 37621；人工面写 82 处 / 44 文件、实测 83 处 / 45 文件——后者含本记录 §4① 的自引用）。修复：blocker 修复后重取终态并回填 §8（机检面 124 / 314 / 0；人工面 **68 处 / 30 文件**；`check-docs-git-revision` **37662 代码区行**）。
  - **RG-S1（suggest，采纳）**：14 份 Phase 19 治理记录表头仍指向 `todo.md`，当前仅因 `todo.md` 状态句含「Phase 19」而暂免机检，下次归档会一次性复现。→ 已与 9 份 Phase 18 记录一并主动改指 `todo-archive.md`。
  - **RG-S2（suggest，部分采纳）**：`backlog.md` §1.1 多行「来源」列仍含里程碑出处（`M4 条目 5 follow-up` 等）。→ 属**点时出处**、非当前条目编号，按 [规划规范 §9](../../standards/planning.md) 判据不回改；已在 §9 显式声明边界。
  - **RG-S3（suggest，不适用）**：称索引摘要复写 `check:governance-records` 的记录计数——经复核本批索引条目未写该计数（索引中的 `124` 系其它条目数字子串），不适用。
- **R2（第 2 轮，`standard`，只审修复点）`Pass`**：0 blocker；RG-B1 / RG-S1 / RG-S2 / RG-S3 已关闭；RG-W1 的 §8 终态回填记为「已修复未复审」。审计方独立复算：`check:governance-records` OK（124 / 314 / 0）、`check:planning-numbers` 0 命中、`todo-archive.md` **423** 行、`check-docs-git-revision` **276 / 37662 / 147**、人工面 **68 / 30**；§4① 已无 `](...plan/todo.md)` 形态；9 + 14 份记录表头改指语义等价。
- **实测用时**：R1 发起 `2026-10-07T01:19:07+08:00`；R2 发起 `2026-10-07T01:45:11+08:00` → 上界取戳 `01:56:49`（≤ **11 分 38 秒**，**含调用方阅读 / 决策 / 修复与回填**，非纯审计时长）；R1 未在返回时点单独取戳（口径偏差，同 Phase 18 归档批次）。

## 11. 回填（提交号与提交后计数）

- **归档批次提交**：TODO_BACKFILL_COMMITS
- **提交后复跑（提交之后）**：TODO_BACKFILL_MEASURE
- **不计入 §2**：归档批次自身提交不计入 §2 的 28 条窗口范围。
