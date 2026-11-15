# Tooltip

A tooltip shows a short hint on pointer hover or keyboard focus. It wraps Reka UI Tooltip; place a `CaomeiTooltipProvider` once at the app root (recommended) and compose it with `CaomeiTooltip` / `CaomeiTooltipTrigger` / `CaomeiTooltipContent` / `CaomeiTooltipArrow` (the component falls back to a built-in provider when none is present — see below).

## Basic usage

Placing `CaomeiTooltipProvider` once at the app root is recommended (a one-off provider like `CaomeiToastProvider` / `CaomeiConfirmDialog`); it carries the shared "skip delay between triggers" state (`skipDelayDuration`) along with the global `delayDuration` / `disabled` settings.

**A missing provider no longer throws**: `CaomeiTooltip` falls back to built-in defaults (700ms delay), so a single tooltip still works; the cost is that such tooltips do not share the cross-trigger skip delay. The library's built-in tooltips (such as Button's `tooltip`) take the same fallback path, so existing apps do not have to change their root first.

`CaomeiTooltipTrigger` renders a **chrome-free** clickable container with the accessibility wiring in place; use `as-child` to reuse an existing button / link / icon element.

> Place `class` / `style` on the trigger or the content; the root container renders no DOM and other attributes on it have no effect.

<demo
    vue="../examples/tooltip/basic.vue"
    ssg="true"
/>

## Built-in tooltips

Beyond composing `CaomeiTooltip` yourself, every built-in trigger that has **no visible text, or text that can be truncated** carries a built-in tooltip. This phase added **no dedicated prop per trigger**: Button / Toolbar / Paginator / SplitButton reuse their existing `tooltip` prop, while the remaining triggers (long-text surfaces included) are on by default and are turned off through the root provider. Content defaults to the trigger's existing accessible name (explicit content and a native `title` win), so the hint text and the screen-reader name never drift apart.

> The one exception to the default is `CaomeiButton`: its `tooltip` is off by default (adding hints to ordinary text buttons would disturb existing pages), so icon buttons must opt in explicitly.

<demo
    vue="../examples/tooltip/built-in.vue"
    ssg="true"
/>

| Trigger | Default | Content | How to turn it off |
| --- | :-: | --- | --- |
| Button (icon-only / truncated text) | off | explicit `tooltip` text > native `title` > accessible name / visible text | omit `tooltip`, or pass `:tooltip="false"` |
| Toolbar icon button / link | on | explicit content > native `title` > `label` / `aria-label` | `:tooltip="false"` |
| Paginator first / previous / next / last | on | each button's accessible name (no override) | `:tooltip="false"` |
| SplitButton dropdown button | on | `menuLabel` (a string / `{ content }` overrides it) | `:tooltip="false"` |
| Dialog / Drawer close button | on | the close label (`closeLabel`) | root `CaomeiTooltipProvider :disabled` |
| Select family clear, InputNumber steppers, Password toggle | on | the existing accessible names | root provider `:disabled` |
| Calendar prev / next, DatePicker / ColorPicker, Image, FileUpload, Message (including Alert) | on | the existing accessible names | root provider `:disabled` |
| Tag / Breadcrumb / Menu / DataTable long text | on | the visible text (only while truncated) | root provider `:disabled` |

- **Only while truncated**: the Tag / Breadcrumb / Menu / DataTable text surfaces measure `scrollWidth > clientWidth + 1` and stay completely silent while the text fits (no `aria-describedby` on the element).
- **Programmatic focus does not pop**: the Dialog / Drawer close button and the date / color picker navigation receive focus when the panel opens, so those triggers open only for keyboard `:focus-visible`.
- **Keyboard boundary**: the long-text triggers (Tag / Breadcrumb / Menu / DataTable) are the text boxes themselves and are not focusable, so their tooltips are pointer-only; screen readers are unaffected because truncation is purely visual and the text stays in the DOM.
- **Data table column width**: cells truncate only when `columns[].width` uses an absolute length (`px` / `rem` / `em` / `ch`, ……, lowercase); a percentage would be re-based against the cell content box, so it does not drive truncation, and neither do keywords such as `auto` / `min-content` or viewport units (`vh` / `vw` / `vmin` / `vmax`); columns without a width keep the existing wrapping behaviour. A sortable header's cap does not subtract the space reserved for the sort indicator, so a sortable column with a declared width ends up slightly wider than declared (details in [DataTable](./data-table.md#truncation-and-tooltip)).

