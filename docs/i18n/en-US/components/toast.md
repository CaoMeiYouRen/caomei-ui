# Toast

A toast gives brief feedback on a user action; it wraps Reka UI Toast and provides a service-style `useToast()` API. Toasts live in an accessible viewport region and support auto-dismiss, swipe-to-dismiss, action buttons and semantic tones.

## Basic usage

Place `<CaomeiToastProvider>` once at the app root; **descendant components** then get the service via `useToast()`.

<demo
    vue="../examples/toast/basic.vue"
    ssg="true"
/>

`show()` accepts a string or a config object and returns the toast `id`.

```vue
<!-- App.vue: mount the Provider at the root -->
<script setup lang="ts">
import { CaomeiToastProvider } from 'caomei-ui'
</script>

<template>
  <CaomeiToastProvider>
    <RouterView />
  </CaomeiToastProvider>
</template>
```

```vue
<!-- Any descendant component: get the service -->
<script setup lang="ts">
import { useToast } from 'caomei-ui'

const toast = useToast()

function save(): void {
  toast.show('Action completed')
  toast.show({ title: 'Saved', description: 'Changes have been synced to the server.' })
}
</script>

<template>
  <button @click="save">Save</button>
</template>
```

> The component library styles must be imported (`import 'caomei-ui/styles.css'`), otherwise the toast and viewport lack base styles.
>
> `useToast()` must be called in a descendant of `CaomeiToastProvider`. Calling it at the same level as the Provider throws a clear error; the docs examples get their context from the Provider at the layout root.

## Tones

Use the `info` / `success` / `warning` / `danger` shortcuts to set a semantic tone (neutral, success, warning, danger colors respectively); you can also set it explicitly with `show({ tone })`.

<demo
    vue="../examples/toast/tones.vue"
    ssg="true"
/>

## Position

`position` controls the viewport docking position and supports `top-left` / `top-center` / `top-right` / `bottom-left` / `bottom-center` / `bottom-right`, defaulting to `top-right`. Nested Providers can override the position locally.

<demo
    vue="../examples/toast/position.vue"
    ssg="true"
/>

## Actions and duration

Common config object options:

| Option | Type | Default | Description |
|------|------|------|------|
| `title` | `string` | — | Title |
| `description` | `string` | — | Description text |
| `tone` | `'neutral' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'neutral'` | Tone |
| `type` | `'foreground' \| 'background'` | `'foreground'` | Screen-reader announcement priority |
| `duration` | `number` | the Provider's `duration` | Display duration (ms); `<= 0` or `Infinity` means no auto-dismiss |
| `closable` | `boolean` | `true` | Whether to show the close button |
| `action` | `{ label, altText?, onClick? }` | — | Action button; dismisses after click |

<demo
    vue="../examples/toast/action.vue"
    ssg="true"
/>

`dismiss(id)` closes a specific toast, `clear()` closes all toasts. When `max` (default 5) is exceeded the oldest toast is dropped; lowering `max` immediately trims the existing queue.

```ts
const id = toast.warning({ title: 'File deleted', action: { label: 'Undo', onClick: undo } })
toast.dismiss(id)
toast.clear()
```

Provide at least one of `title` and `description`, otherwise an empty-shell toast is rendered.

## Style customization

Toast styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-toast-offset` | `--caomei-space-4` | Distance from the viewport to the screen edge |
| `--caomei-toast-width` | `min(24rem, 100% - 2 * offset)` | Viewport width |
| `--caomei-toast-z-index` | `1100` | Viewport stacking level |
| `--caomei-toast-accent` | by tone | Left accent color of the toast; overridable per tone class |

```css
.caomei-toast-viewport {
    --caomei-toast-offset: 24px;
}

.caomei-toast--success {
    --caomei-toast-accent: #16a34a;
}
```

## Accessibility and SSR

- The viewport is a `role="region"` accessible area and supports `F8` to focus; its accessible name resolves as `viewportLabel` > forwarded `aria-label` > the current locale text. Each toast's `label` and the close button's text come from the current locale and can be overridden via props.
- `foreground` toasts (default) are announced as `assertive`; `background` toasts as `polite`.
- The Provider's toast queue and auto-increment sequence are created per instance and not shared at module level, so no state leaks across requests during SSR; the viewport has no visible content until a toast is enqueued.

<ComponentApi name="toast" />
