# InputGroup

An input group visually joins multiple form controls into a single control: adjacent duplicated borders and inner corner radii are removed, and input-like members fill the remaining width.

## Basic usage

Join an input and an icon button; clicking the button fills the field:

<demo
    vue="../examples/input-group/basic.vue"
    ssg="true"
/>

## With a select

Any form control can be a member, for example a select plus an action button:

<demo
    vue="../examples/input-group/with-select.vue"
    ssg="true"
/>

## Vertical group

`orientation="vertical"` stacks members vertically (often used for an input plus a full-width button):

<demo
    vue="../examples/input-group/vertical.vue"
    ssg="true"
/>

## Border joining rules

- Members are joined in DOM order: the first keeps the start-side radius, the last keeps the end-side radius, and middle members are squared.
- Adjacent members overlap their borders with a `-1px` margin to avoid a 2px double line; the focused member is lifted above neighbouring borders.
- Input-like members (`Input` / `InputNumber` / `Select` / `MultiSelect` / `Textarea`) fill the remaining width and have their own `max-width` lifted (both `Select` and `InputNumber` cap their width by default) so the group truly fills; other members (such as `Button`) keep their content width.

## Accessibility

- The container is layout-only and does not change members' semantics, focus order or ARIA attributes.
- For icon-only buttons, provide an accessible name (for example `Button`'s `label`).

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-input-group-radius` | `--caomei-radius-md` | Outer radius at the two ends of the group |

<ComponentApi name="input-group" />
