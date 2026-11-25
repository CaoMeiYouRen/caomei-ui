# Anchor

Anchor turns a list of headings into a table of contents: it highlights the current section while scrolling and smoothly jumps to a heading on click. It supports the window and custom scroll containers, nested indentation, a controlled active value and URL hash sync; Reka UI has no matching primitive, so the scroll-spy is built in-house.

## Basic usage

`items` describes the outline; `key` is also the `v-model:active` value, and `id` defaults to `key` and is used to find the heading element. The nav renders as `nav` plus a list of links, named by `label` (defaulting to the locale's "Anchor navigation").

<demo
    vue="../examples/anchor/basic.vue"
    ssg="true"
/>

## Custom scroll container

`container` accepts an element or a CSS selector and defaults to the window; a selector is resolved on mount and when `container` changes, falling back to the window when missing or invalid. Both the scroll listener and click scrolling target that container — with a container, a click scrolls only the container and never the page.

<demo
    vue="../examples/anchor/container.vue"
    ssg="true"
/>

## Nested levels

`children` render as an indented level (`--caomei-anchor-indent-step`, 12px by default); parents and children both take part in activation.

<demo
    vue="../examples/anchor/nested.vue"
    ssg="true"
/>

## Activation, clicks and the hash

> The demos disable `hashSync` so they never touch the documentation site's own URL hash; enable it in real integrations as needed.

- The activation line is the container top plus `offset` (12px by default). Items are walked in flattened `items` order and the walk stops at the first heading that has not crossed the line, so **`items` order should match the heading order in the document**. The first resolved item is the fallback and the controlled value is kept when nothing is resolved yet.
- A click writes `v-model:active` and scrolls so the heading top sits on the activation line; `smooth` controls smooth scrolling and always honors `prefers-reduced-motion`. Modifier clicks (new tab / window) are left to the browser.
- `hashSync` is on by default: clicks write `#<id>` via `pushState` (Back returns to the previous section), and first paint plus `hashchange` look the section up and scroll to it. **Hosts using hash-mode routing (such as `createWebHashHistory`) should set `hashSync="false"`** so the route hash is not overwritten; `v-model:active` still works.
- Writing `v-model:active` from outside only changes the highlight and does not scroll; the next scroll is taken over by the scroll-spy.

## Accessibility

- The root is a `nav` with an accessible name; the current item is marked with `aria-current="location"` and links keep native `<a href="#id">` semantics.
- When the target is not rendered the click is not intercepted, preserving the browser's default anchor behavior.
- Links are tabbable and `:focus-visible` draws a 2px focus ring.

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-anchor-gap` | `--caomei-space-1` | Item gap |
| `--caomei-anchor-indent-step` | `12px` | Indent step per level |
| `--caomei-anchor-link-padding-y` | `--caomei-space-1` | Link vertical padding |
| `--caomei-anchor-link-padding-x` | `--caomei-space-2` | Link horizontal padding |

<ComponentApi name="anchor" />
