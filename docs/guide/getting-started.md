<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
</script>

# 快速上手

## 安装

```bash
pnpm add caomei-ui
```

> 当前最新版本为 **v{{ theme.version }}**（样式入口为 `caomei-ui/theme.css`；破坏性形态变更与下游修复指引见[版本与兼容策略](./version-policy.md)）。0.x 阶段 API 与目录结构在 1.0 前可能调整；组件库以 Vue 3.5+ 作为 peer 依赖。规划与进展见 [路线图](../plan/roadmap.md)。

Vue 3.5+ 需在项目中自行安装。此外**部分组件带可选 peer 依赖**（当前为 `CaomeiRichTextEditor` 的编辑器内核 `md-editor-v3`）：未使用这些组件的下游无需安装、也不受影响；使用前须自行安装（`pnpm add md-editor-v3`），否则会在打包期报「无法解析 md-editor-v3」。

需要本地联调时，下游项目也可通过[本地联调](./local-linking.md)消费本地构建产物。

## 引入样式

组件样式随包自带（打包器按组件按需取用），但**基础层（tokens / 暗色 / 品牌预设）需要显式提供**：

```ts
import 'caomei-ui/theme.css'
```

用按需引入（`CaomeiUiResolver`）或 Nuxt 模块时，基础层会自动注入，无需手写这一行。

> 产物以打包器消费为前提（Vue 应用 / Nuxt 均满足）：产物 JS 保留 CSS import，故**不经打包器的裸 Node ESM 不能直接 `import 'caomei-ui'`**。

## 基本用法

```vue
<script setup lang="ts">
import { CaomeiButton } from 'caomei-ui'
</script>

<template>
  <CaomeiButton variant="primary">按钮</CaomeiButton>
</template>
```

## Nuxt 项目接入

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['caomei-ui/nuxt'],
  caomeiUI: {
    prefix: 'Caomei',
    darkMode: 'class',
    injectStyles: true,
    theme: { primary: '#2563eb' },
  },
})
```

组件与 composables（`useTheme` / `useToast` / `useConfirm` / `useLocale` / `provideLocale`）自动导入，样式默认自动注入；选项与暗色策略见 [架构设计 §5](/design/architecture)。

模块基于 `@nuxt/kit`，该包声明为**可选 peer 依赖**：**非 Nuxt 消费方不会安装它**，Nuxt 4 应用自带同名依赖、可直接复用，无需手工安装。模块要求 Nuxt 4。

## 非 Nuxt 项目按需引入

```ts
import Components from 'unplugin-vue-components/vite'
import { CaomeiUiResolver } from 'caomei-ui/resolver'

export default defineConfig({
  plugins: [Components({ resolvers: [CaomeiUiResolver()] })],
})
```

## 主题定制

覆盖 CSS variables 即可：

```css
:root {
  --caomei-color-primary: #2563eb;
  --caomei-radius-md: 6px;
}
```

若自定义品牌色会作为实底或底色承载文字 / 图标，需同时覆盖对应 tone 的 `-solid` 与 `-foreground`（如 `primary-solid` / `primary-foreground`）（详见 [主题与样式 §4](/design/theming)）。

详见 [主题与样式](/design/theming)。

## 下一步

- [组合式 API](/components/composables)
- [图标](/components/icons)
- [内建文案与语言](/components/locale)
- [开发指南](./development.md)
- [组件设计](/design/components)
- [项目规范](/standards/index)
