# 项目规范索引

本文档是 caomei-ui 项目规范的统一入口。`AGENTS.md` 是唯一权威事实源，本目录承载其显式引用的规范细则。

## 规范清单

| 规范 | 文件 | 适用范围 |
|------|------|----------|
| 开发规范 | [development.md](./development.md) | 技术栈、TypeScript/Vue 风格、组件 API、样式、目录结构 |
| 测试规范 | [testing.md](./testing.md) | Vitest 单元测试、Playwright E2E、覆盖率与验证矩阵 |
| 文档规范 | [documentation.md](./documentation.md) | 文档站、规范/设计/规划文档的维护与同步 |
| Git 规范 | [git.md](./git.md) | 分支、提交、合并与推送纪律 |
| 安全规范 | [security.md](./security.md) | 密钥、依赖、输入校验、终端与供应链安全 |
| 规划规范 | [planning.md](./planning.md) | backlog / roadmap / todo 制度与新需求准入流程 |
| AI 协作规范 | [ai-collaboration.md](./ai-collaboration.md) | PDTFC+ 工作流、搜索优先、交接与验证矩阵 |
| AI 资产治理 | [ai-governance.md](./ai-governance.md) | agents / skills 库存、镜像、外部资产准入与治理 |

## 使用约定

- 修改任何规范前，先确认其是否与 `AGENTS.md` 冲突；冲突时以 `AGENTS.md` 为准。
- 规范条目只写「要做什么」，不写原理与案例数据；具体案例沉淀到 `docs/design/governance/` 或 `docs/reports/`。
- 规范变更属于治理定义改动，必须经过 `@code-reviewer` Review Gate。
- 所有规范文档遵循 [文档规范](./documentation.md) 的格式与检查要求。
