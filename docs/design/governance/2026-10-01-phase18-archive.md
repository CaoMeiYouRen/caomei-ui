# Phase 18 归档批次记录

> 创建时间：2026-10-01
> 关联：**Phase 18（发布收口、测试稳定性与一致性治理）阶段归档**——用户指令「开始归档」
> 依据：[规划规范 §7 / §8](../../standards/planning.md)（状态同步 / 归档清理 / 长期任务触发义务）、[Session Wisdom 蒸馏机制](../../standards/session-wisdom-distillation.md)
> 范围依据：[下一阶段范围评估（第二轮）](./2026-09-30-next-stage-scope-evaluation-2.md) §8
> **本记录是 Phase 18 归档批次的唯一口径载体**：归档块与治理索引条目只引用本记录，不复写易变计数（见 §8 的单点来源界定）。

---

## 1. 归档动作清单

| 动作 | 载体 | 结果 |
|:---|:---|:---|
| 归档块 | `docs/plan/todo-archive.md` | 新增「Phase 18」块（授权与范围 / M1~M6 逐条 / 附带交付 / 阶段总结 / 长期任务 / 回扫 / wisdom / 已知观察 / 归档批次 Review Gate） |
| 清空当前阶段 | `docs/plan/todo.md` | 重写为「当前无进行中阶段 + 未完成项汇总」（移除全部条目行与交付摘要） |
| 阶段表与状态 | `docs/plan/roadmap.md` | 阶段表 Phase 18 行补「完成并归档」；§1 现状句补 Phase 18；§5 归档索引补 Phase 18；状态行改「当前无进行中阶段」；规划纪律注补 Phase 18 归档时点 |
| 长期任务 | `docs/plan/recurring.md` | §2「上次执行」列更新为第 20 轮；§3 新增第 20 轮行；触发义务注追加第 20 轮 |
| 候选池复核 | `docs/plan/backlog.md` | 逐行复核确认 Phase 18 交付项**无残留**（不新增行、不删除行；行数与构成不变） |
| wisdom | `.session/wisdom.md`（git-ignored） | `--check` → **15 活跃条目（阈值 20）**，**未达阈值、本轮不蒸馏**；归档段对账维持通过（§6） |
| 本记录 + 索引 | 本文件 + `docs/design/governance/index.md` | 登记 |
| **R1 修复（同批）** | `docs/plan/todo.md` + `scripts/governance/check-planning-numbers.mjs` + 其单测 | 清除 `todo.md` 的条目编号残留（`M3-1` → 能力名 + 文档指针）；**补机检兜底**——该守卫受检面扩至规划载体（`docs/plan/todo.md`，只判 `entry` 形态，跳过围栏 / 行内代码与阶段点名），使「归档后 `todo.md` 无 `Mx-y`」由 Review Gate 必查项升级为**可复算门禁**（该形态在近三次归档复发） |

---

## 2. 阶段交付与提交对账（Phase 18）

- **提交对账命令**：`git log --oneline ed99c7b..d3de4e0 | wc -l` → **41**（下界 = Phase 17 归档批次末条提交 `ed99c7b`，上界 = 本阶段末条实现 / 状态提交 `d3de4e0`；**不得写 `HEAD` 相对范围**，归档提交会推进 `HEAD`）。
- **构成**（逐项相加 = 41）：

| 分类 | 条数 | 提交 |
|:---|:-:|:---|
| Phase 18 本体（原子条目） | **19** | M1 3（`f0df2b0` / `3fcc78f` / `1e05b5e`）；M2 11（M2-1 `1b39f37` / `a3591a0` / `1e65760`；M2-2 `6ba6d0c` / `5036199`；M2-3 `8c7292d` / `2b2fe92`；M2-4 `27c9700` / `5150e21`；M2-5 `37552ec` / `d02177c`）；M3 1（`b0567c0`）；M4 2（`898fbf4` / `37aa19b`）；M6 2（`5921787` / `d3de4e0`） |
| 阶段登记与范围评估 | **2** | `369a5b2`（范围评估第二轮）/ `53ff4eb`（Phase 18 登记） |
| 发布执行（用户本地） | **2** | `b66d330`（`0.5.0` 版本基线）/ `4c3e124`（CHANGELOG） |
| 附带交付（非阶段条目，本窗口内） | **8** | `eea4746`（并行负载 flaky 类登记）/ `25f79fa` / `8667117` / `b89d720`（画廊批次与回填）/ `8c696d2` / `29dbb86` / `29a7693`（富文本安装前置 + 可选 peer 说明 + 设计区侧栏简化）/ `1c9f9b0`（预备检查与第 19 轮门槛复核） |
| 依赖维护（dependabot） | **10** | `9ecde8e` / `6694220` / `7bd6951` / `3e73b1c` / `b33231d` / `ed3c87c` / `1385f3e` / `8dfeca0` / `b509774` / `559b73e` |

