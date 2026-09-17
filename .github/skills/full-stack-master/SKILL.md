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
  - [ ] 4.1 交 `code-reviewer` 执行 Review Gate；审计 prompt 必须声明 `audit-depth` + 理由与**时间盒**（按 [AI 协作规范 §3.1 审计调用协议](../../../docs/standards/ai-collaboration.md)计算），携带变更文件清单与已验证证据；小改动必须主动声明 `quick`。
  - [ ] 4.2 大改动（触发条件与汇总规则见 [AI 协作规范 §3.2](../../../docs/standards/ai-collaboration.md)）按模块划分，并行发起多个 `@code-reviewer` 审计任务；小改动不并发。
  - [ ] 4.3 发起前记录宿主时间戳，返回后实测 elapsed 并回填「实际用时 / 是否超时间盒」（见 [AI 协作规范 §3.3](../../../docs/standards/ai-collaboration.md)）。
  - [ ] 4.4 blocker 关闭前不得进入后续阶段。
  - [ ] 4.5 同一原子条目达到 [AI 协作规范 §3.4 / §3.5](../../../docs/standards/ai-collaboration.md) 的轮次上限仍未 `Pass` 时不得原样续审：先按 §3.5 执行改进协议（缩面 → 复发 finding 转机检约束 → 缺信息先搜索取证），再决定是否续审。
- [ ] Step 5: 验证（V）与测试（T）
  - [ ] 5.1 涉及界面交 `ui-validator`；无 UI 影响显式说明跳过。
  - [ ] 5.2 测试补强交 `test-engineer`。
- [ ] Step 6: 收口（F）
  - [ ] 6.1 文档同步交 `documentation-specialist`。
  - [ ] 6.2 用 `conventional-committer` 提交，不自动 push。
  - [ ] 6.3 批次内已有子范围通过 Review Gate 时先提交该子范围（部分交付），不累积到整批通过。

## 反模式

- 需求未澄清就开工。
- 跳过 Review Gate 直接提交。
- 一个事项多个实现主责并行。
- 把大改动不拆分地一次推进。
- 发起审计不带 `audit-depth` 与时间盒声明（默认 `deep` 白耗时）。
- 大改动不按模块分区、只交由单个审查者硬扛。
- Review Gate 达到轮次上限仍未过却原样续审：不缩面、不转机检约束、不补搜索取证。

## 交付前检查

- [ ] 验收标准已满足且可验证。
- [ ] Review Gate 已 Pass（达到轮次上限仍未过时已按 §3.5 执行缩面 / 机检约束 / 取证）。
- [ ] 已通过部分的子范围已单独提交，未累积到整批。
- [ ] 测试与质量门通过。
- [ ] 文档与规划已同步。
- [ ] 提交符合 Conventional Commits，未 push。
