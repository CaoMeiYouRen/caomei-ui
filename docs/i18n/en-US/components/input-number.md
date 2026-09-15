# InputNumber

An input number records numeric values and supports range limits, stepping and decimal precision.

## Basic usage

Two-way bind the number with `v-model`; the type is `number | null` (`null` when cleared).

<demo
    vue="../examples/input-number/basic.vue"
    ssg="true"
/>

## Sizes

Switch the size with `size`; supports `sm` / `md` / `lg`.

<demo
    vue="../examples/input-number/sizes.vue"
    ssg="true"
/>

## Range, stepping and precision

`min` / `max` clamp the value on blur and step; `step` controls the increment; `precision` controls the number of decimal places.

> Commit timing: input commits to `v-model` on blur or Enter, and clearing commits `null`.
> `step` must be greater than 0, otherwise it falls back to 1; `precision` must be an integer from 0–20, the same domain as `minFractionDigits` / `maxFractionDigits`: the value feeds `Intl.NumberFormat`, where larger limits require ES2023 Intl v3; out-of-range values are treated as unset and no rounding is applied. Rounding takes effect on blur, Enter, step and Home / End, and rounds by precision before clamping to `min` / `max`.
> When `min` / `max` have more decimal places than `precision`, the committed value is rounded by `precision` and may be slightly below the boundary (it never goes out of range).
> `v-model` changes driven from outside backfill the input immediately.
> `name` is used for native form submission and requires the component to be inside a `<form>`; outside a form no hidden input is rendered.

<demo
    vue="../examples/input-number/step.vue"
    ssg="true"
/>

## Grouping and fraction digits

`useGrouping` (default `true`) controls grouping separators such as thousands separators; `minFractionDigits` / `maxFractionDigits` (integers from 0–20) control the fraction digits used for display and rounding, with `precision` taking precedence over `maxFractionDigits`.

<demo
    vue="../examples/input-number/format.vue"
    ssg="true"
/>

> `useGrouping` defaults to `true` (matching PrimeVue); `minFractionDigits` only pads the display without changing the model, while `maxFractionDigits` also rounds the model to that precision. Non-integers outside 0–20 are treated as unset, and when `minFractionDigits` is greater than `maxFractionDigits` the minimum is dropped to avoid an `Intl` error.
> When `precision` is greater than `maxFractionDigits`, `precision` wins for both display and rounding.
> When the external model or `min` / `max` has more fraction digits than `maxFractionDigits`, the display is rounded to `maxFractionDigits` (for example `max=1.005` displays as `1.01`); the model value is unchanged and always clamped by `min` / `max`.

## States

`disabled` disables, `readonly` makes it read-only, and `invalid` marks a validation failure; `controls="false"` hides the increment/decrement steppers.

<demo
    vue="../examples/input-number/states.vue"
    ssg="true"
/>

## Accessibility

- `label` provides an accessible name when there is no visible label and maps to `aria-label`. Use this prop; passing a native `aria-label` directly will be overridden by the component.
- When `invalid`, it outputs `aria-invalid="true"`.
- The input is `role="spinbutton"` and supports arrow-key steps, PageUp / PageDown for tenfold steps, and Home / End to jump to `min` / `max`; `min` / `max` map to `aria-valuemin` / `aria-valuemax`.
- The steppers use built-in localized labels (increase / decrease), overridable via `increaseLabel` / `decreaseLabel`; they are disabled automatically at `min` / `max` and support press-and-hold continuous stepping.
- `class` lands on the root element; native attributes such as `required` are forwarded to the inner `input`.

## Events and exposed API

Besides `update:modelValue` (committed on blur or Enter), it also provides `focus`, `blur` and `change` (payload is the normalized `number | null`, fired on blur, Enter and stepper clicks); `focus()` / `blur()` and the inner `inputRef` are exposed via `defineExpose`.

> Arrow-key / PageUp / PageDown stepping also updates `v-model` but does not fire `change` separately (`change` fires only at the commit points above).

> Width: `width: 100%` by default, with an overridable `max-width` set by `--caomei-input-number-max-width` (see [Theming and styles §4.1](/design/theming), Chinese); set the variable to `none` to fill its column.

<ComponentApi name="input-number" />