- **归档批次自身提交不计入上式**（本记录 + 归档块 + 同步载体为归档批次，另计）。

---

## 3. 阶段交付摘要（逐条）

- **M1 发布收口与版本一致性（3 条）**：0.5.0 发布后校验（registry shasum / tarball 解包冒烟 / 导出 92）与版本句同步（`docs:check:version` exit 0）；发布指南 §3 tag 落点口径改为「两种形态均正常」（`v0.5.0` 不回改）；发布执行治理记录 + 索引登记。
- **M2 测试稳定性与质量装置消缺（5 条）**：并行负载 flaky 类根因修复（`test/helpers/settle.ts` 条件轮询 + `maxWorkers: 4` / `testTimeout: 15000` 兜底，连续 7 轮零失败）+ `guard-ref-attrs` 崩溃修复；计算样式采样面扩 toast·switch（**245 → 262 项**）；富文本编辑器窄屏真实几何常驻 E2E + 独立夹具入口；组件设计 §5 清单对账守卫（`check:design-catalog`，5 条判定 + §5 7 行标记修复）；浮层档位装置判别力补强（内联绘制顺序命中 + 后代自证 + **T10 清单联动**）。
- **M3 组件设计一致性回归评估（1 条）**：设计规范 §6 十六行约定按可机检性分级（**无一行属「仅人工」**），盘点现有装置覆盖与缺口，取证发现 **7 项 §6 ↔ 实现口径漂移**（须先裁定再落守卫），给出 P0~P3 落地建议与误报边界（**纯评估、零 `src/**` 零 `test/**`**）。
- **M4 组件文档与口径收口（2 条）**：`Select` 字段层 `class` / `style` 落点文档补强（中英）；对比度 **6 项终局结论收口**（全部维持、不修色；唯一载体 = [M4-2 记录](./2026-10-01-phase18-m4-2-contrast-terminal-conclusions.md)；`design-spec §3.2` 指针收敛）。
- **M6 治理台账漂移消缺（1 条）**：3 处漂移（`Backlog §1.2`→§1.8 / `todo.md` 陈旧轮次指针复核确认 / `Backlog §1.8` 升级护航行口径 0.5.0）+ 同类三类回扫 + 承接 M1-2 延期回扫面（活载体修、点时记录不回改）+ **指针判据沉淀至 [规划规范 §9](../../standards/planning.md)**。

---

## 4. 归档后回扫（三段式）

> 口径与示例见 [规划规范 §7](../../standards/planning.md)（回扫结论须按机检面 / 人工面 / 未处理面记录）。

- **① 机检面**：清空 `todo.md` 阶段段落后复跑 `pnpm check:governance-records` → **OK：104 记录与索引一致 / 294 md 指针无失效**（`stale-planning-pointer` **0 处**）；本阶段**新增载体**（5 份治理记录 + 本记录 + 归档块）逐条核对「链接文字内含编号」形态，无失效指针。
- **② 人工面**：枚举指向 `docs/plan/todo.md` 的链接（含「链接文字为载体名、编号写在链接外」的散文形态）——`rg -o "\[[^]]*\]\((\.\./)*plan/todo\.md\)" docs -g '*.md' | wc -l` → **73 处**；`rg -l` → **35 文件**（Phase 17 归档批次为 62 处 / 24 文件；增长来自本阶段新增记录）。逐条判定为**登记动作的时点陈述**（本批不改）。
- **③ 未处理面**：更早历史记录中指向 `docs/plan/todo.md` 的散文指针沿用既有边界（属登记动作的时点陈述），**本批不回改、亦未登记为待办**；深度归档文件内的同类指针随迁入保留。

---

## 5. 长期任务门槛复核（第 20 轮）

