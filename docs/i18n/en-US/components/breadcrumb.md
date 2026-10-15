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

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `<Breadcrumb :model="[{ label, url }]">` | `<CaomeiBreadcrumb>` + one `<CaomeiBreadcrumbItem href>` per level (declarative, no `:model` array) |
| `BreadcrumbItem.url` | `href` (native attribute) |
| `BreadcrumbItem` last level (no `url`) | Omit `href` on the last item and add `current` |
| `#item` / `#separator` slots | Item content goes in the default slot; the separator is configured via the `separator` prop (**no separator slot**) |
| `home` (Home icon item) | Put an icon inside the first `CaomeiBreadcrumbItem` (`@lucide/vue`) |

<ComponentApi name="breadcrumb" />
