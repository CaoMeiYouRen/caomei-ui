# 待办归档

本文档归档已完成阶段的原子条目与验收结论。当前阶段完成后，从 [todo.md](./todo.md) 迁入此处。

## 归档格式

每个阶段归档块应包含：

- 阶段名称与时间；
- 交付内容与提交记录；
- 质量门结果（lint / typecheck / test / build）；
- 审计结论（Pass / Reject 及修复情况）；
- 遗留问题与后续候选。

---

## Phase 0：立项与 POC

- 时间：2026-09-11 ~ 2026-09-12
- 交付：
  - 命名与关键决策冻结（`caomei-ui`、组件前缀 `Caomei`、单仓库单包、semantic-release、禁用 Tailwind）
  - tsdown 组件库构建 + 子路径导出（POC 验证通过，结论见 [架构设计 §4.1](../design/architecture.md)）
  - 设计 token 草案：`src/styles/theme.css` 产出 `--caomei-*` CSS variables 与 `.dark` 暗色方案
  - AI 基建与文档基建落地（agents / skills / 镜像 / standards / plan / design / 文档站），`pnpm governance:check` 通过
  - `src/` 骨架：`components/`、`composables/`、`styles/`、`locale/`、`icons/`、`resolver/`、`nuxt/`、`types.ts`、`index.ts`
  - 开发环境收敛为 `playground/`，移除旧 Vite 应用脚手架
- 提交：`87703e5`（tsdown 构建）、`6b64969`（骨架与开发环境）、`4cc921a`（构建选型与文档）
- 质量门：`pnpm verify` 通过（lint / lint:css / lint:md / typecheck / test / build / docs:build / governance）
- 审计：`@code-reviewer` Review Gate 对 `87703e5` / `6b64969` / `4cc921a` 均已执行并放行（本仓库未保留独立审查工件文件）
- 遗留与后续候选：`@iconify/vue` 字符串图标名接入（Backlog）；按组件独立 chunk 暂缓
