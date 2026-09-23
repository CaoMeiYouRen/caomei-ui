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
| `expander` | `boolean` | Marks the row-expander column: its cells render the expand / collapse toggle and its header is left blank (an `#expansion` slot is required) |

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

Click the header of a `sortable` column to sort (ascending first; set `sortDescFirst` to sort descending first). Pass `sortField` + `sortOrder` for **controlled sorting** and listen to the `sort` event; write the new value back from that event. Adding or removing `sortField` at runtime switches between controlled and component-managed modes; when uncontrolled the `sort` event is still emitted for observation.

Sort keys cycle through "asc → desc → removed": a third click on a sorted column removes the sorting (the `sort` payload then carries an empty `sortOrder`).

<demo
    vue="../examples/data-table/sorting.vue"
    ssg="true"
/>

### Multi-column sorting

Set `sortMode="multiple"` for multi-column sorting and bind the sort keys (in priority order) with `v-model:multiSortMeta` (`DataTableSortMeta[]`).

- **Hold Cmd / Ctrl while clicking a header** to append that column as the next sort key (a column already in the list has its direction flipped instead, leaving the other keys untouched); clicking **without** the modifier collapses the sorting to that column alone (matching PrimeVue).
- `order` is `1` (ascending) / `-1` (descending); entries with `order: 0` are ignored. The first direction of a new key comes from `sortDescFirst` (default `false`, ascending).
- Sorted headers show their priority number; with several columns sorted, each header carries its own `aria-sort`.
- Providing `multiSortMeta` enables the **controlled mode** (a click only emits `update:multiSortMeta`, so write it back yourself); removing it falls back to component-managed state. Both modes emit `update:multiSortMeta`.
- In multi-column mode the `sort` payload additionally carries `multiSortMeta` (the full sort keys), while `sortField` / `sortOrder` still reflect the first key.
- `sortMode` must be set at mount; `sortMode="multiple"` is mutually exclusive with the single-column path.

<demo
    vue="../examples/data-table/sorting-multiple.vue"
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
> With `striped` enabled as well, striping is computed on the `<tbody>` child order (`nth-child`), so both group header rows and **row expansion areas** consume an index and shift the data rows' stripe phase relative to the ungrouped case; expanding / collapsing groups or rows also changes the parity of the following rows, shifting the stripes again.
>
> **Intentional difference from PrimeVue**: in subheader mode PrimeVue does not render the group field's data cells at all, which shifts the whole data row one column left and misaligns it with the header ([primefaces/primevue#6496](https://github.com/primefaces/primevue/issues/6496)); this library renders a blank placeholder cell instead to keep the columns aligned, while the group value is still shown in the group header row.

### Expandable row groups

With `expandableRowGroups`, each group header row renders a built-in toggle button (a native `<button>` with a chevron, carrying `aria-expanded` and an accessible name, keyboard reachable) that collapses / expands that group's data rows.

- **By default (no `expandedRowGroups`) all groups start collapsed** (matching PrimeVue) — only the group header rows are rendered; pass an initial value with `v-model:expandedRowGroups` when groups should start open.
- Bind the expanded group-key set with `v-model:expandedRowGroups` (`string[]`); providing it enables the **controlled mode** (a click only emits `update:expandedRowGroups`, and the parent decides whether to accept), removing it falls back to component-managed state. The demo below omits it (component-managed), so all groups start collapsed; pass an initial value (e.g. `['Frontend']`) to open groups initially.
- Emits `rowgroupExpand` / `rowgroupCollapse` with the payload `{ originalEvent, data }`, where `data` is the group key.
- The group key is the group field value stringified (`null` / `undefined` normalize to an empty string); **non-contiguous groups with the same value share one group key**, so toggling affects them together, and different values that stringify identically (e.g. the number `1` and the string `'1'`) also share one key.
- Collapsing only affects rendering and does not change the paginator's total (the total comes from `data` / `totalRecords`).
- The toggle's accessible name defaults to the current locale's "Expand row group" / "Collapse row group" and can be overridden with `expandRowGroupLabel` / `collapseRowGroupLabel`.

<demo
    vue="../examples/data-table/grouping-expandable.vue"
    ssg="true"
/>

## Row expansion

Mark a column with `expander: true` and that column's body cells render an **expand / collapse toggle** (a native `<button>` with a chevron, carrying `aria-expanded`, `aria-controls` and an accessible name, keyboard reachable); the column's header is **always left blank** (even when `header` is provided, no header text / sort button / column slot is rendered; when several `expander` columns are declared only the first one takes effect). The expansion area comes from the `#expansion` slot and can hold arbitrary nested content (a sub-table, a detail list, ……).

