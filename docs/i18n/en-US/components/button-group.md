# ButtonGroup

A button group joins multiple buttons into a single control: adjacent borders are merged and inner corner radii removed, commonly used for a set of closely related actions.

## Basic usage

<demo
    vue="../examples/button-group/basic.vue"
    ssg="true"
/>

## Icons and vertical group

`orientation="vertical"` stacks the buttons vertically:

<demo
    vue="../examples/button-group/variants.vue"
    ssg="true"
/>

## Border joining rules

- Members are joined in DOM order: the first keeps the start-side radius, the last keeps the end-side radius, and middle members are squared.
- The inner border of every non-last member is removed to avoid a 2px double line; the focused member is lifted above neighbouring buttons.
- Members keep their own content width (the `inline-flex` container shrinks to fit).

## Accessibility

- The container is layout-only and does not change members' semantics, focus order or ARIA attributes.
- For icon-only buttons, provide an accessible name (for example `Button`'s `label`).

## Style customization

A button group exposes no group-level radius variable: the outer corners follow each member's own radius (default `--caomei-radius-md`, or `--caomei-radius-full` for a `rounded` Button). The group only removes inner corners and borders.

<ComponentApi name="button-group" />
