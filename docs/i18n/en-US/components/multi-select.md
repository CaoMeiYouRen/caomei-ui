# MultiSelect

The multi-select wraps Reka UI `Combobox` and supports multiple selection, an array `v-model`, selected-value tags and type-to-filter. After opening you can type a keyword to filter the local options.

## Basic usage

Two-way bind an array of values (strings or numbers) with `v-model`; selected values are shown as tags, and the remove button on a tag filters by value.

<demo
    vue="../examples/multi-select/basic.vue"
    ssg="true"
/>

## Object options

`options` accepts arbitrary objects; `optionLabel` / `optionValue` set the fields (or accessor functions) for the display text and the value. Values may be strings or numbers.

<demo
    vue="../examples/multi-select/object-options.vue"
    ssg="true"
/>

> Field resolution: the string form of `optionLabel` / `optionValue` supports `a.b` dot-paths. When `optionValue` does not resolve to a string or number (`null`, a boolean, a missing field), that option is **not rendered**; when `optionLabel` resolves to no text, the option's text is empty.

## Clear

`showClear` shows a clear button **when values are selected and the field is not disabled** (the `options` list need not be non-empty, so values not present in `options` can still be cleared); clicking it resets the model to an empty array and returns focus to the input. The button's accessible name defaults to the current locale's "Clear" text, overridable via `clearLabel`.

<demo
    vue="../examples/multi-select/clear.vue"
    ssg="true"
/>

## Custom options

The `#option` slot customizes the panel option content and receives `option` (the **raw** option object) and `selected` (whether it is the current selection); without it the mapped display text is rendered.

<demo
    vue="../examples/multi-select/option-slot.vue"
    ssg="true"
/>

> Option filtering still uses the text mapped from `optionLabel` (Reka uses a text snapshot for type-to-filter); the slot content only affects the panel display.

## States and sizes

`disabled` disables and `invalid` marks a validation failure (maps to `aria-invalid`); `size` supports `sm` / `md` / `lg`.

<demo
    vue="../examples/multi-select/states.vue"
    ssg="true"
/>

## Form and accessibility

- When `name` is provided inside a `<form>`, a form control is generated per selected value, named `name[index]`, so it is collected by the form directly.
- `required` targets the hidden form controls (requires `name` as well); native validation fails when nothing is selected.
- `label` maps to the inner input's `aria-label`; `id` also lands on the inner input, making `<label for>` association easy.
- Note: native attributes such as `maxlength` are forwarded to the **search input**, not the selected-value text, so they only affect the filter input length.
- The open trigger's accessible name defaults to "Show options", overridable via `openLabel` (overriding Reka's built-in English name).
- The remove button's accessible name is "Remove + option text"; the prefix is overridable via `removeLabel`. When no options match it shows "No matching options", overridable via `emptyLabel`.
- The clear button renders when `showClear` is set and values are selected; its accessible name defaults to "Clear" and is overridable via `clearLabel`. After clearing, focus returns to the search input.
- Page scroll is not locked on open by default (`bodyLock=false`) to avoid layout shift from the disappearing scrollbar; enable it via `bodyLock` when needed.

## Scope

- Only local filtering and flat options are supported; **no grouping, remote search or virtual scrolling** (long lists can be added in a later iteration).
- A value not present in `options` does not render a tag but is still kept in the `v-model` array.

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-multi-select-max-width` | `--caomei-select-max-width` | Maximum field width |

```css
.caomei-multi-select {
    --caomei-multi-select-max-width: 24rem;
}
```

<ComponentApi name="multi-select" />
