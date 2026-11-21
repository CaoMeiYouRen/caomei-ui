# Cascader

Cascader selects one path from a multi-level option tree, commonly for region or organization hierarchies. `v-model` stores the full value path from root to leaf.

## Basic usage

`options` is an option tree with `children`; clicking a node with children opens the next column, while clicking a leaf commits the full path and closes the panel.

<demo
    vue="../examples/cascader/basic.vue"
    ssg="true"
/>

## Behavior

- `changeOnSelect` (default `false`) commits the current path when a parent with children is clicked.
- `clearable` (default `true`) shows a clear button when a value exists; clearing sets the model to an empty array.
- `separator` (default ` / `) joins the path labels on the trigger.
- `disabled` disables the trigger and clear button; an option's own `disabled` only blocks that node.

## Control and data

- `v-model` is a value path array; an empty array or `null` means no selection.
- `options` is never mutated; the display text resolves from the value path, and a missing level is treated as no selection.
- Values follow `Select`: only `string | number`.

## Accessibility

- The trigger is a native `button` with `aria-expanded`; name it with `label`.
- Each panel column is `role="listbox"` and each node `role="option"` with `aria-selected` / `aria-disabled`; Enter / Space selects.
- The clear button is a separate button with an accessible name, never nested in the trigger.

## Boundary with Select

- Use Cascader only for **two or more levels**; use `Select` for a single level.
- Search filtering, remote loading and virtual scrolling are not built in; evaluate them separately when needed.

<ComponentApi name="cascader" />
