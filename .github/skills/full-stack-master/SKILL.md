---
name: full-stack-master
description: 统筹需求澄清、方案设计、实现、审计、验证、测试与提交的端到端编排技能。适用于复杂任务、跨阶段任务或需要全流程推进时。用户提到 end-to-end、全流程开发、PDTFC+、多技能编排时都应触发。
metadata:
  internal: false
---

# Full Stack Master

铁律：先建立最小充分上下文，再分配角色；同一事项同一时点只有一个实现主责；未过 Review Gate 不得提交。

## 工作流

- [ ] Step 1: 建立上下文 ⚠️ REQUIRED
  - [ ] 1.1 用 `context-analyzer` 扫描项目结构、约束文档与相关文件。
  - [ ] 1.2 读取 `AGENTS.md`、`docs/standards/index.md`、`docs/plan/todo.md`。
- [ ] Step 2: 澄清与规划（P） ⚠️ REQUIRED
  - [ ] 2.1 需求不清时交 `product-manager` / `requirement-analyst`。
  - [ ] 2.2 需要方案时交 `technical-architect`，产出文件映射与接口约定。
  - [ ] 2.3 确认验收标准与受影响文件清单。
- [ ] Step 3: 实现（D） ⚠️ REQUIRED
  - [ ] 3.1 组件实现交 `frontend-developer`，遵守 [开发规范](../../../docs/standards/development.md)。
  - [ ] 3.2 自检 `lint` + `typecheck` + 定向测试。
- [ ] Step 4: 审计（A） ⚠️ REQUIRED
  - [ ] 4.1 交 `code-reviewer` 执行 Review Gate，声明 `audit-depth`。
  - [ ] 4.2 blocker 关闭前不得进入后续阶段。
- [ ] Step 5: 验证（V）与测试（T）
  - [ ] 5.1 涉及界面交 `ui-validator`；无 UI 影响显式说明跳过。
  - [ ] 5.2 测试补强交 `test-engineer`。
- [ ] Step 6: 收口（F）
  - [ ] 6.1 文档同步交 `documentation-specialist`。
  - [ ] 6.2 用 `conventional-committer` 提交，不自动 push。

## 反模式

- 需求未澄清就开工。
- 跳过 Review Gate 直接提交。
- 一个事项多个实现主责并行。
- 把大改动不拆分地一次推进。

## 交付前检查

- [ ] 验收标准已满足且可验证。
- [ ] Review Gate 已 Pass。
- [ ] 测试与质量门通过。
- [ ] 文档与规划已同步。
- [ ] 提交符合 Conventional Commits，未 push。
