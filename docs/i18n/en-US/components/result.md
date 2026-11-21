# Result

A result page carries the final outcome of an action (success, failure, forbidden, not found and so on) with an icon, title, description and the next step. It only renders; it knows nothing about where the business state comes from.

## Basic usage

`status` drives the default icon and tone (defaults to `info`); `title` / `description` supply the copy and `#extra` holds the next actions.

<demo
    vue="../examples/result/basic.vue"
    ssg="true"
/>

## Statuses and icons

- Semantic states: `success` / `info` / `warning` / `danger`.
- HTTP error codes: `403` (forbidden, warning tone) / `404` (not found, muted tone) / `500` (server error, danger tone).
- `icon` takes a component to replace the icon; pass `null` to hide it. It defaults by status (success / info / warning / danger / error / info / danger).
- The icon is decorative and marked `aria-hidden`; the title and description carry the accessible information.

<demo
    vue="../examples/result/statuses.vue"
    ssg="true"
/>

## Heading level and actions

- The title renders as `h2`; when the page needs another level, use the `#title` slot with a real heading element or wrap the component in the matching section.
- `#description` can hold rich text; `#extra` carries one or two buttons and wraps on narrow screens.
- `size` accepts `sm` / `md` (default) / `lg`, controlling icon and title sizes plus padding.
- `as` accepts `div` (default) / `section` / `article`: use `section` for a full-page result and `article` inside a card.

## Boundary with Empty / Message / Alert

- `Result` carries the **final outcome of a page or a whole flow**, usually occupying the main content area with a next step.
- `Empty` carries a **block-level empty state** (a list without data) and does not express success or failure.
- `Message` is an **instant feedback bar** that appears near the action and provides live-region announcements.
- `Alert` is an **inline persistent notice** (environment notes, configuration warnings) shown alongside page content.
- Pick one per scenario: a full-page outcome uses `Result`; an empty list uses `Empty`; a lightweight action result uses `Message`.

## Accessibility

- By default the component emits `role="status"` and `aria-live="polite"`, so screen readers announce the result when it appears; pass `:live="false"` when an outer live region already exists to avoid double announcements.
- The icon is decorative (`aria-hidden`); the title is a real `h2` and the description a paragraph.
- Buttons inside `#extra` keep their own accessibility; the component does not take over focus.

## Style customization

| Variable | Default | Description |
| --- | --- | --- |
| `--caomei-result-gap` | `--caomei-space-2` | Gap between elements |
| `--caomei-result-padding` | Set by the size step | Outer padding |
| `--caomei-result-icon-size` | 2 / 3 / 4rem | Icon size |
| `--caomei-result-icon-color` | By status | Icon color |
| `--caomei-result-title-size` | Set by the size step | Title size |
| `--caomei-result-description-size` | `--caomei-font-size-sm` | Description size |

Content wraps with `overflow-wrap: anywhere` and never clips or scrolls horizontally at 320px.

<ComponentApi name="result" />
