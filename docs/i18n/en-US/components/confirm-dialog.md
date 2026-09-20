# ConfirmDialog

The confirm dialog interrupts the user's current action and obtains explicit confirmation; it wraps Reka UI AlertDialog and provides a service-style `useConfirm()`. The overlay is forced modal, locks page scroll, and **does not close on overlay click** — the user must explicitly choose confirm or cancel (Esc counts as cancel).

## Basic usage

Place `<CaomeiConfirmDialog>` once at the app root; **descendant components** then get the service via `useConfirm()`. `confirm()` returns `Promise<boolean>`: confirm resolves to `true` and cancel to `false`. Passing a string is equivalent to `{ title }`.

<demo
    vue="../examples/confirm-dialog/basic.vue"
    ssg="true"
/>

```vue
<!-- App.vue: mount the host at the root -->
<script setup lang="ts">
import { CaomeiConfirmDialog } from 'caomei-ui'
</script>

<template>
  <CaomeiConfirmDialog>
    <RouterView />
  </CaomeiConfirmDialog>
</template>
```

```vue
<!-- Any descendant component: get the service -->
<script setup lang="ts">
import { useConfirm } from 'caomei-ui'

const confirmDialog = useConfirm()

async function save(): Promise<void> {
  const confirmed = await confirmDialog.confirm('Save changes?')
  if (confirmed) {
    // perform the save
  }
}
</script>
```

> Component styles ship with the package; the base layer is injected by the resolver or the `caomei-ui/nuxt` module (both on by default) — import `caomei-ui/theme.css` yourself when wiring imports manually.
>
> `useConfirm()` must be called in a descendant of `CaomeiConfirmDialog`; calling it at the same level as the host throws a clear error. The docs examples get their context from the host at the layout root.

## Description and tone

`open()` accepts a full config object:

| Option | Type | Default | Description |
|------|------|------|------|
| `title` | `string` | — | Title, also the accessible name (required) |
| `description` | `string` | — | Description text, for explaining the consequences of the action |
| `icon` | `Component` | Falls back by `tone`: `neutral` → `Info`, `danger` → `TriangleAlert` | Icon component next to the title (e.g. one exported by `@lucide/vue`); **string icon classes are not accepted** |
| `confirmLabel` | `string` | Falls back to the host's `confirmLabel`, then the current locale's built-in text | Confirm button text |
| `cancelLabel` | `string` | Falls back to the host's `cancelLabel`, then the current locale's built-in text | Cancel button text |
| `tone` | `'neutral' \| 'danger'` | `'neutral'` | Tone, determines the confirm button accent |

`tone="danger"` is for destructive actions such as deletion and switches the confirm button to the danger accent.

> The full precedence for the button text is "per-request > host props > injected locale"; see [Built-in text and locales](/en-US/components/locale).

<demo
    vue="../examples/confirm-dialog/tone.vue"
    ssg="true"
/>

## Icon

`icon` takes an **icon component** (e.g. one exported by `@lucide/vue`), never a PrimeVue string icon class. When omitted it falls back by `tone`: `Info` for `neutral` and `TriangleAlert` for `danger`, so destructive actions show a warning icon without extra props. The icon is decorative and marked `aria-hidden="true"`; the accessible name always comes from the title.

<demo
    vue="../examples/confirm-dialog/icon.vue"
    ssg="true"
/>

```ts
import { Rocket } from '@lucide/vue'

const confirmed = await confirmDialog.open({
  title: 'Publish a new version?',
  icon: Rocket, // falls back to Info / TriangleAlert by tone when omitted
})
```

## Promise semantics

- Only one pending request is allowed at a time; calling again while the old request is unsettled settles the old Promise as `false` and starts a new request independently.
- `cancel()` actively cancels the current pending request (resolves to `false`); it has no side effect when there is no pending request.
- Clicking the overlay does not close the dialog; Esc counts as cancel.

```ts
const confirmDialog = useConfirm()

const confirmed = await confirmDialog.confirm({ title: 'Delete file', tone: 'danger' })
confirmDialog.cancel() // actively cancel (resolves to false)
```

## Accessibility and focus

- The content layer is `role="alertdialog"` and marked `aria-modal="true"`; the title and description are associated via `aria-labelledby` / `aria-describedby`.
- Focus is trapped on open and **lands on the "Cancel" button by default** to avoid accidentally triggering the destructive action.
- Page scroll is locked while modal; clicking the overlay does not close it, and Esc closes it and returns focus.
- Portal content is mounted on the client only, and there is no SSR output when `open` is false, so `ssg` is safe on the docs site.

## Style customization

The dialog width is based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-confirm-dialog-width` | `400px` | Dialog maximum width (`100vw - 2 * space-4` on narrow screens) |

```css
.caomei-confirm-dialog__content {
    --caomei-confirm-dialog-width: 480px;
}
```

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `<ConfirmDialog />` | `<CaomeiConfirmDialog />` (place once at the app root) |
| `useConfirm().require({ ... })` | `useConfirm().open({ ... })`; `confirm(content)` is the string shorthand |
| `header` / `message` | `title` / `description` |
| `acceptLabel` / `rejectLabel` | `confirmLabel` / `cancelLabel` (request > provider props > built-in text) |
| `accept` / `reject` callbacks | **Use the returned `Promise<boolean>`** instead: `true` on confirm, `false` on cancel or close |
| `acceptClass` / `rejectClass` | `tone` (`danger` renders the confirm button as destructive); arbitrary class injection is not offered |
| `icon` (string icon class) | `icon` (pass an `@lucide/vue` component, not a string class); when omitted, falls back by `tone` (`neutral` → `Info`, `danger` → `TriangleAlert`) |

**Not implemented / not exposed**: `group` (multiple instances), `position` / `draggable` / `breakpoints` / `blockScroll` / `appendTo` (placement, layering and scroll locking are managed by the library, and the dialog is always modal).

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="confirm-dialog" />
