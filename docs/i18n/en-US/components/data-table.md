# DataTable

A table displays structured data; it is custom-rendered on top of the headless `@tanstack/vue-table`, with minimal table styles and an empty state by default.

## Basic usage

Pass row data via `data` and column definitions via `columns`; `key` also serves as the default value field, and `rowKey` is used for a stable row identity.

<demo
    vue="../examples/data-table/basic.vue"
    ssg="true"
/>

## Column definition

Common `DataTableColumn` fields:

| Field | Type | Description |
|------|------|------|
| `key` | `string` | Unique column id, also the default value field |
| `header` | `string` | Header text; falls back to `key` |
| `accessor` | `string \| (row) => unknown` | Value field name (dot-path nesting supported) or function |
| `cell` | `(context) => VNodeChild` | Custom cell content; `context` contains `row` / `value` / `index`; overridden by a same-named column slot when present |
| `width` | `string` | Column width, e.g. `120px` / `20%` |
| `align` | `'left' \| 'center' \| 'right'` | Horizontal alignment, defaults to `left` |
| `sortable` | `boolean` | Whether the column is sortable (header renders a sort button) |
| `sortFn` | `'alphanumeric' \| 'text' \| 'basic'` | Sort function, defaults to `alphanumeric` |
| `headerClass` / `bodyClass` | `string` | Custom class for header / body cells |
| `headerStyle` / `bodyStyle` | `CSSProperties` | Custom style for header / body cells |
| `frozen` | `'left' \| 'right'` | Frozen column (sticks to the edge when scrolling horizontally) |

<demo
    vue="../examples/data-table/custom-cell.vue"
    ssg="true"
/>

## Column slots

Besides the `cell` function in a column definition, you can customize cells and headers with **scoped slots named after the column key**; slots take precedence over `cell`, and columns without a slot keep their previous behavior.

| Slot | Scope | Description |
|------|-------|-------------|
| `#cell-{key}` | `{ row, value, index, column }` | Cell content of that column |
| `#header-{key}` | `{ column }` | Header content of that column; for sortable columns it renders inside the sort button, keeping sort interaction |

<demo
    vue="../examples/data-table/column-slots.vue"
    ssg="true"
/>

> `{key}` is the column's `key` (e.g. `key: 'status'` maps to `#cell-status`); `column` is the full column definition, useful for rendering per column config. Slot names are matched as plain strings and are **not key-checked** — a mistyped `key` does not error, it silently falls back to the default value.
>
> `index` in the scope is the **source-data row index** (same as the `cell` function context) and does not follow the displayed order after sorting; if you need a display row number, compute it from the current render order instead of using `index` directly.
>
> For sortable columns the `#header-{key}` slot renders inside the sort `<button>`, so **avoid placing buttons or links** in it (nested interactive controls break keyboard semantics).

## Sorting

Click the header of a `sortable` column to sort (ascending first). Pass `sortField` + `sortOrder` for **controlled sorting** and listen to the `sort` event; write the new value back from that event. Adding or removing `sortField` at runtime switches between controlled and component-managed modes; when uncontrolled the `sort` event is still emitted for observation.

<demo
    vue="../examples/data-table/sorting.vue"
    ssg="true"
/>

## Row grouping

With `rowGroupMode="subheader"` and `groupRowsBy`, rows sharing the same group key are **collapsed into contiguous runs** and a group header row is rendered before each run. `groupRowsBy` supports `a.b` dot-path nesting and resolves values the same way as a column's `accessor` **dot-path form** (a function `accessor` does not take part in grouping).

- Grouping is computed on the **current rendered row order** (the slice after sorting and pagination): equal values split across pages each get their own group header row.
- When a column with the same `key` exists, its data cells become **blank placeholder cells** (the group value is not repeated) while the header cell is kept; the placeholder keeps the column width so the remaining data columns stay aligned with the header.
- When `rowGroupMode` and `groupRowsBy` are not both provided, no grouping happens and rendering is identical to the previous behavior.

The `#groupheader` slot customizes the group header content; without it the group key value is rendered as a fallback (using default JS stringification).

| Slot | Scope | Description |
|------|-------|-------------|
| `#groupheader` | `{ data, index, groupValue }` | `data` is the group's first row, `index` is that row's index in the current rendered row order (0-based, unlike the source index of `#cell-{key}`), and `groupValue` is the group key value |

<demo
    vue="../examples/data-table/grouping.vue"
    ssg="true"
/>

> The group header row spans all data columns, so it **does not take part in frozen-column pinning**; evaluate this limitation when combining frozen columns with row grouping.
>
> With `striped` enabled as well, striping is computed on the `<tbody>` child order (`nth-child`), so a group header row consumes an index and shifts the data rows' stripe phase relative to the ungrouped case.
>
> **Intentional difference from PrimeVue**: in subheader mode PrimeVue does not render the group field's data cells at all, which shifts the whole data row one column left and misaligns it with the header ([primefaces/primevue#6496](https://github.com/primefaces/primevue/issues/6496)); this library renders a blank placeholder cell instead to keep the columns aligned, while the group value is still shown in the group header row.

## Row selection

When `selectionMode` is `multiple` or `single`, a selection column is rendered first; bind it with `v-model:selection` (an array for `multiple`, a single row or `null` for `single`). `multiple` mode adds a select-all checkbox in the header. Adding or removing `selection` at runtime switches between controlled and component-managed modes; `selectionMode` must be set at mount. The `update:selection` event is emitted even when uncontrolled.

