# 快速上手

## 安装

```bash
pnpm add caomei-ui
```

> 项目尚未发布首个版本（Tier 0 组件已完成，Phase 2 待启动）。以下为接入目标形态。

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
    theme: { primary: '#e63946' },
    darkMode: 'class',
  },
})
```

组件与 composables 将自动导入。

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

- [开发指南](./development.md)
- [组件设计](/design/components)
- [项目规范](/standards/index)
