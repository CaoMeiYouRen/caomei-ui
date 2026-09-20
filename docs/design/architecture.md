# 架构设计

本文档定义 caomei-ui 的仓库形态、构建方案、包导出与依赖选型。

## 1. 仓库形态：单仓库单包

- **不使用 monorepo / pnpm workspace 多包**：当前组件与能力可由单包完全覆盖，无 workspace 必要性。
- 全部能力通过**子路径导出**承载。
- `pnpm-workspace.yaml` 存在但仅含 `.`，不构成多包 workspace。

## 2. 技术选型

| 层 | 选型 | 版本（核实于 2026-09-11，图标行复核于 2026-09-12） |
|----|------|---------------------------|
| 语言 | TypeScript（严格） | — |
| 框架 | Vue 3 | 3.5.42 |
| primitives | Reka UI | 2.10.4（peer `vue >= 3.4.0`） |
| 构建 | tsdown | 0.23.0 |
| 表格 | @tanstack/vue-table | 9.2.4 |
| 图标 | @lucide/vue | 1.45.0 |
| 测试 | Vitest / Playwright | 5.0.0 / 1.63.0 |
| 文档 | VitePress | 1.6.4 |
| 发布 | semantic-release | 25.0.9 |

> `@iconify/vue` 作为字符串图标名的可选扩展，暂不接入（见 [Backlog](../plan/backlog.md)）。

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
    "./theme.css": "./dist/styles/index.css",
    "./resolver": { "types": "./dist/resolver.d.ts", "import": "./dist/resolver.js" },
    "./nuxt": { "types": "./dist/nuxt.d.ts", "import": "./dist/nuxt.js" },
    "./package.json": "./package.json"
  }
}
```

> 本项目为 `"type": "module"`，tsdown 默认产出 `.js` / `.d.ts`（等价 ESM 与声明文件），不再使用 `.mjs` / `.d.mts`。

| 入口 | 用途 |
|------|------|
| `caomei-ui` | 组件 + composables + 类型（**含组件样式**：产物保留逐模块 CSS import，打包器按需取用；**不含基础层**，见下） |
| `caomei-ui/theme.css` | 基础层样式：tokens + 暗色选择器 + `.caomei-root` + 两个品牌预设 |
| `caomei-ui/resolver` | unplugin-vue-components resolver |
| `caomei-ui/nuxt` | Nuxt 模块 |

> **样式入口语义（2026-09-20 起，Phase 11 M1-2 确认）**：产物改为 `unbundle` + `css.inject`，**不再提供单体全量 `styles.css`**。按需由消费方打包器对逐模块 CSS import 做 tree-shaking 达成；`theme.css` 是唯一的基础层入口，供「只需要 tokens / 预设」或「组件从子路径导入」的场景显式引用。依据见 [M1-1 构建路径 POC](../design/governance/2026-09-20-m1-1-build-path-poc.md) 与 [M1-2 入口语义与 dts 验证](../design/governance/2026-09-20-m1-2-entry-semantics-and-dts-verification.md)。
>
> **基础层必须显式提供（重要）**：**实测 Vite / rolldown 系**下基础层不会随 JS 图被消费方保留（仅根导入的产物 CSS 中 `--caomei-color-bg:` 0 命中；**esbuild 实测保留**，见 [M1-2 §3](./governance/2026-09-20-m1-2-entry-semantics-and-dts-verification.md)），故不应依赖该 import，须：按需引入由 **resolver 注入** `caomei-ui/theme.css`（默认）、Nuxt 项目由**模块注入**（`injectStyles: true`，见 §5）、手写导入场景需自行 `import 'caomei-ui/theme.css'`。证据见 [M1-2 §3 更正](./governance/2026-09-20-m1-2-entry-semantics-and-dts-verification.md) 与 [M1-3 §4](./governance/2026-09-20-m1-3-style-on-demand-landing.md)。

## 4. 构建方案（tsdown）

- 产物（**2026-09-20 起**）：`unbundle: true` 的**逐模块 ESM**（镜像 `src/`，含逐模块 `.d.ts`）+ `css.inject: true`（JS 保留逐模块 CSS import）；`index` / `resolver` / `nuxt` 三入口。
- 样式：不再抽取单体 CSS；基础层落 `dist/styles/index.css`（经 `caomei-ui/theme.css` 暴露），组件样式随各自模块产出。
- `vue`、`reka-ui` 必须 external。
- `sideEffects: ["**/*.css"]` 声明支持 tree-shaking——**消费方打包器据此丢弃未使用组件的 CSS**，这是按需机制的前提（消费方不应覆写该字段）。
- **决策反转留痕**：本方案启用 `css.inject`，取代此前「样式始终由消费方显式导入或经 resolver 注入，未启用 `css.inject`」的口径（依据见 §3 引用与 [M1-1 POC §7](../design/governance/2026-09-20-m1-1-build-path-poc.md)）。

### 4.1 POC 验证结论（2026-09-12）

以 tsdown 0.23.0 + unplugin-vue 7.2.0 + @tsdown/css 0.23.0 完成最小 POC（Button / Dialog / Switch + `index`/`resolver`/`nuxt` 三入口）：

| # | 验证点 | 结论 |
|---|--------|------|
| 1 | Vue SFC（`<script setup lang="ts">` + `<style scoped>`） | ✅ 编译通过 |
| 2 | `vue` / `reka-ui` external | ✅ 产物以 `import ... from "vue"` / `"reka-ui"` 引用，未打包 |
| 3 | SFC `<style>` + CSS 抽取 | ✅ 合并进 `dist/styles.css`（含 tokens）。**2026-09-20 起改为逐模块 CSS**，见 §4 |
| 4 | 类型声明（props / slots / emits / model） | ✅ `dts.vue` 产出 `dist/*.d.ts` |
| 5 | SSR / Teleport | ✅ 非 Portal 组件正常 SSR；Portal 组件（Dialog）在 SSR 下内容进入 `ssrContext.teleports`，需 `ClientOnly` 或 `forceMount` |
| 6 | 子路径导出多入口 | ✅ `index` / `resolver` / `nuxt` 均产出 `.js` + `.d.ts`，包自引用解析通过 |

补充结论：

- Vite 仅用于 `playground/` 本地开发/演示（`pnpm dev`）与文档站构建，不产出应用发布物。
- 包体为单 ESM bundle + 命名导出，配合 `sideEffects` 支持 tree-shaking；按组件独立 chunk 暂缓。
- 样式由产物自带（`css.inject`）并经 resolver / Nuxt 模块注入基础层 `theme.css`；旧的「显式导入单体 `styles.css`」口径已废止（见 §4 决策反转留痕）。
- Reka UI 依赖链中的 `vue-demi` 在 `pnpm-workspace.yaml` 的 `allowBuilds` 中显式设为 `false`（Vue 3 下其 postinstall 为空操作，无需执行）。
- pnpm 11 不再读取 `package.json` 的 `pnpm` 字段，构建脚本放行等配置统一写进 `pnpm-workspace.yaml`（如 `allowBuilds`）；下游临时应用被 `ERR_PNPM_IGNORED_BUILDS` 阻断时据此配置。

### 4.2 构建工具选型（Vite vs tsdown）

Vite 与 tsdown 均可构建组件库。本项目采用「**Vite 负责开发 / 演示，tsdown 负责库产物**」的分工。

| 维度 | Vite Library Mode | tsdown |
|------|-------------------|--------|
| 定位 | 通用构建工具的库模式（simple & opinionated） | 专用库打包器 |
| 内核 | Rolldown（Vite 8 起） | Rolldown + Oxc |
| 类型声明 | 需额外插件（`vite-plugin-dts`） | 内置 `dts`（Vue 配 `vue-tsc`） |
| 多入口 / 子路径 | 支持，多需手工配置 | 内置，可自动生成 `exports` |
| 依赖 external | 手工 `rollupOptions.external` | 自动 external `dependencies` / `peerDependencies` |
| 发布校验 | 无内置 | 内置 `publint` / `attw` |
| 插件生态 | Vite / Rollup 完整 | Rolldown / Rollup / unplugin，部分 Vite 插件 |
| 开发体验 | dev server + HMR（强项） | 仅 watch 模式 |

选型理由：

- 组件库需要 `dts`、多入口子路径、external 与发布校验，tsdown 开箱即用、配置集中。
- Vite 官方文档明确：非浏览器库或需要高级构建流程时，可直接使用 tsdown 或 Rolldown。
- tsdown 是 Rolldown 官方项目（VoidZero 生态），官方定位为 Rolldown Vite 未来 Library Mode 的基础，长期方向一致。
- Vite 保留承担 dev server / 演示与文档站构建，二者互补而非替代。

参考：Vite `guide/build` §Library Mode；tsdown Introduction / How It Works / Vue Support；[rolldown/tsdown 讨论 #465](https://github.com/rolldown/tsdown/discussions/465)。

## 5. Nuxt 模块

`caomei-ui/nuxt` 是基于 `@nuxt/kit` 的 Nuxt 模块，随主包发布，通过 `modules` 配置接入。

- 职责：组件自动导入、composables 自动导入、样式注入、主题 token 覆盖、暗色策略。
- `@nuxt/kit` 声明为**可选 peer 依赖**：非 Nuxt 消费者不会安装它，Nuxt 应用可直接复用其同名依赖。
- 组件与样式均来自包内 `caomei-ui`（含逐模块 CSS）与 `caomei-ui/theme.css`，模块不复制运行时文件。
- **注入目标与顺序（2026-09-20 确认）**：`injectStyles` 注入的是 `caomei-ui/theme.css`（基础层），**不是全量样式**；组件样式随自动导入的模块自带。模块的虚拟 theme 覆盖（`caomei-theme.css`）必须排在 `theme.css` **之后**，否则覆盖会被基础层覆盖（M1-2 §4 场景 B 佐证）。
- 发布声明需能命名 `NuxtModule` 类型：`ReturnType<typeof defineNuxtModule<T>>` 会命中无参重载（类型缺 `with`）不可用，应显式标注 `NuxtModule<T>`；`@nuxt/schema` 作为 devDependency 提供类型并加入 tsdown `neverBundle` 以保持外部引用。

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['caomei-ui/nuxt'],
  caomeiUI: {
    prefix: 'Caomei',
    darkMode: 'class',
    injectStyles: true,
    theme: { primary: '#2563eb', radius: '0.5rem' },
  },
})
```

| 选项 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `prefix` | `string` | `'Caomei'` | 组件自动导入前缀；仅影响导入名，导出名不变 |
| `darkMode` | `'class' \| 'media' \| false` | `'class'` | `class` 由应用切换 `.dark`；`media` 注入 `data-scheme="auto"` 跟随系统；`false` 不处理 |
| `injectStyles` | `boolean` | `true` | 是否注入基础层 `caomei-ui/theme.css`（tokens + 暗色 + `.caomei-root` + 预设）。Nuxt 侧组件样式随自动导入自带，但**基础层不会被自动携带**，故默认 `true`；仅在消费方自行提供基础层时关闭 |
| `theme` | `Record<string, string>` | `{}` | 覆盖主题 token：语义别名（`primary` / `radius` 等）或 `--caomei-*` 变量名 |

`theme` 会生成 `:root { --caomei-*: … }` 作为样式注入；出现未知别名时在构建期报错。自动导入的 composables 为 `useTheme` / `useToast` / `useConfirm` / `useLocale` / `provideLocale`。

模块要求 Nuxt 4（`compatibility.nuxt: '>=4.0.0'`，`@nuxt/kit` 为可选 peer `^4.0.0`）。`theme` 的值视为构建期可信配置，会原样写入生成的 CSS。

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
- 下游兼容性回归机制（Phase 8，延迟启用）：组件库改动时同步触发已接入下游项目的 CI，验证类型与构建兼容性。

详见 [发布指南](../guide/release.md)。
