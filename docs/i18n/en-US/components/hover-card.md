# HoverCard

A card that surfaces supplementary information on hover or focus — terminology notes, user summaries, link previews. Wraps the Reka UI `HoverCard` primitives and exposes trigger / content / arrow layers.

## Basic usage

`CaomeiHoverCardTrigger` always renders a focusable button (no `as` / `asChild` passthrough); `CaomeiHoverCardContent` floats through a portal, below the trigger and aligned to its start edge by default.

<demo
    vue="../examples/hover-card/basic.vue"
    ssg="true"
/>

## Open and close delays

`openDelay` (200ms by default) is the wait before opening on hover and `closeDelay` (100ms) the wait before closing after leaving; moving the pointer into the card and out again also closes after `closeDelay`.

<demo
    vue="../examples/hover-card/delay.vue"
    ssg="true"
/>

## Interaction and accessibility

- Hover **and keyboard focus** open the card; `Esc` closes it (focus stays on the trigger for the keyboard path, and the pointer path closes as well), while leaving with pointer and focus closes it after `closeDelay`.
- The trigger is a focusable button; when `disabled` no popup is rendered and neither hover nor focus opens it (the information source is removed for pointer and keyboard alike). The card holds supplementary information and must not be the only place to complete required work.
- The card is a **non-modal** popup: the background stays interactive and clicking outside closes it.
- `v-model:open` controls the open state; without it the card is uncontrolled.

## Props

| Component | Main props |
|------|------|
| `CaomeiHoverCard` | `v-model:open`, `openDelay`, `closeDelay` |
| `CaomeiHoverCardTrigger` | `disabled` |
| `CaomeiHoverCardContent` | `side`, `align`, `sideOffset`, `alignOffset`, `forceMount` |
| `CaomeiHoverCardArrow` | — |

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-hover-card-max-width` | `20rem` | Card max-width |
| `--caomei-hover-card-padding` | `--caomei-space-3` | Card padding |
| `--caomei-hover-card-border` | `--caomei-color-border` | Card border |
| `--caomei-hover-card-bg` | `--caomei-color-bg-elevated` | Card background (arrow matches) |
| `--caomei-hover-card-z-index` | `--caomei-z-dropdown` | Card z-index |

<ComponentApi name="hover-card" />
