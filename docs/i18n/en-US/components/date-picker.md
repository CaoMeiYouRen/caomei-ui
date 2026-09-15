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
- `minValue` / `maxValue` constrain selectable dates; `closeOnSelect` (default `true`) controls whether the panel closes after a pick.
- The open state supports `v-model:open`; `showIcon` toggles the calendar icon.
- `locale` controls the calendar and date language, defaulting to the library's default locale (`zh-CN`). It is independent of the injected built-in text locale; pass it explicitly when the two must match.

## Accessibility

- The trigger is a `button` with `aria-expanded`. When there is no visible text (date / placeholder), `label` or the current locale's "Date" text is used as the accessible name.
- Native attributes such as `class` / `style` / `id` / `data-*` / `title` land on the trigger `<button>`, which helps external layout and `<label for>` association. `aria-label` is managed via the `label` prop (not added when `label` is omitted and visible text exists), `aria-invalid` via `invalid`, and `type` is fixed to `button`.
- The calendar inside the panel inherits the keyboard and accessibility behavior of [Calendar](./calendar). Esc closes the panel.
- When `invalid`, it outputs `aria-invalid="true"`.

> Migration map: PrimeVue `show-icon` → `showIcon`; `icon-display="input"` matches this component's default (icon inside the trigger); `date-format` → `dateFormat`; `show-time` → `showTime`; `hour-format` → `hourFormat`; `show-seconds` → `showSeconds`; `fluid` is full width by default, so drop it when migrating. Range selection (`selection-mode`) is not implemented; see the [todo list](/plan/todo) (Chinese).

<ComponentApi name="date-picker" />
