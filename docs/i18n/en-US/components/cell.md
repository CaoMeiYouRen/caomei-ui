# Cell

A cell is the basic row of a mobile list: it carries a title, a description, a value and prefix / suffix slots, while the host element (`div` / `button` / `a`) owns the click semantics.

## Basic usage

Title, description and the right-hand value are provided as props. The row height floor is `--caomei-control-height-lg` (44px on desktop, 52px under `data-density="touch"`), and the whole row is the hit target.

<demo
    vue="../examples/cell/basic.vue"
    ssg="true"
/>

## Slots and host semantics

- `#prefix` / `#suffix`: extra areas at the start and end of the row (icons, switches, badges).
- `#title` / `#description` / `#value`: override the matching prop text.
- `as` accepts `div` (default) / `button` / `a`: use `button` or an `a` with `href` for clickable rows so the native element supplies focus, keyboard and click semantics.
- `arrow` shows the chevron indicator (decorative, hidden from assistive technology).

<demo
    vue="../examples/cell/slots.vue"
    ssg="true"
/>

## Click behaviour and the chevron

With `as="button"` the default `type` is `button`; set `type` to `submit` / `reset` when needed. With `as="a"` the `href` and `target` are forwarded. The component binds no click behaviour itself: selection, navigation and analytics stay on the host element.

## Accessibility

- Clickable rows use real interactive elements; `button` / `a` are keyboard reachable without extra `tabindex`.
- Title, description and value are plain text and add no heading level; pass a real heading through `#title` when heading semantics are needed.
- The chevron is decorative and marked `aria-hidden`.

## Style customization

| Variable | Default | Description |
| --- | --- | --- |
| `--caomei-cell-min-height` | `--caomei-control-height-lg` | Row height floor |
| `--caomei-cell-padding-y` / `--caomei-cell-padding-x` | `--caomei-space-2` / `--caomei-space-3` | Row padding |
| `--caomei-cell-gap` | `--caomei-space-3` (narrow: `--caomei-space-2`) | Gap between row areas |

<ComponentApi name="cell" />
