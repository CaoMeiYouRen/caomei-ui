# Tag

A tag categorizes or labels content and supports semantic tones, several variants and a closable interaction.

## Basic usage

<demo
    vue="../examples/tag/basic.vue"
    ssg="true"
/>

## Tones

Switch the semantic tone with `tone`; supports `neutral` / `primary` / `success` / `warning` / `danger`.

<demo
    vue="../../../examples/tag/tones.vue"
    ssg="true"
/>

## Variants and sizes

Switch between `soft` / `solid` / `outline` with `variant`, and between `sm` / `md` / `lg` with `size`.

<demo
    vue="../../../examples/tag/variants.vue"
    ssg="true"
/>

## Closable

With `closable`, a close button is shown; clicking it emits `close` for the parent to handle the removal.

<demo
    vue="../examples/tag/closable.vue"
    ssg="true"
/>

## Accessibility

- The close button uses the built-in localized label, overridable via `closeLabel`.
- When `disabled`, the close button is not interactive and does not emit `close`.
- The `icon` slot places an icon before the text.

<ComponentApi name="tag" />
