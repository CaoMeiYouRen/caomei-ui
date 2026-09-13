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
- The accessible name defaults to the current locale's "Loading" text, overridable via `label`; adjacent visible text should match `label`.
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

<ComponentApi name="progress-spinner" />
