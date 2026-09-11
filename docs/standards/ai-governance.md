# AI 资产治理

本文档定义 caomei-ui 的 agents / skills 库存、镜像机制、外部资产准入与变更治理。

## 1. 主定义与镜像

| 位置 | 角色 |
|------|------|
| `.github/agents/` | agent 主定义目录，权威来源 |
| `.github/skills/` | skill 主定义目录，权威来源 |
| `.claude/agents/`、`.claude/skills/` | Claude Code 兼容镜像 |
| `.opencode/agents/`、`.opencode/skills/` | OpenCode 兼容镜像 |
| `.agents/agents/`、`.agents/skills/` | 通用 Agent 兼容镜像 |

- 镜像通过 `scripts/setup/setup-ai.mjs` 维护为**符号链接**，指向 `.github/` 主定义。
- 镜像必须与主定义同名、同库存、同职责边界；不得独立发明另一套角色体系。
- 新增/删除/重命名 agent 或 skill 后，必须运行 `pnpm setup:ai` 同步镜像，并更新 `AGENTS.md` 的智能体矩阵。

## 2. Agent 定义约定

- 文件名：`<role>.agent.md`，放在 `.github/agents/`。
- 头部 frontmatter 必须包含 `name` 与 `description`（触发面清晰）。
- 正文只保留：角色定位、输入输出、交接点、禁区、强制参考文档。
- 不重复抄写现成 skills 或规范文档的完整条款，使用链接引用。
- agent 引用的 skill 与文档必须真实存在（提交前检查链接）。

## 3. Skill 定义约定

- 目录结构：`.github/skills/<name>/SKILL.md`（可含 `references/`、`scripts/`）。
- frontmatter 必须包含 `name` 与 `description`；`metadata.internal` 标记是否为内部技能。
- `description` 需包含明确的触发词，便于自动匹配。
- 正文建议包含：铁律、工作流（带 REQUIRED 标记）、常见检查、反模式、交付前检查。
- 一个 skill 只承担一类能力；避免与既有 skill 职责重叠。

## 4. 外部资产准入

引入外部 skill / agent / MCP server 前必须：

1. 核实来源真实存在（官方 registry / 官方仓库），排除 typosquatting；
2. 记录来源、版本、license；
3. 锁定版本，不直接跟随上游主分支；
4. 评估与现有资产的职责重叠，避免重复承载；
5. 在 `docs/design/governance/` 记录准入决策与理由。

## 5. 库存变更治理

- 任何 agent / skill 库存变更属于治理定义改动，必须经过 `@code-reviewer` Review Gate。
- 变更后同步更新：`AGENTS.md` 智能体矩阵、平台适配入口（`CLAUDE.md` 等）、镜像。
- 定期清理长期未使用或职责重叠的资产。

## 6. 反模式

- 直接复制上游 SKILL.md 而不适配本项目。
- 镜像与主定义内容不一致。
- agent 引用不存在的 skill 或文档（断链）。
- 在 agent/skill 中重复定义已有的项目级规则。
