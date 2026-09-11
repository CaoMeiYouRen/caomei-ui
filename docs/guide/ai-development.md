# AI 协同开发指南

本指南面向使用 AI 代理参与 caomei-ui 开发的开发者。核心规则以 [AGENTS.md](../../AGENTS.md) 为准，本文档只提供导览。

## 1. 权威事实源

- [AGENTS.md](../../AGENTS.md)：项目级 AI 行为准则、PDTFC+ 工作流、智能体矩阵、安全红线。
- [docs/standards/ai-collaboration.md](../standards/ai-collaboration.md)：PDTFC+ 与搜索优先细则。
- [docs/standards/ai-governance.md](../standards/ai-governance.md)：agents / skills 库存与治理。

## 2. 工作流概览

```
P 需求/规划 → D 实现 → A 审计 → V 界面验证 → T 测试 → F 收口提交
```

- **P**：`@product-manager` 澄清需求与验收标准，对齐 `docs/plan/todo.md`。
- **D**：`@full-stack-master` 统筹实现，遵守 [开发规范](../standards/development.md)。
- **A**：`@code-reviewer` 强制 Review Gate，未放行不得提交。
- **V**：`@ui-validator` 浏览器验证组件渲染、主题、响应式。
- **T**：`@test-engineer` 测试补强。
- **F**：`@documentation-specialist` 同步文档，`conventional-committer` 提交。

## 3. 智能体与技能

- 主定义目录：`.github/agents/`、`.github/skills/`。
- 平台镜像：`.claude/`、`.opencode/`、`.agents/`（符号链接）。
- 同步命令：`pnpm setup:ai`。

详见 [AI 资产治理](../standards/ai-governance.md)。

## 4. 提交纪律

- 提交必须符合 Conventional Commits，描述用中文。
- 禁止裸 `git commit -m`，必须经 `conventional-committer` skill。
- **禁止擅自 push**。

## 5. 搜索优先

遇到不熟悉的 API（Reka UI、tsdown、Vue 3.6 兼容性等）或修复失败 >= 2 次时，先搜索官方文档与权威来源，再继续分析。

## 6. 新需求处理

新需求默认走「评估 → [backlog](../plan/backlog.md) → 用户决策」，不得自动升级为当前阶段最高优先级。详见 [规划规范](../standards/planning.md)。
