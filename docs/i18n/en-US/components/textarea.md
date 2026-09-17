# Textarea

A textarea receives multiple lines of text, suited to notes, descriptions and similar input.

## Basic usage

Two-way bind the value with `v-model`.

<demo
    vue="../examples/textarea/basic.vue"
    ssg="true"
/>

## Sizes and rows

Switch the size with `size`, and control the number of initially visible lines with `rows`.

<demo
    vue="../examples/textarea/sizes.vue"
    ssg="true"
/>

## Auto resize

With `autoResize`, the height follows the content in both directions and no scrollbar appears; `rows` still acts as the initial minimum height, and `resize` is fixed to `none` (a manually dragged size is overwritten by the next measurement).

<demo
    vue="../examples/textarea/auto-resize.vue"
    ssg="true"
/>

> The height is unbounded; to cap it, layer `max-height` on `.caomei-textarea__control` at the usage site (the native `overflow-y: auto` then scrolls the overflow).

## States and resizing

`disabled` disables, `readonly` makes it read-only, and `invalid` marks a validation failure; `resize` controls whether manual resizing is allowed.

<demo
    vue="../examples/textarea/states.vue"
    ssg="true"
/>

## Accessibility

- `label` provides an accessible name when there is no visible label and maps to `aria-label`; `label` takes precedence over a passed-in `aria-label`, and the passed-in value applies when `label` is not provided (or empty).
- When `invalid`, it outputs `aria-invalid="true"`.
- `class` lands on the root element; native attributes such as `maxlength` / `required` are forwarded to the inner `textarea`.

## Events and exposed API

Besides `update:modelValue`, it also provides `focus`, `blur` and `change`; `focus()` / `blur()` and the inner `textareaRef` are exposed via `defineExpose`.

> Width: `width: 100%` by default to fit form grids; to constrain the width, control it at the usage site with a container or `max-width` (see [Theming and styles §4.1](/design/theming), Chinese).

<ComponentApi name="textarea" />
