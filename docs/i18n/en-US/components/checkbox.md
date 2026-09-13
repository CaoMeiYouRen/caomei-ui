# Checkbox

A checkbox selects several options from a list or represents a single boolean toggle; it wraps Reka UI Checkbox.

## Basic usage

Two-way bind the checked state (`boolean`) with `v-model`, provide a visible label via `text`, or customize the label content with the default slot.

<demo
    vue="../examples/checkbox/basic.vue"
    ssg="true"
/>

## States

- A `modelValue` of `'indeterminate'` means partially checked and maps to `aria-checked="mixed"`; clicking it becomes checked.
- `disabled` disables, `invalid` marks a validation failure (maps to `aria-invalid`).

<demo
    vue="../examples/checkbox/states.vue"
    ssg="true"
/>

## Sizes

Switch the size with `size`; supports `sm` / `md` / `lg`.

<demo
    vue="../../../examples/checkbox/sizes.vue"
    ssg="true"
/>

## Multi-select group

A group can be managed with an array model, binding each item to whether it is included in the array:

<demo
    vue="../examples/checkbox/group.vue"
    ssg="true"
/>

## Form integration

With `name`, the checkbox is submitted with a native form when inside `<form>`; `value` is the submitted value (defaults to `'on'`), and `required` participates in native validation.

```vue
<form>
  <CaomeiCheckbox v-model="agree" name="agree" value="yes" required text="I agree to the terms" />
  <button type="submit">Submit</button>
</form>
```

> Currently only single-value form submission is supported; there is no group container, so multi-select groups with object values are not supported yet.

## Accessibility

- The control is rendered by Reka UI as a button with `role="checkbox"`, with keyboard focus and Space to toggle.
- `aria-checked` outputs `true` / `false` / `mixed`; `required` maps to `aria-required`.
- `text` or the default slot renders a `<label for>` automatically associated with the control.
- When there is no visible label (e.g. to keep the layout compact), use `label` for the accessible name, mapped to the control's `aria-label`.
- When both visible text and `label` are provided, `label` should contain or equal the visible text to avoid a mismatch between the accessible name and the visible label (WCAG 2.5.3).

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-checkbox-size` | from the `size` step | Checkbox edge length (sm 16 / md 18 / lg 20) |
| `--caomei-checkbox-font-size` | from the `size` step | Label font size (sm 12 / md 14 / lg 16) |
| `--caomei-checkbox-radius` | `--caomei-radius-sm` | Border radius |
| `--caomei-checkbox-bg` | `--caomei-color-bg` | Unchecked background color |
| `--caomei-checkbox-border` | `--caomei-color-border` | Unchecked border color |
| `--caomei-checkbox-active-bg` | `--caomei-color-primary` | Checked / indeterminate background and border color |
| `--caomei-checkbox-foreground` | `--caomei-color-primary-foreground` | Indicator icon color |

```css
.caomei-checkbox {
    --caomei-checkbox-active-bg: #16a34a;
    --caomei-checkbox-radius: 999px;
}
```

<ComponentApi name="checkbox" />
