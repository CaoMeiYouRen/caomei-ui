---
name: todo-manager
description: 管理项目规划三层结构（roadmap / todo / backlog / todo-archive）与 Session 级任务协议时使用。用户提到规划同步、阶段归档、任务拆解、session 开局恢复、session 收尾、认知状态更新、wisdom 蒸馏提醒时都应触发。
metadata:
  internal: false
---

# Todo Manager Skill（规划与 Session 协议管理）

铁律：`todo.md` 负责阶段跨度，`.session/current-task.yaml` 负责 session 跨度；两者同步不替代。

## 工作流

- [ ] Step 1: 规划同步
  - [ ] 1.1 新事项先评估 → `backlog.md` → 用户决策，再进入 `todo.md` 当前阶段。
  - [ ] 1.2 任务开始标记进行中，完成标记已完成；禁止「代码完成但规划未同步」。
  - [ ] 1.3 阶段完成时按 [规划规范](../../../docs/standards/planning.md) 收口并归档到 `todo-archive.md`。
- [ ] Step 2: Session 开局恢复 ⚠️ REQUIRED
  - [ ] 2.1 读取 `.session/current-task.yaml`（`active_plan` / `progress` / `next_steps` / `cognitive`）。
  - [ ] 2.2 读取 `.session/runtime-state.json`（`last_verification` 等运行快照）。
  - [ ] 2.3 读取 `.session/wisdom.md`（跨 session 可复用发现）。
  - [ ] 2.4 读取 `docs/plan/todo.md`，对齐阶段级上下文。
- [ ] Step 3: Session 收尾更新 ⚠️ REQUIRED
  - [ ] 3.1 更新 `.session/current-task.yaml` 的 `progress` / `next_steps` / `cognitive` / `session.updated_at`。
  - [ ] 3.2 追加可复用发现到 `.session/wisdom.md`。
  - [ ] 3.3 若活跃条目 >= 20，提醒执行蒸馏（见 [Session Wisdom 蒸馏机制](../../../docs/design/governance/session-wisdom-distillation.md)）。
  - [ ] 3.4 更新 `.session/runtime-state.json` 的 `last_verification`。

## 常见检查

- 新事项是否有明确落点（当前阶段 / backlog），未在阶段容量内私自扩容。
- `.session/` 三文件是否与 `todo.md` 状态一致。
- 认知状态（`cognitive`）是否记录了本 session 的失败与模式切换。

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

## 交付前检查

- [ ] `.session/` 三文件与 `todo.md` 状态一致。
- [ ] 新增事项有明确落点，未越阶段容量私自扩容。
- [ ] 达到阈值时已提示 wisdom 蒸馏（`pnpm distill:wisdom --check`）。
- [ ] `cognitive` 已记录本 session 的失败与模式切换。
