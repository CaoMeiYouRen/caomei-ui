# Watermark

Overlays a tiled watermark (text or image) on top of content to mark ownership, flag internal material or raise the cost of leaking screenshots. The watermark is a **decorative** layer: the overlay is hidden from assistive technology while the slot content stays readable and selectable.

## Basic usage

`content` is the text watermark; `rotate` / `opacity` / `gap` control the tilt, transparency and spacing. The container height follows its content.

<demo
    vue="../examples/watermark/basic.vue"
    ssg="true"
/>

## Image watermark

When `image` is provided it wins over text; `imageWidth` / `imageHeight` set the drawn size and a failed load falls back to `content` when provided, otherwise the previous painting is kept. The image is tiled through the same rotated bounding box.

<demo
    vue="../examples/watermark/image.vue"
    ssg="true"
/>

## Semantics and boundaries

- **Only the overlay** carries `aria-hidden="true"`; the root and the slot do not, so the content is still announced by screen readers and can be selected.
- The watermark is painted on mount and rebuilt on the next task after **child additions / removals, attribute changes, text changes, container resizes or theme (dark / preset) switches**; it stops observing once unmounted.
- **Pixel-level tampering is out of scope**: scripts that rewrite canvas pixels or screenshot-and-inpaint tools are not detected, and no anti-tamper guarantee is made. A removed overlay is re-attached, which is recovery rather than tamper protection.
- Painting happens only on the client (after mount); server rendering emits no watermark pattern (the overlay element is empty).

## Props

| Component | Main props |
|------|------|
| `CaomeiWatermark` | `content`, `image`, `rotate`, `opacity`, `gap`, `offset`, `imageWidth`, `imageHeight`, `fontSize`, `color`, `zIndex` |

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-watermark-z-index` | `--caomei-z-raise` | Overlay z-index; below overlays and modals unless `zIndex` overrides it |

<ComponentApi name="watermark" />