- Bind the expanded row set with `v-model:expandedRows` (`string[]`, row keys with the same shape as `rowKey`); providing it enables the **controlled mode** (a click only emits `update:expandedRows`, and the parent decides whether to accept), removing it falls back to component-managed state (starting empty, i.e. all rows collapsed).
- Emits `rowExpand` / `rowCollapse` with the payload `{ originalEvent, data }`, where `data` is the row.
- The **`#expansion` slot is required** for visible expansion content; without it the expansion state and events still work (same as PrimeVue).
- The expansion row spans all data columns (including the selection and expander columns), so it **does not take part in frozen-column pinning**; give the expander column an explicit px `width`.
- **Providing `rowKey` is recommended**: without it keys come from the row index and expansion drifts once `data` is replaced wholesale (server pagination / lazy loading / a data refresh); sorting and client-side pagination only reorder row references and do not change the keys.

| Slot | Scope | Description |
|------|-------|-------------|
| `#expansion` | `{ data, index }` | `data` is the row, `index` is that row's index in the current rendered row order (0-based, same convention as `#groupheader`, unlike the source index of `#cell-{key}`) |

<demo
    vue="../examples/data-table/row-expansion.vue"
    ssg="true"
/>

> The toggle's accessible name defaults to the current locale's "Expand row" / "Collapse row" and can be overridden with `expandRowLabel` / `collapseRowLabel`.

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
- `multiSortMeta` / `selection` / `expandedRows` / `expandedRowGroups` are likewise shallowly reactive: replace the array reference when writing back from a controlled binding (in-place mutation will not trigger a re-render).
- `key` and `accessor` use string field names and do not perform field-level type checking; use an `accessor` function when you need type-safe access.
- Currently column definitions and column slots, sorting (including multi-column sorting), row grouping, row expansion, row selection, pagination, frozen columns and loading state are all supported.

## Accessibility

- Uses semantic `<table>` / `<thead>` / `<tbody>`, with `scope="col"` on header cells.
- The built-in toggle of expandable row groups is a native `<button>` carrying `aria-expanded` and an accessible name (locale-based by default, overridable with `expandRowGroupLabel` / `collapseRowGroupLabel`), and is keyboard reachable.
  - That button's `aria-label` **follows the state** ("Expand row group" while collapsed, "Collapse row group" while expanded) alongside `aria-expanded`; this is this library's trade-off (the name describes the action). If a constant name is preferred, override both labels with the same text at the usage site and let `aria-expanded` carry the state alone.
- The row-expander toggle is likewise a native `<button>` carrying `aria-expanded`, `aria-controls` (pointing at the expansion row) and an accessible name (locale-based by default, overridable with `expandRowLabel` / `collapseRowLabel`), and is keyboard reachable; the expander column's header is left blank.
- With multi-column sorting, every sorted header carries its own `aria-sort`; the priority number is visible text (it becomes part of the header button's accessible name, matching PrimeVue).
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
| `--caomei-data-table-expansion-bg` | `--caomei-color-bg-elevated` | Row expansion area background color |

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
| `expandableRowGroups` | The same-named prop; each group header row renders a built-in toggle button (native `button` + `aria-expanded` + accessible name) |
| `v-model:expandedRowGroups` | The same-named prop (a `string[]` of group keys); controlled takes precedence, component-managed by default, and all groups start collapsed without it |
| `@rowgroup-expand` / `@rowgroup-collapse` | `@rowgroup-expand` / `@rowgroup-collapse`; payload `{ originalEvent, data }` where `data` is the group key (PrimeVue passes the raw group field value) |
| `v-model:expandedRows` (+ `dataKey`) | `v-model:expandedRows` (a `string[]` of row keys) + `rowKey`; only the row-key array form is supported (PrimeVue also accepts an array of row objects and a `{ [key]: true }` record) |
| `<Column expander>` | An entry in the `columns` array: `{ key, expander: true }`; that column's header is left blank |
| `#expansion="slotProps"` | `#expansion="{ data, index }"` (`data` matches; `index` is the display index, unlike the source index of `#cell-{key}`) |
| `@row-expand` / `@row-collapse` | `@row-expand` / `@row-collapse`; payload `{ originalEvent, data }` where `data` is the row |
| `sortMode="multiple"` + `v-model:multiSortMeta` | The same-named props; `field` accepts only a column key (PrimeVue also allows a field function) and `order` is `1 \| 0 \| -1` |
| `:default-sort-order="-1"` | `sortDescFirst` (a **table-level** boolean; PrimeVue offers column-level and table-level numbers, this library only the table-level one) |
| `removableSort` | **No toggle provided**; sort keys always cycle through "asc → desc → removed" (same as the single-column path) |

> For the workflow, common pitfalls and the per-component index see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="data-table" />
