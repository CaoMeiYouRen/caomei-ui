# 开发规范

本文档定义 caomei-ui 的技术栈、编码风格、组件 API 设计与目录结构约定。

## 1. 技术栈

| 类别 | 选型 | 说明 |
|------|------|------|
| 语言 | TypeScript（严格模式） | 禁止 `any` 逃逸，优先 `unknown` + 类型收窄 |
| 框架 | Vue 3.5.x + Composition API + `<script setup>` | 单文件组件 |
| 底层 primitives | Reka UI | 无样式、无障碍 |
| 样式 | CSS variables + 原生 CSS/SCSS | **禁止 Tailwind / UnoCSS** |
| 构建 | tsdown | 库产物（ESM + 类型声明 + CSS） |
| 表格 | @tanstack/vue-table | headless |
| 图标 | @lucide/vue | 不造图标 |
| 测试 | Vitest + Playwright | 见 [测试规范](./testing.md) |
| 发布 | semantic-release | 见 [发布指南](../guide/release.md) |

## 2. 目录结构

```
src/
├─ components/<name>/     # 单个组件（kebab-case 目录 + kebab-case.vue + types.ts + index.ts）
├─ composables/           # useToast / useConfirm / useDialog / useTheme
├─ locale/                # 组件内建文案（zh-CN / en-US）
├─ styles/                # tokens 与基础样式
├─ icons/                 # 图标封装
├─ resolver/              # unplugin-vue-components resolver
├─ nuxt/                  # Nuxt 模块（子路径导出）
├─ types.ts
└─ index.ts
playground/               # 本地开发/演示环境（不发布）
docs/                     # VitePress 文档站
examples/                 # 集成示例（不发布）
test/                     # 单元与 E2E 测试
```

## 3. 命名约定

- 目录与文件：统一 `kebab-case`；组件目录与组件文件均为 kebab-case（如 `components/data-table/data-table.vue`）；文档站主题组件同样遵循（如 `theme/components/component-api.vue`）。
- 组件对外名称：`Caomei` + `PascalCase`（如 `CaomeiButton`、`CaomeiDataTable`）；模板中亦可写作 kebab-case（如 `<caomei-button>`）。
- 常量：`UPPER_SNAKE_CASE`。
- 类型/接口：`PascalCase`，优先 `interface`（联合类型用 `type`）。
- 工具函数：`camelCase`。
- CSS 变量：`--caomei-*`（语义化命名，如 `--caomei-color-primary`）。

## 4. TypeScript 准则

- 开启 `strict`，禁止 `any`；对外 API 的所有 props / emits / slots 必须有显式类型。
- 优先 `interface` 定义 props/emits；用 `defineProps<Props>()` 泛型写法。
- 使用 `withDefaults` 或默认值语法为可选 props 提供默认值。
- 不导出未使用的类型；`src/index.ts` 只导出公共 API。
- 类型导入使用 `import type`。

## 5. Vue 组件准则

- 统一使用 `<script setup lang="ts">`。
- 组件顺序：`<script setup>` → `<template>` → `<style>`。
- 受控组件使用 `defineModel` 或显式 `modelValue` + `update:modelValue`。
- 组件必须支持 `class` 透传（根元素继承 attrs，必要时 `inheritAttrs: false` + `v-bind="$attrs"`）。
- 状态最小化：组件内优先 `ref` / `computed`，不在组件库引入全局 store。
- 插槽（slots）用于内容定制，props 用于行为控制，CSS variables 用于视觉定制。
- 不在渲染函数中做重计算；大列表/表格使用虚拟滚动（`@tanstack/vue-virtual`）。

## 6. 组件 API 设计约定

- **三层解耦**：primitive 层（Reka UI）→ 派生层（加样式/变体）→ 复合层（多 primitive 组合）。
- 变体通过 `variant` / `size` / `tone` 等受控枚举 props 提供，不通过散落布尔量堆叠。
- 默认样式**极简可用**，必须能被 CSS variables 或 `class` 100% 覆盖。
- 公共 API 变更必须考虑向后兼容；破坏性变更走 major 版本。

## 7. 样式规范

- 使用 CSS variables 承载设计 token，语义化命名，禁止硬编码品牌色到组件内部。
- 暗色模式通过 `.dark` class 或 `[data-theme="dark"]` 切换。
- 组件样式与使用方 SCSS(BEM) 共存时，保持低特异性，便于覆盖。
- 响应式由组件内部媒体查询处理，断点使用 `--caomei-breakpoint-*` token。
- 禁止引入 Tailwind / UnoCSS；如需 Tailwind 用户适配，另提供可选 preset 文档（不内置依赖）。

## 8. 构建与产物

- 使用 tsdown 构建：单 ESM bundle + 类型声明 + CSS 抽取（按组件独立 chunk 暂缓，见 [架构设计 §4.1](../design/architecture.md)）。
- `vue` 与 `reka-ui` 必须 external，不打包进产物。
- `package.json` 声明 `sideEffects`（`**/*.css`）以支持 tree-shaking。
- 子路径导出：`caomei-ui`、`caomei-ui/styles.css`、`caomei-ui/resolver`、`caomei-ui/nuxt`（tokens 并入 `styles.css`，暂不单列 `theme.css`）。

## 9. 代码生成准则

- 优先复用项目中已有的工具函数、类型与 composables，不重复实现。
- 最小改动原则：只改必须改的，不做无关重构。
- 显式优于隐式；早返回，少嵌套；不吞异常，不空 catch。
- 新增依赖前确认无功能相近的已有依赖。

## 10. 质量门

以下检查必须全部通过：

- `pnpm lint`（ESLint 零 error）
- `pnpm lint:css`（Stylelint，涉及样式时）
- `pnpm lint:md`（文档改动时）
- `pnpm typecheck`（`vue-tsc --noEmit` 零 error）
- `pnpm test`（全部通过）
- `pnpm build`（无报错，发布前对产物冒烟）
