# ToggleButton

A toggle button toggles the pressed / unpressed state on a single button (such as bold or italic in a toolbar); it wraps Reka UI Toggle.

## Basic usage

`v-model` two-way binds the pressed state (`boolean`); when there is no visible text, provide an accessible name via `label`.

<demo
    vue="../examples/toggle-button/basic.vue"
    ssg="true"
/>

## Icon usage

For icon-only buttons, use `label` to provide the accessible name.

<demo
    vue="../examples/toggle-button/icon.vue"
    ssg="true"
/>

## Sizes

Switch the size with `size`; supports `sm` / `md` / `lg`.

<demo
    vue="../examples/toggle-button/sizes.vue"
    ssg="true"
/>

## States

The pressed state is determined by `v-model`; `disabled` disables interaction.

<demo
    vue="../examples/toggle-button/states.vue"
    ssg="true"
/>

## Accessibility

- The control renders as a native `<button>` (implicit button role); `aria-pressed` outputs `true` / `false`.
- Supports keyboard focus and toggling with Space / Enter.
- The visible text is its accessible name; for icon-only buttons, use `label` to provide the accessible name (mapped to `aria-label`).
- When both visible text and `label` are provided, `label` should contain or equal the visible text to avoid a mismatch between the accessible name and the visible label (WCAG 2.5.3).
- Keyboard focus shows a `:focus-visible` ring and respects `prefers-reduced-motion`.

## Form integration

This component does not provide native form submission (the hidden input Reka UI Toggle generates inside a form has incomplete semantics); for a switch that participates in form submission, use Switch or Checkbox.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-toggle-button-gap` | `--caomei-space-1` | Gap between the icon and the text |
| `--caomei-toggle-button-radius` | `--caomei-radius-md` | Border radius |
| `--caomei-toggle-button-height` | from the `size` step | Height (sm 28 / md 36 / lg 44) |
| `--caomei-toggle-button-padding-x` | from the `size` step | Horizontal padding (sm 8 / md 12 / lg 16) |
| `--caomei-toggle-button-padding-y` | `0` | Vertical padding |
| `--caomei-toggle-button-font-size` | from the `size` step | Font size (sm 12 / md 14 / lg 16) |
| `--caomei-toggle-button-active-bg` | `--caomei-color-primary` | Pressed background and border color |
| `--caomei-toggle-button-active-color` | `--caomei-color-primary-foreground` | Pressed text color |

> Step-derived variables (`height` / `padding-x` / `font-size`) are declared by the component on its own element and must be overridden on the `.caomei-toggle-button` element itself; setting them on an ancestor such as `:root` will not take effect.

```css
.caomei-toggle-button {
    --caomei-toggle-button-active-bg: #16a34a;
    --caomei-toggle-button-radius: 999px;
}
```

<ComponentApi name="toggle-button" />
