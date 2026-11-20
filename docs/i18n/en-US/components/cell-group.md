# CellGroup

A cell group collects several [Cell](./cell) rows into a bordered container with dividers and an optional group title.

## Basic usage

Put `CaomeiCell` rows into the default slot; a divider is drawn between adjacent rows and no extra border is added at either end.

<demo
    vue="../examples/cell-group/basic.vue"
    ssg="true"
/>

## Group title

`title` renders a visible title, or use the `#title` slot for custom content. With a title the root exposes `role="group"` + `aria-labelledby`; without one, no `aria-labelledby` is emitted.

## Dividers

The container draws the dividers itself (`.caomei-cell-group__list > .caomei-cell + .caomei-cell`), so individual cells declare no borders; override `--caomei-cell-group-divider` to change or remove them.

## Accessibility

- With a title the group exposes grouped-region semantics, so screen readers announce the group name.
- The group itself is not focusable and does not intercept clicks; all interaction stays on the cells' host elements.

## Style customization

| Variable | Default | Description |
| --- | --- | --- |
| `--caomei-cell-group-bg` | `--caomei-color-bg` | Group background |
| `--caomei-cell-group-border` | `--caomei-color-border` | Outer border colour |
| `--caomei-cell-group-divider` | `--caomei-color-border` | Divider colour |
| `--caomei-cell-group-radius` | `--caomei-radius-md` (narrow: `--caomei-radius-sm`) | Corner radius |

## API

Public props and slots of `CaomeiCellGroup`:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Group title; the root always exposes `role="group"`, adding `aria-labelledby` only when a title is present |

| Slot | Description |
| --- | --- |
| `default` | The cell list, usually `CaomeiCell` rows |
| `title` | Custom group title content, overriding the `title` prop |

For `CaomeiCell` props and slots see [Cell](/en-US/components/cell).