<demo
    vue="../examples/data-table/selection.vue"
    ssg="true"
/>

## Pagination

`paginator` shows the paginator and `rows` sets rows per page; bind the current page with `v-model:page` (controlled). Providing `rowsPerPageOptions` renders a rows-per-page selector in the paginator; switching it emits `update:rows` (use with `v-model:rows`) and derives the page again by preserving the current first-row offset (in controlled pagination it also emits `update:page`, leaving slicing to the parent). Without `paginator` no slicing happens and all rows are rendered. With `lazy`, pagination is server-side: the provided `data` is not sliced further (it should already be the current page) and the page count comes from `totalRecords` (defaulting to `data.length`, which yields a single page — pass it for server-side pagination). Page changes emit `page` (`{ page, rows, first, pageCount }`). `lazy` must be set at mount.

<demo
    vue="../examples/data-table/pagination.vue"
    ssg="true"
/>

## Frozen columns

`frozen` accepts `'left'` / `'right'` to stick a column to the edge while scrolling horizontally. Offsets accumulate from the declared px `width` of frozen columns (non-px or missing widths fall back to 150px), so set an explicit px `width`; one frozen column per side is recommended. When frozen columns exist the table gets a `min-width` equal to the sum of px widths so it can scroll; multiple columns on the same side accumulate from the far end.

> Frozen columns need an opaque background: the row background default changed from `transparent` to `--caomei-color-bg`, and hover / selected states mix on top of it; override `--caomei-data-table-row-bg` if you need transparency, and make sure pinned cells stay opaque.

<demo
    vue="../examples/data-table/frozen.vue"
    ssg="true"
/>

## Loading state

When `loading` is true a loading row is rendered and `aria-busy` is set; the text defaults to the current locale's "Loading" and can be overridden with `loadingText`.

## Empty state

When `data` is empty an empty state is rendered, with default text from the current locale; customize it with the `empty` slot or override the text with `emptyText`.

<demo
    vue="../examples/data-table/empty.vue"
    ssg="true"
/>

## Row styles

- `hoverable` controls row hover highlight (enabled by default).
- `striped` enables striped rows.
- `caption` renders a table caption for accessibility.

<demo
    vue="../examples/data-table/striped.vue"
    ssg="true"
/>

## Scope and conventions

- `data` is shallowly reactive: replace the array reference when updating (`data.value = [...]`); in-place `push` / `splice` will not trigger a re-render.
- `key` and `accessor` use string field names and do not perform field-level type checking; use an `accessor` function when you need type-safe access.
- Currently column definitions and column slots, sorting, row grouping, row selection, pagination, frozen columns and loading state are all supported.

## Accessibility

- Uses semantic `<table>` / `<thead>` / `<tbody>`, with `scope="col"` on header cells.
- Provide a table caption via `caption`, or a visible explanation at the usage site.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-data-table-border` | `--caomei-color-border` | Cell divider color |
| `--caomei-data-table-head-bg` | `--caomei-color-bg-elevated` | Header background color |
| `--caomei-data-table-row-bg` | `--caomei-color-bg` | Row background color |
| `--caomei-data-table-striped-bg` | `--caomei-color-bg-elevated` | Striped row background color |
| `--caomei-data-table-row-hover-bg` | 4% text color mix | Row hover background color |
| `--caomei-data-table-selected-bg` | 8% primary color mix | Selected row background color |
| `--caomei-data-table-group-bg` | `--caomei-color-bg-elevated` | Group header row background color |

## Migration from PrimeVue

| PrimeVue | This component |
|----------|----------------|
| `<Column field="x" :header="…">` | An entry in the `columns` array: `{ key: 'x', header: … }` (`key` also serves as the default value field) |
| `<template #body="{ data }">` / `#body="slotProps"` | `<template #cell-{key}="{ row, value, index }">` (`data` maps to `row`; `slotProps.data` likewise) |
| Column-level `<template #header>` | `<template #header-{key}="{ column }">` |
| Table-level `<template #header>` / `#footer` | No table-level header / footer slot; use `caption` for the title and place the action area outside the table container |
| `frozen` + `align-frozen="left" \| "right"` | `frozen: 'left' \| 'right'` (one field expresses both frozen state and docking side) |
| `<Column selection-mode="multiple" />` | Table-level `selectionMode="multiple"`; the selection column is always rendered first and **its width and styles are not configurable** (built-in `1%` width plus padding) |
| `rows-per-page-options` | The same-named `rowsPerPageOptions`; switching emits `update:rows` and derives the page by preserving the first-row offset |
| `@page="({ page, rows, first }) => …"` | `@page="({ page, rows, first, pageCount }) => …"` (same field shape, plus `pageCount`) |
| `rowGroupMode="subheader"` + `groupRowsBy` | The same-named `rowGroupMode` + `groupRowsBy`; splits on contiguous equal values and renders the group column as a blank placeholder in data rows (the value is not repeated) |
| `#groupheader="slotProps"` | `#groupheader="{ data, index, groupValue }"` (`data` / `index` match PrimeVue, plus `groupValue`); without the slot the group key value is rendered as a fallback |
| `#groupfooter` | **Not supported** (group footers are out of scope for this round, see [Design spec §7](/design/design-spec)) |

> For the workflow, common pitfalls and the per-component index see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="data-table" />
