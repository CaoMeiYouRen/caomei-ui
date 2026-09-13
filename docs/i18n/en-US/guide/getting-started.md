# Getting Started

## Install

```bash
pnpm add caomei-ui
```

> The first release is not published yet (Tier 0 / Tier 1 / Tier 2 / Tier 3 components are implemented and archived; see the [roadmap](/plan/roadmap)). The snippets below show the target integration shape.

## Import styles

```ts
import 'caomei-ui/styles.css'
```

## Basic usage

```vue
<script setup lang="ts">
import { CaomeiButton } from 'caomei-ui'
</script>

<template>
  <CaomeiButton variant="primary">Button</CaomeiButton>
</template>
```

## Nuxt

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

Components and composables are auto-imported.

## Non-Nuxt projects

```ts
import Components from 'unplugin-vue-components/vite'
import { CaomeiUiResolver } from 'caomei-ui/resolver'

export default defineConfig({
  plugins: [Components({ resolvers: [CaomeiUiResolver()] })],
})
```

## Theming

Override CSS variables:

```css
:root {
  --caomei-color-primary: #e63946;
  --caomei-radius-md: 6px;
}
```

See [Theming and styles](/design/theming) (Chinese) for details.

## Next steps

- [Development guide](/guide/development) (Chinese)
- [Component design](/design/components) (Chinese)
- [Standards](/standards/index) (Chinese)
