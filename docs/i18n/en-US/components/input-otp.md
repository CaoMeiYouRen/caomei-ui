# InputOtp

The verification-code input captures a one-time numeric or alphanumeric code: one cell per character, arrow-key and backspace navigation, and paste distribution. It wraps Reka UI's `PinInputRoot` / `PinInputInput`.

## Basic usage

`v-model` binds a string; `length` sets the number of cells (6 by default) and `label` provides the group's accessible name. The `complete` event fires once every cell is filled, with the full string as payload.

The example only reports the fill state and never prints the code; production code should likewise keep codes out of logs and storage.

<demo
    vue="../examples/input-otp/basic.vue"
    ssg="true"
/>

## Type and length

- `type="numeric"` (default) accepts digits only and renders `inputmode="numeric"` with a `[0-9]` pattern; non-digits are dropped.
- `type="alphanumeric"` accepts letters and digits with `inputmode="text"`.
- Changing `length` re-normalizes the internal value to the new size; extra characters are truncated without an event.
- `otp` defaults to `true`: cells fill in order (no gaps) and the inputs emit `autocomplete="one-time-code"`, so mobile browsers can autofill from SMS or the clipboard. `otp: false` restores free cell editing.

<demo
    vue="../examples/input-otp/states.vue"
    ssg="true"
/>

## Paste and the complete event

- Pasting a full code distributes it across the cells; content beyond `length` is truncated.
- In `numeric` mode the pasted text is stripped of non-digits first, so spaces and hyphens do not consume cells.
- `complete` fires once on the "incomplete → complete" transition; a controlled write-back of the same value does not fire it again. Clearing a cell and filling it again fires again.
- Deleting a middle cell does **not** shift later characters left (positions stay stable); `v-model` carries the concatenation of non-empty characters and never a gap.

## States and sizes

- `size` accepts `sm` / `md` (default) / `lg`, controlling cell size and font size.
- `invalid` emits `aria-invalid` and an error border; `disabled` disables every cell; `readonly` keeps cells focusable and copyable but not editable.
- `name` + `required` add a hidden form control inside a `<form>` for native validation.
- On touch devices, set `data-density="touch"` on an ancestor to scale control height and font in that subtree; the density axis is orthogonal to `size` (see [Touch density axis](../guide/mobile.md#touch-density-axis-and-size-overrides)).

## Forms and accessibility

- The root is `role="group"`, named by `label` (a forwarded `aria-label` also works); no empty name is emitted when neither is provided.
- Each cell has its own accessible name from the current locale's "digit N of M" text, updated with `length`.
- Arrow keys move between cells; `Backspace` clears the current cell and, when already empty, moves back and clears the previous one; `Delete` clears the current cell.
- `disabled` emits `aria-disabled` and `invalid` emits `aria-invalid`; `aria-readonly` is not placed on the `role="group"` root (that combination is not allowed) — read-only semantics come from each cell's native `readonly`.

## Style customization

Styles use CSS variables and stay low-specificity for easy overrides:

| Variable | Default | Description |
| --- | --- | --- |
| `--caomei-input-otp-gap` | `--caomei-space-2` | Gap between cells |
| `--caomei-input-otp-cell-width` | `--caomei-control-height-md` | Cell width |
| `--caomei-input-otp-cell-height` | `--caomei-control-height-md` | Cell height |
| `--caomei-input-otp-font-size` | `--caomei-font-size-lg` | Cell font size |

The `sm` / `lg` steps override these variables inside `:where()`, so consumers can override them on the same element or an ancestor. At narrow widths the cells wrap via `flex-wrap` and never overflow horizontally.

## Migrating from PrimeVue

| PrimeVue `InputOtp` | This component |
| --- | --- |
| `v-model` string | Same (`string`) |
| `length` | Same (defaults to 6) |
| `integerOnly` | Expressed through `type`: `true` → `numeric` (the default here), `false` → `alphanumeric`; **the defaults are opposite** (PrimeVue allows letters by default) |
| `mask` | Same |
| `invalid` / `disabled` / `readonly` | Same |
| `size` (`small` / `large`) | `size` (`sm` / `lg`) |
| `ariaLabel` / `ariaLabelledby` | `label` (maps to `aria-label`); `aria-labelledby` can be forwarded |
| — | `otp` (defaults to `true`, emits one-time-code autofill semantics), `placeholder`, `required` and the `complete` event are new here |

**Known intentional difference**: the default type is `numeric` (PrimeVue's `integerOnly` defaults to `false` and allows letters). Numeric-only migrations need no change; alphanumeric codes must pass `type="alphanumeric"`.

**Not implemented**: `variant` (`outlined` / `filled`), `fluid` (the field is `width: 100%` by default), `pt` / `dt` / `unstyled`, and PrimeVue's theme passthrough such as separator slots.

> See [Migrating from PrimeVue](../guide/primevue-migration.md) for the process, common pitfalls and the per-component index.

<ComponentApi name="input-otp" />
