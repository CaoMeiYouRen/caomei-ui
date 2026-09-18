# Popover

A popover holds temporary content tied to a trigger element (explanations, forms, actions); it wraps Reka UI Popover and is used by combining `CaomeiPopover` with `CaomeiPopoverTrigger` / `CaomeiPopoverContent` / `CaomeiPopoverArrow` / `CaomeiPopoverClose`.

## Basic usage

`CaomeiPopover` controls open state via `v-model:open` (uncontrolled by default); click the trigger to toggle, and press Esc or click outside the panel to close.

> Put `class` / `style` on the trigger or the content; the root container renders no DOM, so other attributes on it have no effect.

<demo
    vue="../examples/popover/basic.vue"
    ssg="true"
/>

## Placement

`CaomeiPopoverContent` supports `side` (`top` / `right` / `bottom` / `left`), `align` (`start` / `center` / `end`) and `side-offset` / `align-offset`, and enables collision-aware auto flipping by default (disable it with `avoid-collisions="false"`).

<demo
    vue="../examples/popover/placement.vue"
    ssg="true"
/>

## Arrow and close

`CaomeiPopoverArrow` renders an arrow pointing at the trigger; `CaomeiPopoverClose` renders a button that closes on click (use `label` for the accessible name when there is no visible text).

<demo
    vue="../examples/popover/rich.vue"
    ssg="true"
/>

## Modal

`modal` defaults to `false` (a non-modal popover that does not lock page scroll, avoiding layout shift from the disappearing scrollbar); set `modal` when modal behavior is needed.

```vue
<CaomeiPopover modal>
  <CaomeiPopoverTrigger>Open</CaomeiPopoverTrigger>
  <CaomeiPopoverContent>Modal popover</CaomeiPopoverContent>
</CaomeiPopover>
```

## Accessibility

- The trigger is a native `<button>` outputting `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`.
- The panel is `role="dialog"`, permanently associated with the trigger's accessible name via `aria-labelledby`; `aria-label` can override the panel name (`aria-labelledby` is managed by the component, so passing it has no effect).
- Focus moves into the panel on open: the first focusable element is focused when one exists, otherwise the panel container (`tabindex="-1"`); on close focus returns to the trigger; in non-modal mode, Esc or an outside click closes it.
- The panel is mounted on body (Portal) and stacks above form-type overlays.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-popover-z-index` | `1050` | Panel stacking level |
| `--caomei-popover-width` | `max-content` | Panel width |
| `--caomei-popover-min-width` | `12rem` | Panel minimum width |
| `--caomei-popover-max-width` | `min(20rem, available width)` | Panel maximum width |
| `--caomei-popover-padding` | `--caomei-space-3` | Panel padding |
| `--caomei-popover-bg` | `--caomei-color-bg` | Panel background color |
| `--caomei-popover-border` | `--caomei-color-border` | Panel border color |
| `--caomei-popover-radius` | `--caomei-radius-md` | Panel border radius |
| `--caomei-popover-arrow-bg` | panel background | Arrow fill color |
| `--caomei-popover-trigger-height` | `--caomei-control-height-md` | Trigger height |
| `--caomei-popover-trigger-gap` | `--caomei-space-1` | Gap between the icon and the text inside the trigger |
| `--caomei-popover-trigger-padding-x` | `--caomei-space-3` | Trigger horizontal padding |
| `--caomei-popover-trigger-bg` | `--caomei-color-bg` | Trigger background color |
| `--caomei-popover-trigger-border` | `--caomei-color-border` | Trigger border color |
| `--caomei-popover-trigger-radius` | `--caomei-radius-md` | Trigger border radius |

```css
.caomei-popover__content {
    --caomei-popover-max-width: 24rem;
    --caomei-popover-radius: var(--caomei-radius-lg);
}
```

## Composite component API

| Component | Key props | Description |
|------|----------|------|
| `CaomeiPopover` | `modal` (default `false`), `v-model:open` | Root container, controls open state and modality |
| `CaomeiPopoverTrigger` | `disabled` | Trigger, renders a native `<button>` |
| `CaomeiPopoverContent` | `side`, `sideOffset`, `align`, `alignOffset`, `avoidCollisions`, `forceMount`, `disableOutsidePointerEvents` | Popover panel, mounted via Portal |
| `CaomeiPopoverArrow` | `width`, `height` | Arrow pointing at the trigger |
| `CaomeiPopoverClose` | `label` | Button that closes on click |

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `<Popover>` (content goes in the **default slot**; a `#container` slot can replace the whole container) | `<CaomeiPopover>` + `<CaomeiPopoverTrigger>` / `<CaomeiPopoverContent>` (plus `PopoverArrow` / `PopoverClose`) |
| Visibility (controlled or internal) | `v-model:open` (uncontrolled by default; the trigger toggles it) |
| `dismissable` (default `true`) | Default behavior of a non-modal popover (closes on outside click); `PopoverContent`'s `disable-outside-pointer-events` can turn it off |
| `append-to` / `base-z-index` / `auto-z-index` / `breakpoints` | Not implemented (the panel is portalled to `body`, layering is managed by the library, breakpoint widths are unsupported); listen to `v-model:open` instead of the `@show` / `@hide` events |
| `closeCallback` / `keydownCallback` in the `#container` scope | `<CaomeiPopoverClose>` (wrap your own button with `as-child`) |
| `close-on-escape` (default `true`) | Default behavior (Esc closes); **there is no switch to turn Esc off** |

**No imperative anchor API**: PrimeVue can open at the event coordinates via `ref.show(event)` / `toggle(event)` / `hide()`; here the API is declarative (the `#trigger` slot), so there is no equivalent for event-coordinate imperative opening — use the trigger element or position it yourself (**the imperative API or a migration recipe is registered as a follow-up; this section will be updated when it ships**).

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="popover" />
