# Drawer

A drawer slides in from the edge of the page for secondary content, settings panels or navigation; it wraps the Reka UI Dialog primitive and offers a four-way `position`.

## Basic usage

Control visibility with `v-model:open`; `title` acts as the accessible name; put footer actions in the `footer` slot.

<demo
    vue="../examples/drawer/basic.vue"
    ssg="true"
/>

## Positions

Switch between `left` / `right` / `top` / `bottom` with `position`; the default is `left`. `left` / `right` control width, `top` / `bottom` control height.

<demo
    vue="../examples/drawer/positions.vue"
    ssg="true"
/>

## Sizes

Switch between `sm` / `md` / `lg` with `size` (default `md`), mapping to 320 / 420 / 560px of width (`left` / `right`) or height (`top` / `bottom`); capped at `90vw` / `90vh`. For an exact width pass `style` directly (e.g. `:style="{ width: '600px' }"`); inline style wins over the size step.

## Custom header

The `#header` slot replaces the content of the title area while the close button stays. In that case `title` becomes a screen-reader-only accessible name, so passing `title` alongside `#header` is recommended.

<demo
    vue="../examples/drawer/custom-header.vue"
    ssg="true"
/>

## Behavior options

- `closable`: whether to show the close button, defaults to `true`; its built-in tooltip is on by default (content from `closeLabel`, never affecting the `aria-label` or the close behaviour; disable all tooltips by placing `CaomeiTooltipProvider` at the root and setting `disabled`).
- `closeOnOverlay`: whether clicking the overlay closes the drawer, defaults to `true`.
- `closeOnEsc`: whether pressing Esc closes the drawer, defaults to `true`; while a tooltip is open, the first Esc closes the tooltip and the second closes the drawer.
- `modal`: whether the drawer is modal, defaults to `true`; modal locks page scroll and blocks background interaction, while `modal="false"` renders no overlay and keeps the page scrollable.

<demo
    vue="../examples/drawer/behaviors.vue"
    ssg="true"
/>

## Accessibility

- `title` is the accessible name referenced by `aria-labelledby`; when omitted it falls back to the built-in locale text (screen-reader only, without a visible title, matching PrimeVue).
- `description` establishes the `aria-describedby` association.
- The close button uses the built-in localized label, overridable via `closeLabel`; that text is also the close button's tooltip content.
- Modal drawers get focus trapping and scroll locking from the primitives.

> **Known trade-off (nested overlays)**: opening another Dialog / Drawer / ConfirmDialog inside a drawer puts the child overlay (1000) below the parent content (1001), so the parent content is not dimmed although it is blocked and cannot be interacted with; a floating panel already open in the parent (1050) sits above the child content (1001) and stays visible, but inherits the modal lock's `pointer-events: none` — **visible but not clickable**; clicking that area first closes the child as an outside click and then falls through to the revealed option. Closing order, focus isolation and scroll locking still follow "close only the topmost layer". See [nested overlay layering evaluation](/design/governance/2026-11-15-phase34-m2-1-nested-overlay-layering) for the evaluation and the implementation sketch.

## Mobile and narrow screens

- Left / right drawers converge to `min(90vw, size)` and top / bottom drawers to `min(90vh, size)`; the `dvh` fallback is built in, so the address bar collapsing does not shift the panel.
- Bottom drawers add `--caomei-safe-area-bottom` and scroll their body; the overlay and scroll lock work the same on narrow screens.
- **Known limits**: a drawer never turns full screen by itself; override `size` to `100vw` / `100dvh` and handle the safe area yourself when needed.

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `v-model:visible` | `v-model:open` |
| `header` | `title` (or the `#header` slot, which replaces the title area while keeping the close button) |
| `position` | `position` (four sides; **defaults to PrimeVue's `left`**) |
| `dismissable` | `closeOnOverlay` |
| `show-close-icon` | `closable` |
| `close-on-escape` | `closeOnEsc` |
| `#footer` | `#footer` (same-named footer slot) |
| `modal` | `modal` (here `modal="true"` also locks page scroll — stricter than PrimeVue) |
| width via `style` | `size` (new here: `sm` / `md` / `lg` = 320 / 420 / 560px, converging on narrow viewports) |

**Not implemented / not exposed**: `position="full"`; the `show` / `before-hide` / `hide` / `after-show` / `after-hide` events; the `#closebutton` / `#closeicon` / `#container` slots; `base-z-index` / `auto-z-index` / `close-button-props` / `close-icon`; the overlay/panel layering is fixed at 1000 / 1001 and the close button form is fixed; `position="full"`, the lifecycle events and the container slots all have **no downstream usage** (see [Design spec §7](/design/design-spec) for the full list).

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="drawer" />
