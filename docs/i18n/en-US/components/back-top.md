# BackTop

BackTop is a persistent back-to-top button: it appears in the bottom-right corner once the scroll offset passes a threshold and returns the target container to the top when clicked.

## Basic usage

`label` is the accessible name; it defaults to the current locale's "Back to top". `target` defaults to `window` and also accepts a CSS selector or an element to observe a specific scroll container.

<demo
    vue="../examples/back-top/basic.vue"
    ssg="true"
/>

## Scroll target and threshold

- `target`: `window` (default) / CSS selector / element. Missing matches and invalid selectors fall back to `window`; the target must exist when the component mounts.
- `threshold`: show threshold in px, defaults to `200`; the button appears only when the scroll offset is **strictly greater** than it.
- Changing the target or threshold recalculates visibility immediately.

## Scroll-to-top behavior

- A click calls `scrollTo({ top: 0 })` on the target; with `prefers-reduced-motion: reduce` it uses `behavior: 'auto'` (instant), otherwise `smooth`.
- Emits `click` (the native event) for analytics.
- The default slot replaces the button content and receives `visible` in its scope.

## Accessibility

- Renders a native `<button type="button">`; the accessible name comes from `label`, defaulting to the current locale.
- The default icon is `aria-hidden="true"` and does not duplicate the accessible name.
- Fixed positioning and stacking are overridable via CSS variables; the default tier is `--caomei-z-sticky` (below every overlay).

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-back-top-right` | `--caomei-space-4` | Distance from the right edge |
| `--caomei-back-top-bottom` | `--caomei-space-4` | Distance from the bottom edge |
| `--caomei-back-top-size` | `2.5rem` | Button size (width and height) |
| `--caomei-back-top-radius` | `--caomei-radius-full` | Corner radius |
| `--caomei-back-top-bg` | `--caomei-color-bg-elevated` | Background |
| `--caomei-back-top-color` | `--caomei-color-text` | Icon color |
| `--caomei-back-top-border` | `--caomei-color-border` | Border color |
| `--caomei-back-top-shadow` | `--caomei-shadow-sm` | Shadow |
| `--caomei-back-top-z-index` | `--caomei-z-sticky` | Stacking tier |

## Migration from PrimeVue

| PrimeVue `ScrollTop` | This component |
| --- | --- |
| `target="window"` | Omit `target` (defaults to `window`) |
| `target="parent"` | Pass the parent element or a selector; there is no `parent` sentinel |
| `threshold` (default 400) | Same name, **default 200** |
| `icon` | Replace the content via the default slot |
| `behavior` (v4+) | No switch: follows `prefers-reduced-motion` to choose `smooth` / `auto` |
| `buttonProps` (v4+) | No equivalent; style with CSS variables and let other attributes fall through |
| locale `aria.scrollTop` | `label` (defaults to the current locale) |

> See [Migration from PrimeVue](/en-US/guide/primevue-migration) for the general process and pitfalls.

<ComponentApi name="back-top" />
