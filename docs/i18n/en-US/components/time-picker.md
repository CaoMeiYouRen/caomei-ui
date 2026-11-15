# TimePicker

TimePicker records a time of day: minutes by default, optionally seconds, with 12 / 24-hour cycles and stepping.

## Basic usage

`v-model` is `Date | null`: only hours / minutes / seconds are used, while the date part is just a carrier (editing preserves the current date; an empty value starts from today). `label` is both the visible label and the accessible name; override it with `ariaLabel`.

<demo
    vue="../examples/time-picker/basic.vue"
    ssg="true"
/>

## Precision and hour cycle

- `showSeconds`: defaults to `false` (minutes only); when enabled a seconds input appears. Turning it off zeroes the seconds on the **next edit**; until then the model keeps the original seconds.
- `hourFormat`: `'24'` (default) or `'12'`; in 12-hour mode the hour input ranges 1–12 and a localized day-period select (AM / PM) is provided.
- `step`: `{ hour?, minute?, second? }`, applied to both the native `step` attribute and the arrow keys; defaults to 1 per segment.
- In 12-hour mode the arrow keys wrap over the 24-hour value: pressing ↑ at 11 AM yields 12 PM (the day period switches with it).

## Bounds and empty state

- `minValue` / `maxValue` take a `Date` and compare only the time part; edits are clamped into the range. `minValue > maxValue` (an overnight range) is treated as unsatisfiable and is not clamped.
- `null` and invalid dates render empty inputs instead of reading as 00:00.
- `disabled` / `readonly` apply to the inputs and the day-period select; in read-only mode neither keyboard nor the select can change the value.

## Accessibility

- The container is `role="group"` named by `label` / `ariaLabel`; the default rendering has hour / minute inputs, and enabling `showSeconds` adds a seconds input.
- The day-period control is a native `<select>` whose options use the current locale.
- The read-only select exposes `aria-readonly` and blocks changes at the interaction layer.

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-time-picker-height` | `--caomei-control-height-md` | Minimum field height |
| `--caomei-time-picker-padding-inline` | `--caomei-space-2` | Field inline padding |
| `--caomei-time-picker-border` | `--caomei-color-border` | Border color |
| `--caomei-time-picker-radius` | `--caomei-radius-md` | Corner radius |
| `--caomei-time-picker-bg` | `--caomei-color-bg` | Background |
| `--caomei-time-picker-color` | `--caomei-color-text` | Text color |

## Migration from PrimeVue

| PrimeVue `DatePicker` (`timeOnly`) | This component |
| --- | --- |
| `timeOnly` + `hourFormat` | A standalone `TimePicker`; same-named `hourFormat` (`'12'` / `'24'`); no `timeOnly` switch needed |
| `showSeconds` | Same name |
| `stepMinute` / `stepHour` / `stepSecond` | Merged into the `step` object |
| `minDate` / `maxDate` | `minValue` / `maxValue` (time part only) |
| `v-model` is a `Date` | Same-named `Date \| null` |
| Panel-based picking | Inline three-segment inputs, no popup |

> See [Migration from PrimeVue](/en-US/guide/primevue-migration) for the general process and pitfalls.

<ComponentApi name="time-picker" />