### Migrating from the native `title`

**Button-like** components with a built-in tooltip enabled no longer forward a native `title` to the DOM (its value becomes fallback tooltip content), so the browser tooltip and the built-in one never show twice. Today only `CaomeiButton` (with `tooltip` enabled) and `CaomeiToolbarButton` / `CaomeiToolbarLink` (on by default) take over `title`; the Paginator / SplitButton dropdown / Dialog / Drawer close button use fixed accessible names and neither read nor consume `title`, and the long-text surfaces (Tag / Breadcrumb / Menu / DataTable) do not handle `title` either.

| Your current setup | What to do |
| --- | --- |
| Keep the browser's native tooltip | Turn the built-in one off per component: omit `tooltip` / pass `:tooltip="false"` on `Button`, pass `:tooltip="false"` on `Toolbar`; `title` is forwarded as before |
| Switch to the built-in tooltip (Toolbar) | Nothing to change: Toolbar is on by default, the old `title` text becomes the tooltip content and `title` is removed from the DOM |
| Switch to the built-in tooltip (Button) | Opt in explicitly: pass `tooltip` (reusing the `title` text) or `tooltip="new text"`; without it you keep the browser tooltip |
| Keep `title` but show different hint text | Pass `tooltip="new text"`: it wins as the content and `title` is still removed |
| Disable built-in tooltips globally | Pass `:disabled="true"` to the root `CaomeiTooltipProvider` (covers every built-in tooltip, long-text surfaces included). Note that a **global disable does not restore a `title` that was already taken over** — those components end up with neither hint; turn it off per component to keep the browser tooltip |

> The native `title` tooltip timing is browser-defined (usually over a second), cannot be styled, and barely appears on touch devices; the built-in tooltips share the library's tokens and delay settings.

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

## Overflow tooltips

`CaomeiTooltipText` wraps "an element plus an overflow tooltip" into one box: the tooltip appears only when the content does not fit, and stays completely silent otherwise (no `aria-describedby` on the element). It only provides the wiring and a measurable box — **truncation is up to the consumer**: declare `white-space: nowrap` plus a fixed width / `max-width` and `overflow: hidden` + `text-overflow: ellipsis` yourself.

```vue
<template>
    <div class="cell">
        <CaomeiTooltipText mode="auto">
            {{ fullText }}
        </CaomeiTooltipText>
    </div>
</template>

<style scoped>
.cell {
    max-width: 12rem;
}

/* The tooltip wrapper renders through several components, so the consumer's scope id never reaches the inner span — use :deep() for the truncation styles. */
.cell :deep(.caomei-tooltip-text) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
```

> **Keep a measurable box when you override `display`**: the overflow check reads `scrollWidth` / `clientWidth`, and both are always 0 for non-replaced `display: inline` elements. Switching the default `inline-block` to `inline` / `contents` silently disables detection (the tooltip never appears in a real browser, and the happy-dom unit tests cannot see it because the readings are stubbed). The component's default box is declared through `:where()`, so `display` / `box-sizing` / `max-width` / `min-width` are ordinary overridable declarations — just keep a measurable box (`block` / `inline-block`, or a flex / grid item) when you override them.

- `mode` (default `auto`): `auto` shows the tooltip only when overflowing; `always` shows it unconditionally;
- `content` defaults to the element's visible text;
- `disabled` turns the tooltip off without affecting the element's rendering or truncation;
- add `tabindex="0"` when keyboard users must reach it too (inherited `class` / `style` / `aria-*` land on the root element).

Button's built-in `tooltip` is the component-level wrapping of the same capability; see [Button](./button.md#text-overflow-and-tooltips).

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

**Known intentional differences**: ① placing `CaomeiTooltipProvider` explicitly is recommended, since that is what enables the cross-trigger skip delay (`skipDelayDuration`); without it `CaomeiTooltip` falls back to a built-in provider (each tooltip keeps its own defaults) — usable, but that state is not shared; ② the hint is announced as a **description** only — `role="tooltip"` sits on a visually hidden element inside the panel (its `id` is what the trigger's `aria-describedby` points to) and never becomes part of the trigger's accessible name; ③ it is split from `CaomeiPopover` by semantics (read-only hint vs interactive content), on tiers `--caomei-z-tooltip` (1060) and `--caomei-z-dropdown` (1050) respectively.

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
