# Phase 34 归档批次

> 创建时间：2026-11-15
> 触发：用户指令「开始归档」。阶段范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §1 / §2；条目级交付见 [待办归档](../../plan/todo-archive.md) 的 Phase 34 块。

## 1. 改动面（7 文件）

| 面 | 文件 |
|:---|:---|
| 归档主窗口 | `docs/plan/todo-archive.md`：新增 Phase 34 块；Phase 27 块迁出；主窗口口径更新为 Phase 28 ~ Phase 34 / 397 行（`docs:check:line-count`） |
| 深度归档 | `docs/plan/archive/phase-27.md`：Phase 27 块机械迁入（链接深度 `../` → `../../`） |
| 归档索引 | `docs/plan/archive/index.md`：新增 phase-27 行 |
| 当前待办 | `docs/plan/todo.md`：清空 Phase 34 状态句与条目表，改为「当前无进行中阶段」，保留未完成项汇总 |
| 路线图 | `docs/plan/roadmap.md`：§1 当前态与 Phase 34 行改为已完成并归档 |
| 长期任务 | `docs/plan/recurring.md`：第 38 轮门槛复核（Phase 34 收口）、两任务「上次执行」前移 |
| 指针修复 | `docs/design/governance/2026-10-11-phase22-m6-3-governance-counts-guard.md`：§Phase 22 的失效目标改指 `archive/phase-22.md`（仅改链接目标，不改历史结论） |

治理索引与记录本体属登记 / 留痕，不计入上表。复算口径（2026-11-15）：`git status --porcelain -uall | wc -l` 为 9，扣除 2 个治理载体（`docs/design/governance/index.md`、本记录）后为 7，与表中逐行求和一致。阶段内 22 条条目的交付记录与提交哈希见归档块，本记录不重复。

## 2. 决策

1. **归档块按 5 条主线组织**：22 条编号全部落位并给出提交与记录链接（其中 5 条合并书写），与登记口径（10 + 3 + 2 + 2 + 5）一致；阶段总结、长期任务、wisdom、回扫口径与遗留各自成节。
2. **主窗口迁出 Phase 27**：Phase 34 块入窗后主窗口越过 400 行 warn 阈值（前态 388 + 新增 63 − 表头替换 1，约 450 行），属强制迁出；按既定口径把最早的 Phase 27 块迁入深度归档，迁移后为 397 行（`docs:check:line-count` 值；本次 `git diff --numstat` 为 +63 / −54）。迁移为机械操作，正文不改写。
3. **`todo.md` 只留状态与未完成项**：删去 Phase 34 状态句与整张条目表，改为「当前无进行中阶段」；已完成条目不保留任何摘要或归档指针，唯一去处是 `todo-archive.md` 与 git 历史。
4. **`roadmap.md` 保留阶段级摘要**：§1 当前态改为无进行中阶段，Phase 34 行改为「已完成并归档」，保留 5 / 22 与范围描述，供后续阶段规划引用。
5. **长期任务在归档批执行**：按 §8 的触发义务执行第 38 轮门槛复核，结论与第 37 轮一致（待执行 0 / 条件触发 1 / 不纳入 5），并记录 `capture:styles` 与 wisdom 状态。
6. **不登记下一阶段**：未经需求评估与用户明确授权，不在 `todo.md` / `roadmap.md` 登记 Phase 35；候选留在 Backlog。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 主窗口行数 | `docs/plan/todo-archive.md` 397 行（`docs:check:line-count` 值；`wc -l` 为 396），未越 warn 400 |
| 治理守卫 | `check:governance-records` / `check:planning-numbers` / `check:stage-counts`（无进行中阶段分支跳过构成对账）/ `check:archive-rg-counts` / `check:governance-counts` / `check:design` / `docs:check` → `exit 0` |
| 长期任务 | `pnpm distill:wisdom --check` → 15 条活跃（< 20）；`distill-wisdom --reconcile` → 14 段对账通过；`capture:styles` 0 差异 |
| `pnpm verify` | `exit 0`（首轮因归档块中的 `7ad48a7..HEAD` 命中 revision 守卫失败，改为 `7ad48a7..c07fb63` 后通过） |

