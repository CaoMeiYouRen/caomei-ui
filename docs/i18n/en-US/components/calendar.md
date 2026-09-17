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

<ComponentApi name="calendar" />
