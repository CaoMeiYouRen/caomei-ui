# Empty

An empty state explains that a page or section has no content and offers the next step. It only renders; it knows nothing about the data source.

## Basic usage

The title defaults to the locale's "No data" text; the description and `#action` are optional.

<demo
    vue="../examples/empty/basic.vue"
    ssg="true"
/>

## Icons and images

- `icon` takes an `@lucide/vue` component; `image` takes an image URL, and `image` wins when both are provided.
- The `#icon` / `#image` slots fully replace the media content.
- With no media at all, a decorative default icon is rendered.

<demo
    vue="../examples/empty/image.vue"
    ssg="true"
/>

## Size steps

`size` accepts `sm` / `md` (default) / `lg`, controlling padding, media size and title size. At a 320px viewport the content wraps via `overflow-wrap` and is never clipped.

`as` accepts `div` (default) / `section` / `article`: use `section` for a page-level empty state and `article` inside an article or card; keep `div` for a layout wrapper.

## Relationship with DataView

- `CaomeiDataView` owns the **in-container** list / grid empty state (replacing the content area when the data source is empty), keeping its `#empty` slot and pagination / layout structure.
- `CaomeiEmpty` owns **page- or section-level** empty states: a whole page, a card, or a standalone block in any container.
- To reuse it, put `CaomeiEmpty` inside DataView's `#empty` slot instead of duplicating message keys (both share the `dataView.empty` fallback).

## Accessibility

- The default icon is decorative and marked `aria-hidden`; provide `imageAlt` when using `image`.
- The title is plain text and adds no heading level; pass a real heading through `#title` when heading semantics are needed.
- The action area only carries consumer-provided buttons; the component adds no focus logic.

## Style customization

| Variable | Default | Description |
| --- | --- | --- |
| `--caomei-empty-padding` | Set by the size step | Outer padding |
| `--caomei-empty-media-size` | 40 / 56 / 72px | Icon font size and image height basis |
| `--caomei-empty-title-size` | Set by the size step | Title font size |

<ComponentApi name="empty" />
