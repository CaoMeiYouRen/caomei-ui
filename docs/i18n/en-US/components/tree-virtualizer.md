# TreeVirtualizer

A tree built for **large lists**: only rows near the viewport are rendered, so thousands of nodes still scroll smoothly. Wraps the Reka UI `TreeVirtualizer` primitive; expansion, selection and keyboard behaviour match `CaomeiTree`.

## Basic usage

`height` fixes the scroll container's height (virtualization needs a known height to compute the visible window). `itemHeight` is the estimated row height and must match the real one (28px by default), otherwise scroll positioning drifts.

<demo
    vue="../examples/tree-virtualizer/basic.vue"
    ssg="true"
/>

## Large datasets

The example below holds 4200 nodes (200 groups × 20 children) while the DOM only keeps the visible rows plus `overscan`. A larger `overscan` (12 by default) smooths scrolling at a higher render cost.

<demo
    vue="../examples/tree-virtualizer/large.vue"
    ssg="true"
/>

## Interaction and accessibility

- **Virtualization boundary**: only rows near the viewport exist in the DOM, so "find every node" style work must read `items` rather than the DOM.
- **Expand / collapse**: `v-model:expanded` is controlled, self-managed when unbound; the container's total height grows with newly visible rows and shrinks again on collapse.
- **Keyboard**: the tree is a single Tab stop and arrow keys move within the rendered window (the same roving tabindex semantics as `CaomeiTree`); crossing windows scrolls and refocuses.
- **Selection**: `v-model` is a key list; with `multiple` off at most one key is kept.
- **Accessible name**: `label` wins over a forwarded `aria-label`; a virtual tree still needs a name describing what it is.
- `CaomeiTree` vs this component: use `CaomeiTree` for a few hundred nodes, this component for thousands or when you need a fixed-height scroll area. `propagateSelect` / `bubbleSelect` are not supported here.

## Props

| Component | Main props |
|------|------|
| `CaomeiTreeVirtualizer` | `items`, `itemKey`, `labelKey`, `childrenKey`, `height`, `itemHeight`, `overscan`, `v-model`, `v-model:expanded`, `multiple`, `label` |

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-tree-virtualizer-border` | `--caomei-color-border` | Scroll container border |
| `--caomei-tree-virtualizer-item-height` | `28px` | Row height, must match `itemHeight` |
| `--caomei-tree-virtualizer-indent` | `--caomei-space-4` | Indent per level |
| `--caomei-tree-virtualizer-selected-bg` | `color-mix(in srgb, --caomei-color-primary 12%, transparent)` | Selected row background |

<ComponentApi name="tree-virtualizer" />
