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
- **Stepper direction** — the horizontal form compresses with the container; switch to `orientation="vertical"` when a vertical layout is required. At very narrow widths the horizontal layout degrades (titles one character per line), so it is not recommended there (see Backlog §1.5, Chinese).
- **Long text** — a single very long option can overflow by itself (e.g. long enums at the narrowest viewports), so constrain copy length or container width.

## Safe areas (notch and home indicator)

Full-screen pages need room for the notch, rounded corners and the bottom home indicator. The library exposes four safe-area tokens, defaulting to `env()` and falling back to `0px` on desktop or when the page does not declare `viewport-fit=cover`:

| token | Default | Meaning |
| --- | --- | --- |
| `--caomei-safe-area-top` | `env(safe-area-inset-top, 0px)` | Top (notch / status bar) |
| `--caomei-safe-area-right` | `env(safe-area-inset-right, 0px)` | Right (landscape corner) |
| `--caomei-safe-area-bottom` | `env(safe-area-inset-bottom, 0px)` | Bottom (home indicator) |
| `--caomei-safe-area-left` | `env(safe-area-inset-left, 0px)` | Left (landscape corner) |

> `env()` is non-zero only when the page declares `viewport-fit=cover`, e.g. `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`. Without it all four tokens are `0px`, so the default layout stays as-is.

Six utility classes write the tokens into `padding` on the matching side:

| Utility | Properties written |
| --- | --- |
| `.caomei-safe-area-top` / `-right` / `-bottom` / `-left` | The single-side `padding` |
| `.caomei-safe-area-x` | `padding-right` + `padding-left` |
| `.caomei-safe-area-y` | `padding-top` + `padding-bottom` |

<demo
    vue="../examples/mobile/safe-area.vue"
    ssg="true"
/>

- The utilities **set** that side's `padding`: after applying one, that side is exactly the token value and **the host's original padding is not kept** (on desktop the token is `0px`, which zeroes that side). To keep the original value, compose it with `calc()`, e.g. `padding-bottom: calc(var(--caomei-space-3) + var(--caomei-safe-area-bottom))`.
- All six utilities are single-class selectors, and the base layer loads before component / app styles; at equal specificity the later declaration wins, so a `padding` on the host can override the utility. For a deterministic override, raise the selector's specificity or compose the tokens with `calc()` in your own rule.
- For extra breathing room (say 8px), override the token on any ancestor; CSS inheritance carries it through the subtree: `--caomei-safe-area-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px)`.
- Fixed-position components already consume the tokens, so no utility class is needed: Drawer adds the token to the edge-side padding of its opening direction (a bottom drawer gets `--caomei-space-4` plus the bottom safe area; left / right drawers also pad both vertical ends), Toast adds it to the top / bottom docking offset, BackTop adds it to the bottom-right offset, and Image preview shrinks its available bounds by all four insets. The Drawer height on top / bottom, the Dialog / ConfirmDialog height cap, the Toast viewport cap and the preview bounds use `dvh` (keeping a `vh` fallback), so they follow the visible viewport while the address bar collapses or expands.
- The demo pins the tokens to `34px` / `16px` so the inset is visible; on desktop, or without `viewport-fit=cover`, the tokens are `0px`, so computed styles stay identical **as long as only the base layer is imported and no utility is applied**.

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

## Mobile layout recipes

These recipes apply "safe area + dynamic viewport + touch minimums" to common mobile layouts. Breakpoint semantics and the narrow-screen matrix live in [Responsive design §2](/design/responsive) / [§3](/design/responsive); this section only gives copy-ready consumer patterns.

### Bottom sheet

- Use `CaomeiActionSheet` (a `CaomeiDrawer position="bottom"` under the hood), or build your own with the bottom Drawer.
- The panel height converges to `min(90dvh, size)` and the body scrolls when content overflows; bottom padding already adds `--caomei-safe-area-bottom`, so do not wrap it in a safe-area utility class.
- For a custom panel, set `max-height: 90dvh; overflow: auto` and `padding-bottom: calc(var(--caomei-space-4) + var(--caomei-safe-area-bottom))` so content clears the home indicator.

### Sticky header

