# FloatLabel

FloatLabel overlays a `<label>` on a form field: `over` (default) centers the label as a placeholder when empty and floats it above the field on focus or when filled; `in` keeps the label at the top of the field and pushes the content down.

## Basic usage

With the `over` variant the label is centered when empty and floats above the field when the field has a value or receives focus (it leaves the field's inner space, so it never covers the value):

<demo
    vue="../examples/float-label/basic.vue"
    ssg="true"
/>

## With a select

Members can be any form control, for example a select:

<demo
    vue="../examples/float-label/with-select.vue"
    ssg="true"
/>

## The in variant

`variant="in"` pins the label to the top of the field and reserves space for it:

<demo
    vue="../examples/float-label/in.vue"
    ssg="true"
/>

## Usage notes

- The default slot must contain a field and a **direct child** `<label>` associated with the field's `id` via `for`.
- The "filled" state relies on the `data-filled` attribute exposed by the field root; `CaomeiInput` / `Textarea` / `Select` / `MultiSelect` / `InputNumber` all support it, and native `<input>` / `<textarea>` also float on focus or a non-empty `placeholder`.
- `MultiSelect` renders through a Reka `ComboboxRoot` wrapper, so the field is not a direct child; FloatLabel matches it via a descendant selector. For other controls, keep the field as a direct child.
- Put a single field inside each FloatLabel: the `over` "filled" check matches any descendant `data-filled`.
- When a member provides a non-empty `placeholder`, the empty-state `over` label also floats so it does not overlap the placeholder text.
- The `in` variant normalizes the field height (ignores the `size` prop, using `--caomei-float-label-in-min-height`) so the label and content keep a stable gap.
- Custom fields can opt into the `over` floating state by exposing `data-filled` (has a value) or `data-has-placeholder` (has non-empty placeholder text) on the field root.
- The `over` variant floats the label above the field and reserves outer space via `margin-block-start` (see `--caomei-float-label-over-space`); set it to `0` to control spacing yourself.
- The `in` variant reserves top space via padding and currently supports `Input` / `Select` / `MultiSelect` / `Textarea`; use `over` for `InputNumber`.

## Browser support

The floating state relies on the CSS `:has()` selector and requires Chrome 105+ / Edge 105+ / Safari 15.4+ / Firefox 121+. Without `:has()` support it degrades to a label permanently centered (in the `over` variant it will cover the value when the field is filled); target the baseline above or use `variant="in"`, which does not rely on `:has()` for positioning.

## Accessibility

- The label stays a semantic `<label>` associated with the field via `for`; the `over` variant sets `pointer-events: none` so it does not block text selection.
- The focused label uses the primary theme colour; `aria-invalid` or the field's `invalid` state switches it to the danger colour.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-float-label-inset` | `--caomei-space-3` | Inline start padding of the label |
| `--caomei-float-label-color` | `--caomei-color-text-muted` | Default label colour |
| `--caomei-float-label-focus-color` | `--caomei-color-primary` | Label colour when focused |
| `--caomei-float-label-invalid-color` | `--caomei-color-danger` | Label colour in the invalid state |
| `--caomei-float-label-over-space` | `--caomei-space-4` | Space reserved above the field by `over` (set to `0` to opt out) |
| `--caomei-float-label-over-top` | `calc(-1 * var(--caomei-space-4))` | Label offset from the field top after floating (`over`; negative means above the field) |
| `--caomei-float-label-over-textarea-top` | `--caomei-space-2` | Empty-state label offset for a textarea (`over`) |
| `--caomei-float-label-in-top` | `--caomei-space-1` | Label offset from the top (`in`) |
| `--caomei-float-label-in-min-height` | `--caomei-control-height-lg` | Minimum field height (`in`) |
| `--caomei-float-label-in-padding-top` | `--caomei-space-4` | Top space reserved for the label (`in`) |
| `--caomei-float-label-in-padding-bottom` | `--caomei-space-1` | Field bottom padding (`in`) |
| `--caomei-float-label-transition-duration` | `0.15s` | Transition duration |

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `variant` (`over` / `in` / `on`) | `variant` (`over` / `in`); **`on` is not supported** |
| Wrapped child | Same usage: wrap a supported input control, and the child needs a `placeholder` |

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="float-label" />
