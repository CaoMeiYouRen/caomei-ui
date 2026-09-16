# SelectButton

The segmented control switches between a set of mutually exclusive or multi-selectable options, presented visually as a segmented button group (equivalent to a SegmentedControl); it wraps Reka UI ToggleGroup.

> The segmented control is always horizontal (arrow keys move left / right) and offers no vertical mode.

## Basic usage

Pass options via `options` and bind the selected value with `v-model`; it is single-select by default (`multiple` off). In single-select mode, clicking the selected option does not deselect it.

<demo
    vue="../examples/select-button/basic.vue"
    ssg="true"
/>

## Object options

`options` accepts arbitrary objects; `optionLabel` / `optionValue` set the fields (or accessor functions) for the display text and the value. Values may be strings or numbers.

<demo
    vue="../examples/select-button/object-options.vue"
    ssg="true"
/>

> Field resolution: the string form of `optionLabel` / `optionValue` supports `a.b` dot-paths. When `optionValue` does not resolve to a string or number (`null`, a boolean, a missing field), that option is **not rendered**; when `optionLabel` resolves to no text, the option's text is empty. The `#option` slot still receives the raw option object.

## Multi-select

With `multiple`, `v-model` becomes an array of values, and clicking toggles an option between selected and unselected.

<demo
    vue="../examples/select-button/multiple.vue"
    ssg="true"
/>

## Sizes and states

`size` supports `sm` / `md` / `lg`; `disabled` disables the whole group and an option-level `disabled` disables a single option; `invalid` marks a validation failure.

<demo
    vue="../examples/select-button/states.vue"
    ssg="true"
/>

## Custom option content

Use the `#option` slot to customize each option's content (such as icon + text); the slot parameter is `{ option, selected }`. Options may carry extra fields (`SelectButtonOption` has an open index signature) for use in the slot.

<demo
    vue="../examples/select-button/icon.vue"
    ssg="true"
/>

## Narrow-screen behaviour

Below 768px the options wrap by content width and share the remaining space within each row (widths are no longer strictly equal); the container grows with the number of rows so wrapped options are never clipped. The desktop form is a single row of equal-width segments. See matrix #8 in [Responsive design](/design/responsive) (Chinese).

## Form integration

With `name`, the component is submitted with a native form when inside `<form>`: single-select submits `name=value` (no field is produced when nothing is selected), and multi-select submits by index as `name[0]`, `name[1]` and so on.

```vue
<form>
  <CaomeiSelectButton v-model="align" :options="options" name="align" label="Text alignment" />
  <button type="submit">Submit</button>
</form>
```

## Accessibility

- The root element renders `role="group"`; when there is no visible label, use `label` for the accessible name (mapped to `aria-label`). Each option is a native `<button>` outputting `aria-pressed` and `data-state`.
- Roving tabindex manages focus: arrow keys move between options, `Home` / `End` jump to the first / last, and Space / Enter toggles the selection.
- A disabled option outputs `disabled` and `data-disabled` and is excluded from pointer and keyboard interaction.
- `invalid` maps to the root element's `aria-invalid`.
- The root is `role="group"` and not a labelable element, so `<label for>` cannot associate with it; for an external label use `label` (`aria-label`) or `aria-labelledby` pointing at the label element's id.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-select-button-border` | `--caomei-color-border` | Whole-group border and segment divider color |
| `--caomei-select-button-radius` | `--caomei-radius-md` | Whole-group border radius |
| `--caomei-select-button-bg` | `--caomei-color-bg` | Unselected segment background color |
| `--caomei-select-button-color` | `--caomei-color-text` | Unselected segment text color |
| `--caomei-select-button-gap` | `--caomei-space-1` | Gap between the icon and the text inside an option |
| `--caomei-select-button-active-bg` | `--caomei-color-primary` | Selected segment background color |
| `--caomei-select-button-active-color` | `--caomei-color-primary-foreground` | Selected segment text color |
| `--caomei-select-button-invalid-border` | `--caomei-color-danger` | Validation failure border color |

```css
.caomei-select-button {
    --caomei-select-button-active-bg: #16a34a;
    --caomei-select-button-active-color: #fff;
}
```

<ComponentApi name="select-button" />
