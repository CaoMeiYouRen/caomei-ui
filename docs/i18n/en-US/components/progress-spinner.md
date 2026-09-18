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
| `--caomei-progress-spinner-stroke` | from the `size` step | Track width (sm / md 2px, lg 3px) |
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
| `strokeWidth` | Not implemented: use the `--caomei-progress-spinner-stroke` CSS variable (preset defaults 2 / 2 / 3px); **registered as a follow-up, this section will be updated when it ships** |
| `fill` (circle background) | Not implemented: the track color comes from `--caomei-progress-spinner-track` |
| `animationDuration` | Not implemented: fixed at `0.6s`, and `1.6s` under `prefers-reduced-motion` |
| — | `label` (accessible name; falls back to the built-in "Loading" text) is new here |

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="progress-spinner" />
