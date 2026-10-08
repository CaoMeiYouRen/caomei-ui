# Phase 20 归档批次记录

> 创建时间：2026-10-09
> 关联：**Phase 20（测试装置扩面、治理守卫补口与发布收口）阶段归档**——用户指令「开始归档」
> 依据：[规划规范 §7 / §8](../../standards/planning.md)（状态同步 / 归档清理 / 长期任务触发义务）、[Session Wisdom 蒸馏机制](../../standards/session-wisdom-distillation.md)
> 范围依据：[下一阶段范围评估（第四轮）](./2026-10-07-next-stage-scope-evaluation-4.md) §8
> **本记录是 Phase 20 归档批次的唯一口径载体**：归档块与治理索引条目只引用本记录，不复写易变计数（见 §8 的单点来源界定）。

---

## 1. 归档动作清单

| 动作 | 载体 | 结果 |
|:---|:---|:---|
| 归档块 | `docs/plan/todo-archive.md` | 新增「Phase 20」块（授权与范围 / 非目标 / M1 ~ M7 逐条 / 附带交付 / 阶段总结 / 归档批次 Review Gate）；主窗口口径句更新为「Phase 13 ~ Phase 20」 |
| 清空当前阶段 | `docs/plan/todo.md` | 重写为「当前无进行中阶段 + 下一阶段授权规则 + 未完成项汇总」（移除全部条目行、阶段摘要与非目标段） |
| 阶段表与状态 | `docs/plan/roadmap.md` | 阶段表 Phase 20 行补「完成并归档」；§1 现状句补 Phase 20 归档；§5 归档索引补 Phase 20；状态行改「当前无进行中阶段」；规划纪律注补 Phase 20 归档时点；Phase 8 注补 2026-10-08 初步取向 |
| 长期任务 | `docs/plan/recurring.md` | §2「上次执行」列更新为第 23 轮；§3 新增第 23 轮行；触发义务注追加第 23 轮 |
| 候选池复核 | `docs/plan/backlog.md` | 逐行复核确认 Phase 20 交付项**无残留**（不新增、不删除候选行）；「归档载体行数超阈压缩」候选的取证计数随本批更新 |
| wisdom | `.session/wisdom.md`（git-ignored） | 22 条活跃 ≥ 阈值 → **执行蒸馏**（migrate 22），见 §6 |
| 蒸馏落点 | `docs/standards/*`（4 文件）+ `docs/design/governance/experience-archive.md` | 外科式新增落点并新增「2026-10-09 阶段归档蒸馏（Phase 20）」段（22 行摘要） |
| 本记录 + 索引 | 本文件 + `docs/design/governance/index.md` | 登记 |
| 指针回扫（同批） | `check:governance-records` 机检命中面 | 归档后指向 `docs/plan/todo.md` 的失效规划指针改指 `todo-archive.md`（见 §4） |

---

## 2. 阶段交付与提交对账（Phase 20）

- **提交对账命令**：`git log --oneline 29662c7..c4f2e3f | wc -l` → **24**（下界 = Phase 19 归档批次提交 `29662c7`，上界 = 本阶段末条记录提交 `c4f2e3f`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。
- **构成**（逐项相加 = 24）：

| 分类 | 提交数 | 提交 |
|:---|:-:|:---|
| Phase 20 本体（原子条目 + 发布执行） | **21** | M1 4（`852908b` / `8d8a775` / `437431f` / `f3b3b78`）；M2 6（`5d3ce82` / `2149de1` / `c6158ce` / `d8641c6` / `62431d0` / `e996656`）；M3 2（`2c803e0` / `ac21a46`）；M6 8（`ef65a33` / `5c48387` / `b083a53` / `ead6624` / `e14edc0` / `8e3c395` / `d22f034` / `a87f657`）；M7 1（`6d992d8`） |
| 阶段登记与范围评估 | **1** | `95aea81`（Phase 20 登记 + 第四轮下一阶段范围评估） |
| 附带交付与上一阶段回填 | **2** | `c4f2e3f`（发布机制评估）/ `83ff5b4`（Phase 19 归档批次提交号回填） |

