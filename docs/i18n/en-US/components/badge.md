# Badge

A badge shows a count or status hint; it can be used standalone or overlaid on the top-right corner of another element.

## Basic usage

Show a number or text via `value`; a single digit or narrow character renders as a full circle, while multiple characters expand into a pill automatically.

<demo
    vue="../../../examples/badge/basic.vue"
    ssg="true"
/>

## Tones and variants

Switch the semantic tone with `tone`, and between `soft` / `solid` / `outline` with `variant`.

<demo
    vue="../../../examples/badge/tones.vue"
    ssg="true"
/>

## Numeric maximum

When `value` is a number greater than `max`, `max+` is shown.

<demo
    vue="../../../examples/badge/max.vue"
    ssg="true"
/>

## Dot and overlay

Providing the default slot switches to overlay mode, positioning the badge at the top-right of the content; `dot` shows only a dot.

<demo
    vue="../examples/badge/overlay.vue"
    ssg="true"
/>

## Accessibility

- Dot mode has no visible text; provide an accessible name via `label` (mapped to `aria-label` plus `role="img"`). Without `label` the badge is hidden from assistive technology (a forwarded `aria-label` is likewise cancelled by `aria-hidden`).
- Outside dot mode, `label` takes precedence over a forwarded `aria-label`; the forwarded value applies when `label` is not provided (or empty).
- In numeric mode, `label` overrides the spoken content of the visible value, so it is usually unnecessary.
- Overlay mode keeps the slot content semantics, with the badge as a sibling node; forwarded attributes such as `class` land on the wrapper `.caomei-badge-wrapper` (the badge's own accessible name comes from `label`).

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `value` | `value` (truncated to `max+` beyond `max`; `null` / empty string renders nothing) |
| `severity` | `tone` (`secondary` / `contrast` → `neutral`, `info` → `primary`, `success` → `success`, `warn` → `warning`, `danger` → `danger`; `info` / `contrast` among them are lossy approximations) |
| `size` (`small` / `large` / `xlarge`) | `size` (`sm` / `md` / `lg`) |
| — | `variant` (`soft` / `solid` / `outline`) is new here |

**Intentional differences**: the default `tone` is `danger` and `variant` is `solid` (PrimeVue falls back to its default primary styling when `severity` is absent); `max` (numeric cap), `dot` (a dot with no value), `label` (accessible name) and the default slot as an overlay badge are new here.

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="badge" />
