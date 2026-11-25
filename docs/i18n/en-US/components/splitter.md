# Splitter

Splitter divides an area into draggable panes, wrapping Reka UI's `SplitterGroup` / `SplitterPanel` / `SplitterResizeHandle` with horizontal and vertical layouts, size constraints, collapsing and nesting.

## Basic usage

`CaomeiSplitter` is the container, `CaomeiSplitterPanel` a pane, and `CaomeiSplitterResizeHandle` sits between panes. Pane order follows markup order; `defaultSize` / `minSize` / `maxSize` are percentages.

The container defaults to `width/height: 100%`, so **the parent needs a definite height** (or set a height on the splitter itself); otherwise a vertical split collapses to its content height.

<demo
    vue="../examples/splitter/basic.vue"
    ssg="true"
/>

## Vertical layout

`direction="vertical"` splits top and bottom; the separator orientation, drag cursor and `aria-orientation` follow.

<demo
    vue="../examples/splitter/vertical.vue"
    ssg="true"
/>

## Nested splitters

Splitters nest: put an inner splitter inside an outer pane and the two drag independently. Pane content adapts to the container while the pane itself scrolls with `overflow: auto`.

<demo
    vue="../examples/splitter/nested.vue"
    ssg="true"
/>

## Controlled layout

`v-model:layout` is the percentage array of panes (summing to about 100): it is applied on mount and re-applied when written from outside; dragging, keyboard resizing and collapsing write back, and out-of-range values are clamped by `minSize` / `maxSize` before writing back. With `autoSaveId` the controlled value wins.

<demo
    vue="../examples/splitter/controlled.vue"
    ssg="true"
/>

## Keyboard and accessibility

- The separator is `role="separator"`, named by `label` (defaulting to the locale's "Resize panels"); `aria-orientation` is the opposite of the split direction (a horizontal split reports `vertical`).
- After focusing a separator, arrow keys resize by `keyboardResizeBy` (10% by default); `Enter` collapses or expands a collapsible pane.
- With `disabled` the handle gets `tabindex="-1"` and ignores dragging and keys.
- The line is 3px visually with a 13px hit area that does not affect layout.

## Subcomponent props

| Component | Main props |
|------|------|
| `CaomeiSplitter` | `direction` (`horizontal` / `vertical`), `keyboardResizeBy`, `autoSaveId`, `v-model:layout` |
| `CaomeiSplitterPanel` | `defaultSize`, `minSize`, `maxSize`, `collapsible`, `collapsedSize` |
| `CaomeiSplitterResizeHandle` | `label`, `disabled` |

> `CaomeiSplitter` also exposes `resize(sizes: number[])` for imperative sizing. Adding or removing panes redistributes the layout from `defaultSize`; previous ratios are not inherited.

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-splitter-handle-bg` | `--caomei-color-border` | Separator color |
| `--caomei-splitter-handle-z-index` | `--caomei-z-raise` | Separator stacking |
| `--caomei-splitter-grip-bg` | 60% of the muted text color | Grip color in the middle of the line |
| `--caomei-splitter-grip-size` | `3px` | Grip thickness |
| `--caomei-splitter-grip-length` | `1.5rem` | Grip length |

<ComponentApi name="splitter" />
