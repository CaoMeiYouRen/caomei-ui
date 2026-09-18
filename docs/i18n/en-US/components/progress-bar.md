# ProgressBar

The progress bar shows a determinate progress value or an indeterminate waiting state; it wraps Reka UI Progress and shares its source with ProgressSpinner.

## Basic usage

Pass the current progress via `value` (`0` ~ `max`, with `max` defaulting to `100`); `max` customizes the range. An out-of-range `value` is narrowed to the valid interval, and a non-positive or non-finite `max` falls back to the default `100`.

<demo
    vue="../examples/progress-bar/basic.vue"
    ssg="true"
/>

## States

- Determinate: `value` is a number and `data-state` is `loading`; it becomes `complete` when `value === max`.
- Indeterminate: when `value` is `null` (or not passed) the state is `indeterminate` and a looping animation is shown.

<demo
    vue="../examples/progress-bar/states.vue"
    ssg="true"
/>

## Sizes

Switch the height with `size`; supports `sm` / `md` / `lg`.

<demo
    vue="../../../examples/progress-bar/sizes.vue"
    ssg="true"
/>

## Accessibility

- It renders as `role="progressbar"`; a determinate progress outputs `aria-valuenow` / `aria-valuemin` / `aria-valuemax`, while an indeterminate progress outputs no `aria-valuenow`.
- The accessible name resolves as `label` > forwarded `aria-label` > the current locale's "Progress" text.
- The indeterminate looping animation respects `prefers-reduced-motion` (slows down rather than removing it).

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-progress-bar-width` | `100%` | Progress bar width |
| `--caomei-progress-bar-height` | from the `size` step | Progress bar height (sm 4 / md 8 / lg 12) |
| `--caomei-progress-bar-radius` | `999px` | Border radius |
| `--caomei-progress-bar-track` | `--caomei-color-border` | Track background color |
| `--caomei-progress-bar-color` | `--caomei-color-primary` | Progress indicator color |

```css
.caomei-progress-bar {
    --caomei-progress-bar-color: #16a34a;
    --caomei-progress-bar-height: 10px;
}
```

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `value` | `value` (`null` / non-finite → **indeterminate**) |
| `mode="indeterminate"` | Not exposed: derived from `value` being `null` or non-finite |
| `mode="determinate"` | Default: any valid `value` is determinate |
| `showValue` (default `true`, renders the percentage inside the bar) | Not implemented: no numeric text is rendered; the accessible name comes from `label` / `aria-label` / the locale fallback |
| — | `max` (default `100`, out-of-range values clamped) and `size` (`sm` / `md` / `lg`) are new here |

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="progress-bar" />
