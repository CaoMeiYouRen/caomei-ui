# DatePicker

A date picker made of a trigger button plus a calendar panel: click the trigger to open the calendar, and the selected date is shown using `dateFormat`. The public model is a native `Date`.

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

With `showTime`, a time input (hour / minute) is shown at the bottom of the panel; `hourFormat` switches between `12` and `24`-hour cycles, and `showSeconds` refines to seconds. When time selection is on, picking a date does not close the panel so the time can be edited next; the time inputs are disabled until a date is selected; the time text follows `locale`.

<demo
    vue="../examples/date-picker/datetime.vue"
    ssg="true"
/>

## States and behavior

- `disabled` / `readonly` / `invalid` / `size` behave as in the Input family.
- Width: `width: 100%` by default, with an overridable `max-width` from `--caomei-date-picker-max-width` (falling back to `--caomei-select-max-width`, default `20rem`; see [Theming and styles §4.1](/design/theming), Chinese). To fill its column, set that variable to `none` on the element or an ancestor.
- `minValue` / `maxValue` constrain selectable dates; `closeOnSelect` (default `true`) controls whether the panel closes after a pick.
- The open state supports `v-model:open`; `showIcon` toggles the calendar icon.
- `locale` controls the calendar and date language, defaulting to the library's default locale (`zh-CN`). It is independent of the injected built-in text locale; pass it explicitly when the two must match.

## Accessibility

- The trigger is a `button` with `aria-expanded`. Its accessible name resolves as `label` > forwarded `aria-label` > the current locale's "Date" text; when none applies (visible date text or a placeholder is present) no `aria-label` is added.
- Native attributes such as `class` / `style` / `id` / `data-*` / `title` land on the trigger `<button>`, which helps external layout and `<label for>` association. `aria-label` comes from the `label` prop together with a forwarded `aria-label` (see above), `aria-invalid` from `invalid`, and `type` is fixed to `button`.
- The calendar inside the panel inherits the keyboard and accessibility behavior of [Calendar](./calendar). Esc closes the panel.
- When `invalid`, it outputs `aria-invalid="true"`.

> Migration map: PrimeVue `show-icon` → `showIcon`; `icon-display="input"` matches this component's default (icon inside the trigger); `date-format` → `dateFormat`; `show-time` → `showTime`; `hour-format` → `hourFormat`; `show-seconds` → `showSeconds`; `fluid` (fill the container width) is dropped when migrating, and true full width is obtained by setting `--caomei-date-picker-max-width` to `none` (the default cap is `20rem`). Range selection (`selection-mode`) is not implemented: it has no downstream usage and was deferred by user decision; see the [backlog](/plan/backlog) (Chinese).

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-date-picker-max-width` | `--caomei-select-max-width` | Maximum trigger width |

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
| `minDate` / `maxDate` | `minValue` / `maxValue` |
| `dateFormat` | `dateFormat` (PrimeVue-style tokens; defaults to a localized short date from `locale`) |
| `showIcon` / `iconDisplay="input"` | `showIcon` (this component is a "trigger button + panel" by default) |
| `showTime` / `hourFormat` / `showSeconds` | Same names |
| `disabled` / `readonly` / `invalid` / `placeholder` | Same names |
| `locale` (a **global config** on the PrimeVue side, not a component prop) | `locale` (a prop here; controls the date/calendar language only) |
| `fluid` | Drop it: a `20rem` cap applies by default; set `--caomei-date-picker-max-width` to `none` for true full width (see [Theming and styles §4.1](/design/theming), Chinese) |
| `inputId` | `id`; `aria-label` → `label` |

**Intentional differences**: PrimeVue's `Calendar` is a typeable input, while this component is a "trigger button + panel" and **does not support typing a date** (confirm there is no typing dependency before migrating); `locale` only controls the date/calendar language and is independent of the built-in text language — pass it explicitly when they must match.

**Not implemented**: `selectionMode` (`multiple` / `range`; see §7 and the [Backlog](/plan/backlog), Chinese), `numberOfMonths`, `view`, `showOtherMonths` / `selectOtherMonths`, `disabledDates` / `disabledDays`, the button bar (`showButtonBar` / `today`), `responsiveOptions` / `breakpoint`, time stepping (`timeOnly` / `stepHour`), `appendTo` and panel style forwarding.

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="date-picker" />