- **归档批次自身提交不计入上式**（本记录 + 归档块 + 载体同步 + 蒸馏 + 索引为归档批次，另计）。

---

## 3. 阶段交付摘要（逐条）

- **M1 测试装置与覆盖扩面（4 条）**：Tabs 纳入 `capture:styles`（采样面 **302 → 308**，两轮负向对照各 3 处）；焦点可见扩面（**5 → 31**，下界守卫 31）；禁用态几何扩面（**7 → 18 对**，下界守卫 18）；文档站浮层泄漏常驻浏览器断言（`docs-theme-isolation.e2e.ts`，负向对照 1 failed）。
- **M2 基建与治理守卫补口（5 条）**：a11y 同类悬空引用处置（分组标签在位检测 + 折叠触发器省略 `aria-controls`，新增 `_shared/slot-presence`）；文档站主题 CSS 纳入 lint 面；直连 Reka 触发器机检守卫（`check-reka-trigger-usage`，197 文件 / 0 违规）；浮层交互 E2E 规格（`overlay-interaction.e2e.ts`，`test:e2e` 318 passed）；执行层规则重述收敛 + `check-ai-asset-links` + `check:audit-protocol` 扩 `granularity-threshold`。
- **M3 下游协同与 Phase 8 评估（1 条）**：Phase 8 启动范围评估（**只出评估、不启动**）——前置三条件 ②③ 复核、已接入下游清单、触发形态四选（以发布指南 §10 基线）、容量边界；用户初步取向（2026-10-08）：下阶段正式启动、以 dependfix 为试点。
- **M6 发布收口（1 条）**：**0.6.0 发布**（长期任务第 22 轮门槛复核 → `pnpm verify` 全绿 → `npm version 0.6.0` + annotated tag `v0.6.0` → `pnpm changelog` → 本地 `npm publish` → 发布后校验 + 版本句同步 → 同源漂移 9 文件归一 + `check-final-newline` 守卫 → **GitHub Release 回填** `v0.1.0` ~ `v0.6.0`）。
- **M7 视觉回归基线立项评估（1 条）**：Playwright 截图比对形态评估（**只出立项建议、不建实体基线**）——采用内置 `toHaveScreenshot` + 仓库内冻结基线。

---

## 4. 归档后回扫（三段式）

> 口径与示例见 [规划规范 §7](../../standards/planning.md)（回扫结论须按机检面 / 人工面 / 未处理面记录）。

- **① 机检面**：清空 `todo.md` 阶段段落后复跑 `pnpm check:governance-records`——命中的失效指针（`stale-planning-pointer`）改指 `todo-archive.md`；改指后复跑 **exit 0**。本阶段**新增载体**（本记录 + 归档块 + 蒸馏落点）逐条核对「链接文字内含编号」形态。
- **② 人工面**：枚举指向 `docs/plan/todo.md` 的链接（含「链接文字为载体名、编号写在链接之外」的散文形态），逐条判定为**登记动作的时点陈述**。
- **③ 未处理面**：更早历史记录中指向 `docs/plan/todo.md` 的散文指针沿用既有边界（属登记动作的时点陈述），**本批不回改、亦未登记为待办**；深度归档文件内的同类指针随迁入保留。

---

## 5. 长期任务门槛复核（第 23 轮）

