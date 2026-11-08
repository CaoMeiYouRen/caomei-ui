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
| `size` | `number \| string` | `'1em'` | Size; numbers are pixels, strings are used as-is |
| `strokeWidth` | `number \| string` | — | Stroke width; only applies to stroke-based icons |
| `label` | `string` | — | Accessible name for meaningful icons; emits `role="img"` + `aria-label` |

> To reference icon components in your own templates, install `@lucide/vue` in the project (`pnpm add @lucide/vue`). It is a runtime dependency of caomei-ui, but under pnpm's strict dependency layout it is not guaranteed to be resolvable downstream.
>
> Examples on this page import from `@/icons`, the documentation site's alias to this repository's source; downstream projects import `CaomeiIcon` from the package root instead: `import { CaomeiIcon } from 'caomei-ui'`.

## Sizing

`CaomeiIcon` inherits the font size by default (`1em`) and aligns with adjacent text. Pass `size` for a fixed size (numbers are pixels, e.g. `16` / `20`).

<demo
    vue="../examples/icons/sizing.vue"
    ssg="true"
/>

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
