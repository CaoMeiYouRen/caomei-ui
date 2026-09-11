# Copilot Instructions

请阅读项目根目录的 `AGENTS.md`，其中包含本项目的完整 AI 行为准则、PDTFC+ 工作流、质量红线与安全约束。请严格遵循其中的所有约定。

补充要点：

- 项目为 **Vue 3 组件库（单仓库单包）**，底层使用 Reka UI，样式使用 CSS variables + 原生 CSS/SCSS。
- **禁止引入 Tailwind / UnoCSS**。
- 组件前缀统一为 `Caomei`（如 `<CaomeiButton>`）。
- 代码、配置、文档与规划类改动须遵守 [规范索引](../docs/standards/index.md)。
- 提交必须符合 Conventional Commits，且不得自动 `git push`。
- 若 Copilot 无法访问 `.github/agents/` 或 `.github/skills/`，应显式说明并按 `AGENTS.md` 的默认推荐路径执行。