- **触发**：Phase 20 收口前（用户指令「开始归档」），规划清理域，属**门槛复核轮**。
- **结论**：两组任务**待执行批次 0 项**；未达门槛 → **条件触发 1 项维持**（表单控件公共 props 契约后续候选）；**已判定不纳入 5 项维持**。
- **计数**：与第 22 轮**逐项一致（无漂移）**——`useLabelAttrs` 15 / `labelAttrs` 10 / 模板级 `:aria-label="label"` 0 / 继承公共契约 12 / 含内联同名字段 32 / `useFocusControl` 4 / `useAttrs()` 11 / 数值钳位 2 处；§2.2 复跑 `field-shell-overlap.mjs`（四组件共有声明 **0**）；`capture:styles` 采样面 **308 项** 0 差异。
- **落点**：[长期任务](../../plan/recurring.md) §3 第 23 轮（证据与复算命令见该行）。

---

## 6. wisdom 蒸馏与 Backlog

- **wisdom**：`pnpm distill:wisdom --check` → **`WISDOM_NEEDS_DISTILL: 22 active entries (threshold 20)`**——**达到阈值，本轮执行蒸馏**（migrate 22 / compress 0 / remove 0 / keep 0）：外科式写入 `ai-collaboration §9`、`testing §2.1 / §4 / §7 / §10`、`planning §9`、`development §8`（**16 条条目为新增落点**〔其中 2 条并入 `ai-collaboration §9` 同一落点行〕、**6 条落点已存在**）；[experience-archive.md](./experience-archive.md) 新增「2026-10-09 阶段归档蒸馏（Phase 20）」段（22 行摘要）；`.session/wisdom.md` 活跃段清空并保留指针。蒸馏后 `--check` → **`WISDOM_OK: 0 active entries`**；`check:distill-archive` → **`WISDOM_ARCHIVE_OK: 12 archive sections reconciled`**（由 11 增 1）。
- **Backlog**：逐行复核 Phase 20 交付项**无残留**（M1 / M2 的受检装置与守卫、M3 / M7 评估、M6 发布均未在候选池留行；7 行已于登记批次迁出）；本批不新增候选行；「归档载体行数超阈压缩」候选的取证计数随本批更新。

---

## 7. 规模（唯一口径）

- 归档批次文件（见 §1）：`todo-archive.md`（新增 Phase 20 块 + 主窗口口径句）/ `todo.md`（重写）/ `roadmap.md` / `recurring.md` / `backlog.md`（一处计数更新）/ `docs/standards/`（4 文件蒸馏落点）/ `experience-archive.md`（蒸馏段）/ 本记录 / `index.md` / 规划指针回扫文件（见 §4①）。**零 `src/**` 改动、零 `test/**` 改动**。
- 归档块行数、`check-docs-git-revision` 计数与 `check:governance-records` 计数**只在本记录 §8 声明**（漂移高发项）。

---

## 8. 质量门

> **单点来源范围**：**`todo-archive.md` 行数**、**`check-docs-git-revision` 的 md / 命令计数**与 **`check:governance-records` 的记录 / 指针计数**只在本节声明——归档块与治理索引条目**不复写**、仅引用本节（该几项随文档增删变化，是漂移高发项）。
> **时点口径**：数值为**本批终态时点**（工作区含本批文档；已 `git add` 的受版本控制 md 计入）。

| 项 | 实测（2026-10-09 本批） | 复算命令 |
|:---|:---|:---|
| `pnpm verify` | **exit 0** | `pnpm verify` |
| `pnpm test` / `test:a11y` | **114 文件 / 2258 例** / **59 例** | `pnpm test` / `pnpm test:a11y` |
| `pnpm test:e2e` | **318 例** | `pnpm test:e2e --workers=2` |
| `capture:styles` | **308 项 0 差异** | `pnpm capture:styles` |
| `docs:check` | **11 段链全绿** | `pnpm docs:check` |
| `todo-archive.md` 行数 | **479 行**（主窗口；超 warn 下界 400、未达 error 600） | `pnpm docs:check:line-count`（**以此脚本口径为准**） |
| `check-docs-git-revision` | **291 md / 40119 代码区行 / 158 条取证命令**（**代码区行数随本批文档增删变化**，非终端指标；含本记录 §8 / §10 / §11 的行内代码） | `node scripts/governance/check-docs-git-revision.mjs` |
| `check:governance-records` | **139 记录与索引一致 / 329 md 指针无失效 / `stale-planning-pointer` 0 处**（改指 12 份 Phase 20 记录表头后） | `pnpm check:governance-records` |
| `distill:wisdom --check` | **0** 活跃条目（阈值 20） | `pnpm distill:wisdom --check` |
| `check:distill-archive` | **12** 段 reconciled | `pnpm check:distill-archive` |
| `docs:build` | **exit 0** | `pnpm docs:build` |

