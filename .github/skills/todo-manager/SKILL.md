---
name: todo-manager
description: 管理项目规划载体（roadmap / todo / backlog / todo-archive / recurring）与 Session 级任务协议时使用。用户提到规划同步、阶段归档、任务拆解、归档清理、session 开局恢复、session 收尾、认知状态更新、wisdom 蒸馏提醒时都应触发。
metadata:
  internal: false
---

# Todo Manager Skill（规划与 Session 协议管理）

铁律：`todo.md` 负责阶段跨度，`.session/current-task.yaml` 负责 session 跨度；两者同步不替代。

规划载体共五个（规则见 [规划规范](../../../docs/standards/planning.md)）：`roadmap.md`（阶段表）/ `todo.md`（当前阶段条目 + 未完成项汇总）/ `backlog.md`（待决策候选）/ `todo-archive.md`（已完成阶段）/ `recurring.md`（可反复执行的长期任务）。

## 工作流

- [ ] Step 1: 规划同步
  - [ ] 1.1 新事项先评估 → `backlog.md` → 用户决策，再进入 `todo.md` 当前阶段。
  - [ ] 1.2 任务开始标记进行中，完成标记已完成；禁止「代码完成但规划未同步」。
  - [ ] 1.3 阶段完成时按 [规划规范](../../../docs/standards/planning.md) 收口并归档到 `todo-archive.md`。
  - [ ] 1.4 **归档清理**（[规划规范 §7](../../../docs/standards/planning.md)）：已完成 / 已归档条目不得在 `todo.md`、`backlog.md` 保留任何内容（含交付摘要、归档指针、「闭环整理」段）；`todo.md` 归档后只留「当前阶段状态（可为无进行中阶段）+ 未完成项汇总」，`backlog.md` 只留待决策候选。
  - [ ] 1.5 `recurring.md` 只承载**可多阶段反复执行**的任务（门槛 + 触发时机 + 待执行批次 + 执行记录）；已完成批次与一次性条目不入表；阶段收口 / 发布前须执行一轮并留痕。
  - [ ] 1.6 用户决策落定后同步全部受影响载体并回扫 AI 资产（[规划规范 §3.8](../../../docs/standards/planning.md)）。
  - [ ] 1.7 **完成态回填次序**：`todo.md` 条目置「已完成」**不得早于**该条目的 Review Gate 结论；完成态与 RG 结论须**同批落地**，且提交前记录中的结论已回填（非「待回填」占位）。否则视为「预写未落地状态」，由 Review Gate 引用本项判 warning / blocker。
- [ ] Step 2: Session 开局恢复 ⚠️ REQUIRED
  - [ ] 2.1 读取 `.session/current-task.yaml`（`active_plan` / `progress` / `next_steps` / `cognitive`）。
  - [ ] 2.2 读取 `.session/runtime-state.json`（`last_verification` 等运行快照）。
  - [ ] 2.3 读取 `.session/wisdom.md`（跨 session 可复用发现）。
  - [ ] 2.4 读取 `docs/plan/todo.md`，对齐阶段级上下文。
- [ ] Step 3: Session 收尾更新 ⚠️ REQUIRED
  - [ ] 3.1 更新 `.session/current-task.yaml` 的 `progress` / `next_steps` / `cognitive` / `session.updated_at`。
  - [ ] 3.2 追加可复用发现到 `.session/wisdom.md`。
  - [ ] 3.3 若活跃条目 >= 20，提醒执行蒸馏（见 [Session Wisdom 蒸馏机制](../../../docs/standards/session-wisdom-distillation.md)）。
  - [ ] 3.4 更新 `.session/runtime-state.json` 的 `last_verification`。
  - [ ] 3.5 **阶段态必同步触发点**：本 session 若发生 **① 阶段登记 / ② 阶段归档 / ③ 阶段范围变更（执行期追加或移出主线 / 条目）** 三类事件之一，必须**伴随该事件所在批次**同步 `.session` 阶段态——`current-task.yaml` 的 `current_phase` / `active_plan` / `next_steps` 与 `runtime-state.json` 的 `plan_state`（依据 [规划规范 §3.8](../../../docs/standards/planning.md) 的 `.session` 回扫面与 [§3.9](../../../docs/standards/planning.md) 的阶段条目构成变更面）。「同批」= 伴随触发该事件的那一批次，**不后延至 session 收尾**。该载体 git-ignored、**不设机检守卫**，由 Review Gate 引用本项作为必查依据。

## 常见检查

- 新事项是否有明确落点（当前阶段 / backlog），未在阶段容量内私自扩容。
- `.session/` 三文件是否与 `todo.md` 状态一致。
- `todo.md` 完成态是否与 Review Gate 结论**同批落地**（完成态不得早于 RG 结论，提交前记录结论已回填）——Step 1.7。
- 阶段**登记 / 归档 / 范围变更**三类事件后 `.session` 阶段态（`current-task.yaml` + `runtime-state.json`）是否已同步——Step 3.5（git-ignored，无脚本守卫，由 Review Gate 引用）。
- 认知状态（`cognitive`）是否记录了本 session 的失败与模式切换。
- 归档后 `todo.md` / `backlog.md` 是否已清空全部完成项（无交付摘要、无归档指针、无「闭环整理」段）；`recurring.md` 是否只剩可反复执行的任务。
- 长期任务的阶段收口 / 发布前触发义务是否已执行并留痕（未留痕视为未执行）。

## 边界

- `.session/` 为 **git-ignored** 的任务态，属任务态而非历史态，阶段结束时无需归档其内容。
- 权威来源：失败/模式以 `current-task.yaml` 的 `cognitive` 为准，`runtime-state.json` 仅存运行快照（`last_verification` 等）。
- 失败切换规则见 [AI 协作规范 §5 失败自检](../../../docs/standards/ai-collaboration.md)，本 skill 不重复定义。
- 首次使用或文件缺失时，从 `todo.md` 当前进行中条目派生初始内容。
- 不依赖 `.session/` 文件的存在性做提交门禁（本地有、CI 无会导致行为分叉）。

## 反模式

- 用聊天历史替代结构化 `.session/` 文件恢复上下文。
- 只更新 `todo.md` 而不同步 session 协议，或反之。
- 达到阈值仍不蒸馏，导致 wisdom 无限膨胀。
- 在 `todo.md` / `backlog.md` 里为已完成 / 已归档条目保留交付摘要或归档指针（消耗阅读成本且与归档重复）。

## 交付前检查

- [ ] `.session/` 三文件与 `todo.md` 状态一致。
- [ ] `todo.md` 完成态未早于 Review Gate 结论，且提交前结论已回填（Step 1.7）。
- [ ] 阶段登记 / 归档 / 范围变更后 `.session` 阶段态已同步（Step 3.5；git-ignored，无脚本守卫）。
- [ ] 新增事项有明确落点，未越阶段容量私自扩容。
- [ ] 达到阈值时已提示 wisdom 蒸馏（`pnpm distill:wisdom --check`）。
- [ ] `cognitive` 已记录本 session 的失败与模式切换。
- [ ] 归档清理已完成（完成项已从 `todo.md` / `backlog.md` 移除；`recurring.md` 只剩长期任务）。
