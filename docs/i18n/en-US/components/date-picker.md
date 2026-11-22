# DatePicker

A date picker made of a trigger button plus a calendar panel: click the trigger to open the calendar, and the selected date is shown using `dateFormat`. The public model uses native `Date`; with `selectionMode="range"` it is a closed `[Date, Date]` interval.

## Upgrade note

This release changes the trigger's default width from the selector family's `20rem` to date-content tiers (date `12rem` / with time `15rem` / range `18rem`). This is a display-default adjustment, not treated as a breaking change; override `--caomei-date-picker-max-width` for the old width or to align with other form controls.

## Basic usage

Two-way bind with `v-model`; `placeholder` is shown while nothing is selected.

<demo
    vue="../examples/date-picker/basic.vue"
    ssg="true"
/>

## Display format

`dateFormat` accepts PrimeVue-style tokens: `yyyy` / `yy` for the year, `mm` / `m` for the numeric month, `MM` / `M` for month names, `dd` / `d` for the day, and `DD` / `D` for weekday names. When omitted, a localized short date is produced from `locale`.

<demo
    vue="../examples/date-picker/format.vue"
    ssg="true"
/>

## Time selection

With `showTime`, a time input (hour / minute) is shown at the bottom of the panel; `hourFormat` switches between `12` and `24`-hour cycles (defaults to the `locale` convention: `12` for `en-US`, `24` for the other built-in locales), and `showSeconds` refines to seconds. When time selection is on, picking a date does not close the panel so the time can be edited next; the time inputs are disabled until a date is selected; the time text follows `locale`.

<demo
    vue="../examples/date-picker/datetime.vue"
    ssg="true"
/>

## Month / year selection

`selectionMode="month"` / `"year"` swaps the panel for a month or year grid; the value is still a native `Date`, **normalized** to the granularity: a month writes back the 1st at 00:00, a year writes back January 1st at 00:00 (local time zone). The panel closes after a pick when `closeOnSelect` applies.

<demo
    vue="../examples/date-picker/granular.vue"
    ssg="true"
/>

- `minValue` / `maxValue` compare at month / year granularity: out-of-range options are disabled and cannot be picked.
- Keyboard: arrow keys move within the grid (±1 horizontally, ±3 vertically, stopping at the first / last item instead of wrapping), `Home` / `End` jump to the first / last enabled option and disabled options are skipped; the year grid also pages with ‹ › (12 years per page); the grid is a `listbox` (`aria-readonly` carries the read-only state) and options use `aria-selected`.
- Display: by default the locale renders "month year" / "year"; an explicit `dateFormat` wins (`yyyy-mm` renders `2026-09`).
- **Deselect is not supported**: clicking the selected month / year again does not clear it, and `preventDeselect` only applies to `single`.
- **`showTime` is not supported**: the granularity is coarser than a day, the time layer is ignored with a dev warning; the default width step is 13rem.

## Range selection

Set `selectionMode="range"` to pick an interval; `v-model` becomes `[Date, Date]` (start, end) and `null` when nothing is selected. Click a start date and then an end date to complete the range; `closeOnSelect` (default `true`) closes the panel once both ends exist. A half-open selection (start only) is never emitted; the panel keeps it so the end can be chosen next. Clearing has three cases: with a complete range, clicking any date restarts the selection from that date (the trigger keeps showing the old range until the end is chosen); when the range is a single day (`[d, d]`), clicking that day again clears it and emits `null`; `preventDeselect` disables clearing.

<demo
    vue="../examples/date-picker/range.vue"
    ssg="true"
/>

- `dateFormat` applies to both ends, rendered as `start – end` (the separator is fixed to ` – `); `minValue` / `maxValue` apply to each end independently.
- `selectionMode` is a runtime prop, so the static type of `v-model` is `Date | [Date, Date] | null`; single-date consumers should declare that union (not just `Date | null`), otherwise type checking fails on write-back.
- `showTime` / `showSeconds` / `hourFormat` are **not supported**: a range carries dates only. Passing `showTime` ignores the time layer and logs a development warning. For a time range, place two single-date pickers side by side.
- `multiple` is not implemented (no downstream use case).

## States and behavior

