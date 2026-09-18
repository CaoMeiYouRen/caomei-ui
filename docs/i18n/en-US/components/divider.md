# Divider

A divider separates content blocks and supports horizontal / vertical orientation, a content slot and line styles.

## Basic usage

<demo
    vue="../examples/divider/basic.vue"
    ssg="true"
/>

## With content

With a default slot the content is shown in the middle of the line; `align` controls its alignment (`left` / `center` / `right`, horizontal only).

<demo
    vue="../examples/divider/with-content.vue"
    ssg="true"
/>

## Line styles and vertical

`variant` supports `solid` / `dashed` / `dotted`; `orientation="vertical"` renders a vertical divider (commonly used between inline actions).

<demo
    vue="../examples/divider/variants.vue"
    ssg="true"
/>

## Accessibility

- Renders `role="separator"` with `aria-orientation`.
- The content slot is for the horizontal orientation only; vertical dividers do not render content.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-divider-color` | `--caomei-color-border` | Line color |
| `--caomei-divider-thickness` | `1px` | Line thickness |
| `--caomei-divider-margin` | `--caomei-space-4 0` | Margin of a horizontal divider |
| `--caomei-divider-vertical-margin` | `--caomei-space-2` | Inline margin of a vertical divider |
| `--caomei-divider-gap` | `--caomei-space-3` | Gap between content and the lines on each side |

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `layout` (`horizontal` / `vertical`) | `orientation` (same values) |
| `type` (`solid` / `dashed` / `dotted`) | `variant` (same values) |
| `align` (`top` / `bottom` for vertical layout) | `align` (`left` / `center` / `right`); **`top` / `bottom` alignment in vertical layout is not supported** |
| Content | Default slot (only participates in horizontal layout) |

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="divider" />
