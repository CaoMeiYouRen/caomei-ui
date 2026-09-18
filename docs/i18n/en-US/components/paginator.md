# Paginator

The paginator switches between data pages; it wraps Reka UI Pagination.

## Basic usage

Two-way bind the current page with `v-model:page`, and `total` plus `itemsPerPage` determine the page count (10 items per page by default).

<demo
    vue="../examples/paginator/basic.vue"
    ssg="true"
/>

## Edges and ellipsis

`showEdges` shows the first / last page buttons, and `siblingCount` controls how many page numbers appear on each side of the current page; with many pages they collapse into an ellipsis automatically.

<demo
    vue="../examples/paginator/edges.vue"
    ssg="true"
/>

## States

When `total` is 0, only page 1 is shown and paging is disabled; `disabled` disables all controls.

<demo
    vue="../../../examples/paginator/states.vue"
    ssg="true"
/>

## Rows per page

When `rowsPerPageOptions` is provided, a rows-per-page selector is rendered at the end of the paginator; changing it emits `update:itemsPerPage` and **preserves the current first-row offset** `(page - 1) * itemsPerPage`, deriving the new page from it (matching PrimeVue's `first` semantics) — when the offset fits less than one page, the page becomes 1. The selector's accessible name defaults to the current locale's "Rows per page" text, overridable via `rowsPerPageLabel`.

<demo
    vue="../examples/paginator/rows-per-page.vue"
    ssg="true"
/>

> Without `rowsPerPageOptions` no selector is rendered and behavior matches the previous release; `itemsPerPage` stays a controlled prop, so bind `v-model:items-per-page` to receive the new value.

## Accessibility

- The root is a `<nav>` whose accessible name resolves as `label` > forwarded `aria-label` > the current locale's pagination label (Chinese by default); a forwarded `aria-label` applies when `label` is absent (or empty). When a page has several paginators, it is best to name them individually so landmark navigation can distinguish them.
- Page numbers and paging buttons are native `<button>`s; the current page outputs `aria-current="page"`, and the ellipsis is marked `aria-hidden`.
- Page numbers and paging buttons have built-in accessible names from the current locale, overridable via `pageLabel` / `firstLabel` / `previousLabel` / `nextLabel` / `lastLabel`; `{page}` in `pageLabel` is replaced by the page number.
- The first / last page buttons are disabled automatically on the first / last page, and the paging buttons are likewise disabled at the boundaries.
- The rows-per-page selector's accessible name defaults to "Rows per page" and is overridable via `rowsPerPageLabel`; its options are the numeric choices.
- Controls wrap automatically on narrow screens to avoid horizontal overflow.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-paginator-gap` | `4px` | Gap between controls |
| `--caomei-paginator-control-size` | `32px` | Control minimum width and height |
| `--caomei-paginator-radius` | `--caomei-radius-sm` | Control border radius |
| `--caomei-paginator-bg` | `--caomei-color-bg` | Control background color |
| `--caomei-paginator-border` | `--caomei-color-border` | Control border color |
| `--caomei-paginator-color` | `--caomei-color-text` | Control text color |
| `--caomei-paginator-active-bg` | `--caomei-color-primary` | Current-page background and border color |
| `--caomei-paginator-active-color` | `--caomei-color-primary-foreground` | Current-page text color |
| `--caomei-paginator-rows-width` | `6rem` | Rows-per-page selector width (only when `rowsPerPageOptions` is provided) |

```css
.caomei-paginator {
    --caomei-paginator-active-bg: #16a34a;
    --caomei-paginator-control-size: 36px;
}
```

## Migration from PrimeVue

| PrimeVue | caomei-ui |
| --- | --- |
| `v-model:first` (0-based offset) | `v-model:page` (1-based page number) |
| `:rows` | `:items-per-page` |
| `:total-records` | `:total` |
| `@page="({ page, rows, first }) => ..."` | Listen to `update:page` / `update:itemsPerPage`; compute an offset as `(page - 1) * itemsPerPage` when needed |
| `:rows-per-page-options` | `rowsPerPageOptions` (listen to `update:itemsPerPage` for changes) |
| `template` (including `CurrentPageReport`) | **Not implemented**: the paginator offers no template slots or "page x of y" report; render your own report beside the paginator from `page` / `itemsPerPage` / `total` (see the range text in the example above) |

> For the workflow, common pitfalls and the per-component index see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="paginator" />