- Make the header `position: sticky; top: 0` and take its stacking level from `var(--caomei-z-sticky)`; never write a numeric `z-index`.
- Add `--caomei-safe-area-top` to the top padding; under `viewport-fit=cover` this is the only way to clear the notch.
- Do not set `overflow: hidden` on the sticky header, or it will clip overlays opened inside it.

### Fixed bottom action bar

- Use `position: fixed; inset-inline: 0; bottom: 0` with `var(--caomei-z-sticky)` and padding `calc(var(--caomei-space-3) + var(--caomei-safe-area-bottom))`.
- Reserve bottom spacing equal to the bar height (including the safe area) on the page content, or the last block will sit underneath it.
- Prefer `size="lg"` or a `data-density="touch"` subtree for the primary button in the bar (see the 44px path below).

### Search bar (SearchBar recipe)

The search bar is composed from `Input` + `InputGroup` + `Button`; the library ships **no** SearchBar component (componentising it waits for a second real reuse case). All four paths need a home: clear, cancel, submit, empty.

<demo
    vue="../examples/mobile/search-bar.vue"
    ssg="true"
/>

- **Clear**: `clearable` on the input plus the `clear` event, resetting both the result and the state so an old result never outlives the cleared keyword.
- **Cancel**: show it only when there is text (`variant="ghost"`); a text label is easier to recognise on mobile than a close glyph.
- **Submit**: button click and the keyboard `enter` share one handler; `enter` comes from `Input`'s `enter` event, so do not wire a raw keydown.
- **Empty**: report an empty submit with an inline `role="status"` line rather than a toast — the field is still in view.
- Touch density: put the whole bar in a `data-density="touch"` subtree for 44px heights; do not enlarge the input alone.

### Mobile shell example

Compose a header, search bar, list, bottom action bar and tab bar into a runnable app shell: the header sticks and adds the safe area, the action bar reserves the bottom safe area, and the tab bar stays at the bottom.

<demo
    vue="../examples/mobile/shell.vue"
    ssg="true"
/>

- Use `CaomeiNavBar` for the header (`sticky` plus the default `safe-area`); back only emits an event, so routing stays in your app.
- The search bar reuses the recipe above; submit and `enter` share one handler.
- Inside the shell the action bar can simply be a flex footer (as in the example, which needs no extra list padding); to float above the content use `position: fixed` or `sticky bottom` and reserve equal space at the end of the list.
- Only the **bottom-most** fixed element carries the bottom safe area: when a tab bar sits at the bottom, the action bar above it must not add `--caomei-safe-area-bottom` again, or the spacing doubles.
- Use `CaomeiTabbar` for the tab bar; items share the width and never overflow. Give the header and tab bar different `label`s so the two landmarks are distinguishable.

### Soft keyboard and visibility

- The library does **not** listen to `visualViewport` and has no JavaScript viewport branch; address-bar changes are handled by `dvh` (Drawer / Dialog / Toast / image preview already ship the `dvh` fallback).
- Use `min-height: 100dvh` instead of `100vh`; when an input is focused the browser scrolls it into view, so do not fight it with a manual `scrollIntoView`.
- Keep input font size ≥16px (`data-density="touch"` already raises `--caomei-font-size-md` to 16px) to avoid iOS focus zoom.

### Five lower bounds

1. **Hit area ≥24×24** (WCAG 2.5.8): the in-library P0 / P1 / P2 targets already meet it through invisible hit areas, with the visual box unchanged.
2. **Adjacent target centre distance ≥24**: use `--caomei-space-3` or larger row spacing within one interaction family.
3. **Primary actions ≥44×44 recommended**: use `size="lg"` or the touch density axis for the top action in a sheet or bottom bar; do not enlarge every control by default.
4. **Text and input floors**: body text ≥14px, inputs ≥16px; narrow viewports converge by wrapping / truncation, never by shrinking the font.
5. **Fixed pieces clear the safe area and dynamic viewport**: fixed top / bottom / drawer / toast offsets add the matching safe-area token and use `dvh` for heights.

### Reaching 44px

