# Tree

Display hierarchical data as an expandable structure with single / multiple selection, per-node disabled state and keyboard navigation. It wraps Reka UI's `TreeRoot` / `TreeItem` (**Alpha primitives**; this library pins `reka-ui@2.11.0` and ships regression tests for the wrapping surface).

## Basic usage

Pass recursive data through `items`: node keys come from `id` (`itemKey` can rename it), visible text from `label` (`labelKey`), children from `children` (`childrenKey`). `v-model` holds selected keys and `v-model:expanded` holds expanded keys; without `v-model:expanded` the component keeps the expansion itself, and `defaultExpanded` seeds the initial value.

<demo
    vue="../examples/tree/basic.vue"
    ssg="true"
/>

- **Expansion and selection**: clicking a node toggles both expansion and selection; `ArrowRight` expands a collapsed node and moves focus into its first visible child when already expanded, `ArrowLeft` collapses an expanded node and moves focus back to the parent when collapsed; `ArrowUp` / `ArrowDown` move through visible nodes in expansion order (crossing levels), and `Home` / `End` jump to the first / last visible node. All keys come from the primitive.
- **Disabled**: a node's `disabled: true` disables selection and expansion for that node only; the component-level `disabled` disables the whole tree.
- **Accessible name**: `label` maps to the root `aria-label`; `role="tree"` / `treeitem`, `aria-expanded` / `aria-selected` / `aria-level` / `aria-setsize` / `aria-posinset` are emitted by the wrapper and the primitive together.

## Multiple selection and custom labels

`multiple` enables multiple selection (the root also emits `aria-multiselectable`). The `#label` slot receives `{ item, level, expanded, selected, disabled }` for icons, badges or level-dependent text.

<demo
    vue="../examples/tree/multiple.vue"
    ssg="true"
/>

- `propagateSelect` (default `false`): selecting a parent also selects all descendants (and removes them on deselect); `bubbleSelect` (default `false`): adds the parent to the selection when all descendants are selected, removes it otherwise. Both are optional multiple-selection semantics.
- This wrapper does **not** emit an indeterminate state (`aria-checked="mixed"` / `data-indeterminate`): the primitive only exposes `isIndeterminate` inside its own slot scope, so compose the primitive yourself if you need indeterminate visuals.
- In single mode consumers still receive a **key array** (at most one item); clicking the selected node clears the selection, leaving an empty array.

## Data size and virtualization

- Reka's `TreeVirtualizer` is not enabled, so every visible node is rendered. In production keep visible nodes per level in the hundreds; for thousands, paginate or lazy-load children (the component accepts a new `items` at any time) or compose `TreeVirtualizer` yourself.
- Trade-off: flat rendering keeps `aria-setsize` / `posinset` per level, and keyboard roving costs scale with visible nodes — collapsing a parent removes its whole subtree from rendering.
- Keys must be unique and stable (the field named by `itemKey`); missing keys log a development-time warning and make selection / expansion interfere with each other.

## Accessibility

- The root is `role="tree"`, nodes are `role="treeitem"` with `aria-level`; nodes with children add `aria-expanded`, selection adds `aria-selected`, disabled nodes add `aria-disabled` (`setsize` / `posinset` count siblings at the same level).
- The chevron is **decorative** (`aria-hidden`): expansion is owned by the node itself, so screen readers do not announce a second "expand button".
- Focus uses roving tabindex: only the current node is reachable with Tab, and arrow keys move inside the tree.

## Theming

| Variable | Default | Description |
| --- | --- | --- |
| `--caomei-tree-row-height` | `--caomei-control-height-md` | Minimum row height |
| `--caomei-tree-indent` | `--caomei-space-4` | Indent per level |
| `--caomei-tree-toggle-size` | `1rem` | Width reserved for the chevron |
| `--caomei-tree-selected-bg` | 12% `primary` mix | Selected row background |
| `--caomei-tree-selected-color` | `--caomei-color-primary-text` | Selected row text color |

> For class-based overrides and specificity in general see [Overriding styles downstream](../guide/overriding-styles.md).

<ComponentApi name="tree" />
