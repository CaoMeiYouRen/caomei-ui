# Overriding styles downstream

This page is for teams wiring caomei-ui into a product: how to change the look **without copying component styles or reaching for `!important`**.

> The evaluation behind the `@layer` decision is recorded in [CSS `@layer` strategy evaluation](/design/governance/2026-11-24-phase43-m2-3-layer-strategy) (conclusion: **not adopted**); **this page is the source of truth for override rules**. Consumer-visible changes in 1.5.0 are listed in the [1.5.0 upgrade notes](/release-notes/1.5.0).

## Order of preference: start with the lightest

1. **Tokens** (first choice): theme variables `--caomei-*` and per-component hooks `--caomei-<component>-*`. Library rules read them with a fallback (`var(--caomei-button-bg, var(--caomei-color-primary))`), so **no extra specificity is needed**. The two levels take effect differently:
   - **Global semantic tokens** (`--caomei-color-*` / `--caomei-control-height-*` / `--caomei-space-*` / `--caomei-radius-*`): declaring them on `:root` or any ancestor works (the element's own declaration consumes the inherited value as its fallback).
   - **Component hooks** (`--caomei-button-bg` / `--caomei-button-height`, and so on): when a size class (`--sm|md|lg`) or `tone` already declares the hook **on the button element itself**, an ancestor declaration loses to that element-level declaration (inherited custom properties always lose to the element's own declaration — specificity is not involved). Declare it on the component root class instead (`.social-btn { --caomei-button-height: 40px }`), or override the size source token (`--caomei-control-height-md`).
2. **Component API**: prefer `variant` / `tone` / `size` / `wrap` / `block` / `rounded` over restyling.
3. **Your own class**: add a class to the component root and lift specificity with an app-level scope (see below).
4. **`!important`**: last resort; record the condition under which it can be removed.

Common token families:

| Family | Examples | Notes |
| :--- | :--- | :--- |
| Semantic colors | `--caomei-color-primary` / `--caomei-color-danger-text` | Brand and text colors; presets are documented in [Theming §4](/design/theming) |
| Control sizes | `--caomei-control-height-sm/md/lg` | Affects fields and buttons; `data-density="touch"` raises the whole scale |
| Component hooks | `--caomei-button-bg` / `--caomei-popover-radius` | Component-specific; `--caomei-button-bg` is read by **solid** variants only (`secondary` / `ghost` use `--caomei-button-text` / `--caomei-button-border`) |
| Spacing / radius / motion | `--caomei-space-*` / `--caomei-radius-*` / `--caomei-motion-*` | Broad blast radius; override at the app root |

> After overriding solid / state color tokens, **state contrast becomes your responsibility** (same-value rewrites are unaffected; new color values need a WCAG check); see [Theming](/design/theming) for presets and contrast rules.

## Specificity baseline (why two classes are not enough)

- Component root rules compile to **class + scoped attribute**, i.e. `.caomei-button[data-v-<hash>]` = **(0,2,0)**; size / tone selectors use `:where()` (zero specificity) and only declare variables.
- A downstream **two-class** rule (`.caomei-button.social-btn`) lands on the same (0,2,0), so it depends on source order — which shifts with bundlers, code splitting and CSS injection (including the base layer arriving through `sideEffects`). It is **not guaranteed** to survive an upgrade.
- The library's **state rules are stronger**: `:hover` / `:active` are `(0,4,0)` (`.caomei-button--primary[data-v-*]:hover:not(:disabled)`), while `:disabled` / `:focus-visible` and internal parts are `(0,3,0)`. A (0,3,0) override wins only the static root rule — **states still come from the library**.

| Target | Library rule example | Specificity | Recommended |
| :--- | :--- | :-: | :--- |
| Root box / static colors | `.caomei-button[data-v-*]` | (0,2,0) | (0,3,0)+ or `:deep()` with an ancestor anchor |
| Combination classes (`--block` / `--icon-only`) | `.caomei-button--block[data-v-*]` | (0,2,0) | Same |
| Internal parts | `.caomei-button--icon-only .caomei-button__icon[data-v-*]` | (0,3,0) | `:deep()` plus one more ancestor level (≥ (0,4,0)) |
| Wrapping (`--wrap`) | `.caomei-button--wrap:not(.caomei-button--icon-only)[data-v-*]` | (0,3,0) | (0,4,0)+, or change `--caomei-button-wrap-padding-y` / `--caomei-button-wrap-line-height` |
| `hover` / `active` | `.caomei-button--primary[data-v-*]:hover:not(:disabled)` | (0,4,0) | **Prefer tokens** — state colors derive from tokens via `color-mix()`, so a token change covers all three states |
| `disabled` / `focus-visible` | `.caomei-button[data-v-*]:disabled` | (0,3,0) | Same (`--caomei-disabled-opacity` / `--caomei-button-focus`) |

> `tone="neutral"` solid state rules are (0,5,0) (base class + tone class + scoped attribute + `:hover` + `:not()`) — **always prefer tokens for states**, do not race specificity class by class.

```css
/* Not guaranteed: same (0,2,0) as the library root rule, decided by source order */
.caomei-button.social-btn { border: 0 }

/* Works (static property): (0,3,0), independent of source order */
.account-page .caomei-button.social-btn { border: 0 }

/* Works (all states at once): change the token instead of fighting state selectors.
   For a branded solid color also set --caomei-button-fg; contrast becomes your responsibility */
.social-btn {
    --caomei-button-bg: #1da1f2;
    --caomei-button-fg: #fff;
}
```

```vue
<!-- Works: the scope anchors the ancestor, `:deep()` drills into the component -->
<style scoped>
.actions :deep(.caomei-button) {
    border-radius: var(--caomei-radius-full);
}
</style>
```

> Do not rely on "the library loads last": bundlers, lazy loading, CSS injection positions and the resolver's base-layer `sideEffects` all change it. A library rule moving into `:where()` also silently breaks order-based overrides.

## Runnable example: a scoped rule hitting the button root

**Since 1.5.0**, a `CaomeiButton` without the built-in tooltip renders a single `<button>` root, so the parent's scoped rule hits it directly:

```vue
<script setup lang="ts">
import { CaomeiButton } from 'caomei-ui'
</script>

<template>
    <div class="actions">
        <CaomeiButton class="submit">
            Submit
        </CaomeiButton>
    </div>
</template>

<style scoped>
/* (0,2,0): your class + the parent scope → applies to the button element */
.submit {
    width: 100%;
}
</style>
```

**With `tooltip` enabled** the root is a Fragment of the button and the tooltip panel (multiple roots; the trigger reuses the button itself through `as-child`, so it adds no element), and the parent scope has nowhere to land — use `:deep()`:

```vue
<style scoped>
.actions :deep(.caomei-button) { width: 100% }
</style>
```

> `:deep()` only compiles inside scoped / CSS Modules style blocks; pasting it into a global stylesheet does nothing. In global styles use `.actions .caomei-button` (the `:deep()` need comes from the parent scope, not from where the class sits).

## Internal classes and structure: what is a stable contract

- **Class names are the current override entry point, not a frozen surface**: `caomei-<component>`, `caomei-<component>--<variant|size>` (BEM) are the selectors to prefer when overriding; per [Versioning & compatibility](./version-policy), DOM structure and class names are **not frozen** — re-check them against each release's notes instead of treating them as an eternal contract.
- **Internal part classes are visible but not promised stable**: e.g. `.caomei-button__content` (the text layer that owns single-line truncation / wrapping). It belongs to the component scope, so parent scoped rules need `:deep()`; internal markup changes may rename it.
- **Element hierarchy, sibling order and tag names are not a contract**: selectors such as `div > button` or `button + span` silently break when internals move.

## Anti-patterns

| Anti-pattern | Problem | Alternative |
| :--- | :--- | :--- |
| `div > button { … }` | Depends on hierarchy and tag name | Target the component class |
| `.caomei-button.caomei-button--primary { … }` | Copies an internal combination; breaks when the size/tone rule moves into `:where()` | Use `tone` / `variant` or component hook variables |
| Two-class override relying on load order | Fails when order changes | Lift to (0,3,0) or use `:deep()` |
| Unregistered `!important` | Lingers after upstream fixes | Record removal conditions and drop it with the upgrade |
| Editing `theme.css` or copying component styles | Drifts from the library on upgrade | Override variables |
| Putting overrides inside `@layer` | Unlayered rules beat layered ones, so the override loses | Keep overrides unlayered (the library is unlayered too) |

## Relation to upgrade notes

1.4.0 wrapped table headers and cells in `CaomeiTooltipText` and made button labels single-line, which forced a round of downstream adaptation; `1.5.0` restores the single element root for Button / `CaomeiTooltipText` (when the built-in tooltip is not enabled; the `tooltip` or overflow-tooltip branch still renders multiple roots) and narrows the open-state background isolation of Popover / Popconfirm. **Read the upgrade notes of every version before upgrading**, then decide whether temporary `:deep()` / `!important` workarounds can be removed:

- [1.5.0 upgrade notes](/release-notes/1.5.0)
- [1.4.0 upgrade notes](/release-notes/1.4.0)
- [Versioning & compatibility](./version-policy.md)
