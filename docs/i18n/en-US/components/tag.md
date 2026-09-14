# Tag

A tag categorizes or labels content and supports semantic tones, several variants and a closable interaction.

## Basic usage

<demo
    vue="../examples/tag/basic.vue"
    ssg="true"
/>

## Tones

Switch the semantic tone with `tone`; supports `neutral` / `primary` / `success` / `warning` / `danger`.

<demo
    vue="../../../examples/tag/tones.vue"
    ssg="true"
/>

## Variants and sizes

Switch between `soft` / `solid` / `outline` with `variant`, between `sm` / `md` / `lg` with `size`, and toggle the pill shape with `rounded` (`--caomei-radius-full`).

<demo
    vue="../../../examples/tag/variants.vue"
    ssg="true"
/>

> Migration mapping (PrimeVue → caomei-ui): `severity` → `tone`, where `secondary` / `contrast` → `neutral`, `success` → `success`, `warn` / `warning` → `warning`, `danger` → `danger`, and `info` → `primary` (`secondary` / `contrast` / `info` are all **lossy approximations**; the `info` tone is listed as an open item in [the design spec §9](/design/design-spec), Chinese; Tag has no `error` usage — see the [audit ledger §4.3](/design/governance/2026-09-14-momei-usage-audit), Chinese); `outlined` → `variant="outline"`; `rounded` → `rounded`; `value` → the default slot; string `icon` → the `#icon` slot. Tag adds no `outlined` / `severity` / `value` prop.

## Closable

With `closable`, a close button is shown; clicking it emits `close` for the parent to handle the removal.

<demo
    vue="../examples/tag/closable.vue"
    ssg="true"
/>

## Accessibility

- The close button uses the built-in localized label, overridable via `closeLabel`.
- When `disabled`, the close button is not interactive and does not emit `close`.
- The `icon` slot places an icon before the text.

<ComponentApi name="tag" />
