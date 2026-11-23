# Statistic

Large numeric display: precision, thousands separators, prefix / suffix and a loading state. It is a display component with no count-up animation; empty and invalid input fall back to a placeholder instead of silently becoming `0`.

## Basic usage

<demo
    vue="../examples/statistic/basic.vue"
    ssg="true"
/>

```vue
<CaomeiStatistic label="Monthly revenue" :value="1234567.891" :precision="2" prefix="$" suffix="USD" />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number \| string \| null` | `null` | Value; numeric strings are parsed, while empty or non-numeric strings, `NaN`, `Infinity` and `undefined` render `placeholder` |
| `precision` | `number` | — | Decimal places (0 ~ 20); when omitted the value keeps its own decimals, and non-integer or out-of-range values are treated as absent |
| `groupSeparator` | `string` | `,` | Thousands separator; pass an empty string to disable grouping |
| `decimalSeparator` | `string` | `.` | Decimal point |
| `prefix` | `string` | — | Value prefix (such as a currency symbol), read together with the value |
| `suffix` | `string` | — | Value suffix (such as a unit), read together with the value |
| `label` | `string` | — | **Visible label** (unlike this library's Input / Select, where `label` only provides the accessible name); when provided, it (or the `label` slot content) names the value region |
| `loading` | `boolean` | `false` | Loading state: hides the value region's content (prefix and suffix included) behind a skeleton and marks the value region `aria-busy` |
| `placeholder` | `string` | `--` | Placeholder for empty values |
| `size` | `'sm' \| 'md' \| 'lg'` | `md` | Size step |
| `as` | `'div' \| 'span'` | `div` | Root element tag |

## Slots

| Slot | Description |
| --- | --- |
| `label` | Custom label content (wins over `label`) |
| `prefix` | Custom prefix (wins over `prefix`) |
| `suffix` | Custom suffix (wins over `suffix`) |

## Loading and empty values

- The loading state replaces only the value region's content (prefix and suffix text included): the skeleton is `aria-hidden`, the value region keeps `aria-busy="true"`, and the label stays in the reading order so screen readers never announce a fake number.
- Empty and invalid input renders `placeholder` (default `--`) with the `caomei-statistic--empty` class for styling; it never silently becomes `0`.
- Use `placeholder` for "no data" and `loading` for "in flight"; do not fake either with `0`.

## Accessibility

- The root is not a landmark and carries no `role`; the value region is `role="group"` and points at the label text through `aria-labelledby` only when a visible label exists.
- `prefix` / `suffix` are part of the value semantics (currency symbols, percent signs) and are read with it; for purely decorative glyphs use the slots and add `aria-hidden` yourself.
- When the accessible name and the visible label share a source, some screen readers announce the label twice (the standard cost of `group`); the component has no single-announcement mode — for a different context omit `label` and let an outer element with a role carry the semantics (do not put `aria-label` on the role-less root: ARIA 1.2 forbids naming generic elements).

## Formatting limits

- `precision` follows `Number#toFixed` semantics and is affected by binary floating point, not strict decimal rounding (for example `1.005` with 2 places gives `1.00`).
- Values always go through double-precision parsing: integers beyond `Number.MAX_SAFE_INTEGER` and decimals with more than roughly 17 significant digits cannot stay exact, so do not use this component for digit-exact display.
- When the output is an exponent form (such as `1e+21`) it is rendered as-is without grouping, and `precision` does not apply.
- `groupSeparator` is inserted literally and never interpreted as a replacement pattern such as `$1` or `$&`; pass an empty string to get the ungrouped value.

<ComponentApi name="statistic" />
