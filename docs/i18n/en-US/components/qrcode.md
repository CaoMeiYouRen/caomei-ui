# QRCode

QRCode encodes text or links into a QR image with error correction, quiet zone, colors and a centered icon. The encoder `qrcode` is an optional peer loaded on demand; on load or encoding failure the old image is cleared and a failure notice is shown.

## Basic usage

`value` is the encoded content; `label` is the image's accessible name, defaulting to the locale's "QR code". The default slot renders caption content below the code (in normal flow) and exposes `{ status, value }` in its scope.

<demo
    vue="../examples/qrcode/basic.vue"
    ssg="true"
/>

## Installing the optional peer

`qrcode` is declared as an optional peer: `npm install` does not pull it and the public type surface never references it. **Consumers must install `qrcode` to bundle, whether or not they use this component** — the loader's dynamic `import()` uses a literal specifier, which the bundler resolves through the module graph and fails with "cannot resolve qrcode" when missing. This is the same structural boundary as `CaomeiChart` (`vue-echarts` + `echarts`) and `CaomeiRichTextEditor` (`md-editor-v3`); the improvement candidate is tracked in the [Backlog](/plan/backlog) (Chinese).

```bash
pnpm add qrcode
```

> This repository measures all four paths (missing × used/unused, installed × used/unused) with a consumer fixture; recompute with `pnpm check:optional-peer`.

## Icon and error correction

`icon` is an image URL rendered centered on the code; `iconSize` is its ratio of the edge length (0–0.3, default 0.2). The icon covers modules, so raise `level` to `H` (about 30% correction) as well. Use the `#icon` slot for custom icon content (same `{ status, value }` scope).

<demo
    vue="../examples/qrcode/icon.vue"
    ssg="true"
/>

## Size, quiet zone, error correction and colors

`size` is the rendered edge length in px (default 160), `margin` is the quiet zone in modules (default 2; the spec recommends at least 4) and `level` is the error correction level (L ~7% / M 15% / Q 25% / H 30%): at the same size a higher level packs denser modules, lowers capacity and tolerates more occlusion. `color` / `background` control modules and backdrop; keep strong contrast and make the backdrop opaque — a transparent backdrop hurts readability on dark pages. Failure text grows to fit its content, so very small sizes (e.g. 64px) deserve a shorter message or the default size; keep regular usage at 96px or above.

<demo
    vue="../examples/qrcode/size-level.vue"
    ssg="true"
/>

## Accessibility

- The code is a native `<img>`; the accessible name comes from `label` (defaulting to the locale text). An empty string marks it decorative (`alt=""`).
- Generating uses `role="status"`; failure uses `role="alert"` for immediate announcement. The old code is cleared on failure so users never scan content that no longer matches.
- With several codes on a page, distinguish them with `label` (for example "Order QR code" and "Invite QR code").

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-qrcode-radius` | `--caomei-radius-sm` | QR code corner radius |
| `--caomei-qrcode-icon-radius` | `--caomei-radius-sm` | Centered icon corner radius |

> Colors are intentionally not CSS variables: foreground and background decide scannability and must be given explicitly through `color` / `background` so a theme switch cannot change contrast.
>
> QR encoding starts after mount, so the SSR / SSG first frame renders the "Generating QR code" placeholder; server and client first frames match, so there is no hydration mismatch.

<ComponentApi name="qrcode" />