- **Preferred**: add `data-density="touch"` to touch-dense containers; control heights become 36 / 44 / 52px and fonts grow with colours unchanged.
- **Per control**: use `size="lg"` for primary buttons; only upgrade first-level actions that must be easy to hit — list rows do not need global enlargement.
- **At the consumer layer**: enlarge the clickable area with wrapper padding; the hit area may exceed the visual box.
- **Avoid**: making 44px the default control height — that changes the desktop shape and shifts every visual baseline; also avoid packing adjacent 24px hit areas into row spacing under 24px.

## Touch targets

Measured hit areas for key controls (2026-10-16, at 390×844 and 320×568):

- `CaomeiCheckbox` / `CaomeiRadioButton` control boxes are 18px tall (width is sufficient once the associated label is included); the `CaomeiSwitch` track is 40×22; `control-height` tiers are 28 / 36 / 44px.
- Under **WCAG 2.5.8 (≥24×24)**, about **30%** of the 289 interactive targets (87) fall short — **clear / close icon buttons (13.33px), 34 of them**, are the largest single group; under **Apple HIG (≥44×44)** only 9 targets pass (file-picker drop zone / stepper triggers / multiline textarea).
- **P0 shipped (1.1.0)**: the six clear / close buttons (TagsInput / MultiSelect / AutoComplete / Password / Tag / Message, including value-chip removal) now have a **≥24×24** hit area with an **unchanged button box**; multi-row chips get +2px row spacing so adjacent hit areas do not overlap. Tune the minimum with `--caomei-hit-target-min`, but keep the axis distance (`max(|dx|, |dy|)`) between adjacent targets at least that value, and override `row-gap` on the three multi-value fields as well.
- **P1 shipped (2026-11-10, Phase 30 M4-1)**: the 17 form-control targets (Checkbox ×2 / RadioButton ×6 / Switch ×2 / Slider ×3 / ColorPicker thumbs ×4) also reach **≥24×24** with unchanged visual boxes (Checkbox 18, RadioButton 18 tall, Switch 40×22, Slider 18, ColorPicker 18 border box); adjacent targets of the same interaction family keep ≥24 axis distance. See [Responsive design §4](/design/responsive) assertion 7 and the [delivery record](/design/governance/2026-11-10-phase30-m4-1-hit-target-p1) (Chinese).
- **P2 shipped (2026-11-12, Phase 31 M4-1)**: row-height-limited targets (Breadcrumb links / DataTable sort / Select clear) also reach **≥24×24** with unchanged visual boxes; the plain Input control stretches to fill the field shell, while the multi-value fields' anchors already handle click-to-focus. See [Responsive design §4](/design/responsive) assertion 7 and the [delivery record](/design/governance/2026-11-12-phase31-m4-1-touch-target-p2) (Chinese).
- **Suggestions for your app**: for finger-heavy areas (forms, toolbars, row actions), widen the clickable area at the consumer level with container `padding` or a wrapper element. P0 (1.1.0), P1 (Phase 30) and P2 (Phase 31) have all shipped; consumers may still widen wrappers where needed.

## Device preview

The "Device preview" entry in the site navigation opens a **same-origin iframe of the current page** in a drawer, switchable between 390 / 768 / 1024 / 1280. Media queries inside the iframe use the iframe's own width, so the result is a real breakpoint rather than a narrowed or scaled container. The drawer also has light / dark and reload controls; the theme is written only into the iframe, and the main site neither reloads nor navigates.

- **Preview route**: the current page URL plus `device-preview=1`; inside the iframe that marker suppresses the entry to avoid recursion.
- **Same origin and theme**: the iframe shares the site origin and can read the `localStorage` theme preference; after load it corrects `dark` / `data-theme` for the current preview state.
- **Scope**: how a whole documentation page (sidebar and navigation included) looks on a device; the P2 single-demo isolated preview is not part of this entry.

## Narrow-screen self-check

