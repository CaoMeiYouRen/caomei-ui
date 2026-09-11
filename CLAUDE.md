# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在 caomei-ui 仓库中工作时提供平台适配指导。
同时必须遵守 [AGENTS.md](./AGENTS.md) 中的项目级规则。

## 平台适配说明

### Claude 目录发现与回退

- **主定义目录**：治理上以 `.github/agents/` 与 `.github/skills/` 为主定义。
- **优先目录**：Claude Code 应优先读取 `.claude/agents/` 与 `.claude/skills/`。
- **回退目录**：若对应定义不存在，回退读取 `.github/agents/` 与 `.github/skills/`。
- **镜像约束**：`.claude/` 中的文件名、职责边界与推荐路径必须与 `.github/` 主定义一致。
- **能力受限处理**：当 Claude Code 无法完整执行某项项目规则时，应显式说明能力缺口与回退做法。

### 冲突处理

- `AGENTS.md` 是唯一权威事实源。
- 若本文件与 `AGENTS.md` 冲突，一律以 `AGENTS.md` 为准。
- 本文件只允许补充：目录发现顺序、工具能力差异、加载回退与降级策略。

## 常用命令（快速参考）

| 分类 | 命令 | 说明 |
|------|------|------|
| 开发 | `pnpm dev` | 启动 Vite 开发/演示环境 |
| 构建 | `pnpm build` | 构建库产物 |
| 测试 | `pnpm test` | 运行全部单元测试 |
| 测试 | `pnpm exec vitest run <path>` | 运行单个测试文件 |
| 质量 | `pnpm lint` | ESLint 检查与修复 |
| 质量 | `pnpm lint:css` | Stylelint 检查与修复 |
| 质量 | `pnpm typecheck` | `vue-tsc --noEmit` 类型检查 |
| 文档 | `pnpm docs:dev` | 启动 VitePress 文档站 |

## Claude 执行前检查

1. 进入任何写操作前，先按 [AGENTS.md](./AGENTS.md) 要求读取对应阶段必须参考的项目文档。
2. 涉及组件实现时，从 `docs/design/`、`docs/standards/`、`docs/guide/` 补读对应文档。
3. 若 `.claude/` 缺少某个 agent 或 skill 定义，按回退规则查找 `.github/`。
4. 遇到需外部信息、未知问题或修复失败 >= 2 次时，**必须先使用搜索工具**获取官方文档、issue tracker 或社区信息，再继续分析。详见 [AI 协作规范 - 搜索优先](./docs/standards/ai-collaboration.md)。

## Git Commit Rules

- **严禁**在提交信息中添加任何表明信息由 AI 生成的内容（如 "Written by Claude"、"AI-generated"、"Generated with" 等）。
- **不要**添加 "Signed-off-by" 或 "Co-authored-by" 页脚，除非明确要求。
- **直接输出**提交信息，不包含介绍性文字。
- **禁止擅自推送**：`git commit` 后不得自动 `git push`，除非用户明确要求。提交后应止步于本地 commit 并告知用户。

## 相关文档

| 文档 | 用途 |
|------|------|
| [AGENTS.md](./AGENTS.md) | 唯一权威事实源，定义项目级 AI 行为准则与 PDTFC+ 工作流 |
| [docs/standards/index.md](./docs/standards/index.md) | 项目规范索引 |
| [docs/standards/development.md](./docs/standards/development.md) | 开发规范、技术栈、组件实现准则 |
| [docs/standards/testing.md](./docs/standards/testing.md) | 测试规范 |
| [docs/standards/ai-collaboration.md](./docs/standards/ai-collaboration.md) | AI 协作与 PDTFC+ 工作流详情 |
| [docs/plan/roadmap.md](./docs/plan/roadmap.md) | 项目路线图 |

---

*本文件由 `@documentation-specialist` 维护，每次 `AGENTS.md` 重大变更后应同步检查是否需要精简。*
