# Slider

A slider drags to select one or more values within a numeric range; it wraps Reka UI Slider.

## Basic usage

Binding `v-model` to a number renders a single-thumb slider; `label` provides the accessible name when there is no visible heading.

<demo
    vue="../examples/slider/basic.vue"
    ssg="true"
/>

## Range selection

Binding `v-model` to an array renders multiple thumbs (the array length is the number of thumbs); `thumb-labels` provides each thumb's accessible name in order, falling back to the built-in text ("Slider" for a single thumb, "Minimum" / "Maximum" for a range).

<demo
    vue="../examples/slider/range.vue"
    ssg="true"
/>

## Orientation

`orientation="vertical"` switches to a vertical slider.

<demo
    vue="../examples/slider/vertical.vue"
    ssg="true"
/>

## Stepping and states

Constrain the value with `min` / `max` / `step`; `disabled` disables interaction. `minStepsBetweenThumbs` constrains the minimum gap between adjacent thumbs on a range slider.

<demo
    vue="../examples/slider/states.vue"
    ssg="true"
/>

## Form integration

With `name`, the slider is submitted with a native form when inside `<form>`. Reka UI submits it as an array under `name[0]` (for a range slider, `name[0]`, `name[1]` in order), and `required` participates in native validation.

```vue
<form>
  <CaomeiSlider v-model="volume" name="volume" label="Volume" required />
  <button type="submit">Submit</button>
</form>
```

## Accessibility

- Each thumb renders as a focusable element with `role="slider"`, outputting `aria-valuenow` / `aria-valuemin` / `aria-valuemax` and `aria-orientation`.
- Accessible names: use `label` for a single thumb and `thumb-labels` for a range; the priority is `thumb-labels` / `label` > forwarded `aria-label` (single thumb only) > the built-in text.
- Keyboard support: arrow keys / `PageUp` / `PageDown` adjust the value (`Shift` or the page keys accelerate), and `Home` / `End` jump to the minimum / maximum.
- When `disabled`, the thumb is not focusable and `aria-disabled` is set.
- The descriptive attributes `aria-describedby` / `aria-labelledby` are forwarded to every thumb.
- Keyboard focus shows a `:focus-visible` ring.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-slider-width` | `100%` | Horizontal slider width |
| `--caomei-slider-min-width` | `120px` | Horizontal slider minimum width |
| `--caomei-slider-height` | `10rem` | Vertical slider height |
| `--caomei-slider-track-height` | `6px` | Track thickness |
| `--caomei-slider-track-radius` | `999px` | Track radius |
| `--caomei-slider-track-bg` | `--caomei-color-border` | Track background color |
| `--caomei-slider-range-bg` | `--caomei-color-primary` | Selected range background color |
| `--caomei-slider-thumb-size` | `18px` | Thumb size |
| `--caomei-slider-thumb-bg` | `--caomei-color-bg` | Thumb background color |
| `--caomei-slider-thumb-border` | `--caomei-color-primary` | Thumb border color |
| `--caomei-slider-thumb-shadow` | `--caomei-shadow-xs` (`0 1px 2px rgb(0 0 0 / 0.2)`) | Thumb shadow |
| `--caomei-slider-focus` | `--caomei-color-primary` | Focus ring color |

```css
.caomei-slider {
    --caomei-slider-range-bg: #16a34a;
    --caomei-slider-thumb-border: #16a34a;
    --caomei-slider-thumb-size: 22px;
}
```

<ComponentApi name="slider" />
