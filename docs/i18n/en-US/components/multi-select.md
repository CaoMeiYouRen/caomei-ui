# MultiSelect

The multi-select wraps Reka UI `Combobox` and supports multiple selection, an array `v-model`, selected-value tags and type-to-filter. After opening you can type a keyword to filter the local options.

## Basic usage

Two-way bind a string array with `v-model`; selected values are shown as tags, and the remove button on a tag filters by value.

<demo
    vue="../examples/multi-select/basic.vue"
    ssg="true"
/>

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
