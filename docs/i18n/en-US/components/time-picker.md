# TimePicker

TimePicker records a time of day: hours / minutes / seconds with zero padding by default (`09:30:00`), plus 12 / 24-hour cycles, a padding switch and stepping.

## Basic usage

`v-model` is `Date | null`: only hours / minutes / seconds are used, while the date part is just a carrier (editing preserves the current date; an empty value starts from today). `label` is both the visible label and the accessible name; override it with `ariaLabel`. Seconds and zero padding are on by default; pass `:show-seconds="false"` for minute precision.

<demo
    vue="../examples/time-picker/basic.vue"
    ssg="true"
/>

## Upgrade note

This release changes the `showSeconds` default to `true` and narrows the field's default width from the selector family's `20rem` to a time-content tier. Both are display-default adjustments, not treated as breaking changes; pass `:show-seconds="false"` for the old precision, or use `--caomei-time-picker-max-width` to restore the width you need. `pad` is a new switch, on by default.

## Picker modes

- `mode="input"` (default): inline hour / minute / second fields edited directly by keyboard; no wheel entry.
- `mode="wheel"`: a read-only display; clicking anywhere in the field opens the wheel popover. Columns support touch / mouse scrolling and the ↑↓, PageUp / PageDown, Home / End keys (↑ previous, ↓ next, matching the scroll direction).
- `mode="both"`: keeps the inline fields and adds a wheel entry at the **right edge** of the field; both share the same controlled value, but their arrow keys differ (inline fields increment / decrement values, wheel columns move to the previous / next row).

All three modes share one field shell and segment layout: the height, inline padding, radius, font size, segment width and segment origin stay identical, and each colon sits exactly between its neighbouring digits. The `wheel` / `both` chevron sits on the field's right edge, and the panel is anchored to the **whole field**, opening from its left edge instead of drifting with an inner button.

Wheel selection keeps the `minValue` / `maxValue` clamp, `showSeconds`, `pad` and the 12-hour day period. `step` is an increment hint, not a validity constraint: typing or scrolling can still land on any value (wheel columns are not filtered by `step`).

<demo
    vue="../examples/time-picker/modes.vue"
    ssg="true"
/>

## Precision and hour cycle

- `showSeconds`: defaults to `true` (hours / minutes / seconds); pass `:show-seconds="false"` for minute precision. Turning it off zeroes the seconds on the **next edit**; until then the model keeps the original seconds.
- `pad`: defaults to `true`, zero-padding each segment (`09:30:00`); pass `false` for natural numbers (`9:30:0`). The inline fields and wheel columns share the switch.
- `hourFormat`: `'24'` (default) or `'12'`; in 12-hour mode the hour input ranges 1–12 and a localized day-period select (AM / PM) is provided.
- `step`: `{ hour?, minute?, second? }`, applied to the arrow keys; defaults to 1 per segment. Typing is not filtered by the step.
- In 12-hour mode the **inline input** arrow keys wrap over the 24-hour value: pressing ↑ at 11 AM yields 12 PM (the day period switches with it). Wheel columns do not follow this rule (↑↓ move to the previous / next row).

## Bounds and empty state

- `minValue` / `maxValue` take a `Date` and compare only the time part; edits are clamped into the range. `minValue > maxValue` (an overnight range) is treated as unsatisfiable and is not clamped.
- `null` and invalid dates render empty inputs instead of reading as 00:00.
- `disabled` / `readonly` apply to the inputs and the day-period select; in read-only mode neither keyboard nor the select can change the value.

## Accessibility

- The container is `role="group"` named by `label` / `ariaLabel`; the default rendering has hour / minute / second inputs, and `showSeconds={false}` falls back to hour / minute.
- The day-period control is a native `<select>` whose options use the current locale.
- The read-only select exposes `aria-readonly` and blocks changes at the interaction layer; the `wheel` / `both` entry still opens for viewing, while wheel columns are not focusable and cannot change.
- Each wheel column is a `role="listbox"` named by the localized hour / minute / second label; options are `role="option"` with `aria-selected`, and `aria-activedescendant` follows the selection. Under `readonly` / `disabled` the columns are not focusable and expose `aria-disabled` / `aria-readonly`.

## Style customization

Time text has a predictable length, so the default width only reserves room for the time itself (with seconds `11.5rem`, minutes only `8.5rem`, plus `3.75rem` for the 12-hour period) and **no longer inherits the selector family's `20rem`**. The field still declares `width: 100%` and shrinks in narrow containers; to align with other form controls or fill the column, override `--caomei-time-picker-max-width` to `100%` (or `none`).

```css
/* align with Select / Input in the same column */
.caomei-time-picker {
  --caomei-time-picker-max-width: 100%;
}
```

The touch density axis still scales height and font size; the default content width stays unchanged. See [Touch density axis](/en-US/guide/mobile#touch-density-axis-and-size-overrides).

| Variable | Default | Description |
|------|------|------|
| `--caomei-time-picker-height` | `--caomei-control-height-md` | Minimum field height |
| `--caomei-time-picker-max-width` | Content tier (seconds `11.5rem` / minutes `8.5rem` / +`3.75rem` for 12-hour) | Field width cap; override to `100%` or `none` to align with other form controls |
| `--caomei-time-picker-padding-inline` | `--caomei-space-2` | Field inline padding (symmetric) |
| `--caomei-time-picker-segment-width` | `2.25rem` | Segment width shared by inputs and wheel display |
| `--caomei-time-picker-separator-width` | `0.75rem` | Colon column width (centred between neighbouring digits) |
| `--caomei-time-picker-period-width` | `3.75rem` | Day-period select width in 12-hour mode |
| `--caomei-time-picker-border` | `--caomei-color-border` | Border color |
| `--caomei-time-picker-radius` | `--caomei-radius-md` | Corner radius |
| `--caomei-time-picker-bg` | `--caomei-color-bg` | Background |
| `--caomei-time-picker-color` | `--caomei-color-text` | Text color |
| `--caomei-time-picker-trigger-size` | `1.5rem` | Wheel entry button size in `both` mode |
| `--caomei-time-picker-wheel-item-height` | `2.25rem` | Wheel row height (also the panel height and snap step) |
| `--caomei-time-picker-wheel-column-width` | `3.25rem` | Wheel column width |
| `--caomei-time-picker-z-index` | `--caomei-z-dropdown` | Wheel panel layer |

## Migration from PrimeVue

| PrimeVue `DatePicker` (`timeOnly`) | This component |
| --- | --- |
| `timeOnly` + `hourFormat` | A standalone `TimePicker`; same-named `hourFormat` (`'12'` / `'24'`); no `timeOnly` switch needed |
| `showSeconds` | Same name; this component defaults to `true` (seconds included); disable explicitly for minute precision |
| `pad` | New here: defaults to `true` for zero padding |
| `stepMinute` / `stepHour` / `stepSecond` | Merged into the `step` object |
| `minDate` / `maxDate` | `minValue` / `maxValue` (time part only) |
| `v-model` is a `Date` | Same-named `Date \| null` |
| Panel-based picking | Inline inputs by default; use `mode="wheel"` or `mode="both"` for the wheel popover |

> See [Migration from PrimeVue](/en-US/guide/primevue-migration) for the general process and pitfalls.

<ComponentApi name="time-picker" />
