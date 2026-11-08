# Icons

Icons in caomei-ui come from `@lucide/vue` and `CaomeiIcon`: `@lucide/vue` provides the icon components, and `CaomeiIcon` handles consistent sizing and alignment.

## Basic usage

`icon` takes an icon component; `size` defaults to `1em`.

<demo
    vue="../examples/icons/basic.vue"
    ssg="true"
/>

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `Component` | — | Icon component; used first when both `icon` and `name` are provided |
| `name` | `string` | — | Icon name in the registry; used when `icon` is omitted |
| `size` | `number \| string` | `'1em'` | Size; numbers are pixels, `sm` / `md` / `lg` use icon size tokens, other strings are used as-is |
| `strokeWidth` | `number \| string` | — | Stroke width; only applies to stroke-based icons |
| `label` | `string` | — | Accessible name for meaningful icons; emits `role="img"` + `aria-label` |

> To reference icon components in your own templates, install `@lucide/vue` in the project (`pnpm add @lucide/vue`). It is a runtime dependency of caomei-ui, but under pnpm's strict dependency layout it is not guaranteed to be resolvable downstream.
>
> Examples on this page import from `@/icons`, the documentation site's alias to this repository's source; downstream projects import `CaomeiIcon` from the package root instead: `import { CaomeiIcon } from 'caomei-ui'`.

## Sizing

`CaomeiIcon` inherits the font size by default (`1em`) and aligns with adjacent text. Pass `size` for a fixed size (numbers are pixels, e.g. `16` / `20`), or use `sm` / `md` / `lg` for the token tiers. Icons inside a container should keep following the container `font-size`; do not combine both approaches.

<demo
    vue="../examples/icons/sizing.vue"
    ssg="true"
/>

## Style customization

| token | Default | Description |
| --- | --- | --- |
| `--caomei-icon-size-sm` | `16px` | Font size for standalone `size="sm"` icons |
| `--caomei-icon-size-md` | `20px` | Font size for standalone `size="md"` icons |
| `--caomei-icon-size-lg` | `24px` | Font size for standalone `size="lg"` icons |
| `--caomei-icon-stroke-width` | `2` | Stroke width for Lucide icons when `strokeWidth` is not passed |

> Control stroke width with `--caomei-icon-stroke-width` (Lucide icons only; custom SVGs keep their own `stroke-width` — pass `strokeWidth` or change the SVG attribute when it must match), and do not rely on global selectors such as `svg { stroke-width }`. `sm` / `md` / `lg` are reserved values and must not be reused as a custom icon component's own size enum; tiers rely on `width/height: 1em`, so fixed-pixel SVGs do not scale with them.

## Icon registry and accessible names

`CaomeiIcon` supports three forms: pass an `icon` component, resolve a `name` from the registry, or render an empty placeholder with a development warning when both are missing. The registry is provided per request through `provideIconRegistry()`; it never uses a module-level singleton, so SSR is safe.

<demo
    vue="../examples/icons/registry.vue"
    ssg="true"
/>

```ts
import { provideIconRegistry } from 'caomei-ui'
import { Star } from '@lucide/vue'

provideIconRegistry({ star: Star })
```

- Resolution order: `icon` component > registry `name`; when both are missing an empty placeholder is rendered with a warning.
- The registry accepts a plain object, a `ref`, or a getter; call it in the app root or a layout.
- Accessible-name order: explicit `label` > forwarded `aria-*` / `role` / `title` > default `aria-hidden="true"`. Providing `label` emits `role="img"` + `aria-label`; only decorative icons are hidden by default.
- `icon` stays optional (`icon?: Component`) rather than a union type, preserving existing `:icon` usage and props extraction tools; at runtime provide at least one of `icon` / `name`.
- Advanced usage: `useIconRegistry()` reads the current registry; `caomeiIconRegistryKey` is available for a manual `provide` (rarely needed).

## Replacing built-in icons

Built-in component icons come from the `internal-icons` semantic map (for example `dismiss`, `chevronDown`, `check`). Use `provideIconOverrides()` to replace them by semantic name; keys you do not override keep the Lucide default. A component `#icon` slot only replaces the icon at that position; positions without a slot (such as dismiss buttons) still use the override map.

```ts
import { provideIconOverrides } from 'caomei-ui'
import { X } from '@lucide/vue'

provideIconOverrides({
    dismiss: X, // only replace the dismiss icon
})
```

- Overrides apply by semantic name: `error` (Message) and `danger` (Toast) are separate and are never merged.
- Overrides also accept a `ref` or getter and are isolated per request; call it in the app root or a layout.

## Build-time integration and migration

`CaomeiIcon` accepts any Vue component through `icon`, so Lucide is not required. Pick one of these paths as needed.

1. **unplugin-icons / Iconify (recommended for on-demand icons)**: install `unplugin-icons` and the icon set you need (for example `@iconify-json/lucide`), enable it in the build config, and import the generated component:

    ```ts
    import IconCheck from '~icons/lucide/check'

    // <CaomeiIcon :icon="IconCheck" />
    ```

2. **Your own SVG**: import the SVG as a Vue component (or via a loader such as `vite-svg-loader`) and pass it to `icon`; use `currentColor` when it should follow text color. Brand logos keep their original colors and should provide `label`.

3. **Replace built-in component icons**: use `provideIconOverrides()` by semantic name; the `#icon` slot can still override the icon at its own position (see above).

When migrating PrimeVue `pi pi-*`, map to the semantic names below; icons without a direct equivalent stay on Lucide or a custom SVG:

| Semantic name | PrimeIcons |
| --- | --- |
| `dismiss` | `pi-times` |
| `check` | `pi-check` |
| `chevronDown` / `chevronUp` / `chevronLeft` / `chevronRight` | `pi-chevron-*` |
| `chevronsLeft` / `chevronsRight` | `pi-angle-double-left` / `pi-angle-double-right` |
| `calendar` | `pi-calendar` |
| `info` | `pi-info-circle` |
| `warning` | `pi-exclamation-triangle` |
| `success` | `pi-check-circle` |
| `error` | `pi-exclamation-circle` |
| `danger` | `pi-times-circle` |
| `eye` / `eyeOff` | `pi-eye` / `pi-eye-slash` |
| `upload` | `pi-upload` |
| `loading` | `pi-spin pi-spinner` |
| `minus` / `plus` | `pi-minus` / `pi-plus` |
| `radio` | `pi-circle-on` |
| `imageOff` | No direct equivalent; keep Lucide or use a custom SVG |

> The library does not add runtime dependencies such as `@iconify/vue`; `provideIconOverrides()` only changes the component default icons and does not change the priority of the `#icon` slot or an external `icon` component.

## Icon gallery

Built-in component icons come from `@lucide/vue`; the gallery below lists icons commonly used in the documentation, with the `@lucide/vue` export name as the caption (see the [lucide icon site](https://lucide.dev/icons/) for the full set).

<demo
    vue="../examples/icons/gallery.vue"
    ssg="true"
/>

## Passing icons to components

Button, Tag, Message and similar components accept an icon component (not a string name) through the `#icon` slot. Taking [Button](/en-US/components/button) as an example:

<demo
    vue="../examples/icons/in-components.vue"
    ssg="true"
/>

The supported slots and slot positions are documented on each component page.
