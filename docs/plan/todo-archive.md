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

---

## Phase 1：Tier 0 组件

- 时间：2026-09-12
- 交付：
  - Tier 0 组件：Button、Input 家族（Input / Textarea / InputNumber）、Tag / Badge、Select、Dialog、Toast、Card、Checkbox、DataTable（含列定义类型 `DataTableColumn`，非独立组件）
  - InputNumber 迁移为封装 Reka UI `NumberField`；Select 修正为非模态（不锁页面滚动）
  - `label` 语义统一为可访问名（映射 `aria-label`），Checkbox 可见文本改用 `text`
  - 文档站样板（Button）：demo 渲染 + API 自动生成链路打通，其余组件页按同一模板推广
  - 确立「优先封装 Reka UI」的组件实现方式决策（InputNumber 迁移为其落地）
- 提交：组件实现与文档 `8b7c1d1` ~ `7077853`；文档站样板收口 `65f7bba`（Switch 见下）
- 质量门：`pnpm verify` 通过（lint / lint:css / lint:md / typecheck / test / build / docs:build / governance）
- 审计：`@code-reviewer` Review Gate 对各组件条目均已执行并放行（本仓库未保留独立审查工件文件）
- 遗留与后续候选：`@iconify/vue` 字符串图标名、`docs/**` 纳入 typecheck、a11y 自动化回归、视觉回归基线等见 [Backlog](./backlog.md)

---

## 跨阶段预落地条目

### Switch（Phase 2 预落地，用户授权）

- 时间：2026-09-12
- 交付：封装 Reka UI `Switch`，补 `defineOptions` 与表单属性 `name` / `id` / `required` / `value`、可访问名 `label`、CSS 变量覆盖钩子与焦点态；文档、示例与单元测试同步
- 提交：`8a23d1e`
- 质量门：`pnpm verify` 通过；单元测试 16 例
- 审计：`@code-reviewer` Review Gate Pass（RG-SW-01 ~ 06）；浏览器验证 59/59 通过
- 遗留：真实 `<form>` 提交链路与 SSR 水合未纳入浏览器验证覆盖
