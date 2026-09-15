# ColorPicker

The color picker pairs a swatch trigger button with an overlay panel that contains a saturation/brightness area, a hue slider and a hex input; it composes the Reka UI ColorArea / ColorSlider / ColorField / ColorSwatchPicker primitives.

## Basic usage

Bind a color string with `v-model`; `label` is the trigger button's invisible accessible name.

<demo
    vue="../examples/color-picker/basic.vue"
    ssg="true"
/>

## Formats

`format` controls how the `v-model` value is serialized: `hex` (default, `#rrggbb`), `rgb` (`rgb(r, g, b)`) or `hsb` (`hsb(h, s%, b%)`).

The model accepts `#rgb` / `#rrggbb` / `#rrggbbaa`, `rgb()` / `rgba()`, `hsl()` / `hsla()` and `hsb()` / `hsba()` strings (parsing boundaries: `rgb()` / `rgba()` require commas, `hsl()` / `hsla()` saturation and lightness must carry `%`, and modern space-separated syntax such as `rgb(0 255 0)` or `hsl(120 100% 50%)` is unsupported and also falls back to `defaultColor`); **named colors (such as `red`) and `oklch()` are not supported** and fall back to `defaultColor`. **Transparency is not supported**: an input carrying alpha is stripped to 6-digit hex (`#rrggbb`). Empty or invalid values display `defaultColor` (default `#ff0000`) without writing back to the model.

<demo
    vue="../examples/color-picker/options.vue"
    ssg="true"
/>

## Panel and states

- `inline`: render the panel inline, without a trigger button or overlay.
- `swatches`: preset swatches, selected on click; no swatch row is rendered when omitted.
- `showInput`: whether to show the hex input, defaults to `true`.
- `disabled` / `invalid`: disabled and invalid states.

> Migration mapping (PrimeVue → caomei-ui): `format` → `format` (same values); `disabled` → `disabled`; `inline` → `inline`; `invalid` → `invalid`; `appendTo` / `overlayClass` / `panelClass` are not implemented (the panel is portaled and its layering/appearance are managed by the library). **Known differences**: PrimeVue's `format="hex"` model is a 6-digit hex string **without `#`** (momei currently adapts with `replace('#', '')` / re-prefixing), whereas this library uses **standard CSS color strings** (`#rrggbb`), so that adapter can be removed during migration. PrimeVue's `format="rgb"` / `"hsb"` models are `{ r, g, b }` / `{ h, s, b }` **objects**, while this library uses **strings** (`rgb(r, g, b)` / `hsb(h, s%, b%)`). The `alpha` channel is not supported (inputs carrying alpha are normalized to 6-digit hex).

## Accessibility

- The trigger button carries a built-in accessible name ("Color"), overridable via `label`; `invalid` marks `aria-invalid`.
- Every focusable control inside the panel (area / hue thumbs, hex input, swatch items) takes its **accessible name** from the built-in locale messages; the area thumb's `aria-valuetext` (saturation / brightness) is localized too, while the hue thumb's `aria-valuetext` is Reka's raw number. Swatch items are named by their color value and the decorative swatch is hidden from assistive technology.
- Keyboard: arrow keys adjust the area / hue; Enter or blur commits the input.
- **Known limitations**: `aria-roledescription` (`Color picker` / `Color thumb` / `color swatch`) keeps Reka's built-in English descriptions, the same existing pattern as `Number field` in InputNumber; the area's `aria-valuenow` (taken from pointer coordinates) and `aria-valuetext` (quantized from the 8-bit hex model) may differ by up to 2 in low-brightness colors, which is a color-quantization difference.

<ComponentApi name="color-picker" />
