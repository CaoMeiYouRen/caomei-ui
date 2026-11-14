# Button

A button triggers an action.

## Basic usage

<demo
    vue="../examples/button/basic.vue"
    ssg="true"
/>

## Variants

Switch the visual variant with `variant`.

<demo
    vue="../../../examples/button/variants.vue"
    ssg="true"
/>

## Tones

Use `tone` to give the button a semantic color; when unset, the variant's default colors apply. When migrating from PrimeVue, `text` / `outlined` map to `variant="ghost"` / `variant="secondary"`.

<demo
    vue="../../../examples/button/tones.vue"
    ssg="true"
/>

## Icon-only button

The `iconOnly` prop enables icon-only mode: the button becomes square (width equals height), the icon is centered, and no text content is rendered. It must be paired with `label` to provide an accessible name (mapped to `aria-label`); in this mode `iconPosition` is ignored.

<demo
    vue="../../../examples/button/icon-only.vue"
    ssg="true"
 />

## Rounded and icon position

`rounded` renders a pill shape; `iconPosition` controls where the icon sits relative to the label (default `start`, ignored when `iconOnly` is true).

<demo
    vue="../../../examples/button/rounded-icon.vue"
    ssg="true"
 />

## Sizes

Switch the size with `size`.

<demo
    vue="../../../examples/button/sizes.vue"
    ssg="true"
/>

On touch devices, set `data-density="touch"` on an ancestor to enlarge control heights and font sizes in that subtree. The density axis is orthogonal to the `size` tiers; see [Touch density axis](/en-US/guide/mobile#touch-density-axis-and-size-overrides).

## States

While `loading`, the button is disabled and shows a loading indicator; `block` makes it fill the parent width.

<demo
    vue="../examples/button/states.vue"
    title="Disabled, loading and block"
    description="Click the loading button to see the loading state."
    ssg="true"
/>

## State feedback

`hover` and `active` colors are derived from the existing `--caomei-*` tokens with `color-mix()`; no new tokens are introduced:

- solid variants (`primary`) mix toward the neutral solid token (`--caomei-color-neutral-solid`) to darken, leaving the foreground color unchanged; the `tone="neutral"` solid is that same anchor, so it uses `--caomei-color-text` instead;
- text-style variants (`secondary` / `ghost`) mix their text toward `--caomei-color-text` (darker in light mode, lighter in dark mode) and tint the background from the same source at a low ratio; without `tone` the text already is `--caomei-color-text`, so the text stays the same (the `secondary` border color still changes);
- `disabled` (including the automatic disable while `loading`) does not take part in state feedback; `:focus-visible` only adds the outline and does not change state colors;
- the transition lasts 150ms; `prefers-reduced-motion: reduce` disables it while the state difference still applies.

Under the **default preset (`minimal`)**, the derived direction keeps text/background contrast at or above the WCAG AA body threshold (≥ 4.5:1) across all three states (default / hover / active). Brand presets' pre-existing three-state contrast gaps were fixed by G1-F on 2026-10-28 (tone text now uses the `-text` role); all three states are asserted by the preset matrix.

## Badge

A non-empty `badge` string renders a badge at the button's top-right corner (the string is the content); `badgeTone` controls its tone (defaults to `neutral`, corresponding to PrimeVue's default `badge-severity` of `secondary`). Pass `undefined` or an empty string to hide it, which is handy for count-driven visibility.

<demo
    vue="../../../examples/button/badge.vue"
    ssg="true"
/>

> The badge is offset beyond the top-right corner: it does not participate in the button's layout and does not change its size. Unless the accessible name is overridden via `label` (or a forwarded `aria-label`), the badge text is included in the name derived from the visible text (for example "Notifications3").
>
> Because the badge extends past the button's bounds, an ancestor must not clip it (`overflow: hidden` / `clip` and the like), or the badge will be cut off.

## Text overflow and tooltips

`tooltip` wires a built-in tooltip into the button (based on `CaomeiTooltip`; it never shows alongside the native `title`):

- `tooltip` (`true`): always shown for `iconOnly` or when there is no visible text, with the `label` (the `aria-label`) as content; for text buttons it shows only when the text is truncated by the container, using the visible text as content;
- `tooltip="..."` or `{ content, mode }`: an explicit content is always shown by default — use `mode: 'auto'` to fall back to "only when truncated" (on `iconOnly` there is no overflowing text, so `auto` never shows and logs a development-time warning);
- once set, the native `title` is no longer forwarded to the DOM; its value backs the tooltip content, while `content` takes precedence;
- disabled buttons can still show the tooltip on hover.

Truncation prerequisite: the text element is single-line (`nowrap` + `overflow: hidden` + `text-overflow: ellipsis`), so the text only truncates — and triggers the tooltip — when the button is width-constrained (`block`, a parent width, or a custom `max-width`).

<demo
    vue="../examples/button/tooltip.vue"
    ssg="true"
/>

> Known trade-off: the `iconOnly` + `tooltip` content defaults to the `aria-label` and the panel is exposed to screen readers as a **description**, so the same text may be announced twice. Use `tooltip="{ content: '...' }"` to provide distinct supplementary text. See [Tooltip](./tooltip.md) for the provider fallback and its skip-delay trade-off.

## Accessibility

- `label` provides an accessible name when there is no visible text (icon-only buttons) and maps to `aria-label`; `label` takes precedence over a forwarded `aria-label`, and the forwarded value applies when `label` is not provided (or empty).
- When `iconOnly` is enabled, `label` is required and is used as `aria-label` (takes precedence over forwarded `aria-label`); that requirement is the API contract — at runtime a forwarded `aria-label` still backs it up, and the development-time warning is emitted only for `iconOnly` with `tooltip` enabled when there is **no accessible name at all**.
- The loading state is marked with `aria-busy` and still uses native `disabled` to block interaction.
- The built-in tooltip never supplies the accessible name: the name of an `iconOnly` button comes from `label` (with a forwarded `aria-label` as fallback), while the tooltip text is exposed as a description (`aria-describedby`).

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `severity` | `tone` |
| `text` | `variant="ghost"` |
| `outlined` | `variant="secondary"` |
| `size` (`small` / `large`) | `size` (`sm` / `lg`) |
| `rounded` | `rounded` |
| `icon` / `iconPos` (`left` / `right`) | `#icon` slot (pass an `@lucide/vue` component) / `iconPosition` (`start` / `end`); PrimeVue also has `top` / `bottom`, **not supported here** |
| `iconOnly` (icon-only button) | `iconOnly` (square, centered icon, requires `label` for accessible name) |
| `:badge` / `badgeSeverity` | `badge` (a non-empty string renders outside the top-right corner without affecting layout) / `badgeTone` (`secondary` → `neutral` and so on; `info` / `contrast` are lossy) |
| `v-tooltip` directive (PrimeVue) / native `title` | `tooltip` (`true` / string / `{ content, mode }`); without `tooltip`, the native `title` is still forwarded as before |
| `fluid` (span the parent width) | `block` (span the parent width) |
| `loading` | `loading` (disables the button automatically and shows the built-in indicator) |

**Not implemented / not exposed**: `loadingIcon` (built-in indicator), `badgeClass` / `iconClass` (the badge and icon elements carry fixed class names you can override), `raised` / `plain` / `link` and `variant="outlined" | "text" | "link"` (express these with `variant` / `tone`).

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration) (**trap table additions**: Button icon-only shape, `iconPosition` ignored when `iconOnly`, `iconOnly` requires `label`).

<ComponentApi name="button" />
