<script setup>
import { useData } from 'vitepress'

const { theme } = useData()
</script>

# Getting Started

## Install

```bash
pnpm add caomei-ui
```

> The latest version is **v{{ theme.version }}** (style entry: `caomei-ui/theme.css`; see [Versioning & Compatibility](/en-US/guide/version-policy) for the breaking package-format change and downstream fixes). 0.x, so the API and directory layout may still change before 1.0; Vue 3.5+ is a peer dependency. See the [roadmap](/plan/roadmap) for progress.

Vue 3.5+ must be installed by your project. On top of that, **some components carry optional peer dependencies** (currently the editor core `md-editor-v3` for `CaomeiRichTextEditor`): downstreams that do not use those components neither install them nor are affected, while using them requires installing the peer first (`pnpm add md-editor-v3`) — otherwise the build fails with "cannot resolve md-editor-v3".

For local development, downstream projects can also consume the local build through [local linking](/en-US/guide/local-linking).

## Import styles

Component styles ship with the package (bundlers keep only the components you use), but the **base layer (tokens / dark mode / brand presets) must be provided explicitly**:

```ts
import 'caomei-ui/theme.css'
```

With the on-demand resolver (`CaomeiUiResolver`) or the Nuxt module the base layer is injected automatically, so this line is not needed.

> The build targets bundler consumption (Vue apps / Nuxt): the emitted JS keeps CSS imports, so a **plain Node ESM process cannot `import 'caomei-ui'` directly**.

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
    theme: { primary: '#2563eb' },
  },
})
```

Components and composables (`useTheme` / `useToast` / `useConfirm` / `useLocale` / `provideLocale`) are auto-imported, and styles are injected by default; see [Architecture §5](/design/architecture) (Chinese) for options and dark mode.

The module is built on `@nuxt/kit`, which is declared as an **optional peer dependency**: non-Nuxt consumers do not install it, while Nuxt 4 apps already ship the same package and can reuse it directly — no manual install needed. The module requires Nuxt 4.

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
  --caomei-color-primary: #2563eb;
  --caomei-radius-md: 6px;
}
```

If the custom brand colour is used as a solid or soft background behind text/icons, override the matching `-solid` and `-foreground` for that tone (e.g. `primary-solid` / `primary-foreground`) as well (see [Theming and styles §4](/design/theming), Chinese).

See [Theming and styles](/design/theming) (Chinese) for details.

## Next steps

- [Composables](/en-US/components/composables)
- [Icons](/en-US/components/icons)
- [Built-in text and locales](/en-US/components/locale)
- [Development guide](/en-US/guide/development)
- [Component design](/design/components) (Chinese)
- [Standards](/standards/index) (Chinese)
