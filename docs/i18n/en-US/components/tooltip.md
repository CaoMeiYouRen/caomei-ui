# Tooltip

A tooltip shows a short hint on pointer hover or keyboard focus. It wraps Reka UI Tooltip and is composed of a `CaomeiTooltipProvider` placed once at the app root plus `CaomeiTooltip` / `CaomeiTooltipTrigger` / `CaomeiTooltipContent` / `CaomeiTooltipArrow`.

## Basic usage

`CaomeiTooltipProvider` must be placed once at the app root (a one-off provider like `CaomeiToastProvider` / `CaomeiConfirmDialog`) — Reka's `TooltipRoot` throws when no provider is present, and the provider also carries the shared "skip delay between triggers" state.

`CaomeiTooltipTrigger` renders a **chrome-free** clickable container with the accessibility wiring in place; use `as-child` to reuse an existing button / link / icon element.

> Place `class` / `style` on the trigger or the content; the root container renders no DOM and other attributes on it have no effect.

<demo
    vue="../examples/tooltip/basic.vue"
    ssg="true"
/>

## Placement and arrow

`CaomeiTooltipContent` supports `side` (`top` / `right` / `bottom` / `left`, default `top`), `align` (`start` / `center` / `end`) and `side-offset` / `align-offset`, with collision-aware auto flipping on by default (disable with `avoid-collisions="false"`); `CaomeiTooltipArrow` renders an arrow pointing at the trigger.

<demo
    vue="../examples/tooltip/placement.vue"
    ssg="true"
/>

## Delay and disabling

The following five options all follow "**provider fallback, per-tooltip override wins**": when omitted, the provider's configuration applies (configure once for the whole app); passing a value on a single `CaomeiTooltip` overrides it just for that trigger — `delayDuration` (delay in ms between the pointer entering the trigger and the panel appearing, provider default `700`), `disabled` (disable the trigger), `disableHoverableContent` (prevent the pointer from entering the panel), `disableClosingTrigger` (clicking the trigger does not close the panel), `ignoreNonKeyboardFocus` (open only for keyboard focus `:focus-visible`, avoiding stray panels when switching browser tabs or closing a dialog).

The provider additionally has a **provider-only** option, `skipDelayDuration` (default `300`): while moving from one trigger to another within this period the delay is skipped; `CaomeiTooltip` does not expose it.

- Clicking the trigger while the panel is open collapses it (Reka contract); pass `disable-closing-trigger` (provider-level or per tooltip) to keep it open on click.

## Accessibility

- The panel contains a **visually hidden** `role="tooltip"` element whose `id` is what the trigger's `aria-describedby` points to; the visible panel text also serves as that element's description — the hint is announced as a **description** and never becomes part of the trigger's accessible name.
- **No focus trap**: opening does not move focus and the panel carries no dialog semantics; Escape closes the panel.
- When the panel content is not descriptive (an icon or an abbreviation), provide an alternative with `CaomeiTooltipContent`'s `aria-label`.

## Tooltip vs CaomeiPopover

| | Tooltip | Popover |
| --- | --- | --- |
| Content | Read-only short hint | Interactive content (forms / actions) |
| Trigger | Pointer hover + keyboard focus (delayed by default) | Click |
| Tier | `--caomei-z-tooltip` (1060) | `--caomei-z-dropdown` (1050) |
| Focus | Not moved in (no focus trap) | Moved into the panel (dialog semantics) |
| Closing | Pointer leave / blur / Escape | Outside click / Escape / close button |

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-tooltip-z-index` | `1060` | Panel tier |
| `--caomei-tooltip-width` | `max-content` | Panel width |
| `--caomei-tooltip-max-width` | `min(20rem, available width)` | Panel max width |
| `--caomei-tooltip-padding` | `--caomei-space-1 --caomei-space-2` | Panel padding |
| `--caomei-tooltip-bg` | `--caomei-color-neutral-solid` | Panel background |
| `--caomei-tooltip-color` | `--caomei-color-on-solid` | Panel text colour |
| `--caomei-tooltip-border` | `transparent` | Panel border colour |
| `--caomei-tooltip-radius` | `--caomei-radius-sm` | Panel corner radius |
| `--caomei-tooltip-font-size` | `--caomei-font-size-sm` | Panel font size |
| `--caomei-tooltip-shadow` | `--caomei-shadow-sm` | Panel shadow |
| `--caomei-tooltip-arrow-bg` | Panel background | Arrow fill |
| `--caomei-tooltip-trigger-gap` | `--caomei-space-1` | Gap between icon and text inside the trigger |
| `--caomei-tooltip-trigger-padding` | `0` | Trigger padding (reset by default) |
| `--caomei-tooltip-trigger-radius` | `--caomei-radius-sm` | Trigger corner radius |

## Migration from PrimeVue

PrimeVue's `v-tooltip` directive / `<Tooltip>` is likewise a read-only hint shown on hover / focus; the differences are mostly in how it is wired up:

| PrimeVue | This component |
| --- | --- |
| `v-tooltip` directive (`v-tooltip="'text'"` / `v-tooltip.bottom`) | Declarative `<CaomeiTooltipTrigger>` + `<CaomeiTooltipContent>`; use `side` / `align` for placement |
| `v-tooltip:left` style modifiers | `CaomeiTooltipContent`'s `side` (`top` / `right` / `bottom` / `left`) and `align` |
| `<Tooltip>` component + `#content` slot | `CaomeiTooltipContent`'s default slot |
| `showDelay` / `hideDelay` | `delayDuration` (provider-level or per tooltip); **no separate hide delay** (closes as the pointer leaves) |
| `disabled` | `disabled` (provider-level or per tooltip) |
| `escape` (Escape closes) | Default behaviour, no toggle exposed |
| Directive mounting (any element plus an attribute) | Requires an explicit `CaomeiTooltipTrigger` wrapper (`as-child` reuses the original element) |

**Known intentional differences**: ① `CaomeiTooltipProvider` must be placed explicitly (Reka's `TooltipRoot` throws without it), which is also what enables the cross-trigger skip delay (`skipDelayDuration`); ② the hint is announced as a **description** only — `role="tooltip"` sits on a visually hidden element inside the panel (its `id` is what the trigger's `aria-describedby` points to) and never becomes part of the trigger's accessible name; ③ it is split from `CaomeiPopover` by semantics (read-only hint vs interactive content), on tiers `--caomei-z-tooltip` (1060) and `--caomei-z-dropdown` (1050) respectively.

### Differences from Element Plus `el-tooltip`

| Element Plus | This component |
| --- | --- |
| `<el-tooltip content="text">` + `#content` slot | `CaomeiTooltipContent` default slot (no `content` prop) |
| `placement` (12 values, e.g. `top` / `top-start`) | `side` + `align` two-axis combination (4 directions × 3 alignments = the same 12 positions) |
| `effect` (`dark` / `light`) | Dark background by default (override to light via `--caomei-tooltip-bg` / `--caomei-tooltip-color`) |
| `show-after` / `hide-after` / `show-arrow` | `delayDuration`; **no hide delay**; the arrow is a separate `CaomeiTooltipArrow` (not rendered by default) |
| `trigger` (`hover` / `click` / `focus` / `contextmenu`) | Fixed to hover + focus (click collapses) — **no click / contextmenu trigger** |
| `disabled` | `disabled` |
| `teleported` / `append-to` | Always portaled to `body`; the tier is managed by `--caomei-tooltip-z-index` |

<ComponentApi name="tooltip" />
