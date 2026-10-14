# Col

A grid column is a child of the [Row](./row) and positions itself on the 24-column grid: `span` declares how many columns it covers, `offset` reserves columns on the inline start and `order` controls visual order. The `sm` / `md` / `lg` breakpoints can override these values on narrower viewports.

A column carries no interaction semantics — it only holds content, and its placement is fully decided by the parent `CaomeiRow`'s 24-column grid.

## Basic usage

`span` declares how many columns to cover, valid range 1–24 (a value of 0 or below produces an invalid `grid-column`, such as `span 0` / `span -1`; that declaration is dropped and falls back to `auto`, so keep it within 1–24).

<demo
    vue="../examples/row/basic.vue"
    ssg="true"
/>

## Offset and order

`offset` reserves the given number of empty columns on the inline start; `order` maps to CSS `order` and reorders the visual position of columns within a row (DOM order and focus order are unchanged).

<demo
    vue="../examples/col/offset-order.vue"
    ssg="true"
/>

## Responsive breakpoints

`sm` / `md` / `lg` correspond to the viewport max-widths 640px / 768px / 1024px. Each accepts a number (equivalent to setting only `span`) or a `{ span, offset, order }` object. Breakpoints follow the same semantics as the responsive design and narrower breakpoints win over wider ones (`lg` → `md` → `sm`, narrowest applied last).

An object only needs to declare the fields to override; **undeclared fields are not cascaded from wider breakpoints** but fall back to the **base (widest viewport) value**. For example with `:span="24" :lg="{ span: 12 }" :md="{ offset: 4 }"`, at the ≤768px tier `span` returns to the base value 24 (not the `lg` value 12) while `offset` is 4.

<demo
    vue="../examples/col/responsive.vue"
    ssg="true"
/>

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-col-span` | `24` | Default column span |
| `--caomei-col-offset` | `0` | Default inline-start offset |
| `--caomei-col-order` | `0` | Default visual order |
| `--caomei-col-sm-span` / `-offset` / `-order` | — | Overrides at viewport ≤ 640px |
| `--caomei-col-md-span` / `-offset` / `-order` | — | Overrides at viewport ≤ 768px |
| `--caomei-col-lg-span` / `-offset` / `-order` | — | Overrides at viewport ≤ 1024px |

<ComponentApi name="col" />
