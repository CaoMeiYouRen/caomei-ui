# Toolbar

A toolbar organizes a set of action controls into a single keyboard navigation region; it wraps Reka UI Toolbar and is used by combining `CaomeiToolbar` with `CaomeiToolbarButton` / `CaomeiToolbarLink` / `CaomeiToolbarSeparator` / `CaomeiToolbarToggleGroup` / `CaomeiToolbarToggleItem`.

## Basic usage

The toolbar uses roving focus internally: `CaomeiToolbarButton` / `CaomeiToolbarLink` / `CaomeiToolbarToggleItem` share a single Tab stop, and once inside you move between controls with the arrow keys. `label` provides the accessible name when there is no visible title.

<demo
    vue="../examples/toolbar/basic.vue"
    ssg="true"
/>

## Toggle groups

Put toggle items inside `CaomeiToolbarToggleGroup` to build pressed-state actions such as bold / italic; the items also join the toolbar's roving focus. `type="multiple"` is multi-select (each item toggles independently), and `type="single"` is single-select.

<demo
    vue="../examples/toolbar/toggle.vue"
    ssg="true"
/>

> A `CaomeiToggleButton` inside a toolbar does not participate in the toolbar's roving focus and forms an extra Tab stop; use `CaomeiToolbarToggleItem` when it should join keyboard roaming.

## Orientation

`orientation="vertical"` switches to a vertical toolbar, and the arrow keys move up / down accordingly.

<demo
    vue="../examples/toolbar/vertical.vue"
    ssg="true"
/>

## Accessibility

- The container renders as `role="toolbar"`, outputting `aria-orientation`; `label` maps to `aria-label`.
- Roving focus: `CaomeiToolbarButton` / `CaomeiToolbarLink` / `CaomeiToolbarToggleItem` share a single Tab stop, and the arrow keys move between focusable controls (wraps by default; `loop=false` disables wrapping).
- Separators render as `role="separator"`; their `data-orientation` equals the toolbar orientation (a separator on a horizontal toolbar is visually a vertical line).
- `CaomeiToolbarButton` renders as a native `<button>` and `CaomeiToolbarLink` as an anchor; disabled buttons are removed from the focus order.
- Keyboard focus shows a `:focus-visible` ring and respects `prefers-reduced-motion`.

## Composite component API

| Component | Key props | Description |
|------|----------|------|
| `CaomeiToolbarButton` | `disabled`, `label` | Action button, renders as a native `<button>`; the default slot is the content |
| `CaomeiToolbarLink` | `label` (`href` and so on are forwarded as attributes) | Link, renders as an anchor; the default slot is the content |
| `CaomeiToolbarSeparator` | — | Separator between functional groups; orientation is automatic |
| `CaomeiToolbarToggleGroup` | `type` (`single` / `multiple`), `disabled`, `name`, `required`, `label` | Toggle group container; `v-model` binds the selected value; orientation follows the toolbar |
| `CaomeiToolbarToggleItem` | `value` (required), `disabled`, `label` | Toggle item; `value` must correspond to the group model |

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-toolbar-gap` | `--caomei-space-1` | Gap between controls |
| `--caomei-toolbar-padding` | `--caomei-space-1` | Toolbar padding |
| `--caomei-toolbar-border` | `--caomei-color-border` | Border color |
| `--caomei-toolbar-radius` | `--caomei-radius-md` | Border radius |
| `--caomei-toolbar-bg` | `--caomei-color-bg` | Background color |
| `--caomei-toolbar-button-gap` | `--caomei-space-1` | Gap between the icon and the text inside a button |
| `--caomei-toolbar-button-size` | `--caomei-control-height-md` | Button height and minimum width |
| `--caomei-toolbar-button-padding-x` | `--caomei-space-2` | Button horizontal padding |
| `--caomei-toolbar-button-radius` | `--caomei-radius-sm` | Button border radius |
| `--caomei-toolbar-button-active-bg` | `--caomei-color-primary` | Pressed background color of a toggle item |
| `--caomei-toolbar-button-active-color` | `--caomei-color-primary-foreground` | Pressed text color of a toggle item |
| `--caomei-toolbar-separator` | `--caomei-color-border` | Separator color |
| `--caomei-toolbar-separator-margin` | `--caomei-space-1` | Separator margin |

```css
.caomei-toolbar {
    --caomei-toolbar-radius: 999px;
    --caomei-toolbar-button-size: 32px;
}
```

<ComponentApi name="toolbar" />
