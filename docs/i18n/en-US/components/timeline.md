# Timeline

Timeline presents events in chronological order and combines `CaomeiTimeline` with `CaomeiTimelineItem`. Content is supplied by the caller; the component does not parse times or sort items.

## Basic usage

Each `CaomeiTimelineItem` accepts `title` / `content` / `timestamp` / `tone` / `icon`; `tone` only affects the dot color (`primary` / `success` / `warning` / `danger` / `neutral`).

<demo
    vue="../examples/timeline/basic.vue"
    ssg="true"
/>

## Layout

- `mode="left"` (default) puts the dot on the left and content on the right; `mode="right"` mirrors the single-side layout.
- `mode="alternate"` alternates sides, which suits wider logs; prefer a single side on narrow screens.
- `reverse` reverses the item order (newest first) without changing the DOM semantics of the supplied items.

## Accessibility

- The root is an ordered list (`ol`) and each node is an `li`, so screen readers can announce the count and order.
- Dots and icons are decorative and `aria-hidden`; the timestamp, title and body are read in DOM order.
- Use `label` to name the timeline; without it the list semantics remain.

## Boundary with Steps

- `Timeline` presents **events that happened** in time order, without a mandatory completion state.
- `Steps` presents **process progress** with a current step and completion state; use Steps for flows.

<ComponentApi name="timeline" />
