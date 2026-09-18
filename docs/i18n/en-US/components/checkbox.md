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

Pass an array to `v-model` and use `value` as the membership key to enter group semantics: clicking adds or removes that `value` from the array (matching PrimeVue). Checkboxes in one group only need to share the same array model — no manual membership bookkeeping required.

<demo
    vue="../examples/checkbox/group.vue"
    ssg="true"
/>

> `value` is required with an array model; without it a click does not change the model. Use [CheckboxGroup](./checkbox-group.md) when you need a group container (group accessibility semantics, whole-array form submission, select-all / indeterminate).

## Form integration

With `name`, the checkbox is submitted with a native form when inside `<form>`; `value` is the submitted value (defaults to `'on'`), and `required` participates in native validation.

```vue
<form>
  <CaomeiCheckbox v-model="agree" name="agree" value="yes" required text="I agree to the terms" />
  <button type="submit">Submit</button>
</form>
```

> With an array model each checkbox submits one value under its own `name` (sharing one `name` across the group submits multiple values); use [CheckboxGroup](./checkbox-group.md) for whole-array submission or select-all.

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

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `v-model` + `:value` (array model, non-binary) | Same shape: bind an array to `v-model`, use `value` as the member id; clicking adds or removes by `value` |
| `v-model` (`binary`, boolean) | Boolean `v-model`; use the model value `'indeterminate'` for the mixed state |
| `indeterminate` (separate boolean prop) | Not exposed as a prop: express the mixed state with the model value `'indeterminate'` |
| `inputId` | `id` |
| `aria-label` | `label` (visually hidden accessible name, takes precedence over a forwarded `aria-label`) |
| `size` (`small` / `large`) | `size` (`sm` / `lg`) |
| — | `text` (visible label text, or use the default slot) is new here |

**Not implemented / not exposed**: `true-value` / `false-value` (the model is already a boolean or an array), `variant` (`outlined` / `filled`), `readonly`, `tabindex`, `input-class` / `input-style`.

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="checkbox" />
