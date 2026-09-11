# 架构设计

本文档定义 caomei-ui 的仓库形态、构建方案、包导出与依赖选型。

## 1. 仓库形态：单仓库单包

- **不使用 monorepo / pnpm workspace 多包**：当前组件与能力可由单包完全覆盖，无 workspace 必要性。
- 全部能力通过**子路径导出**承载。
- `pnpm-workspace.yaml` 存在但仅含 `.`，不构成多包 workspace。

## 2. 技术选型

| 层 | 选型 | 版本（核实于 2026-09-11） |
|----|------|---------------------------|
| 语言 | TypeScript（严格） | — |
| 框架 | Vue 3 | 3.5.42 |
| primitives | Reka UI | 2.10.4（peer `vue >= 3.4.0`） |
| 构建 | tsdown | 0.23.0 |
| 表格 | @tanstack/vue-table | 9.2.4 |
| 图标 | lucide-vue-next / @iconify/vue | 1.0.0 / 5.0.1 |
| 测试 | Vitest / Playwright | 5.0.0 / 1.63.0 |
| 文档 | VitePress | 1.6.4 |
| 发布 | semantic-release | 25.0.9 |

### 2.1 明确不选

- **Tailwind / UnoCSS**：作者视其为无法掌控的外部依赖；使用方均为 SCSS(BEM)。
- **Vue Vapor 模式**：Reka UI 在 Vapor 下存在 `asChild` 兼容问题（vuejs/core#14771），Vue 3.6 仍在 RC。
- **changesets**：改用 semantic-release（Monorepo 场景才需要 changesets）。
- **Histoire**：维护停滞（最新 `1.0.0-beta.1`，2026-01-07），不作为文档主站。

## 3. 包导出

```jsonc
{
  "exports": {
    ".": { "types": "./dist/index.d.mts", "import": "./dist/index.mjs" },
    "./styles.css": "./dist/styles.css",
    "./theme.css": "./dist/theme.css",
    "./resolver": { "types": "./dist/resolver.d.mts", "import": "./dist/resolver.mjs" },
    "./nuxt": { "types": "./dist/nuxt.d.mts", "import": "./dist/nuxt.mjs" },
    "./package.json": "./package.json"
  }
}
```

| 入口 | 用途 |
|------|------|
| `caomei-ui` | 组件 + composables + 类型 |
| `caomei-ui/styles.css` | 全量样式（tokens + 组件样式） |
| `caomei-ui/theme.css` | 仅主题变量 |
| `caomei-ui/resolver` | unplugin-vue-components resolver |
| `caomei-ui/nuxt` | Nuxt 模块 |

## 4. 构建方案（tsdown）

- 产物：ESM 聚合 + 类型声明 + CSS 抽取 + 按组件 chunk。
- `vue`、`reka-ui` 必须 external。
- `sideEffects` 声明支持 tree-shaking。

### 4.1 待验证（Phase 0 POC）

1. tsdown 处理 `.vue` SFC（`<script setup lang="ts">` + `<style>`）。
2. `reka-ui` external 处理正确。
3. SFC 内 `<style>` 合并到 `styles.css`。
4. `vue-tsc` 正确产出组件 props/slots/emits 类型。
5. SSR 下 `ClientOnly` / `Teleport` 兼容。
6. 子路径导出（`./resolver`、`./nuxt`、`./styles.css`）多入口配置可行。

## 5. Nuxt 模块

- 以 `@nuxt/kit` 编写，作为 `caomei-ui/nuxt` 子路径导出随主包发布。
- 职责：组件自动导入、composables 自动导入、样式注入、SSR 安全处理、主题配置。

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['caomei-ui/nuxt'],
  caomeiUI: {
    prefix: 'Caomei',
    theme: { primary: '#e63946', radius: '0.5rem' },
    darkMode: 'class',
    injectStyles: true,
  },
})
```

## 6. 非 Nuxt 项目接入

```ts
import Components from 'unplugin-vue-components/vite'
import { CaomeiUiResolver } from 'caomei-ui/resolver'

export default defineConfig({
  plugins: [Components({ resolvers: [CaomeiUiResolver()] })],
})
```

## 7. 发布链路

- Conventional Commits → semantic-release 推断版本 → 生成 CHANGELOG → 发布 npm → GitHub Release。
- 下游兼容性回归机制（Phase 5，延迟启用）：组件库改动时同步触发已接入下游项目的 CI，验证类型与构建兼容性。

详见 [发布指南](../guide/release.md)。
