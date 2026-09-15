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

- `closable`: whether to show the close button, defaults to `true`.
- `closeOnOverlay`: whether clicking the overlay closes the drawer, defaults to `true`.
- `closeOnEsc`: whether pressing Esc closes the drawer, defaults to `true`.
- `modal`: whether the drawer is modal, defaults to `true`; modal locks page scroll and blocks background interaction, while `modal="false"` renders no overlay and keeps the page scrollable.

<demo
    vue="../examples/drawer/behaviors.vue"
    ssg="true"
/>

> Migration mapping (PrimeVue → caomei-ui): `visible` → `v-model:open`; `header` → `title` (or the `#header` slot); `dismissable` → `closeOnOverlay`; `showCloseIcon` → `closable`; `closeOnEscape` → `closeOnEsc`; `#footer` → `#footer`. **Known differences**: PrimeVue's `blockScroll` defaults to `false` (`modal` only adds an overlay without locking scroll), whereas this library's `modal="true"` also locks page scroll (stricter); the PrimeVue `position="full"` is not implemented (no downstream usage; use `modal="false"` plus a full-bleed `style` when a full-screen panel is needed); `baseZIndex` / `autoZIndex` / `closeButtonProps` / `closeIcon` are not exposed (fixed close-button shape and fixed layering: overlay 1000 / panel 1001); `size` is an addition of this library (PrimeVue has no such prop and takes the width via `style`). The lifecycle events `show` / `before-hide` / `hide` / `after-show` / `after-hide` and the `#closebutton` / `#closeicon` / `#container` slots are not exposed (no downstream usage).

## Accessibility

- `title` is the accessible name referenced by `aria-labelledby`; when omitted it falls back to the built-in locale text (screen-reader only, without a visible title, matching PrimeVue).
- `description` establishes the `aria-describedby` association.
- The close button uses the built-in localized label, overridable via `closeLabel`.
- Modal drawers get focus trapping and scroll locking from the primitives.

<ComponentApi name="drawer" />