- **触发**：Phase 18 收口前（用户指令「开始归档」），零代码改动域，属**门槛复核轮**。
- **结论**：两组任务**待执行批次 0 项**；未达门槛 → **条件触发 1 项维持**（表单控件公共 props 契约后续候选）；**已判定不纳入 5 项维持**。
- **计数**：与第 19 轮**逐项一致（无漂移）**——`useLabelAttrs` 15 / `labelAttrs` 10 / 模板级 `:aria-label="label"` 0 / 继承公共契约 12 / 含内联同名字段 32 / `useFocusControl` 4 / `useAttrs()` 11 / 数值钳位 2 处；§2.2 复跑 `field-shell-overlap.mjs`（四组件共有声明 **0**）。
- **落点**：[长期任务](../../plan/recurring.md) §3 第 20 轮（证据与复算命令见该行）。

---

## 6. wisdom 蒸馏与 Backlog

- **wisdom**：`pnpm distill:wisdom --check` → **`WISDOM_OK: 15 active entries (threshold 20)`**——**未达阈值（>= 20）**，本轮**不执行蒸馏**（[规划规范 §7](../../standards/planning.md)）；`.session/wisdom.md` 活跃条目留存供后续蒸馏。
  - 本阶段 3 条发现已**即时落入规范载体**（`planning.md §9` 的指针判据 / `testing.md` 与 `ai-collaboration.md` 的既有条款），未在活跃段累积——与 Phase 14 的「落点已存在则不累积」口径一致。
  - `pnpm check:distill-archive` → **`WISDOM_ARCHIVE_OK: 11 archive sections reconciled`**（归档段计数声明对账通过，未新增段）。
- **Backlog**：逐行复核 Phase 18 交付项**无残留**（M1 `Select` `class` 文档 / M4-2 对比度 6 项 / M2 各装置 / M3 评估 / M6 漂移项均在登记批次迁出，且未回流）；本批**不新增、不删除**候选行。在册候选维持（含「下游 0.5.0 升级护航」条件候选）。

---

## 7. 规模（唯一口径）

- 归档批次文件（见 §1）：`todo-archive.md`（新增 Phase 18 块）/ `todo.md`（重写）/ `roadmap.md` / `recurring.md` / `backlog.md`（复核确认，无行变更）/ 本记录 / `index.md`。**零 `src/**` 改动**。
- 归档块行数与 `check-docs-git-revision` 计数**只在本记录 §8 声明**（漂移高发项）。

---

## 8. 质量门

> **单点来源范围**：**`todo-archive.md` 行数**与 **`check-docs-git-revision` 的 md / 命令计数**只在本节声明——归档块与治理索引条目**不复写**、仅引用本节（该两项随文档增删变化，是漂移高发项；Phase 17 归档批次曾连续三轮因「同一计数跨载体漂移」被判 Reject）。其余各项在归档块、索引条目与本表为**同批实测的同值**。
> **时点口径**：数值为**本批终态时点**（工作区含本批文档、**未提交**；提交后 `integrity` / `links` / `check:governance-records` 的**受版本控制 md 计数**会随新文件计入而 +1，故这三项以**提交后复跑**为准，回填见 §11）。

| 项 | 实测（2026-10-01 本批） | 复算命令 |
|:---|:---|:---|
| `pnpm verify` | **exit 0** | `pnpm verify` |
| `pnpm test` / `test:a11y` | **103 文件 / 2151 例** / **59 例** | `pnpm test` / `pnpm test:a11y` |
| `pnpm test:e2e --workers=2` | **117 例** | `pnpm test:e2e --workers=2` |
| `capture:styles` | **262 项 0 差异** | `pnpm capture:styles` |
| `docs:check` | **11 段链全绿** | `pnpm docs:check` |
| `todo-archive.md` 行数 | **361 行**（主窗口；低于 warn 下界 400） | `pnpm docs:check:line-count`（**以此脚本口径为准**；`wc -l` 因末行换行少 1） |
| `check-docs-git-revision` | **256 md / 35626 代码区行 / 128 条取证命令**（**代码区行数随本批文档增删变化**，非终端指标） | `node scripts/governance/check-docs-git-revision.mjs` |
| `check:governance-records` | **104 记录与索引一致 / 294 md 指针无失效** | `pnpm check:governance-records` |
| `distill:wisdom --check` | **15** 活跃条目（阈值 20） | `pnpm distill:wisdom --check` |
| `check:distill-archive` | **11** 段 reconciled | `pnpm check:distill-archive` |
| `docs:build` | exit 0 | `pnpm docs:build` |

