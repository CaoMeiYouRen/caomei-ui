# TimePicker

TimePicker records a time of day: minutes by default, optionally seconds, with 12 / 24-hour cycles and stepping.

## Basic usage

`v-model` is `Date | null`: only hours / minutes / seconds are used, while the date part is just a carrier (editing preserves the current date; an empty value starts from today). `label` is both the visible label and the accessible name; override it with `ariaLabel`.

<demo
    vue="../examples/time-picker/basic.vue"
    ssg="true"
/>

## Picker modes

- `mode="input"` (default): inline hour / minute fields (plus seconds with `showSeconds`), edited directly by keyboard.
- `mode="wheel"`: a read-only display that opens a wheel popover on click; columns support touch / mouse scrolling and the ↑↓, PageUp / PageDown, Home / End keys (↑ previous, ↓ next, matching the scroll direction).
- `mode="both"`: keeps the inline fields and adds a wheel entry at the end of the field; both share the same controlled value, but their arrow keys differ (inline fields increment / decrement values, wheel columns move to the previous / next row).

Wheel selection keeps the `minValue` / `maxValue` clamp, `showSeconds` and the 12-hour day period. The default stays `input`, so existing appearance and interaction do not change on upgrade. `step` is an increment hint, not a validity constraint: typing or scrolling can still land on any value (wheel columns are not filtered by `step`).

<demo
    vue="../examples/time-picker/modes.vue"
    ssg="true"
/>

## Precision and hour cycle

- `showSeconds`: defaults to `false` (minutes only); when enabled a seconds input appears. Turning it off zeroes the seconds on the **next edit**; until then the model keeps the original seconds.
- `hourFormat`: `'24'` (default) or `'12'`; in 12-hour mode the hour input ranges 1–12 and a localized day-period select (AM / PM) is provided.
- `step`: `{ hour?, minute?, second? }`, applied to both the native `step` attribute and the arrow keys; defaults to 1 per segment.
- In 12-hour mode the **inline input** arrow keys wrap over the 24-hour value: pressing ↑ at 11 AM yields 12 PM (the day period switches with it). Wheel columns do not follow this rule (↑↓ move to the previous / next row).

## Bounds and empty state

- `minValue` / `maxValue` take a `Date` and compare only the time part; edits are clamped into the range. `minValue > maxValue` (an overnight range) is treated as unsatisfiable and is not clamped.
- `null` and invalid dates render empty inputs instead of reading as 00:00.
- `disabled` / `readonly` apply to the inputs and the day-period select; in read-only mode neither keyboard nor the select can change the value.

## Accessibility

- The container is `role="group"` named by `label` / `ariaLabel`; the default rendering has hour / minute inputs, and enabling `showSeconds` adds a seconds input.
- The day-period control is a native `<select>` whose options use the current locale.
- The read-only select exposes `aria-readonly` and blocks changes at the interaction layer; the `wheel` / `both` entry still opens for viewing, while wheel columns are not focusable and cannot change.
- Each wheel column is a `role="listbox"` named by the localized hour / minute / second label; options are `role="option"` with `aria-selected`, and `aria-activedescendant` follows the selection. Under `readonly` / `disabled` the columns are not focusable and expose `aria-disabled` / `aria-readonly`.

## Style customization

The field is `width: 100%` by default with an overridable width cap: `--caomei-time-picker-max-width` falls back to `--caomei-select-max-width` (`20rem`) when unset. To fill its column, set that variable to `none` on the element or an ancestor. Under `data-density="touch"` the fallback cap is released like the other selectors; see [Touch density axis](/en-US/guide/mobile#touch-density-axis-and-size-overrides).

| Variable | Default | Description |
|------|------|------|
| `--caomei-time-picker-height` | `--caomei-control-height-md` | Minimum field height |
| `--caomei-time-picker-max-width` | `--caomei-select-max-width` (`20rem`) | Field width cap; override to `none` to fill the column |
| `--caomei-time-picker-padding-inline` | `--caomei-space-2` | Field inline padding |
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
| `showSeconds` | Same name |
| `stepMinute` / `stepHour` / `stepSecond` | Merged into the `step` object |
| `minDate` / `maxDate` | `minValue` / `maxValue` (time part only) |
| `v-model` is a `Date` | Same-named `Date \| null` |
| Panel-based picking | Inline inputs by default; use `mode="wheel"` or `mode="both"` for the wheel popover |

> See [Migration from PrimeVue](/en-US/guide/primevue-migration) for the general process and pitfalls.

<ComponentApi name="time-picker" />
