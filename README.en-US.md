<h1 align="center">caomei-ui</h1>
<p>
  <img alt="Version" src="https://img.shields.io/github/package-json/v/CaoMeiYouRen/caomei-ui.svg" />
  <a href="https://app.codecov.io/gh/CaoMeiYouRen/caomei-ui" target="_blank">
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/CaoMeiYouRen/caomei-ui">
  </a>
  <a href="https://github.com/CaoMeiYouRen/caomei-ui/actions?query=workflow%3ATest" target="_blank">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/CaoMeiYouRen/caomei-ui/test.yml?branch=master">
  </a>
  <a href="http://ui.cmyr.dev/" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <img src="https://img.shields.io/badge/node-%3E%3D20-blue.svg" />
  <a href="https://github.com/CaoMeiYouRen/caomei-ui/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/CaoMeiYouRen/caomei-ui/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/CaoMeiYouRen/caomei-ui?color=yellow" />
  </a>
</p>

> A Vue 3 component library built on [Reka UI](https://reka-ui.com/). Components and styles are decoupled, with minimal default styles that support 100% customization via CSS variables. Theme switching and dark mode work out of the box.

**[中文文档](./README.md)** | **Documentation** | **[Changelog](./CHANGELOG.md)**

## ✨ Features

- **Decoupled Components & Styles**: Minimal default styles, fully customizable via `--caomei-*` CSS variables. No Tailwind / UnoCSS dependency.
- **Theme & Dark Mode**: CSS variables + semantic tokens; supports `.dark` / `[data-theme="dark"]` and three presets (`data-preset`: minimal (default) / caomei / momei).
- **Desktop & Mobile**: Single responsive package, no separate mobile bundle.
- **Single Package**: Components, styles, resolver, and Nuxt module exported via subpaths.
- **Accessible**: Built on Reka UI with ARIA, keyboard navigation, and focus management.

## 📦 Requirements

- Node.js >= 20
- pnpm (version from root `package.json` `packageManager` field)

## 🚀 Installation

```sh
pnpm add caomei-ui
```

Current version is `0.4.0` (style entry: `caomei-ui/theme.css`; 0.2.0 introduced a breaking package-format change from `caomei-ui/styles.css`; 0.3.0 adds `DataTable` row grouping / expandable row groups / row expansion / multi-sort and the `TagsInput` component; 0.4.0 fixes style defects — `iconOnly` button square geometry and invalid-state focus color in `Select` — and improves soft-variant / toast border contrast, plus a `DataTable` pagination alignment token). The library requires Vue 3.5+ as a peer dependency. API and directory structure may change before 1.0; see the [versioning & compatibility page](./docs/guide/version-policy.md) for the frozen surfaces.

Beyond Vue 3.5+, **some components carry optional peer dependencies** (currently the editor core `md-editor-v3` for `CaomeiRichTextEditor`): downstreams that do not use those components neither install them nor are affected, while using them requires installing the peer first (`pnpm add md-editor-v3`).

## 📖 Usage

### On-Demand Import (Recommended)

```ts
import Components from 'unplugin-vue-components/vite'
import { CaomeiUiResolver } from 'caomei-ui/resolver'

export default defineConfig({
  plugins: [Components({ resolvers: [CaomeiUiResolver()] })],
})
```

### Full Import

```ts
import { CaomeiButton } from 'caomei-ui'
```

> Component styles are bundled with each component. **The base layer (tokens / dark mode / presets) must be explicitly imported**: `import 'caomei-ui/theme.css'`, or use the on-demand import above (resolver auto-injects it).

```vue
<template>
  <CaomeiButton variant="primary">Button</CaomeiButton>
</template>
```

### Nuxt Projects

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

Components, composables, and styles are automatically integrated. See [Architecture §5](./docs/design/architecture.md) for options.

The module is built on `@nuxt/kit`, declared as an **optional peer dependency**: Nuxt 4 apps already ship the same package and need no manual install, while non-Nuxt consumers never install it. The module requires Nuxt 4.

## 🔗 Links

- **Documentation**: [ui.cmyr.dev](http://ui.cmyr.dev/)
- **GitHub**: [CaoMeiYouRen/caomei-ui](https://github.com/CaoMeiYouRen/caomei-ui)
- **npm**: [caomei-ui](https://www.npmjs.com/package/caomei-ui)
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

## 📄 License

[MIT](./LICENSE) © [CaoMeiYouRen](https://github.com/CaoMeiYouRen)
