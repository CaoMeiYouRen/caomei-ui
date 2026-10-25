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

## Touch-friendly size overrides (size tokens)

Theme presets carry visual character only and **do not change with the viewport**. If your app targets both desktop and phones, override the size tokens inside a narrow-screen container or media query instead of expecting a preset to switch automatically:

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
- This override does **not** enlarge the hit areas of Checkbox / RadioButton / Switch / icon buttons; use consumer-level `padding` or a wrapper for finger-heavy areas.
- Why there is no `data-preset="mobile"`: presets are orthogonal to colour scheme and viewport-agnostic; putting sizes into a preset would also enlarge desktop controls and still would not cover breakpoints or hit areas. See the [mobile-first preset evaluation](/design/governance/2026-10-25-mobile-first-preset-evaluation) (Chinese).

## Touch targets

Measured hit areas for key controls (2026-10-16, at 390×844 and 320×568):

- `CaomeiCheckbox` / `CaomeiRadioButton` control boxes are 18px tall (width is sufficient once the associated label is included); the `CaomeiSwitch` track is 40×22; `control-height` tiers are 28 / 36 / 44px.
- Under **WCAG 2.5.8 (≥24×24)**, about **30%** of the 289 interactive targets (87) fall short — **clear / close icon buttons (13.33px), 34 of them**, are the largest single group; under **Apple HIG (≥44×44)** only 9 targets pass (file-picker drop zone / stepper triggers / multiline textarea).
- **Current state**: the library keeps the existing sizes (see [Responsive design §5](/design/responsive), Chinese); the per-component inventory and tiered suggestions are in the [touch-target audit record](/design/governance/2026-10-16-phase25-m2-2-touch-target-audit) (Chinese).
- **Suggestions for your app**: for finger-heavy areas (forms, toolbars, row actions), widen the clickable area at the consumer level with container `padding` or a wrapper element; whether the library ships an invisible-hit-area primitive is a later decision (candidate in the [Backlog §1.5](/plan/backlog) (Chinese)).

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
- [Backlog](/plan/backlog) (Chinese) — mobile & responsive candidates (including touch-target enhancement)
