# Descriptions

Descriptions present read-only fields as label / value pairs, typically in the basic info block of a detail page. They use `dl` / `dt` / `dd` semantics and combine `CaomeiDescriptions` with `CaomeiDescriptionsItem`.

## Basic usage

`columns` sets the desktop column count (1–6, default 3) and `labelWidth` the label column width; each item supplies its label through `label` and its value through the default slot.

> An item's `label` is a **visible label** (rendered as `dt`), which differs from this library's convention that `label` is an invisible accessible name; it is registered as an exception in [development standards §6](/standards/development#_6-组件-api-设计约定), and any further use of this shape must be reviewed and registered one by one.

<demo
    vue="../examples/descriptions/basic.vue"
    ssg="true"
/>

## Columns and spanning

- `columns` only affects the desktop tier; at ≤1024px there are at most 2 columns and at ≤640px a single column.
- An item's `span` spans columns; values beyond the current column count span the whole row (no implicit columns or horizontal overflow).
- `columns` outside 1–6 is clamped.

<demo
    vue="../examples/descriptions/layout.vue"
    ssg="true"
/>

## Bordered and layout

- `bordered` renders each item as a bordered cell with a muted label area, matching a detail-page table look.
- `layout="vertical"` puts the label above the value; `horizontal` (default) keeps them on one line.
- `size` accepts `sm` / `md` (default) / `lg`, controlling label / value sizes and item spacing.

## Responsive behavior and long content

- Responsiveness uses the **viewport** width only: 320 / 768 / 1280 fall into one / two / `columns` columns.
- Labels and values use `overflow-wrap: anywhere`, so a long unbroken string wraps inside the item and never breaks the container.
- Items spanning more columns than available are treated as full-row items at ≤1024px.

## Boundary with DataTable

- `Descriptions` shows **read-only key-value pairs** (detail pages, basic info in a drawer) and has no sorting, filtering, pagination or row selection.
- `DataTable` handles **multi-row structured data**; use it when sorting, filtering, pagination, selection or expansion is needed, even with a single row.
- Editable fields belong to `Form` / `FormItem`; this component carries no inputs.

## Accessibility

- The root is `dl`; each item's label is `dt` and its value `dd`, so screen readers read them as term / description pairs.
- The bordered look does not change semantics; `span` only affects visual layout, not DOM order.
- The value area may contain links or buttons; the component does not take over their focus.

## Style customization

| Variable | Default | Description |
| --- | --- | --- |
| `--caomei-descriptions-gap` | `--caomei-space-3` | Item gap in the borderless look |
| `--caomei-descriptions-label-width` | `auto` (set by `labelWidth`) | Label column width |
| `--caomei-descriptions-cell-padding` | `--caomei-space-2 --caomei-space-3` | Bordered cell padding |
| `--caomei-descriptions-label-size` | Set by the size step | Label font size |
| `--caomei-descriptions-value-size` | Set by the size step | Value font size |

<ComponentApi name="descriptions" />
