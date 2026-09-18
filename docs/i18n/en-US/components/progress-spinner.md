# ProgressSpinner

The progress spinner indicates an ongoing asynchronous operation; it wraps Reka UI Progress (indeterminate).

## Basic usage

<demo
    vue="../examples/progress-spinner/basic.vue"
    ssg="true"
/>

## Sizes

Switch the size with `size`; supports `sm` / `md` / `lg`.

<demo
    vue="../../../examples/progress-spinner/sizes.vue"
    ssg="true"
/>

## Stroke width

`strokeWidth` controls the ring thickness: a number is treated as px (`4` → `4px`) and so is a numeric string (`"4"` → `4px`, matching PrimeVue's style), both requiring `0 ≤ value ≤ 1000`; any other string must be a valid `border-width` (`<length>` or `thin` / `medium` / `thick`; `%` and compound values are invalid) and is used as-is. When omitted or invalid it follows the `size` step (`sm` / `md` → `2px`, `lg` → `3px`); once provided, all sizes share that value.

<demo
    vue="../../../examples/progress-spinner/stroke.vue"
    ssg="true"
/>

> Semantic difference from PrimeVue: its `strokeWidth` is in **SVG user units** (scales with the rendered size), whereas this is a **CSS length that does not scale with the component size** — convert to px / rem for the visual thickness you want. `strokeWidth` is applied as an inline variable and takes precedence over the `--caomei-progress-spinner-stroke` CSS variable.

## Accessible name and color

`label` provides the accessible name (defaults to the current locale's "Loading" text); the color and track are overridable via CSS variables.

<demo
    vue="../examples/progress-spinner/states.vue"
    ssg="true"
/>

## Accessibility

- The root is `role="progressbar"`; `aria-valuenow` is not output when the progress is indeterminate.
- The accessible name resolves as `label` > forwarded `aria-label` > the current locale's "Loading" text; a forwarded `aria-label` applies when `label` is absent (or empty). Adjacent visible text should match `label`.
- It respects `prefers-reduced-motion`: when motion is reduced it slows the rotation rather than stopping it (keeping motion to express "in progress"). An application's global reduced-motion rule (such as VitePress's default `* { animation-duration: 1ms !important }`) may stop the animation entirely; the docs site restores the slowed rotation in place so the demo stays visible.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-progress-spinner-size` | from the `size` step | Size (sm 16 / md 24 / lg 32) |
| `--caomei-progress-spinner-stroke` | from the `size` step | Track width (sm / md 2px, lg 3px); the `strokeWidth` prop overrides it through the same inline variable |
| `--caomei-progress-spinner-color` | `--caomei-color-primary` | Indicator color |
| `--caomei-progress-spinner-track` | `--caomei-color-border` | Track color |

```css
.caomei-progress-spinner {
    --caomei-progress-spinner-color: #16a34a;
    --caomei-progress-spinner-track: #d1fae5;
}
```

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| width/height via `style` (any px) | `size` presets (`sm` / `md` / `lg` = 16 / 24 / 32px) or override `--caomei-progress-spinner-size` |
| `strokeWidth` | `strokeWidth` (numbers and numeric strings as px, anything else must be a valid `border-width`); when omitted or invalid it follows the `size` step (2 / 2 / 3px). **Semantic difference**: PrimeVue uses SVG user units (scales with size), this library uses a CSS length that does not scale with the component size |
| `fill` (circle background) | Not implemented: the track color comes from `--caomei-progress-spinner-track` |
| `animationDuration` | Not implemented: fixed at `0.6s`, and `1.6s` under `prefers-reduced-motion` |
| — | `label` (accessible name; falls back to the built-in "Loading" text) is new here |

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="progress-spinner" />
