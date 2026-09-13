# Dialog

A dialog presents content above the current page for the user to focus on; it wraps Reka UI Dialog.

## Basic usage

Control visibility with `v-model:open`; `title` is required and acts as the accessible name; use the `footer` slot for action buttons.

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
- Page scroll is locked while a modal is open; Portal content mounts on the client only, and with `open` closed by default there is no extra SSR output, so `ssg` is safe to use on the docs site.

<ComponentApi name="dialog" />
