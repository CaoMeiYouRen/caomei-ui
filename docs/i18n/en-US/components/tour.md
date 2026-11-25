# Tour

Tour walks users through page features step by step: a full-viewport mask cuts out the current target and a card explains it, with controls to move on or skip. Reka UI has no Tour primitive, so the component is built from scratch.

## Basic usage

`steps` describes each step's target and copy. `target` accepts a selector, an element, or a function returning an element (called on every recalculation, which pairs well with template refs). In the masked form the page scroll is locked, the background is not interactive, and `Escape` closes the tour and returns focus to the element that opened it.

<demo
    vue="../examples/tour/basic.vue"
    ssg="true"
/>

## Controlled open state and step

`v-model:open` controls visibility (defaults to `true`, so the tour opens on mount unless bound; start with `false` to trigger it later), and `v-model:current` controls the step. Use the `next` / `prev` / `skip` / `finish` events to add analytics or navigation. An out-of-range index is clamped and written back through `update:current`, and shrinking `steps` converges to a valid range as well.

<demo
    vue="../examples/tour/controlled.vue"
    ssg="true"
/>

## Custom content

The default slot takes over the body and exposes `step` / `index` / `total` in its scope; the title still comes from `step.title`. Prefer the slot over concatenating long strings when you need rich content (lists, links, form controls).

<demo
    vue="../examples/tour/custom.vue"
    ssg="true"
/>

## Mask, scroll lock and the non-modal form

`mask` is on by default:

- it draws the mask and cuts out the target, with `padding` controlling how far the highlight extends;
- it locks page scroll (removes the scrollbar and compensates `body`'s `padding-right` by the scrollbar width — see [Theming and styles](/design/theming) (Chinese)) so the mask covers the viewport completely;
- it marks the background `inert`, keeps keyboard focus inside the layer, and exposes `role="dialog"` + `aria-modal="true"`;
- clicks never pass through the cutout, so the page is not interactive.

Turning `mask` off gives the non-modal form: no mask, no scroll lock, the page stays interactive, the keyboard can leave the card, and it exposes `role="region"`.

<demo
    vue="../examples/tour/mask-off.vue"
    ssg="true"
/>

> In dark mode, set the page background on `html` / `body`: the `padding-right` compensation from the scroll lock is carried by the page background, and coloring only an inner container leaves a light strip at the right edge of the viewport.

## Positioning and recalculation

- `placement` is the default card side (`top` / `bottom` / `left` / `right`) and `steps[].placement` overrides it per step. When that side lacks room the card flips to the opposite side; when neither side fits it picks the roomier one and clamps to the viewport inset.
- `offset` is the gap between card and target, `padding` is how far the highlight extends; `steps[].offset` overrides the gap per step.
- A step change scrolls the target into view (`scrollIntoView`, honoring `prefers-reduced-motion`); scrolling any container, resizing the window, or changing `steps` recalculates.
- A missing target or an invalid selector degrades to "no cutout + centered card + full mask" without throwing; a target outside the viewport also falls back to the full mask.

## Accessibility

- The layer's accessible name comes from `label`, defaulting to the locale's "Product tour".
- The card exposes `role="group"` named after the current step title; opening and every step change move focus to the card so screen readers announce the step.
- With the mask on, `Tab` / `Shift+Tab` cycle inside the card; `Escape` closes and returns focus. With `closable=false` no skip button renders and `Escape` does not close either.
- The masked background is `inert`: it leaves the accessibility tree and cannot take focus.

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-tour-z-index` | `--caomei-z-toast` | Layer stacking |
| `--caomei-tour-mask-bg` | `--caomei-color-mask` | Mask and highlight surround color |
| `--caomei-tour-spotlight-radius` | `--caomei-radius-md` | Highlight cutout radius |
| `--caomei-tour-card-width` | `min(20rem, 100% - 2 × var(--caomei-space-4))` | Card width |
| `--caomei-tour-card-max-height` | `100% - 2 × var(--caomei-space-4)` | Card max height (scrolls beyond) |
| `--caomei-tour-card-padding` | `--caomei-space-4` | Card padding |
| `--caomei-tour-card-radius` | `--caomei-radius-lg` | Card radius |
| `--caomei-tour-card-bg` | `--caomei-color-bg-elevated` | Card background |
| `--caomei-tour-card-border` | `--caomei-color-border` | Card border |

<ComponentApi name="tour" />
