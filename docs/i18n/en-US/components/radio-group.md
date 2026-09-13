# RadioGroup

A radio group selects one option from a set of mutually exclusive options; it wraps Reka UI RadioGroup and is used by combining `CaomeiRadioGroup` with `CaomeiRadioButton`.

## Basic usage

`CaomeiRadioGroup` two-way binds the selected value (`string | number`) with `v-model`; `CaomeiRadioButton`'s `value` is the item's value, and `text` provides the visible label.

<demo
    vue="../examples/radio-group/basic.vue"
    ssg="true"
/>

## States

- `disabled` disables a single item (on `CaomeiRadioButton`) or the whole group (on `CaomeiRadioGroup`).
- `invalid` marks the whole group as a validation failure, maps to `aria-invalid`, and changes unselected items' border to the danger color.

<demo
    vue="../examples/radio-group/states.vue"
    ssg="true"
/>

## Orientation

Vertical by default; `orientation="horizontal"` switches to horizontal.

<demo
    vue="../examples/radio-group/horizontal.vue"
    ssg="true"
/>

## Sizes

Switch the size with `size`; supports `sm` / `md` / `lg`.

<demo
    vue="../examples/radio-group/sizes.vue"
    ssg="true"
/>

## Form integration

With `name`, the group is submitted with a native form when inside `<form>`; Reka UI outputs a hidden input carrying the selected value, and `required` participates in native validation.

```vue
<form>
  <CaomeiRadioGroup v-model="plan" name="plan" required label="Subscription plan">
    <CaomeiRadioButton value="free" text="Free" />
    <CaomeiRadioButton value="pro" text="Pro" />
  </CaomeiRadioGroup>
  <button type="submit">Submit</button>
</form>
```

## Accessibility

- The group container renders as `role="radiogroup"`, outputting `aria-orientation` and `aria-required`.
- Each item renders as a button with `role="radio"`; `aria-checked` outputs `true` / `false`.
- Keyboard support: arrow keys move within the group and select (↑ / ↓ for vertical groups, ← / → for horizontal groups; wraps by default), and Space selects the focused item.
- Provide the group's accessible name via `label` (mapped to `aria-label`); you can also associate a visible group heading with an external `<fieldset>` + `<legend>` or `aria-labelledby`.
- An item's visible text is its accessible name; use `label` for icon-only items with no visible text.
- Keyboard focus shows a `:focus-visible` ring and respects `prefers-reduced-motion`.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-radio-group-gap` | `--caomei-space-2` | Gap between items in the group |
| `--caomei-radio-font-size` | from the `size` step | Label font size (sm 12 / md 14 / lg 16) |
| `--caomei-radio-size` | from the `size` step | Indicator diameter (sm 16 / md 18 / lg 20) |
| `--caomei-radio-gap` | `--caomei-space-2` | Gap between the indicator and the label |
| `--caomei-radio-bg` | `--caomei-color-bg` | Unselected indicator background color |
| `--caomei-radio-border` | `--caomei-color-border` | Unselected indicator border color (`--caomei-color-danger` when `invalid`) |
| `--caomei-radio-active-bg` | `--caomei-color-primary` | Selected indicator background and border color |
| `--caomei-radio-dot` | `--caomei-color-primary-foreground` | Selected dot color |
| `--caomei-radio-focus` | `--caomei-color-primary` | Focus ring color (`--caomei-color-danger` when `invalid`) |

```css
.caomei-radio-group {
    --caomei-radio-active-bg: #16a34a;
    --caomei-radio-dot: #fff;
}
```

## CaomeiRadioButton props

`CaomeiRadioButton` is a child of the group and must be placed inside `CaomeiRadioGroup`; its props are:

| Prop | Type | Default | Description |
|------|------|------|------|
| `value` | `string \| number` | — | Item value, must be unique within a group (required) |
| `disabled` | `boolean` | `false` | Whether to disable the option |
| `text` | `string` | `''` | Visible label text (also customizable via the default slot) |
| `label` | `string` | `''` | Accessible name when there is no visible text, maps to `aria-label` |
| `id` | `string` | auto-generated | Id of the associated external label |

<ComponentApi name="radio-group" />
