# Calendar

A month calendar (wrapping the Reka UI Calendar primitive) for picking a date inline. The public model is a native `Date`.

## Basic usage

Two-way bind with `v-model`; the value is `null` when nothing is selected.

<demo
    vue="../examples/calendar/basic.vue"
    ssg="true"
/>

## Selection range

`minValue` / `maxValue` constrain the selectable dates; dates outside the range render as disabled. `defaultValue` sets the initial preselected date when uncontrolled.

<demo
    vue="../examples/calendar/min-max.vue"
    ssg="true"
/>

## Display and behavior

- `locale` controls month / weekday text and date formatting, defaulting to the library's default locale (`zh-CN`). It is independent of the injected built-in text locale; pass it explicitly when the two must match.
- `weekStartsOn` sets the first day of the week (0 is Sunday); `weekdayFormat` accepts `narrow` / `short` / `long`.
- `fixedWeeks` keeps six rows so the height does not jump between months; `preventDeselect` stops a second click from clearing the selection.
- `disabled` disables the whole calendar; `readonly` keeps it focusable but not changeable.

## Accessibility

- Keyboard accessible: arrow keys move between dates, Enter / Space selects.
- The previous / next buttons take their accessible names from the current locale ("Previous month" / "Next month"), switchable via locale injection.
- The calendar container's accessible name resolves as `label` > forwarded `aria-label` > the current locale's "Calendar" text; when no explicit name is given, Reka's synthesized month context is kept (`Calendar, <month>`).

## Migration from PrimeVue

PrimeVue v4's `Calendar` (a historical alias of `DatePicker` — the same component) covers both the inline calendar and the "input + panel" form; this library splits them: use `CaomeiCalendar` for the inline form and `CaomeiDatePicker` for the input form.

| PrimeVue | This component |
| --- | --- |
| `inline` (inline calendar) | Use `CaomeiCalendar` (this component is the inline form) |
| `minDate` / `maxDate` | `minValue` / `maxValue` |
| `disabled` / `readonly` | Same names |
| `locale` (a **global config** on the PrimeVue side, not a component prop) | `locale` (a prop here; controls the date/calendar language only) |
| — | `weekStartsOn` / `weekdayFormat` / `fixedWeeks` / `preventDeselect`, `pagedNavigation`, `initialFocus` and `label` (accessible name) are new here |

**Not implemented**: `selectionMode`'s `multiple` / `range` (multi-select and range; see §7 and the [Backlog](/plan/backlog), Chinese), `showOtherMonths` / `selectOtherMonths`, `numberOfMonths`, `disabledDates` / `disabledDays` / `maxDateCount`, `view` (month/year views), `showButtonBar`, `responsiveOptions` / `breakpoint`, `showOnFocus` and so on.

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="calendar" />
