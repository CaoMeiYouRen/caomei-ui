# Button

A button triggers an action.

## Basic usage

<demo
    vue="../../../examples/button/basic.vue"
    ssg="true"
/>

## Variants

Switch the visual variant with `variant`.

<demo
    vue="../../../examples/button/variants.vue"
    ssg="true"
/>

## Sizes

Switch the size with `size`.

<demo
    vue="../../../examples/button/sizes.vue"
    ssg="true"
/>

## States

While `loading`, the button is disabled and shows a loading indicator; `block` makes it fill the parent width.

<demo
    vue="../../../examples/button/states.vue"
    title="Disabled, loading and block"
    description="Click the loading button to see the loading state."
    ssg="true"
/>

## Accessibility

- `label` provides an accessible name when there is no visible text (icon-only buttons) and maps to `aria-label`.
- The loading state is marked with `aria-busy` and still uses native `disabled` to block interaction.

<ComponentApi name="button" />
