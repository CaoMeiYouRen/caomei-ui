# Mobile & Responsive

> For consumers: how to use caomei-ui on narrow screens and touch devices, plus a self-check list. The **library rules** (breakpoint semantics, narrow-screen behaviour matrix, acceptance criteria) live in [Responsive design](/design/responsive) (Chinese) — this page only covers the consumer-side essentials and does not restate them.

## Breakpoint semantics

The library is **desktop-first**: the default form is the desktop form, and narrow screens are handled with `@media (width <= <breakpoint>)`.

| Tier | Literal | Meaning | Typical devices |
| :--- | :--- | :--- | :--- |
| sm | `640px` | Phone | 320 ~ 640px viewports |
| md | `768px` | Narrow tablet side (also matches phone widths) | 641 ~ 768px |
| lg | No media query | Desktop (default form) | ≥1024px |

> The table above is a **summary** (the "typical devices" column is indicative); see [Responsive design §2](/design/responsive) (Chinese) for the authoritative definitions.

- **769 ~ 1023px is the "no-tier" band**: apart from registered exceptions (`CaomeiButtonGroup` / `CaomeiSplitButton` converge at `1024px`), components keep their desktop form there; page-level layout (column counts, sidebar visibility) is up to you.
- There are **no generic `breakpoint` props** and no viewport listeners; narrow-screen behaviour is handled by components themselves (inset width / wrapping / in-group scrolling / truncation).
- **Grid**: `CaomeiRow` / `CaomeiCol` expose breakpoint `span` / `offset` / `order` (`sm` / `md` / `lg`, narrower tiers win); you declare the values in your template. **Note the opposite direction**: the props' `lg` means the "**override** tier at ≤1024px", whereas the table's `lg` means the "**default** form at ≥1024px" — same value, opposite direction (see [Responsive design §2](/design/responsive), Chinese).
- **`CaomeiDialog`'s `breakpoints`**: generates media queries from the viewport limits you pass (narrowest match wins), useful when aligning dialog widths with an existing project.

## What stays on your side

- **Page-level layout and visibility** — everything beyond the grid primitives.
- **Width limits for text controls** — the library sets no maximum by default; your container decides.
- **Table columns and card layouts** — `CaomeiDataTable` degrades to container scrolling on narrow screens; card lists are business-side work.
- **Full-screen dialogs** — narrow screens inset the width by default; implement full-screen when needed.
- **Stepper direction** — the horizontal form compresses with the container; switch to `orientation="vertical"` when a vertical layout is required.
- **Long text** — a single very long option can overflow by itself (e.g. long enums at the narrowest viewports), so constrain copy length or container width.

## Touch density axis and size overrides

Since `1.1.0` there is a **preset- and colour-scheme-independent** touch density axis: add `data-density="touch"` to any ancestor element and controls in that subtree render with touch-sized heights, font sizes and content width caps; without it every value matches the desktop defaults.

<demo
    vue="../examples/mobile/density.vue"
    ssg="true"
/>

| token | Default | `data-density="touch"` |
| --- | --- | --- |
| `--caomei-control-height-sm` / `md` / `lg` | 28 / 36 / 44px | 36 / 44 / 52px |
| `--caomei-font-size-sm` / `md` / `lg` | 12 / 14 / 16px | 14 / 16 / 18px |
| `--caomei-input-number-max-width` / `--caomei-select-max-width` | 12rem / 20rem | `none` |

- **It does not switch with the viewport**: when only narrow screens should be enlarged, put the attribute on a container inside a media query (or override the tokens directly, below).
- **Orthogonal to `data-preset` / `data-theme` / `.dark`**: it changes sizes only, never colours.
- **Overlay panels are not inherited**: `CaomeiSelect` / `CaomeiMultiSelect` / `CaomeiAutoComplete` / `CaomeiDatePicker` portal their panels to `body`. Put the attribute on `<html>` to enlarge both the trigger and the panel; on a local container only that subtree's triggers follow, while panel text keeps the default size.
- **Still overridable**: override the tokens when you need finer control (for example, only taller buttons).

If the app only needs larger controls on narrow screens, skip the axis and override tokens inside a media query:

```css
@media (width <= 768px) {
    :root {
        --caomei-control-height-sm: 36px;
        --caomei-control-height-md: 44px;
        --caomei-control-height-lg: 52px;
        --caomei-font-size-sm: 14px;
        --caomei-font-size-md: 16px;
        --caomei-font-size-lg: 18px;
        --caomei-input-number-max-width: none;
        --caomei-select-max-width: none;
    }
}
```

