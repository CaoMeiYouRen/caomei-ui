# Getting Started

## Install

```bash
pnpm add caomei-ui
```

> The first release is not published yet (Tier 0 / Tier 1 / Tier 2 / Tier 3 components are implemented and archived; see the [roadmap](/plan/roadmap)). The snippets below show the target integration shape.

Before the first release, downstream projects can consume the local build through [local linking](/en-US/guide/local-linking).

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
    darkMode: 'class',
    injectStyles: true,
    theme: { primary: '#e63946' },
  },
})
```

Components and composables (`useTheme` / `useToast` / `useConfirm`) are auto-imported, and styles are injected by default; see [Architecture §5](/design/architecture) (Chinese) for options and dark mode.

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

- [Composables](/en-US/guide/composables)
- [Icons](/en-US/guide/icons)
- [Built-in text and locales](/en-US/guide/locale)
- [Development guide](/en-US/guide/development)
- [Component design](/design/components) (Chinese)
- [Standards](/standards/index) (Chinese)
