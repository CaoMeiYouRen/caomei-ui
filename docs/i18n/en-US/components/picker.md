# Picker

A general wheel picker: one or more columns of options scroll inside a fixed-height area and snap to the nearest row when they stop. It **shares the wheel interaction with `TimePicker`'s wheel mode** (snapping, momentum settle, arrow keys, programmatic alignment) with arbitrary data.

## Basic usage

`v-model` is an array aligned with `columns` (a single column is an array of length one). Before any interaction each column falls back to its first option but **does not write it to the model** — only user interaction writes back.

<demo
    vue="../examples/picker/basic.vue"
    ssg="true"
/>

## Multiple columns and looping

Columns scroll independently (no cascading reset); with `loop` the arrow keys and clicks wrap between the first and last option.

<demo
    vue="../examples/picker/multi.vue"
    ssg="true"
/>

## Interaction and accessibility

- **Snapping and momentum**: `scroll-snap-type: y mandatory` handles the visual snap; the logic takes `round(scrollTop / rowHeight)` 140ms after scrolling stops, which is also the path for touch inertia.
- **Programmatic alignment**: changing the value scrolls the selected row to the centre and ignores scroll events for the next 200ms so alignment is never mistaken for a user choice.
- **Loop boundary**: `loop` applies to **keyboard and clicks** only (wrap-around); scrolling is not infinite, because infinite scrolling requires duplicated option sets at both ends and decouples `scrollTop` from the current value.
- **Keyboard**: each column is a `role="listbox"` and a single Tab stop; `↑` / `↓` move one row, `PageUp` / `PageDown` five, `Home` / `End` jump to the ends.
- **Disabled and read-only**: `disabled` / `readonly` stop settle detection, keyboard and clicks.
- **Row height contract**: `itemHeight` (36 by default) must match the CSS row height (`--caomei-picker-item-height` derives from the prop), otherwise landing positions drift.

## Props

| Component | Main props |
|------|------|
| `CaomeiPicker` | `v-model`, `columns`, `disabled`, `readonly`, `loop`, `itemHeight`, `visibleCount`, `label` |
| `CaomeiPickerColumn` | `options`, `modelValue`, `label`, `disabled`, `readonly`, `loop`, `itemHeight`, `visibleCount` |

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-picker-border` | `--caomei-color-border` | Group border |
| `--caomei-picker-bg` | `--caomei-color-bg` | Group background |
| `--caomei-picker-column-width` | `6rem` | Width of one column |
| `--caomei-picker-item-height` | derived from `itemHeight` | Row height, must match the prop |

<ComponentApi name="picker" />
