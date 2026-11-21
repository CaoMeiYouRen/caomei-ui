# Transfer

Transfer moves items between a source list and a target list and is commonly used for permission assignment or member selection. `v-model` stores only the **target (selected)** values.

## Basic usage

`dataSource` supplies all options and `v-model` the selected values; select items and use the middle buttons to move them. Panel titles, search, empty text and button labels default to the built-in locale.

<demo
    vue="../examples/transfer/basic.vue"
    ssg="true"
/>

## Search and disabled

- `searchable` (default `true`) renders a search input on both sides and matches `label` case-insensitively.
- `disabled` disables all interactions; an option's own `disabled` only blocks that item.
- Selections are cleared after a move so the next move does not resubmit them.

## Data and control

- `v-model` is the target value set; `dataSource` is never mutated, the lists are filtered by the value set.
- Values follow `Select`: only `string | number`; `label` doubles as the search text.
- Selected values missing from `dataSource` are not rendered but stay in the model (useful while options load asynchronously).

## Accessibility

- The root is `role="group"` and can be named with `label`; both lists are named `ul` elements.
- Each item is a native checkbox + text and is keyboard operable; move buttons are regular `button`s with `aria-label`.
- Search inputs use the native `search` type and carry accessible names.

## Boundary with DataTable selection

- `Transfer` is for **moving a set between two lists** (source → target).
- `DataTable` selection is for **selecting rows in the current data set**; use DataTable when row actions, pagination and bulk actions are involved.

<ComponentApi name="transfer" />
