# Composables

Besides components, caomei-ui exports three composables for theming, toasts and confirm dialogs. They are auto-imported when the Nuxt module is used; other projects import them from the package entry.

| Composable | Responsibility | Prerequisite |
| --- | --- | --- |
| `useTheme` | Theme and dark mode management | None |
| `useToast` | Service-style toasts | Call it inside a descendant of `<CaomeiToastProvider>` |
| `useConfirm` | Service-style confirm dialogs | Call it inside a descendant of `<CaomeiConfirmDialog>` |

```ts
import { useConfirm, useTheme, useToast } from 'caomei-ui'
```

## Placing the providers

`useToast` / `useConfirm` rely on their providers for context; place them once near the application root (in Nuxt, `app.vue` works):

```vue
<template>
  <CaomeiToastProvider>
    <CaomeiConfirmDialog>
      <NuxtPage />
    </CaomeiConfirmDialog>
  </CaomeiToastProvider>
</template>
```

In non-Nuxt projects, replace `<NuxtPage />` with your root content.

## useTheme

Manages the theme mode and syncs it to the root `<html>` element:

- `dark` / `light`: toggles the `.dark` / `.light` class;
- `auto`: sets `data-scheme="auto"` and lets CSS follow the system preference; `isDark` reads the system preference.

```vue
<script setup lang="ts">
const { mode, isDark, setMode } = useTheme('auto')
</script>

<template>
  <button type="button" @click="setMode(isDark ? 'light' : 'dark')">
    Current: {{ mode }}
  </button>
</template>
```

| Name | Type | Description |
| --- | --- | --- |
| `initial` | `'light' \| 'dark' \| 'auto'` | Optional, defaults to `'auto'` |
| `mode` | `Ref<ThemeMode>` | Current mode |
| `isDark` | `ComputedRef<boolean>` | Whether dark is active (`auto` follows the system) |
| `setMode` | `(next: ThemeMode) => void` | Switches the mode |

> On the server the initial read is deferred until mount to avoid a hydration mismatch. For tokens and brand presets see [Theming and styles](/design/theming) (Chinese).

## useToast

Must be called inside a descendant of `<CaomeiToastProvider>`; place the provider once near the application root.

```vue
<script setup lang="ts">
const toast = useToast()

function onCopy(): void {
  toast.success('Copied')
}
</script>

<template>
  <button type="button" @click="onCopy">
    Copy
  </button>
</template>
```

| Method | Description |
| --- | --- |
| `show(content)` | Enqueues a toast and returns its `id` |
| `info(content)` / `success(content)` / `warning(content)` / `danger(content)` | Enqueues with the matching tone |
| `dismiss(id)` | Dismisses one toast |
| `clear()` | Dismisses all toasts |

`content` accepts a string (shorthand for `{ title }`) or an options object (`title` / `description` / `tone` / `type` / `duration` / `closable` / `action`); see [Toast](/en-US/components/toast) for the full list.

## useConfirm

Must be called inside a descendant of `<CaomeiConfirmDialog>`.

```vue
<script setup lang="ts">
const confirmDialog = useConfirm()

async function remove(): Promise<void> {
  const ok = await confirmDialog.confirm({
    title: 'Delete this item?',
    description: 'This cannot be undone.',
    tone: 'danger',
  })
  if (ok) {
    // perform the deletion
  }
}
</script>
```

| Method | Description |
| --- | --- |
| `confirm(content)` | Opens the dialog and returns `Promise<boolean>` (`true` on confirm, `false` on cancel) |
| `open(options)` | Same as above, options object only |
| `cancel()` | Cancels the pending request |

`content` accepts a string (shorthand for `{ title }`) or an options object (`title` / `description` / `confirmLabel` / `cancelLabel` / `tone`); see [ConfirmDialog](/en-US/components/confirm-dialog) for details.

## SSR and state isolation

Service-style composables keep their state on the provider instance rather than a module-level singleton; calling them at the same level as their provider throws a clear error. See [Component design §7](/design/components) (Chinese) for the SSR isolation rationale.