- `disabled` / `readonly` / `invalid` / `size` behave as in the Input family.
- Width: `width: 100%` by default, with an overridable `max-width` from `--caomei-date-picker-max-width`. Date text has a predictable length, so when unset it caps by content tier (date `12rem`, with time `15rem`, range `18rem`) instead of inheriting the selector family's `20rem`. To align with other form controls or fill the column, set that variable to `100%` or `none`; adjust it as well when a custom `dateFormat` is clearly longer (see [Theming and styles §4.1](/design/theming), Chinese).
- `minValue` / `maxValue` constrain selectable dates; `closeOnSelect` (default `true`) controls whether the panel closes after a pick.
- The open state supports `v-model:open`; `showIcon` toggles the calendar icon.
- `locale` controls the calendar and date language and **defaults to the locale injected by `ConfigProvider` / `provideLocale`**; an explicit prop still wins. The defaults of `weekdayFormat` and `hourFormat` follow the same locale.

On touch devices, set `data-density="touch"` on an ancestor to enlarge control heights, font sizes and content-width caps in that subtree. The density axis is orthogonal to the `size` tiers; see [Touch density axis](/en-US/guide/mobile#touch-density-axis-and-size-overrides).

## Accessibility

- The trigger is a `button` with `aria-expanded`. Its accessible name resolves as `label` > forwarded `aria-label` > the current locale's "Date" text (`"Date range"` in range mode); when none applies (visible date text or a placeholder is present) no `aria-label` is added.
- With a selected range and no explicit `label` or forwarded `aria-label`, no `aria-label` is output: the name is the visible range text plus the hidden hint "(start / end)" inside the trigger (Label in Name). An explicit `label` / forwarded `aria-label` still takes priority as described above.
- Native attributes such as `class` / `style` / `id` / `data-*` / `title` land on the trigger `<button>`, which helps external layout and `<label for>` association. `aria-label` comes from the `label` prop together with a forwarded `aria-label` (see above), `aria-invalid` from `invalid`, and `type` is fixed to `button`.
- The calendar inside the panel inherits the keyboard and accessibility behavior of [Calendar](./calendar). Esc closes the panel. In range mode the endpoints carry `data-selection-start` / `data-selection-end`, and days inside the range use a light band.
- When `invalid`, it outputs `aria-invalid="true"`.

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-date-picker-max-width` | Content tier (date `12rem` / with time `15rem` / range `18rem`) | Maximum trigger width; override to `100%` or `none` to align with other form controls |

```css
.caomei-date-picker {
    --caomei-date-picker-max-width: none;
}
```

## Migration from PrimeVue

PrimeVue v4 uses a single `DatePicker` (`Calendar` being its historical alias) for both the inline and input forms; here the input form is `CaomeiDatePicker` (trigger + panel), and the inline calendar is `CaomeiCalendar`.

| PrimeVue | This component |
| --- | --- |
| `modelValue` (`Date`) | `v-model` (native `Date`, same semantics) |
| `selection-mode="range"` | `selectionMode="range"`; `v-model` becomes `[Date, Date]` (`null` when empty). `multiple` is not implemented |
| `manual-input="false"` | No mapping needed: this component is always "trigger button + panel" and does not support typing |
| `minDate` / `maxDate` | `minValue` / `maxValue` |
| `dateFormat` | `dateFormat` (PrimeVue-style tokens; defaults to a localized short date from `locale`) |
| `showIcon` / `iconDisplay="input"` | `showIcon` (this component is a "trigger button + panel" by default) |
| `showTime` / `hourFormat` / `showSeconds` | Same names |
| `disabled` / `readonly` / `invalid` / `placeholder` | Same names |
| `locale` (a **global config** on the PrimeVue side, not a component prop) | `locale` (a prop here; defaults to the injected locale, explicit value wins) |
| `fluid` | Drop it: the width caps by date content by default; set `--caomei-date-picker-max-width` to `100%` / `none` to align with other form controls or go truly full width (see [Theming and styles §4.1](/design/theming), Chinese) |
| `inputId` | `id`; `aria-label` → `label` |

**Intentional differences**: PrimeVue's `Calendar` is a typeable input, while this component is a "trigger button + panel" and **does not support typing a date** (confirm there is no typing dependency before migrating); `locale` defaults to the injected locale and, when passed, overrides only the date/calendar language; in range mode the static `v-model` type is `Date | [Date, Date] | null`, so single-date pages migrated from PrimeVue need their binding type widened to that union.

**Not implemented**: the `multiple` value of `selectionMode` (no downstream use case, no Backlog entry), `numberOfMonths`, the other `view` values (`date` / `datetime`, etc.), `showOtherMonths` / `selectOtherMonths`, `disabledDates` / `disabledDays`, the button bar (`showButtonBar` / `today`), `responsiveOptions` / `breakpoint`, time stepping (`timeOnly` / `stepHour`), `appendTo` and panel style forwarding; `range` and `showTime` cannot be combined (see "Range selection").

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="date-picker" />
