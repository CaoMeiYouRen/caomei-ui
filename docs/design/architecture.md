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
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./styles.css": "./dist/styles.css",
    "./resolver": { "types": "./dist/resolver.d.ts", "import": "./dist/resolver.js" },
    "./nuxt": { "types": "./dist/nuxt.d.ts", "import": "./dist/nuxt.js" },
    "./package.json": "./package.json"
  }
}
```

> 本项目为 `"type": "module"`，tsdown 默认产出 `.js` / `.d.ts`（等价 ESM 与声明文件），不再使用 `.mjs` / `.d.mts`。

| 入口 | 用途 |
|------|------|
| `caomei-ui` | 组件 + composables + 类型 |
| `caomei-ui/styles.css` | 全量样式（tokens + 组件样式） |
| `caomei-ui/resolver` | unplugin-vue-components resolver |
| `caomei-ui/nuxt` | Nuxt 模块 |

> 主题变量（tokens）当前并入 `styles.css`；独立的 `caomei-ui/theme.css` 入口按需再评估。

## 4. 构建方案（tsdown）

- 产物：单 ESM bundle + 类型声明 + CSS 抽取（按组件独立 chunk 暂缓）。
- `vue`、`reka-ui` 必须 external。
- `sideEffects` 声明支持 tree-shaking。

### 4.1 POC 验证结论（2026-09-12）

以 tsdown 0.23.0 + unplugin-vue 7.2.0 + @tsdown/css 0.23.0 完成最小 POC（Button / Dialog / Switch + `index`/`resolver`/`nuxt` 三入口）：

| # | 验证点 | 结论 |
|---|--------|------|
| 1 | Vue SFC（`<script setup lang="ts">` + `<style scoped>`） | ✅ 编译通过 |
| 2 | `vue` / `reka-ui` external | ✅ 产物以 `import ... from "vue"` / `"reka-ui"` 引用，未打包 |
| 3 | SFC `<style>` + CSS 抽取 | ✅ 合并进 `dist/styles.css`（含 tokens） |
| 4 | 类型声明（props / slots / emits / model） | ✅ `dts.vue` 产出 `dist/*.d.ts` |
| 5 | SSR / Teleport | ✅ 非 Portal 组件正常 SSR；Portal 组件（Dialog）在 SSR 下内容进入 `ssrContext.teleports`，需 `ClientOnly` 或 `forceMount` |
| 6 | 子路径导出多入口 | ✅ `index` / `resolver` / `nuxt` 均产出 `.js` + `.d.ts`，包自引用解析通过 |

补充结论：

- `pnpm build` 已切换为 tsdown 库构建；旧 Vite 应用构建保留为 `pnpm build:app`，输出到独立 `dist-app/`，与发布目录 `dist/` 隔离。
- 包体为单 ESM bundle + 命名导出，配合 `sideEffects` 支持 tree-shaking；按组件独立 chunk 暂缓。
- 样式始终由消费方显式导入（`import 'caomei-ui/styles.css'`）或经 resolver 注入，未启用 `css.inject`。
- Reka UI 依赖链中的 `vue-demi` 在 `pnpm-workspace.yaml` 的 `allowBuilds` 中显式设为 `false`（Vue 3 下其 postinstall 为空操作，无需执行）。

## 5. Nuxt 模块

- 以 `@nuxt/kit` 编写，作为 `caomei-ui/nuxt` 子路径导出随主包发布。
- 职责：组件自动导入、composables 自动导入、样式注入、SSR 安全处理、主题配置。

> 当前 `src/nuxt/module.ts` 为**占位实现**（尚未接入 `@nuxt/kit`），真实模块在后续阶段落地；下述示例为目标形态。

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
