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

> The component library styles must be imported (`import 'caomei-ui/styles.css'`).
>
> `useConfirm()` must be called in a descendant of `CaomeiConfirmDialog`; calling it at the same level as the host throws a clear error. The docs examples get their context from the host at the layout root.

## Description and tone

`open()` accepts a full config object:

| Option | Type | Default | Description |
|------|------|------|------|
| `title` | `string` | — | Title, also the accessible name (required) |
| `description` | `string` | — | Description text, for explaining the consequences of the action |
| `confirmLabel` | `string` | host `confirmLabel` (default "Confirm") | Confirm button text |
| `cancelLabel` | `string` | host `cancelLabel` (default "Cancel") | Cancel button text |
| `tone` | `'neutral' \| 'danger'` | `'neutral'` | Tone, determines the confirm button accent |

`tone="danger"` is for destructive actions such as deletion and switches the confirm button to the danger accent.

<demo
    vue="../examples/confirm-dialog/tone.vue"
    ssg="true"
/>

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

<ComponentApi name="confirm-dialog" />
