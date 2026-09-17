# Dialog

A dialog presents content above the current page for the user to focus on; it wraps Reka UI Dialog.

## Basic usage

Control visibility with `v-model:open`; `title` acts as the accessible name (it may be omitted, in which case the built-in "Dialog" text is used as a visually hidden accessible name); use the `footer` slot for action buttons.

<demo
    vue="../examples/dialog/basic.vue"
    ssg="true"
/>

## Sizes

Switch the size with `size`; supports `sm` / `md` / `lg` (max width 360 / 480 / 640px).

<demo
    vue="../examples/dialog/sizes.vue"
    ssg="true"
/>

## Header and close event

With `showHeader="false"` the whole header (title area and close button) is not rendered, which suits fully custom overlays; `title` is then kept only as a visually hidden accessible name. The close button goes away with the header, so provide your own close path (or keep the overlay / Esc close). The `hide` event fires when the dialog goes from open to closed — the overlay, Esc, the close button and an external controlled change all count.

<demo
    vue="../examples/dialog/headerless.vue"
    ssg="true"
/>

## Breakpoint widths

`breakpoints` sets the panel width by viewport max-width: keys are viewport max-widths (px), values are panel widths. When several breakpoints match the **narrowest** wins (regardless of key order); when omitted the `size` preset width applies. The semantics follow [Responsive design](/design/responsive) (`width <=`, Chinese). Entries with an invalid key or value are ignored.

<demo
    vue="../examples/dialog/breakpoints.vue"
    ssg="true"
/>

## Behavior options

`closable` controls the close button; `closeOnOverlay` / `closeOnEsc` control whether clicking the overlay or pressing Esc closes the dialog; with `modal="false"` there is no overlay, the background stays interactive and the page scroll is not locked (in this case `closeOnOverlay` means clicking outside the dialog).

<demo
    vue="../examples/dialog/behaviors.vue"
    ssg="true"
/>

When part of the content scrolls, the title and close button stay fixed at the top and the body scrolls independently.

## Trigger slot

Besides the controlled `open`, you can pass a trigger element via the `trigger` slot (Reka `as-child`):

```vue
<CaomeiDialog title="Example">
  <template #trigger>
    <CaomeiButton>Open</CaomeiButton>
  </template>
  Content
</CaomeiDialog>
```

## Accessibility and SSR

- Built on Reka UI: `role="dialog"`, focus trapping, Esc to close, background interaction blocked; the title and description are associated via `aria-labelledby` / `aria-describedby` respectively.
- `title` may be omitted: when omitted or with `showHeader="false"` the title (and description) become visually hidden but stay in the DOM, so the accessible name is never empty (it falls back to the built-in "Dialog" text) and no empty attributes are produced.
- Page scroll is locked while a modal is open; Portal content mounts on the client only, and with `open` closed by default there is no extra SSR output, so `ssg` is safe to use on the docs site.

<ComponentApi name="dialog" />
