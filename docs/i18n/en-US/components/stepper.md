# Stepper

Stepper shows progress across a multi-step flow and navigates between steps. It wraps Reka UI Stepper (a stable primitive) with the same compound API style as Tabs.

## Basic usage

`v-model` binds the current step (1-based). Responsibilities are split across parts: `CaomeiStepper` provides the root context, `CaomeiStepperList` handles layout, `CaomeiStepperItem` declares a step, `CaomeiStepperTrigger` / `CaomeiStepperIndicator` / `CaomeiStepperTitle` / `CaomeiStepperDescription` form the clickable step, and `CaomeiStepperSeparator` draws the connector.

<demo
    vue="../examples/stepper/basic.vue"
    ssg="true"
/>

The root default slot forwards Reka's context (`modelValue`, `totalSteps`, `isPrevDisabled`, `isNextDisabled`, `nextStep`, `prevStep`, `hasNext`, `hasPrev`, and more), which is handy for rendering previous / next controls (use the boolean `isPrevDisabled` / `isNextDisabled` for disabled buttons; `hasPrev` / `hasNext` are functions).

## Orientation

`orientation="vertical"` switches to a vertical layout and `CaomeiStepperList` follows; the root also outputs `data-orientation` for style overrides.

<demo
    vue="../examples/stepper/vertical.vue"
    ssg="true"
/>

`dir` only affects keyboard arrow navigation (mapping left/right and up/down under RTL); set `dir="rtl"` on an ancestor element for layout mirroring.

Narrow screens (≤640px) do **not** auto-switch horizontal to vertical: a horizontal stepper compresses with its container, so pass `orientation="vertical"` when you want the stacked form. See matrix #10 in [Responsive design](/design/responsive) (Chinese).

## Controlled and uncontrolled

- Controlled: pass `v-model`, and the current step is decided entirely by external state.
- Uncontrolled: pass `default-value` (`1` by default) to set the initial step; after interaction the current value is maintained internally.

`CaomeiStepper` emits `update:modelValue` with the activated step index.

## Order and states

- `linear` defaults to `true`, allowing only the next step or a return to completed steps; set it to `false` to jump freely.
- `CaomeiStepperItem`'s `disabled` disables a single step, excluding it from interaction and keyboard navigation.
- `completed` explicitly marks a step as completed, overriding the state derived from the current step.

Step state is exposed through `StepperItem`'s `data-state` (`active` / `completed` / `inactive`), and styles distinguish it accordingly.

<demo
    vue="../examples/stepper/states.vue"
    ssg="true"
/>

## Composite component API

Besides the root component API below, each part of the compound component has one responsibility:

| Component | Key props | Description |
|------|-----------|------|
| `CaomeiStepper` | `v-model`, `defaultValue`, `orientation`, `linear`, `dir`, `label` | Root container, provides context |
| `CaomeiStepperList` | — | Step list layout container (`flex`) |
| `CaomeiStepperItem` | `step` (required), `disabled`, `completed` | A single step, outputs `data-state` |
| `CaomeiStepperTrigger` | — | Clickable trigger, renders as a `button` |
| `CaomeiStepperIndicator` | default slot `{ step }` | Step indicator |
| `CaomeiStepperTitle` | — | Step title |
| `CaomeiStepperDescription` | — | Step description |
| `CaomeiStepperSeparator` | — | Step separator, colored by `data-state` |

`CaomeiStepper` exposes `goToStep` / `nextStep` / `prevStep` through a template ref for external controls.

## Accessibility

- The root renders `role="group"`, and Reka provides `aria-current` and step-state semantics; the accessible name defaults to the localized "Steps" text (`label` overrides it).
- Triggers render as `button` and support `Enter` / Space; in `linear` mode, non-reachable triggers carry `disabled` and `data-disabled`.
- The focus ring uses `:focus-visible` and respects `prefers-reduced-motion`.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-stepper-gap` | `--caomei-space-2` | Root container gap |
| `--caomei-stepper-list-gap` | `--caomei-space-2` | Step list gap |
| `--caomei-stepper-item-gap` | `--caomei-space-2` | Gap between indicator and content in a step |
| `--caomei-stepper-trigger-gap` | `--caomei-space-2` | Gap inside a trigger |
| `--caomei-stepper-trigger-padding` | `--caomei-space-1` | Trigger padding |
| `--caomei-stepper-indicator-size` | `1.75rem` | Indicator size |
| `--caomei-stepper-indicator-bg` | `--caomei-color-bg` | Indicator default background |
| `--caomei-stepper-indicator-color` | `--caomei-color-text-muted` | Indicator default text color |
| `--caomei-stepper-active-color` | `--caomei-color-primary` | Active accent color |
| `--caomei-stepper-active-bg` | `--caomei-color-primary` | Active indicator background |
| `--caomei-stepper-active-indicator-color` | `--caomei-color-primary-foreground` | Active indicator text color |
| `--caomei-stepper-completed-color` | `--caomei-color-success` | Completed accent color |
| `--caomei-stepper-inactive-color` | `--caomei-color-text-muted` | Inactive text color |
| `--caomei-stepper-title-color` | `--caomei-color-text` | Step title color |
| `--caomei-stepper-description-color` | `--caomei-color-text-muted` | Step description color |
| `--caomei-stepper-separator-color` | `--caomei-color-border` | Separator color |
| `--caomei-stepper-separator-min-length` | `--caomei-space-4` | Minimum separator length |

```css
.caomei-stepper {
    --caomei-stepper-active-color: #16a34a;
    --caomei-stepper-completed-color: #16a34a;
}
```

<ComponentApi name="stepper" />
