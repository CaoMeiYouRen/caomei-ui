# 快速上手

## 安装

```bash
pnpm add caomei-ui
```

> 当前最新版本为 `0.1.0`（0.x 阶段，API 与目录结构在 1.0 前可能调整）；组件库以 Vue 3.5+ 作为 peer 依赖。规划与进展见 [路线图](../plan/roadmap.md)。

需要本地联调时，下游项目也可通过[本地联调](./local-linking.md)消费本地构建产物。

## 引入样式

```ts
import 'caomei-ui/styles.css'
```

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
