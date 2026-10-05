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

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `severity` | `tone` (`secondary` / `contrast` → `neutral`, `success` → `success`, `warn` / `warning` → `warning`, `danger` → `danger`, `info` → `primary`) |
| `value` | Default slot |
| `icon` (string icon class) | `#icon` slot (pass an `@lucide/vue` component) |
| `rounded` | `rounded` |
| — | `variant` (`soft` / `solid` / `outline`), `size` (`sm` / `md` / `lg`) and `closable` (with a `close` event) are new here |

**Intentional differences**: no `severity` / `value` aliases or props — semantic color goes through `tone` and content through the default slot; `variant` (`soft` / `solid` / `outline`) is this library's own form expression, and the `secondary` / `contrast` / `info` color mappings are lossy approximations; Tag has no `error` usage (see the [audit ledger §4.3](/design/governance/2026-09-14-momei-usage-audit), Chinese); PrimeVue Tag has no `outlined` prop (its functional props are only `value` / `severity` / `rounded` / `icon`, and `variant` is this library's own form expression); the `info` tone is listed as an open item in [the design spec §9](/design/design-spec).

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="tag" />