- `font-size-md: 16px` avoids iOS zoom when focusing inputs smaller than 16px, but it changes button / table-row heights — run the self-check below.
- This override does **not** enlarge the hit areas of Checkbox / RadioButton / Switch / icon buttons; the P0 clear / close buttons are already covered by the library (≥24×24, visuals unchanged), while the remaining targets still need consumer-level `padding` or a wrapper.
- Why there is no `data-preset="mobile"`: presets are orthogonal to colour scheme and viewport-agnostic; putting sizes into a preset would also enlarge desktop controls and still would not cover breakpoints or hit areas. See the [mobile-first preset evaluation](/design/governance/2026-10-25-mobile-first-preset-evaluation) (Chinese).

## Touch targets

Measured hit areas for key controls (2026-10-16, at 390×844 and 320×568):

- `CaomeiCheckbox` / `CaomeiRadioButton` control boxes are 18px tall (width is sufficient once the associated label is included); the `CaomeiSwitch` track is 40×22; `control-height` tiers are 28 / 36 / 44px.
- Under **WCAG 2.5.8 (≥24×24)**, about **30%** of the 289 interactive targets (87) fall short — **clear / close icon buttons (13.33px), 34 of them**, are the largest single group; under **Apple HIG (≥44×44)** only 9 targets pass (file-picker drop zone / stepper triggers / multiline textarea).
- **P0 shipped (1.1.0)**: the six clear / close buttons (TagsInput / MultiSelect / AutoComplete / Password / Tag / Message, including value-chip removal) now have a **≥24×24** hit area with an **unchanged button box**; multi-row chips get +2px row spacing so adjacent hit areas do not overlap. Tune the minimum with `--caomei-hit-target-min`, but keep the axis distance (`max(|dx|, |dy|)`) between adjacent targets at least that value, and override `row-gap` on the three multi-value fields as well.
- **P1 shipped (2026-11-10, Phase 30 M4-1)**: the 17 form-control targets (Checkbox ×2 / RadioButton ×6 / Switch ×2 / Slider ×3 / ColorPicker thumbs ×4) also reach **≥24×24** with unchanged visual boxes (Checkbox 18, RadioButton 18 tall, Switch 40×22, Slider 18, ColorPicker 18 border box); adjacent targets of the same interaction family keep ≥24 axis distance. See [Responsive design §4](/design/responsive) assertion 7 and the [delivery record](/design/governance/2026-11-10-phase30-m4-1-hit-target-p1) (Chinese).
- **P2 shipped (2026-11-12, Phase 31 M4-1)**: row-height-limited targets (Breadcrumb links / DataTable sort / Select clear) also reach **≥24×24** with unchanged visual boxes; the plain Input control stretches to fill the field shell, while the multi-value fields' anchors already handle click-to-focus. See [Responsive design §4](/design/responsive) assertion 7 and the [delivery record](/design/governance/2026-11-12-phase31-m4-1-touch-target-p2) (Chinese).
- **Suggestions for your app**: for finger-heavy areas (forms, toolbars, row actions), widen the clickable area at the consumer level with container `padding` or a wrapper element. P0 (1.1.0), P1 (Phase 30) and P2 (Phase 31) have all shipped; consumers may still widen wrappers where needed.

## Narrow-screen self-check

1. **Viewports**: 390×844 (phone), 768×1024 (tablet), 1280×800 (desktop), plus a 320×568 extreme-narrow pass and a 900×1024 pass for the 769–1023 "no-tier" band.
2. **No horizontal overflow**: page and component containers must not overflow unexpectedly; components documented as internally scrollable (`CaomeiButtonGroup` / `CaomeiSplitButton` / `CaomeiTabs` / `CaomeiDataTable`) are judged by "container scrolls + members are not clipped".
3. **Overlays and panels**: `left >= 0 && right <= viewport width`; scrollable panels must keep content reachable.
4. **Wrapping containers**: no vertical clipping (every member fully inside the container's client rect) — checking only horizontal `scrollWidth` misses rows cut off by a fixed height.
5. **No desktop regression**: the desktop tier matches the previous form (layout and computed styles).
6. Full assertion details (including the tiered keyboard-focus rule) are in [Responsive design §4](/design/responsive) (Chinese).

## Related

- [Responsive design](/design/responsive) (Chinese) — breakpoints, behaviour matrix, acceptance criteria (single source of truth)
- [Theming and styles](/design/theming) (Chinese) — control width limits and token overrides
- [Component overview](/en-US/components/) — per-component capabilities and usage
- [Backlog](/plan/backlog) (Chinese) — mobile & responsive candidates (including P2 touch targets)
