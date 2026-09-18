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

## Three-zone layout

The `#start` / `#center` / `#end` slots split the toolbar into left / center / right zones, matching PrimeVue Toolbar's same-named slots one to one: the outer zones size to their content and sit at the two ends of the main axis, while the center zone sits in the middle of the leftover space between them (implemented here by giving the center zone `flex: 1`).

<demo
    vue="../examples/toolbar/zones.vue"
    ssg="true"
/>

> Supplying any zone slot switches to the three-zone rendering, and the **default slot is then not rendered**; when all three zone slots are omitted the default slot keeps the original single-zone rendering (identical DOM and styles). Zone wrappers do not change keyboard behavior — members still share the toolbar's single Tab stop.
>
> Position semantics: `start` / `end` follow the **main axis and reading direction** — left / right in horizontal LTR, swapped in horizontal RTL, and top / bottom with `orientation="vertical"`; the center zone sits in the middle of the leftover space between them (it keeps its `flex: 1` placeholder even when empty, so `end` is always flush with the main-axis end). The toolbar itself is **content-sized** (`inline-flex`, unlike PrimeVue's block-level toolbar); set `width: 100%` on the toolbar when the three zones should span the container.

## Accessibility

- The container renders as `role="toolbar"`, outputting `aria-orientation`; `label` maps to `aria-label`.
- Roving focus: `CaomeiToolbarButton` / `CaomeiToolbarLink` / `CaomeiToolbarToggleItem` share a single Tab stop, and the arrow keys move between focusable controls (wraps by default; `loop=false` disables wrapping).
- Separators render as `role="separator"`; their `data-orientation` equals the toolbar orientation (a separator on a horizontal toolbar is visually a vertical line).
- `CaomeiToolbarButton` renders as a native `<button>` and `CaomeiToolbarLink` as an anchor; disabled buttons are removed from the focus order.
- Keyboard focus shows a `:focus-visible` ring and respects `prefers-reduced-motion`.

## Composite component API

| Component | Key props | Description |
|------|----------|------|
| `CaomeiToolbar` | `orientation` (`horizontal` / `vertical`), `dir`, `loop`, `label`, `id`; slots `#start` / `#center` / `#end` plus the default slot | Toolbar container, `role="toolbar"`; switches to the three-zone layout when a zone slot is used |
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

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `<Toolbar>` | `<CaomeiToolbar>` (also a `role="toolbar"` container) |
| `#start` / `#center` / `#end` | Same-named slots (outer zones size to content at the two ends of the main axis, the center zone sits in the middle of the leftover space; implemented here with `flex: 1` on the center zone) |
| `ariaLabelledby` | `label` (maps to `aria-label`); `aria-labelledby` can also be forwarded as an attribute |
| No other props | **New here**: `orientation` (`horizontal` / `vertical`), `dir`, `loop`, `id` |
| Block-level toolbar (spans the container) | Content-sized (`inline-flex`); set `width: 100%` to span |
| `pt` / `dt` / `ptOptions` / `unstyled` | Not implemented (no theme pass-through is exposed; style through CSS variables) |

**Known difference (intentional)**: this library's member components (`CaomeiToolbarButton` / `CaomeiToolbarLink` / `CaomeiToolbarToggleItem`) share one Tab stop and roam with the arrow keys (roving focus); PrimeVue Toolbar has no keyboard roaming and each member forms its own Tab stop. Adjust if you relied on tabbing through members one by one.

> Use the toolbar-specific members above (plain buttons do not join the roving focus). For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="toolbar" />
