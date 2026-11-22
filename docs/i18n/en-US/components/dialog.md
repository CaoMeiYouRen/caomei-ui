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

`closable` controls the close button. The close button has no visible text, so its built-in tooltip is on by default with `closeLabel` as content (the tooltip never affects the `aria-label` or the close behaviour; to turn tooltips off globally, place `CaomeiTooltipProvider` at the app root and set `disabled`, see [Tooltip](./tooltip.md)). `closeOnOverlay` / `closeOnEsc` control whether clicking the overlay or pressing Esc closes the dialog (while a tooltip is open, the first Esc closes the tooltip and the second closes the dialog, matching the layering of panels inside the dialog); with `modal="false"` there is no overlay, the background stays interactive and the page scroll is not locked (in this case `closeOnOverlay` means clicking outside the dialog).

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

> **Known trade-off (nested modals)**: when another Dialog / Drawer / ConfirmDialog opens inside a dialog, the child overlay (1000) sits below the parent content (1001), so **the parent content is not dimmed** although it is already blocked and cannot be interacted with; a floating panel already open in the parent (1050) sits above the child content (1001) and stays visible, but inherits the modal lock's `pointer-events: none` — **visible but not clickable**; clicking that area first closes the child modal as an outside click and then falls through to the revealed option. Closing order, focus isolation and scroll locking still follow "close only the topmost layer". See [nested overlay layering evaluation](/design/governance/2026-11-15-phase34-m2-1-nested-overlay-layering) for the evaluation and the implementation sketch.

## Mobile and narrow screens

- On narrow screens (≤640px) the width narrows to `calc(100vw - 2 × space-4)`; tablets keep `min(90vw, 480px)` (the `size` step). The footer wraps when the buttons do not fit.
- Use `breakpoints` to switch widths per viewport (see Behaviour options above). The component never listens to the viewport and never turns full screen by itself.
- **Known limits**: a full-screen dialog is the consumer's job — override `width: 100vw`, `max-height: 100dvh`, `border-radius: 0` and handle the safe area; the overlay and scroll lock work the same on narrow screens.

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `v-model:visible` | `v-model:open` |
| `header` | `title` (**optional**: when omitted, the built-in "Dialog" text becomes a visually hidden accessible name) |
| `show-header` | `showHeader` (also defaults to `true`; `false` hides the whole header) |
| `breakpoints` | `breakpoints` (keys are viewport max-widths, values are panel widths; the narrowest match wins) |
| `@hide` | `hide` (there is no leave animation here, so the contract is "`open` goes from true to false") |
| `dismissable-mask` / `close-on-escape` | `closeOnOverlay` / `closeOnEsc` |
| `block-scroll` | Not exposed: `modal="true"` already locks page scroll (stricter than PrimeVue's default) |

**Intentional differences**: the breakpoint rules live in a `<style>` element inside the panel and rely on source-order tie-breaking (downstream needs higher specificity or `!important` to override); they also require the consumer's CSP `style-src` to allow inline styles. See [Design spec §7](/design/design-spec) for the rest.

**Not implemented / not exposed**: `maximizable` / `draggable` / `position` / `appendTo`, and lifecycle events such as `show` / `after-hide`.

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="dialog" />
