# Popconfirm

A popconfirm opens a small panel next to its trigger button for a lightweight second confirmation. It combines `CaomeiPopover` and `CaomeiButton` and does not interrupt the page context.

## Basic usage

The default slot is the trigger button's text; `title` / `description` fill the panel, and confirm / cancel emit `confirm` / `cancel`. The panel closes automatically after either action.

<demo
    vue="../examples/popconfirm/basic.vue"
    ssg="true"
/>

## Tone and labels

- `tone="danger"` turns the confirm button danger-colored and the icon into a warning; `neutral` is the default.
- `confirmLabel` / `cancelLabel` override the button text; they default to the current locale's "Confirm" / "Cancel".
- `icon` takes a component to replace the panel icon; pass `null` to hide it. It defaults by tone.
- `triggerLabel` sets the trigger button's accessible name; it defaults to the default slot's text.

<demo
    vue="../examples/popconfirm/async.vue"
    ssg="true"
/>

## Async confirmation and controlled open

`open` supports `v-model:open`. The component **does not manage async requests**: pressing confirm emits `confirm` and closes immediately. To keep the panel open while a request runs, control `open` yourself, use `loading` for the in-flight state and set `open` to `false` when done.

When `loading` is true the confirm button shows a loading state and both buttons are disabled; `disabled` only disables the trigger.

## Keyboard and focus

- On open, focus moves to the confirm button: `Enter` confirms, `Esc` cancels.
- After the panel closes (confirm, cancel, Escape, outside click), focus returns to the trigger button.
- Clicking outside and pressing `Escape` both settle as cancel and emit `cancel`.
- The panel is `role="dialog"`, named by the title when present and otherwise by the description or confirm text.

## Boundary with ConfirmDialog

- `CaomeiPopconfirm` is for **nearby, lightweight** confirmations (delete a row, save once); it does not lock the page or hide context.
- `CaomeiConfirmDialog` (and `useConfirm()`) is for **interrupting** confirmations: modal, scroll-locked and requiring an explicit choice, suitable for irreversible high-risk actions.
- Neither manages async requests: `ConfirmDialog` returns a `Promise<boolean>`, while `Popconfirm` writes back through `confirm` / `cancel`.

## Style customization

| Variable | Default | Description |
| --- | --- | --- |
| `--caomei-popconfirm-width` | `min(20rem, available width)` | Panel width |

Spacing and font sizes inside the panel reuse `--caomei-space-*` / `--caomei-font-size-*`; the surface (background, radius, shadow) reuses `CaomeiPopover`'s `--caomei-popover-*` variables.

## Migrating from PrimeVue

| PrimeVue `ConfirmPopup` | This component |
| --- | --- |
| `<ConfirmPopup />` + imperative `useConfirm().require({...})` | `<CaomeiPopconfirm>` wrapping the trigger declaratively, with event write-back |
| `message` | `title` / `description` (or `#title` / the default slot) |
| `acceptLabel` / `rejectLabel` | `confirmLabel` / `cancelLabel` |
| `acceptIcon` / `rejectIcon` | Not supported (compose your own `CaomeiButton` with an icon slot) |
| `acceptClass` / `rejectClass` | Express the confirm tone with `tone` (`danger` / `neutral`) |
| `icon` (string icon class) | `icon` (an `@lucide/vue` component; defaults by tone) |
| `appendTo` / `baseZIndex` / `autoZIndex` / `pt` / `dt` / `unstyled` | Not implemented (the panel portals to `body`; layering is managed by the library) |

**Known intentional difference**: PrimeVue's `ConfirmPopup` is driven by a global container plus imperative `require()`; this component wraps each trigger declaratively, so every trigger owns its panel and the consumer controls open state and loading. `accept` / `reject` callbacks become `confirm` / `cancel` events.

> See [Migrating from PrimeVue](../guide/primevue-migration.md) for the process, common pitfalls and the per-component index.

<ComponentApi name="popconfirm" />
