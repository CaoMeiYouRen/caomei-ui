# Image

The image component is built on the native `img` and provides ratio placeholders, lazy loading and loading / error placeholders, avoiding layout shift while loading.

## Basic usage

Pass the image info via `src` / `alt`; `ratio` provides the aspect ratio (such as `16 / 9`) so the container reserves space by ratio; `fit` controls the fill mode (defaults to `cover`).

<demo
    vue="../examples/image/basic.vue"
    ssg="true"
/>

## Lazy loading

With `lazy`, `src` is requested only after the image enters the viewport. Providing `ratio` as well is recommended so the container keeps its placeholder before loading.

<demo
    vue="../examples/image/lazy.vue"
    ssg="true"
/>

## Loading and error placeholders

While loading, a pulsing placeholder is shown, and on failure an error icon; customize them via the `#loading` / `#error` slots. When the image fails to load, `alt` remains in the accessibility tree.

<demo
    vue="../examples/image/states.vue"
    ssg="true"
/>

## Accessibility

- `alt` maps to the native `alt`; pass an empty string for decorative images.
- The loading placeholder layer is `aria-hidden="true"`; the error placeholder layer does not carry `aria-hidden`, so it can hold custom error text (the default error icon is automatically `aria-hidden` by Lucide).
- The component emits `load` / `error` with the native event object as the argument; an image that already failed during SSR before hydration enters the error state directly on mount and does not re-emit `error`.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-image-bg` | `--caomei-color-bg-elevated` | Container background color |
| `--caomei-image-loading-bg` | `--caomei-color-bg-elevated` | Loading placeholder background color |
| `--caomei-image-placeholder-color` | `--caomei-color-text-muted` | Placeholder / error icon color |
| `--caomei-image-placeholder-size` | `24px` | Placeholder icon size |

> The component does not handle `srcset` or cross-origin; handle responsive images or cross-origin policy in the application layer when needed.

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `src` | `src` |
| `preview` (click to zoom with an overlay) | **Not implemented (registered as a follow-up; this section will be updated when it ships)** |
| `indicatorIcon` / `previewIcon` | Not implemented (same follow-up) |
| `imageStyle` / `imageClass` | Not implemented: style through the root class and CSS variables (native image attributes are not forwarded to the inner `<img>`) |
| `zoomInDisabled` / `zoomOutDisabled` | Not applicable (no preview) |
| — | `alt`, `ratio` (reserve space to avoid layout shift), `fit`, `lazy` (request on viewport entry) and the `#loading` / `#error` slots are new here |

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="image" />
