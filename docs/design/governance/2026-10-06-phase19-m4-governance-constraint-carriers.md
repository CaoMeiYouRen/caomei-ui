# Phase 19 M4：治理约束载体落地（`.session` 阶段态同步触发点 + `todo.md` 完成态回填次序）

> 创建时间：2026-10-06
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 19 **M4-1 / M4-2**（治理约束载体落地）
> 依据：[规划规范 §3.8](../../standards/planning.md) / [AI 协作规范](../../standards/ai-collaboration.md)；复发记录：`.session` 阶段态未同步 3 次 warning、`todo.md` 完成态先于 RG 2 次判定
> 载体：`todo-manager` skill（`.github/skills/todo-manager/SKILL.md`，平台镜像为符号链接、单一源）；**不为 git-ignored 载体新增机检守卫**。

---

## 1. 结论

- 两条治理约束**固化到 `todo-manager` skill**（可被 Review Gate 直接引用），不再只停留在 `.session/wisdom.md` 的经验记录：
  - **M4-1**：Session 收尾协议新增 **3.5「阶段态必同步触发点」**——阶段 **登记 / 归档 / 范围变更**三类事件后必须同批同步 `.session` 阶段态。
  - **M4-2**：规划同步协议新增 **1.7「完成态回填次序」**——`todo.md` 完成态不得早于该条目的 Review Gate 结论，两者同批落地。
- 两项均在「常见检查」与「交付前检查」各加一行，便于 Review Gate 逐项引用；**未新增任何机检脚本**（`.session` 为 git-ignored，本地有 / CI 无会分叉；完成态次序为流程约束、无机检形态）。

## 2. 改动

`todo-manager` skill（`SKILL.md`）：

| 位置 | 内容 |
| --- | --- |
| Step 1.7（新增） | `todo.md` 完成态**不得早于**该条目 Review Gate 结论；完成态与 RG 结论同批落地、提交前结论已回填（非占位）；否则按「预写未落地状态」判 warning / blocker |
| Step 3.5（新增） | 阶段**登记 / 归档 / 范围变更**为 `.session` 阶段态**必同步触发点**；须同批同步 `current-task.yaml`（`current_phase` / `active_plan` / `next_steps`）与 `runtime-state.json`（`plan_state`）；依据 [规划规范 §3.8](../../standards/planning.md) 的 `.session` 回扫面；git-ignored、不设机检守卫、由 Review Gate 引用 |
| 常见检查（+2 行） | 完成态与 RG 同批（1.7）；阶段三类事件后 `.session` 已同步（3.5） |
| 交付前检查（+2 行） | 同上两条的勾选项 |

**批量说明**：M4-1 / M4-2 同属「治理约束载体落地」，改动落在**同一文件**、均为协议条目增补，故作为一批交付并统一留痕（若无此共载体，按规划规范 §4 应各自独立提交）。

## 3. 不重复重述既有规则

- M4-2 的内容此前**仅**以经验条目存在于 `.session/wisdom.md`（非规范载体），本次是首次**固化**，非重述。
- M4-1 引用 [规划规范 §3.8](../../standards/planning.md) 的既有 `.session` 回扫面，不复制其条款；skill 只补「触发点枚举 + Review Gate 引用口径」。

## 4. 质量门

| 门禁 | 结果 |
| --- | --- |
| `pnpm ai:check` | OK（AI 资产治理一致性校验通过） |
| `pnpm governance:check` | exit 0（含 `check:standards-redundant --strict`） |
| `pnpm lint:md:check` | exit 0 |
| 新增机检守卫 | **无**（符合 M4-1 验收：不为 git-ignored 载体新增机检） |

## 5. 载体与边界

- 平台镜像 `.claude/skills` / `.opencode/skills` 为指向 `.github/skills` 的符号链接（`ai:check` 校验），故只需改单一源。
- 边界：`AGENTS.md` / `规划规范` 未改（§3.8 已含 `.session` 回扫面，M4-1 以其为依据、不复制条款）；`.session` 内容本身不进提交物。

## 6. Review Gate 结论

- **R1（`standard`）`Pass`**：0 blocker / 2 warning / 2 suggest。审计方独立复跑 `check:standards-redundant --strict`（0 命中，证明非重述）、`ai:check`、`lint:md`、`check:governance-records`（121/311）、`check:planning-numbers`（0）、`docs:check:links`（314）、`governance:check` 全链 exit 0；核验镜像符号链接、字段实存性（`current_phase` / `active_plan` / `next_steps` / `plan_state` 均存在）、`backlog.md` 无残留、4 文件 / 约 +61 行未超阈值。
- **同批收口**：warning ① 「完成态先于 §6 回填」→ 本 §6 回填（判定为约束预期的中间态、非自证违反，与 M1-2 判例区分）；warning ② `.session` 阶段态未同步 M4 完成（常规收尾项，**非** Step 3.5 三类触发）→ 同批同步；suggest ① Step 3.5 并列引用 §3.9（范围变更面）与 suggest ② 点明「同批 = 伴随触发批次、不后延至收尾」→ 已采纳。
- 留痕：`artifacts/review-gate/2026-10-06-phase19-m4-governance-constraint-carriers.md`（本地态）。
