# Select

A select chooses a single value from a list of options; it wraps Reka UI Select.

## Basic usage

Two-way bind the selected value with `v-model` and pass the options via `options`.

<demo
    vue="../examples/select/basic.vue"
    ssg="true"
/>

## Object options

`options` accepts arbitrary objects; `optionLabel` / `optionValue` set the fields (or accessor functions) for the display text and the value. Values may be strings or numbers.

<demo
    vue="../examples/select/object-options.vue"
    ssg="true"
/>

> Field resolution: the string form of `optionLabel` / `optionValue` supports `a.b` dot-paths. When `optionValue` does not resolve to a string or number (`null`, a boolean, a missing field), that option is **not rendered**; when `optionLabel` resolves to no text, the option's text is empty and the trigger falls back to `placeholder`.

## Sizes

Switch the size with `size`; supports `sm` / `md` / `lg`.

<demo
    vue="../examples/select/sizes.vue"
    ssg="true"
/>

## States

`disabled` disables, `invalid` marks a validation failure; a per-option `disabled` disables a single option.

<demo
    vue="../examples/select/states.vue"
    ssg="true"
/>

## Accessibility

- Built on Reka UI's native ARIA semantics, with keyboard navigation (arrow keys / Enter / Esc / type-ahead).
- `label` provides an accessible name when there is no visible label and maps to `aria-label`.
- When `invalid`, it outputs `aria-invalid="true"`.

## Events and exposed

No events besides `update:modelValue`; the option list is passed in a controlled way via `options`.

> Controlled behavior: when `modelValue` is not in `options`, the trigger falls back to showing `placeholder`, but the model value stays controlled and is not cleared automatically; if you need it cleared, reset it in the consumer after watching `options` change.

> Width: `width: 100%` by default, with an overridable `max-width` set by `--caomei-select-max-width` (see [Theming and styles §4.1](/design/theming), Chinese); set the variable to `none` to fill its column.
>
> Scroll: the page scroll is not locked when expanded by default (`bodyLock` defaults to `false`) to avoid layout jumps from the disappearing scrollbar; on mobile the background may therefore scroll — pass `body-lock` to lock it.

<ComponentApi name="select" />
