# Breadcrumb

A breadcrumb shows where the current page sits in a hierarchy. Compose it with `CaomeiBreadcrumb` and `CaomeiBreadcrumbItem`; the container is a `nav` plus an ordered list, and the last level is marked as the current page with `current`.

## Basic usage

`CaomeiBreadcrumbItem` renders a link when `href` is given; the last/current item omits `href` (rendering plain text) and adds `current`.

<demo
    vue="../examples/breadcrumb/basic.vue"
    ssg="true"
/>

## Separator

`separator` controls the text between items (default `/`). It is rendered on a decorative element (`aria-hidden="true"`) and is excluded from the accessible name.

<demo
    vue="../examples/breadcrumb/separator.vue"
    ssg="true"
/>

## Truncation and tooltip

When an item's text does not fit inside the container it is truncated to a single line with an ellipsis, and hovering shows the full text; while it fits, everything stays silent. Tighten the cap to a fixed value with `--caomei-breadcrumb-label-max-width`.

Link items carry an invisible hit area (`--caomei-hit-target-min`, 24px by default) and the text box paints above it — hovering the middle of a long link still shows the tooltip, and the hit area keeps its click semantics. The tooltip is pointer-only: the text box is not focusable, so focusing the link never opens it.

## Accessibility

- The container is a `nav` (`label` maps to `aria-label`) plus an `ol`.
- The current page emits `aria-current="page"` via `current` (supported on both links and plain text).
- Separators are decorative (`aria-hidden`), so screen readers announce the hierarchy item by item.
- The component ships **no built-in text**: nothing is rendered when `label` is omitted.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-breadcrumb-font-size` | `--caomei-font-size-md` | Font size |
| `--caomei-breadcrumb-gap` | `--caomei-space-2` | Gap between items and separators |
| `--caomei-breadcrumb-separator-color` | `--caomei-color-border` | Separator colour |
| `--caomei-breadcrumb-link-hover-color` | `--caomei-color-primary` | Link hover colour |
| `--caomei-breadcrumb-current-color` | `--caomei-color-text` | Current page text colour |
| `--caomei-breadcrumb-label-max-width` | `100%` | Width cap for the item text (ellipsis plus tooltip beyond it) |

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `<Breadcrumb :model="[{ label, url }]">` | `<CaomeiBreadcrumb>` + one `<CaomeiBreadcrumbItem href>` per level (declarative, no `:model` array) |
| `BreadcrumbItem.url` | `href` (native attribute) |
| `BreadcrumbItem` last level (no `url`) | Omit `href` on the last item and add `current` |
| `#item` / `#separator` slots | Item content goes in the default slot; the separator is configured via the `separator` prop (**no separator slot**) |
| `home` (Home icon item) | Put an icon inside the first `CaomeiBreadcrumbItem` (`@lucide/vue`) |

<ComponentApi name="breadcrumb" />
