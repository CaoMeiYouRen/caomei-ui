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

## Accessibility

- The root is a `<nav>` whose `aria-label` defaults to the current locale's pagination label (Chinese by default), overridable via `label`; when a page has several paginators, it is best to name them individually so landmark navigation can distinguish them.
- Page numbers and paging buttons are native `<button>`s; the current page outputs `aria-current="page"`, and the ellipsis is marked `aria-hidden`.
- Page numbers and paging buttons have built-in accessible names (Chinese by default), overridable via `pageLabel` / `firstLabel` / `previousLabel` / `nextLabel` / `lastLabel`; `{page}` in `pageLabel` is replaced by the page number.
- The first / last page buttons are disabled automatically on the first / last page, and the paging buttons are likewise disabled at the boundaries.
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

```css
.caomei-paginator {
    --caomei-paginator-active-bg: #16a34a;
    --caomei-paginator-control-size: 36px;
}
```

<ComponentApi name="paginator" />
