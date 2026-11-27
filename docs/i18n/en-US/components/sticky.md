# Sticky

Keeps a piece of content pinned to the top once it scrolls past a given offset, and releases it **inside its container's boundary**. Built on native `position: sticky`: no scroll hijacking and no change to normal flow.

## Basic usage

`offset` (0 by default) is the distance from the top of the viewport or scroll container. Drop the sticky element into any scrollable container — the component listens to the **nearest scrollable ancestor** rather than always listening to `window`.

<demo
    vue="../examples/sticky/basic.vue"
    ssg="true"
/>

## Sticking inside a container

`position: sticky` bounds itself to its containing block, so the element is pushed away once the container bottom arrives. The component exposes this as `data-stuck` / `data-constrained` plus a `change` event, handy for shadows, hints or coordinated UI.

<demo
    vue="../examples/sticky/in-container.vue"
    ssg="true"
/>

## Interaction and accessibility

- **State attributes**: `data-stuck` (pinned) and `data-constrained` (pushed away by the container bottom); `change` emits `{ stuck, constrained }` only when the state actually changes.
- **Scroll container cooperation**: walks up to the nearest ancestor whose `overflow-y` is `auto` / `scroll` / `overlay` and falls back to `window`; it therefore works inside dialog content areas and data panels too.
- **Stacking**: defaults to the base `--caomei-z-sticky` tier; pass `zIndex` for a higher level (written to a component-private variable, not the global tiers).
- **Disabling**: `disabled` returns the element to normal flow (`position: static`) and clears the state, for narrow screens or opt-out branches.
- **Accessibility**: sticking changes neither semantics nor focus order; if the sticky bar acts as navigation, use `nav` / `role="navigation"` and name it with `label` or `aria-label`.
- **Note**: `position: sticky` requires that no ancestor sets `overflow: hidden`, and only a size-constrained ancestor becomes a scroll surface.

## Props

| Component | Main props |
|------|------|
| `CaomeiSticky` | `offset`, `zIndex`, `disabled` |

## Events

| Event | Payload | Description |
|------|------|------|
| `change` | `{ stuck, constrained }` | Emitted when the sticking state changes |

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-sticky-bg` | `--caomei-color-bg` | Sticky background (keeps content underneath from showing through) |
| `--caomei-sticky-shadow` | `--caomei-shadow-sm` | Shadow while pinned |
| `--caomei-sticky-z-index` | `--caomei-z-sticky` | Stacking level (the `zIndex` prop writes this variable) |

<ComponentApi name="sticky" />
