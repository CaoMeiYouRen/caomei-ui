# 快速上手

## 安装

```bash
pnpm add caomei-ui
```

> 项目尚未发布首个版本（Tier 0 / Tier 1 / Tier 2 / Tier 3 稳定批组件均已完成并归档，规划见 [路线图](../plan/roadmap.md)）。以下为接入目标形态。

首版发布前，下游项目可通过[本地联调](./local-linking.md)消费本地构建产物。

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
    theme: { primary: '#e63946' },
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
  --caomei-color-primary: #e63946;
  --caomei-radius-md: 6px;
}
```

详见 [主题与样式](/design/theming)。

## 下一步

- [组合式 API](./composables.md)
- [图标](./icons.md)
- [内建文案与语言](./locale.md)
- [开发指南](./development.md)
- [组件设计](/design/components)
- [项目规范](/standards/index)
