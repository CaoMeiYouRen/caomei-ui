# Icons

Icons in caomei-ui come from `@lucide/vue` and `CaomeiIcon`: `@lucide/vue` provides the icon components, and `CaomeiIcon` handles consistent sizing and alignment.

## Basic usage

`icon` takes an icon component; `size` defaults to `1em`.

```vue
<script setup lang="ts">
import { CaomeiIcon } from 'caomei-ui'
import { Check, ChevronDown } from '@lucide/vue'
</script>

<template>
  <CaomeiIcon :icon="Check" />
  <CaomeiIcon :icon="ChevronDown" size="20" />
</template>
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `Component` | — | Icon component, required |
| `size` | `number \| string` | `'1em'` | Size; numbers are pixels, strings are used as-is |

> To reference icon components in your own templates, install `@lucide/vue` in the project (`pnpm add @lucide/vue`). It is a runtime dependency of caomei-ui, but under pnpm's strict dependency layout it is not guaranteed to be resolvable downstream.

## Passing icons to components

Button, Tag, Message and similar components accept an icon component (not a string name) through the `#icon` slot. Taking [Button](/en-US/components/button) as an example:

```vue
<script setup lang="ts">
import { Plus } from '@lucide/vue'
</script>

<template>
  <CaomeiButton variant="primary" icon-position="start">
    <template #icon>
      <CaomeiIcon :icon="Plus" />
    </template>
    Create
  </CaomeiButton>
</template>
```

The supported slots and slot positions are documented on each component page.

## Sizing

`CaomeiIcon` inherits the font size by default (`1em`) and aligns with adjacent text. Pass `size` for a fixed size (numbers are pixels, e.g. `16` / `20`).
