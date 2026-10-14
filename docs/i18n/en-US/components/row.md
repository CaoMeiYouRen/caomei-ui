# Row

A grid row built on CSS Grid provides the 24-column layout basis; combine it with [Col](./col) for responsive layouts. A row only handles the grid container, column gutter and cross-axis alignment — it carries no interaction semantics.

## Basic usage

Every row has a fixed 24 columns; a column declares how many it spans with `span` (defaults to 24, i.e. the full row).

<demo
    vue="../examples/row/basic.vue"
    ssg="true"
/>

## Column gutter

`gutter` sets the column gutter in px: a single number sets the horizontal (inline) gap only; `[horizontal, vertical]` also sets the vertical gap that applies once rows wrap.

The gutter is built on the CSS Grid `gap`: spacing appears only between adjacent items, with no gap on the row's outer edges and no negative-margin compensation when rows wrap.

**Constraint**: `gap` does not shrink, so the total horizontal gap `23 x gutter` must stay smaller than the container width — otherwise the grid overflows horizontally. Reduce `gutter` at narrow breakpoints (for example a smaller mobile value, or let columns span the full row with `:sm="24"`).

<demo
    vue="../examples/row/gutter.vue"
    ssg="true"
/>

## Cross-axis alignment

`align` maps to CSS `align-items` and controls how items align along the cross axis (block axis by default): `start` / `center` / `end` / `stretch` (default) / `baseline`.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-row-gutter-x` | `0` | Horizontal (inline) column gutter |
| `--caomei-row-gutter-y` | `0` | Vertical (block) row gutter |
| `--caomei-row-align` | `stretch` | Cross-axis alignment |

## Compared with other layout libraries

PrimeVue ships no grid component (its grid lives in PrimeFlex CSS classes); this library provides one as components:

| Element Plus / Vuetify | This library |
| --- | --- |
| `el-row` / `v-row` | `CaomeiRow` |
| `el-col` / `v-col` | `CaomeiCol` |
| `gutter` (horizontal only) | `gutter` (number = horizontal; `[horizontal, vertical]` = both axes) |
| `justify` (flex main-axis alignment) | **Not provided**: the 24 equal-width tracks always fill the container, so `justify-content` has no effect and is not exposed |

<ComponentApi name="row" />
