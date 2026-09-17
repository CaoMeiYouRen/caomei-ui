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
- Group radii: the outer radii at the two ends are customised through `--caomei-input-group-radius`, while the joining sides are always 0; the radii of members and of their inner elements are taken over by the joining rules (a `Select`'s visible radius lives on its inner trigger and follows the member root's value).
- Adjacent members overlap their borders with a `-1px` margin to avoid a 2px double line; the focused member is lifted above neighbouring borders.
- Input-like members (`Input` / `InputNumber` / `Select` / `MultiSelect` / `Textarea`) fill the remaining width and have their own `max-width` lifted (both `Select` and `InputNumber` cap their width by default) so the group truly fills; that rule sets `max-width: none` with higher specificity, so overriding a member-level width cap such as `--caomei-select-max-width` inside a group has no effect either.
- The remaining members do not fill: `Button` and similar keep their content width, while `AutoComplete` and `DatePicker` keep their own width cap (`DatePicker` defaults to `20rem`; see [Theming and styles §4.1](/design/theming), Chinese) and do not take up the remaining width inside a group.

## Accessibility

- The container is layout-only and does not change members' semantics, focus order or ARIA attributes.
- For icon-only buttons, provide an accessible name (for example `Button`'s `label`).

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-input-group-radius` | `--caomei-radius-md` | Outer radius at the two ends of the group |

<ComponentApi name="input-group" />
