# Skeleton

The skeleton is a placeholder shown before content finishes loading, reducing layout shift and hinting at the loading state. It is a pure-CSS component with no external primitive dependency.

## Basic usage

By default `variant="text"` renders a single text-line placeholder; `lines` controls the line count, and with multiple lines the last line narrows automatically to mimic a real paragraph.

<demo
    vue="../../../examples/skeleton/basic.vue"
    ssg="true"
/>

## Shapes

`variant` supports `text` (text line), `circular` (circle, often for avatars) and `rectangular` (rectangle, often for images / cards); `width` / `height` accept numbers (in px) and strings.

<demo
    vue="../../../examples/skeleton/shapes.vue"
    ssg="true"
/>

## Animation

`animation` supports `pulse` (breathing), `wave` (sweeping highlight) and `none` (no animation).

<demo
    vue="../../../examples/skeleton/animation.vue"
    ssg="true"
/>

## Accessibility

- The skeleton is a decorative placeholder and its root always outputs `aria-hidden="true"`, keeping it out of the accessibility tree.
- The loading state should be expressed by the outer container with semantics such as `aria-busy` or `role="status"`; the skeleton itself does not carry it.
- The animation respects `prefers-reduced-motion` (slows down rather than removing it entirely).

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-skeleton-width` | `100%` for `text` / `rectangular`, `40px` for `circular` | Overall width |
| `--caomei-skeleton-height` | `1em` for `text`, `40px` for `circular`, `80px` for `rectangular` | Shape height |
| `--caomei-skeleton-gap` | `--caomei-space-2` | Gap between lines |
| `--caomei-skeleton-radius` | `--caomei-radius-sm` | Border radius |
| `--caomei-skeleton-bg` | `--caomei-color-bg-elevated` | Placeholder background color |
| `--caomei-skeleton-highlight` | `rgb(255 255 255 / 0.6)` | `wave` sweep highlight color |
| `--caomei-skeleton-last-line-width` | `60%` | Width of the last line in a multi-line skeleton |

```css
.caomei-skeleton {
    --caomei-skeleton-bg: #e5e7eb;
    --caomei-skeleton-radius: 999px;
}
```

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `shape="circle"` | `variant="circular"` |
| `shape="rectangle"` | `variant="rectangular"` |
| — | `variant="text"` (the default here) |
| `width` / `height` | Same names |
| `animation` (`wave` / `none`) | Same names optional; **this library defaults to `pulse` (PrimeVue defaults to `wave`) — an intentional difference** |
| `size` (circle / square size) | Not implemented: express it with `width` / `height` |
| `borderRadius` | Not implemented: override via CSS |
| — | `lines` (renders multiple rows for `variant="text"`) is new here |

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="skeleton" />
