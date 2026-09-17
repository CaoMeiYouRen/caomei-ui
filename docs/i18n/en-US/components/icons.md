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
| `icon` | `Component` | — | Icon component, required |
| `size` | `number \| string` | `'1em'` | Size; numbers are pixels, strings are used as-is |

> To reference icon components in your own templates, install `@lucide/vue` in the project (`pnpm add @lucide/vue`). It is a runtime dependency of caomei-ui, but under pnpm's strict dependency layout it is not guaranteed to be resolvable downstream.
>
> Examples on this page import from `@/icons`, the documentation site's alias to this repository's source; downstream projects import `CaomeiIcon` from the package root instead: `import { CaomeiIcon } from 'caomei-ui'`.

## Sizing

`CaomeiIcon` inherits the font size by default (`1em`) and aligns with adjacent text. Pass `size` for a fixed size (numbers are pixels, e.g. `16` / `20`).

<demo
    vue="../examples/icons/sizing.vue"
    ssg="true"
/>

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