---

## 9. 边界与未覆盖

- **不回改面（有意）**：点时记录（历史治理记录 / 归档块）中的历史版本口径、轮次号与候选池指向——按 [规划规范 §9](../../standards/planning.md)「台账指针的处置判据」保持原样。
- **未跨仓复核**：下游锁定版本（`0.3.0`）引自既有治理记录；下游升级护航触发时重取。
- **未穷举**：回扫只覆盖指向 `docs/plan/todo.md` 的链接与治理记录的规划指针；其它文档的 §N 引用未逐条核对（既有机检 + 人工复核面）。
- **M3-1 的 7 项口径漂移未处置**：属评估交付的发现，须用户裁定后再落守卫（不在本批范围）。

## 10. Review Gate（归档批次）

- **R1（第 1 轮，`standard`，单分区）`Reject`**：1 blocker / 1 warning / 1 suggest。本地留痕 `artifacts/review-gate/2026-10-01-phase18-archive.md`。
  - **RG-B1（blocker）**：归档后 `todo.md` 残留里程碑编号 `M3-1`（规划规范 §7 明令禁止、Review Gate 必查项、近三次归档复发）→ ① 改为能力名 + 文档指针；② **补约束载体**：`check-planning-numbers` 受检面扩至规划载体（`docs/plan/todo.md`，只判 `entry`，跳过围栏 / 行内代码，阶段点名不在本面）——把「Review Gate 必查」升级为**可复算门禁**；负向对照（注入编号 → exit 1）与单测（43 例）齐备。
  - **RG-W1（warning）**：回扫「人工面」处数 / 文件数未落地 → §4① / ② 补实测（机检面 104 记录 / 294 指针 / 0 处；人工面 **73 处 / 35 文件**）。
  - **RG-S1（suggest）**：第 20 轮「计数与第 19 轮逐项一致」未限定口径 → 改为「**候选计数**一致」+ 注明「采样面 245 → 262 属预期变更」。
- **R2（第 2 轮，`standard`，只审修复点）`Pass`**：0 blocker / 0 warning / 0 suggest。三条修复点**逐条关闭**（审计方独立复算：`todo.md` 零 `M\d+-\d+`、守卫 exit 0 且输出含「1 个规划载体」、单测 43 passed、只读负向对照成立、`governance:check` exit 0、记录 §4 与 `recurring.md` 措辞自洽、约束载体已在归档块与记录登记）。
- **实测用时**：R1 `2026-10-01T23:27:52+08:00` → `23:31:17+08:00` ≈ **3 分 25 秒**；R2 `23:36:11+08:00` → `23:39:57+08:00` ≈ **3 分 46 秒**（均 ≤ 10 分钟时间盒）。
- **未覆盖边界**（审计方声明）：`scanPlanningDocs` 包装函数与 `PLANNING_DOC_FILES` 常量无独立单测（由 CLI 端到端 + 仓库现行面兜底）；规划载体面只覆盖 `todo.md`（归档块 / 治理记录中的 `Mx-y` 属允许形态）。

## 11. 回填（提交号与提交后计数）

- **归档批次提交**：`763dd5b`（归档块与规划载体同步）/ `5ac4100`（规划载体编号守卫扩面——R1 blocker 的**约束载体**）；本回填提交（记录 §11）。
- **提交后复跑（提交 `5ac4100` 之后）**：`todo-archive.md` 行数、`check-docs-git-revision` 的 md / 代码区行 / 命令数、`check:governance-records` 的记录数 / 指针数、`docs:check:links` / `structure` 的 md / 页数，**与本记录 §8 的提交前实测逐项一致**——`check-docs-git-revision` 与 `check:governance-records` 按**工作区文件**计数（非按 git 跟踪集），故 §8「提交后受版本控制 md 计数 +1」的预期**未发生**；该预期以本节实测为准（§8 不再单独标注 +1）。
- **不计入 §2**：归档批次自身提交（`763dd5b` / `5ac4100` / 本回填提交）不计入 §2 的 41 条窗口范围。
