# Image

The image component is built on the native `img` and provides ratio placeholders, lazy loading and loading / error placeholders, avoiding layout shift while loading.

## Basic usage

Pass the image info via `src` / `alt`; `ratio` provides the aspect ratio (such as `16 / 9`) so the container reserves space by ratio; `fit` controls the fill mode (defaults to `cover`). The demo pairs a square source with a `16 / 9` container — only different ratios make the difference visible: `cover` crops to fill, while `contain` shows the whole image and lets the container background show through (the demo overrides `--caomei-image-bg` so the blank area is easy to see; the default is `--caomei-color-bg-elevated`).

<demo
    vue="../examples/image/basic.vue"
    ssg="true"
/>

## Lazy loading

With `lazy`, `src` is requested only after the image enters the viewport. Providing `ratio` as well is recommended so the container keeps its placeholder before loading. The demo deliberately uses an image URL that no other demo on the page reuses, plus a non-cacheable parameter offered by the image source, so a browser cache hit cannot hide the loading step.

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

## Click-to-enlarge preview

With `preview`, the image becomes clickable once it has loaded: clicking opens an overlay with the enlarged image, closed by the overlay, Escape or the close button, following Reka Dialog's modal semantics (focus trap, scroll lock, focus returning to the trigger on close). The indicator defaults to the `Eye` icon and can be replaced via `previewIcon` (a `@lucide/vue` component) or the `#indicatoricon` slot — **the slot wins over the prop**; no trigger is rendered while loading or after a failure. The `show` / `hide` events fire as the preview opens and closes.

<demo
    vue="../examples/image/preview.vue"
    ssg="true"
/>

## Accessibility

- `alt` maps to the native `alt`; pass an empty string for decorative images.
- The loading placeholder layer is `aria-hidden="true"`; the error placeholder layer does not carry `aria-hidden`, so it can hold custom error text (the default error icon is automatically `aria-hidden` by Lucide).
- The component emits `load` / `error` with the native event object as the argument; an image that already failed during SSR before hydration enters the error state directly on mount and does not re-emit `error`.
- The preview trigger is a plain `button` whose accessible name comes from the built-in "Preview image" text (the `#indicatoricon` slot only replaces the content, not the name); the overlay is a modal dialog (`role="dialog"` + `aria-modal`) titled with the built-in "Image preview" text, and the enlarged image reuses `alt`.
- Keyboard: Tab focuses the trigger, Enter / Space opens it; focus cycles inside the overlay, and after closing via Escape / the close button / the overlay it returns to the trigger. Setting `preview` back to false collapses an open overlay.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-image-bg` | `--caomei-color-bg-elevated` | Container background color |
| `--caomei-image-loading-bg` | `--caomei-color-bg-elevated` | Loading placeholder background color |
| `--caomei-image-placeholder-color` | `--caomei-color-text-muted` | Placeholder / error icon color |
| `--caomei-image-placeholder-size` | `24px` | Placeholder icon size |
| `--caomei-image-preview-color` | `--caomei-color-on-solid` | Preview indicator icon color |
| `--caomei-image-preview-icon-size` | `24px` | Preview indicator icon size |
| `--caomei-image-preview-close-color` | `--caomei-color-on-solid` | Close button icon color |
| `--caomei-image-preview-close-size` | `20px` | Close button icon size |
| `--caomei-image-preview-z-index` | `1100` | Overlay z-index (the enlarged content uses this value + 1; above Dialog / Drawer's 1000 / 1001 and overlays' 1050, level with Toast) |

> The component does not handle `srcset` or cross-origin; handle responsive images or cross-origin policy in the application layer when needed.

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `src` | `src` |
| `preview` (click to zoom with an overlay) | `preview` (defaults to `false`; the trigger appears once loaded, closed by overlay / Escape / close button) |
| `previewIcon` / `indicatorIcon` (string icon class) | `previewIcon` (a `@lucide/vue` component, defaults to `Eye`) |
| `#previewicon` / `#indicatoricon` slots | `#indicatoricon` (a single merged name; **only the legacy `#indicatoricon` migrates with zero edits** — code using the current `#previewicon` name must be renamed) |
| `@show` / `@hide` | `show` / `hide` (same names, emitted as the preview opens and closes) |
| `imageStyle` / `imageClass` | Not implemented: style through the root class and CSS variables (native image attributes are not forwarded to the inner `<img>`) |
| `zoomInDisabled` / `zoomOutDisabled` | Not implemented: there is no rotate / zoom toolbar, so no disable switches are needed |
| `#refresh` / `#undo` / `#zoomin` / `#zoomout` / `#close` / `#image` / `#original` (`#preview`) slots | Not implemented: no toolbar; the enlarged image always reuses `src` / `alt` and the close button is built in |
| `previewButtonProps` | Not implemented: the trigger appearance is overridden through the class name and CSS variables |
| — | `alt`, `ratio` (reserve space to avoid layout shift), `fit`, `lazy` (request on viewport entry) and the `#loading` / `#error` slots are new here |

> **Intentional differences**: ① the overlay only shows the enlarged image and closes — it does not provide PrimeVue's rotate / zoom toolbar; ② the trigger is rendered only after a successful load, so it cannot be opened while loading or after a failure; ③ the overlay is built on Reka Dialog (focus trap, scroll lock, focus returning to the trigger), while PrimeVue uses a hand-rolled Portal + FocusTrap.

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="image" />
