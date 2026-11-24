# TreeSelect

Pick values from hierarchical data through a field plus a tree panel. It composes `CaomeiPopover` with `CaomeiTree`: the field is a native `<button>`, the panel is portalled to `body`, and open-state sibling isolation and collision avoidance come from Popover.

## Basic usage

`items` has the same shape as `CaomeiTree` (key `id`, text `label`, children `children`; all three renameable through `itemKey` / `labelKey` / `childrenKey`). `v-model` is a **key array**: at most one item in single mode, accumulated in pick order in multiple mode.

<demo
    vue="../examples/tree-select/basic.vue"
    ssg="true"
/>

- **Opening and keyboard**: with the field focused press `Enter` / `Space` (or click) to open; focus moves to the first tree node. Arrow keys and `Home` / `End` inside the panel match the [Tree](./tree.md). `Esc` closes and returns focus to the field.
- **Single tab stop**: the field is one button; the panel holds a roving-tabindex tree, so Tab does not walk through every node.
- **Disabled and clear**: `disabled` disables the field and the panel; `clearable` shows a clear button when there is a value (never while disabled). Its accessible name comes from the locale's `select.clear` and can be overridden with `clearLabel`.
- **Empty state**: `placeholder` shows when nothing is selected; `emptyText` shows when `items` is empty.

## Multiple selection and narrow screens

`multiple` keeps the panel open while picking; selected labels are joined with commas in pick order and truncated to one line. Clicking a selected node deselects it. `panelMaxHeight` caps the panel height (default `16rem`) and the panel scrolls internally.

<demo
    vue="../examples/tree-select/multiple.vue"
    ssg="true"
/>

- **Narrow screens**: the field fills its container (`width: 100%`); collision avoidance shifts the panel into the viewport and caps its width to the available space, with `min-width: 12rem` as a floor. Field and panel bounds at 320 / 390 have permanent E2E assertions.
- **Tightening**: the field height uses `--caomei-control-height-md`; override it for denser layouts, or constrain the outer container so the label truncates with an ellipsis.

## Panel and layering

- The panel is portalled to `body` and takes Popover's `--caomei-popover-z-index` (`1050`): level with form overlays and above the modal overlay / content (`1000` / `1001`), below Tooltip (`1060`) and Toast (`1100`). Override that variable when you need a different level.
- While open, siblings outside the panel receive `inert` (plus `aria-hidden`); the field stays a preserved root so clicking it closes the panel.

## Accessibility

- The field is a native `<button>`; `aria-haspopup="dialog"` / `aria-expanded` come from the Popover trigger. The accessible name comes from `label` (maps to `aria-label`) and falls back to a forwarded `aria-label`.
- The panel is `role="dialog"` wrapping a `role="tree"`; node selection / expansion / disabled semantics are documented in [Tree](./tree.md).
- The clear button has its own accessible name, sits outside the field (no nested buttons) and keeps a hit area of at least `--caomei-hit-target-min`.

## Theming

| Variable | Default | Description |
| --- | --- | --- |
| `--caomei-tree-select-panel-min-width` | `12rem` | Panel minimum width |
| `--caomei-tree-select-panel-max-height` | written by `panelMaxHeight` (`16rem`) | Panel maximum height |
| `--caomei-popover-z-index` | `1050` | Panel layer (from Popover) |

> For class-based overrides and specificity in general see [Overriding styles downstream](../guide/overriding-styles.md).

<ComponentApi name="tree-select" />
