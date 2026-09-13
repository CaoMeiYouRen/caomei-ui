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
| `cell` | `(context) => VNodeChild` | Custom cell content; `context` contains `row` / `value` / `index` |
| `width` | `string` | Column width, e.g. `120px` / `20%` |
| `align` | `'left' \| 'center' \| 'right'` | Horizontal alignment, defaults to `left` |
| `sortable` | `boolean` | Whether the column is sortable (header renders a sort button) |
| `sortFn` | `'alphanumeric' \| 'text' \| 'basic'` | Sort function, defaults to `alphanumeric` |
| `headerClass` / `bodyClass` | `string` | Custom class for header / body cells |
| `headerStyle` / `bodyStyle` | `CSSProperties` | Custom style for header / body cells |

<demo
    vue="../examples/data-table/custom-cell.vue"
    ssg="true"
/>

## Sorting

Click the header of a `sortable` column to sort (ascending first). Pass `sortField` + `sortOrder` for **controlled sorting** and listen to the `sort` event; write the new value back from that event. Otherwise sorting state is kept internally. The controlled flag is determined at mount: adding or removing `sortField` later does not switch the mode.

<demo
    vue="../examples/data-table/sorting.vue"
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
- Currently column definitions, sorting and loading state are supported; row selection / pagination / frozen columns land in later stages.

## Accessibility

- Uses semantic `<table>` / `<thead>` / `<tbody>`, with `scope="col"` on header cells.
- Provide a table caption via `caption`, or a visible explanation at the usage site.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-data-table-border` | `--caomei-color-border` | Cell divider color |
| `--caomei-data-table-head-bg` | `--caomei-color-bg-elevated` | Header background color |
| `--caomei-data-table-row-bg` | `transparent` | Row background color |
| `--caomei-data-table-striped-bg` | `--caomei-color-bg-elevated` | Striped row background color |
| `--caomei-data-table-row-hover-bg` | 4% text color mix | Row hover background color |

<ComponentApi name="data-table" />