---

## 9. 边界与未覆盖

- **不回改面（有意）**：点时记录（历史治理记录 / 归档块）中的历史版本口径、轮次号与候选池指向——按 [规划规范 §9](../../standards/planning.md)「台账指针的处置判据」保持原样。
- **未跨仓复核**：下游锁定版本（dependfix `0.5.0` / momei `0.3.0`）引自既有治理记录；升级或迁移触发时重取。
- **主窗口未迁出**：本批主窗口保持 Phase 13 ~ Phase 20（8 个完整块），未把 Phase 13 迁入深度归档——行数仍在 `docs:check:line-count` 的 error 阈值以内（**warn 可接受**）；后续继续增长时按既有机制预防性迁出。
- **未穷举**：回扫只覆盖指向 `docs/plan/todo.md` 的链接与治理记录的规划指针；其它文档的 §N 引用未逐条核对。
- **发布/自动化未实施项**：CI 自动发布与 1.x 未进入（发布机制评估待决策 D1 ~ D6）。

---

## 10. Review Gate（归档批次）

- **结论**：R1 `standard`（单分区）**`Pass`**（0 blocker / 1 warning / 2 suggest）。
- **轮次 / 范围**：第 1 轮，审 24 文件归档批次（规划载体 + 蒸馏落点 + 记录）。
- **实测用时**：发起 `2026-10-09T01:45:26+08:00`、约 5 ~ 8 分钟，**未超** `standard` ≤ 10 分钟时间盒。
- **findings 处置**：
  - **RG-W1（warning）**：§8 的 `check-docs-git-revision` 代码区行数写 40099、按声明命令复算为 **40119**（R1 时点为 40100，§10 / §11 回填的行内代码使其增至 40119）→ **已修**（定稿前重取回填 40119）。
  - **RG-S1（suggest）**：§6「16 条新增落点」措辞易被读作物理行数 → **已修**：改为「16 条**条目**为新增落点〔其中 2 条并入同一落点行〕」。
  - **RG-S2（suggest）**：§2 表头「条数」易与条目数混淆 → **已修**：改为「提交数」。
- **审计核验**：提交对账 24（构成 21+1+2 逐条 SHA 落位）；`todo-archive.md` 479；`check:governance-records` 139 / 329 / 0；`check:distill-archive` 12；`distill:wisdom --check` 0；`check-planning-numbers` 0；§1.4 清理、12 份指针回扫、蒸馏落点存在性、`## N.` 编号与相对链接深度均通过。
- **未覆盖边界**：未重跑全量 `verify` / `e2e` / `docs:build`（采信调用方 exit 0）；未逐条核对 22 条 bullet 与落点行的语义一一对应。
- **留痕**：`artifacts/review-gate/2026-10-09-phase20-archive.md`（本地态，git-ignored）。

---

## 11. 回填

- **归档批次提交**：本记录即 Phase 20 归档批次的**唯一口径载体**（**提交号见 git 历史**；本记录与归档块 / 载体同步 / 蒸馏落点 / 索引同批提交）。
- **提交后复跑**：`check:governance-records` / `check-docs-git-revision` / `docs:check:line-count` 等守卫按**工作区文件**计数，提交本身不改变计数，与 §8 提交前实测一致。
- **不计入 §2**：归档批次自身提交不计入 §2 的 24 条窗口范围。