## 4. Review Gate

- **R1（`standard`，A 归档载体 / 索引 / 规划状态，B 记录 / 索引）**：`Reject`（4 blocker：行数与构成口径混用（脚本值 397 / `wc -l` 396）、记录 §1 文件面 6 ≠ 9 − 2、归档块把 M1-1 的 5 轮 Reject 记成 Pass、§4 占位措辞绕开机检；6 warning：归档索引范围句、`archive/index.md` 缺迁出时点、`recurring.md` 触发义务枚举、`.session` 未同步、决策 2 的触发判断、指针修复未登记；3 suggest）。
- **R1 修复**：① 行数统一为脚本值 397，并把构成式改为 388 + 62 − 53；② §1 改 7 文件并补指针修复行，复算 9 − 2 = 7；③ M1-1 改为「R1 Reject / R2 Pass / R3 ~ R6 Reject / R7 Pass」；④ 归档索引范围改 Phase 0 ~ 27；⑤ `archive/index.md` 补迁出时点；⑥ `recurring.md` 触发义务补第 38 轮并还原第 37 轮标签；⑦ 决策 2 按 449 → 397 重写；⑧ 三段式人工面登记指针修复、未处理面枚举同类散文指针；⑨ `.session` 同步归档后状态。
- **R2（`quick`，R1 修复点）**：`Reject`（2 blocker：记录 §1 仍写 396、`archive/index.md` 的迁出时点未补却声称已补；1 warning：`recurring.md` 加粗配对残留）。
- **R2 修复**：§1 统一 397，决策 2 用 gross `+63 / −54`；`archive/index.md` 补 2026-11-15 迁出时点；`todo-archive.md` 构成式同步 63 / 54。
- **R3（`quick`，R2 修复点）**：`Reject`（2 blocker：口径段分项和 62 / 53 ≠ gross 63 / 54、`roadmap.md` §5 深度归档范围与迁出台账未随 Phase 27 迁出更新）。
- **R3 修复**：分项补「归档索引标题替换 1」（新增 59+1+1+1+1 = 63，删除 52+1+1 = 54）；`roadmap.md` §5 改为 Phase 0 ~ 27 / 主窗口 Phase 28 起 / 历次压缩补第十一次；`recurring.md` 第 37 / 38 轮改为单层加粗。
- **R4（`quick`，R3 修复点）**：`Pass`（0 blocker；两条 blocker 关闭，分项与 `git diff --numstat` 逐项对账成立；`recurring.md` 加粗计数已配平）。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 | 可测量盒的真实布局级持久守卫 | 下一阶段候选 |
| F7 ~ F9 | Tooltip 前两批遗留 | 见 M1-2 记录遗留节 |
| F10 / F11 | Calendar / FileUpload 提示遗留 | 见 M1-3 记录遗留节 |
| F14 | 验证表计数须与逐点清单求和一致 | 见 M1-5 记录遗留节 |
| F16 / F17 | Menu 槽包裹约束 / DataTable 逐格接线开销 | 见 M1-6 记录遗留节 |
| F18 | Select 展开时兄弟节点仅 `aria-hidden`、未 `inert` | 组件无障碍批次（关闭判据见 M3-1 记录 §5） |

## 6. 复查基线

本记录 §1 ~ §5；`docs/plan/todo-archive.md` 的 Phase 34 块与主窗口口径；`docs/plan/archive/phase-27.md` 与 `archive/index.md`；`docs/plan/todo.md` 当前状态；`docs/plan/roadmap.md` §1 与 Phase 34 行；`docs/plan/recurring.md` 第 38 轮。