1. **Viewports**: 390×844 (phone), 768×1024 (tablet), 1280×800 (desktop), plus a 320×568 extreme-narrow pass and a 900×1024 pass for the 769–1023 "no-tier" band.
2. **No horizontal overflow**: page and component containers must not overflow unexpectedly; components documented as internally scrollable (`CaomeiButtonGroup` / `CaomeiSplitButton` / `CaomeiTabs` / `CaomeiDataTable`) are judged by "container scrolls + members are not clipped".
3. **Overlays and panels**: `left >= 0 && right <= viewport width`; scrollable panels must keep content reachable.
4. **Wrapping containers**: no vertical clipping (every member fully inside the container's client rect) — checking only horizontal `scrollWidth` misses rows cut off by a fixed height.
5. **No desktop regression**: the desktop tier matches the previous form (layout and computed styles).
6. Full assertion details (including the tiered keyboard-focus rule) are in [Responsive design §4](/design/responsive) (Chinese).


## Device execution log

The three items below need real hardware: **executed as a browser device-viewport simulation (not a real device) on 2026-11-23**, while **real-device execution is still pending** (this repository has no iOS / Android device attached). The simulation used the Playwright `webkit` presets `iPhone 12` (preset viewport 390×664) and `iPhone SE` (320×568), including mobile UA, DPR and `hasTouch`; per-item results and uncovered parts are in the [Phase 42 M2-1 record](/design/governance/2026-11-23-phase42-m2-1-simulated-mobile-verification) (Chinese).

| Item | Focus | Status | Simulated result (not a real device) and uncovered parts |
| --- | --- | --- | --- |
| iOS `dvh` | Drawer, dialog, toast and image preview do not jump when the address bar collapses | **Simulated (not a real device); real device pending** | Simulated: `dvh` supported, `90dvh` within 1px of 90% of the viewport height, the `ActionSheet` panel converges to `min(90dvh, 420px)` and stays inside the viewport. Not covered: the address bar actually collapsing (the viewport is static in simulation) and notch / home-indicator insets (safe area is 0 in simulation). Stand-in: `@supports (height: 100dvh)` fallbacks exist in Drawer / Dialog / Toast |
| Touch scrolling | Inner panel scrolling does not move the page; scroll lock restores; hit areas under momentum scrolling | **Simulated (not a real device); real device pending** | Simulated: the shell scroll container scrolls (`clientHeight` 400 / `scrollHeight` 564), the sticky header stays at the container top after scrolling, and the action bar and tab bar stay inside the shell. Not covered: inner panel scrolling not moving the page, momentum scrolling, scroll-lock restoration. Stand-in: `responsive.e2e.ts` covers horizontal scrolling and unclipped members; the scroll lock is covered by `ui-validator` records |
| OTP autofill | `autocomplete="one-time-code"` integration with the system keyboard | **Simulated (not a real device); real device pending** | Simulated: all six cells carry `autocomplete="one-time-code"` and `inputmode="numeric"`; typing six digits fills the cells in order, syncs the model and leaves focus on the last cell. Not covered: the system keyboard and SMS autofill. Stand-in: InputOtp unit and E2E tests cover paste distribution and completion |

> "Simulated (not a real device)" only means the problem did not reproduce in simulation; it is not a real-device acceptance result. When executed on hardware, change Status to `Executed (device / OS version / result)` and keep the simulated column for comparison.

**Boundaries found alongside the simulation (not a library issue)**: the same run found page-level horizontal overflow in the docs site at 320×568 (from the site's top bar and hamburger button), and source-code blocks on component example pages overflow at 360 / 390; the library's shell example has no horizontal overflow at those widths. Both belong to the docs site and the example surface and do not affect component behaviour or breakpoint semantics; readings and the probe method are in the [Phase 42 M2-1 record §5](/design/governance/2026-11-23-phase42-m2-1-simulated-mobile-verification) (Chinese), and this page does not restate the counts.

## Related
- [Mobile readiness matrix](./mobile-readiness.md) — per-page 320 / 390 / 768 shapes and gaps

- [Responsive design](/design/responsive) (Chinese) — breakpoints, behaviour matrix, acceptance criteria (single source of truth)
- [Theming and styles](/design/theming) (Chinese) — control width limits and token overrides
- [Component overview](/en-US/components/) — per-component capabilities and usage
- [Backlog](/plan/backlog) (Chinese) — mobile & responsive candidates (including P2 touch targets)
