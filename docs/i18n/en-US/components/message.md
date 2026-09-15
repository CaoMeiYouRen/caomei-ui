# Message

A message shows a context-relevant piece of feedback within the current page (a single component carries both Message and Alert semantics).

## Basic usage

Provide the content via `title` / `description` or the default slot.

<demo
    vue="../examples/message/basic.vue"
    ssg="true"
/>

## Tones

Switch the semantic tone with `tone`; supports `neutral` / `primary` / `success` / `warning` / `danger`.

<demo
    vue="../examples/message/tones.vue"
    ssg="true"
/>

## Variants

Switch the visual variant with `variant`; supports `soft` (default) / `solid` / `outline` / `simple` (an inline form with no background, border or padding, often used for field validation text).

<demo
    vue="../examples/message/variants.vue"
    ssg="true"
/>

> Migration mapping (PrimeVue → caomei-ui): `severity` → `tone` (`error` → `danger`, `warn` / `warning` → `warning`, `info` → `primary`, `secondary` / `contrast` → `neutral`, `success` → `success`; `secondary` / `contrast` / `info` are **lossy approximations**). `variant="outlined"` → `variant="outline"`, `variant="simple"` → `variant="simple"`; the default form with no `variant` maps to `soft`. PrimeVue Message only offers `outlined` / `simple` (there is no `text`).

## Sizes

Switch between `sm` / `md` (default) / `lg` with `size`; it affects font size and padding, while the `simple` variant consumes no padding.

<demo
    vue="../examples/message/sizes.vue"
    ssg="true"
/>

## Close and actions

`closable` shows a close button and emits `close`; the `#actions` slot holds action buttons.

<demo
    vue="../examples/message/closable.vue"
    ssg="true"
/>

## Accessibility

- The message content layer is `role="status"` by default (polite announcement); in error / warning cases it can be changed to `role="alert"` for an immediate announcement. The role sits on the content layer, so the close button and `#actions` are outside the live region, avoiding interactive controls being merged into the announcement.
- It can only carry semantics as plain text; if interactive controls are needed inside the message, use a non-live-region presentation instead.
- The semantic icon is chosen by `tone` and marked `aria-hidden`; the `#icon` slot content is likewise treated as decorative (the whole thing is `aria-hidden`), so put any semantics in the text content.
- With `closable`, the close button has an accessible name (default "Close", overridable via `closeLabel`).

## Style customization

Colors come from the global semantic tokens: `primary` / `success` / `warning` / `danger` use `--caomei-color-<tone>`, and `neutral` uses `--caomei-color-text-muted`; the `solid` variant background uses the matching `--caomei-color-<tone>-solid` (`--caomei-color-neutral-solid` for `neutral`). There is also a radius override hook:

| Variable | Default | Description |
|------|------|------|
| `--caomei-message-radius` | `--caomei-radius-md` | Border radius |

```css
.caomei-message {
    --caomei-message-radius: 999px;
}
```

<ComponentApi name="message" />
