# Avatar

An avatar shows the image of a user or entity, and displays fallback content when no image is provided or loading fails; it wraps Reka UI Avatar.

## Basic usage

Provide the image via `src` and the alternative text via `alt`; fallback content is shown when `src` is missing or loading fails.

<demo
    vue="../examples/avatar/basic.vue"
    ssg="true"
/>

## Sizes and shapes

Switch the size with `size` (`sm` / `md` / `lg`) and the shape with `shape` (`circle` / `square`).

<demo
    vue="../../../examples/avatar/sizes.vue"
    ssg="true"
/>

## Fallback content

Fallback content is taken by priority from: the `#fallback` slot → the `fallback` prop → the first character of `alt` (uppercased). `delayMs` can delay the fallback content to avoid a flash while the image loads (must be positive; `0` means no delay).

<demo
    vue="../examples/avatar/fallback.vue"
    ssg="true"
/>

## Accessibility

- The image outputs `role="img"` and forwards `alt` as the accessible name.
- When `alt` is provided and the `#fallback` slot is not used, the fallback content exposes the same accessible name via `role="img"` + `aria-label="alt"` (the visible fallback text is visual only; the accessible name is `alt`); when `alt` is missing, the fallback content outputs no role and the visible text carries the semantics.
- When the `#fallback` slot is used, the component does not override its semantics; the slot content carries them, and interactive elements may be placed inside.
- Always provide `alt`; for purely decorative use, wrap with `aria-hidden="true"` at the usage site.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-avatar-size` | from the `size` step | Avatar edge length (sm 24 / md 32 / lg 40) |
| `--caomei-avatar-radius` | `999px` | Border radius (`--caomei-radius-md` when `shape="square"`) |
| `--caomei-avatar-bg` | `--caomei-color-bg-elevated` | Fallback background color |
| `--caomei-avatar-color` | `--caomei-color-text-muted` | Fallback text color |
| `--caomei-avatar-font-size` | from the `size` step | Fallback font size (sm 12 / md 14 / lg 16) |

```css
.caomei-avatar {
    --caomei-avatar-size: 48px;
    --caomei-avatar-bg: #16a34a;
    --caomei-avatar-color: #ffffff;
}
```

<ComponentApi name="avatar" />
