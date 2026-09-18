# Card

A card groups related content; as a pure layout container it adds no interaction logic, and ships three base appearances: border / shadow / filled.

## Basic usage

Provide header text via `title` / `subtitle`, put the body in the default slot, and the bottom actions in the `footer` slot.

<demo
    vue="../examples/card/basic.vue"
    ssg="true"
/>

## Variants

Switch the appearance with `variant`; supports `outlined` (default, border), `elevated` (shadow) and `filled` (tinted background).

<demo
    vue="../examples/card/variants.vue"
    ssg="true"
/>

## Padding

Switch the padding step with `padding`; supports `none` / `sm` / `md` (default) / `lg`.

<demo
    vue="../examples/card/padding.vue"
    ssg="true"
/>

## Custom header and footer

- The `title` / `extra` slots customize the title content and the top-right header action.
- The `header` slot replaces the default header entirely (the `title` and related props no longer apply).
- The `footer` slot holds the bottom actions.
- `hoverable` enables hover feedback, suited to clickable cards.

<demo
    vue="../examples/card/slots.vue"
    ssg="true"
/>

## Semantic tag

`as` sets the root element tag, defaulting to `div`. Use `section` / `article` as appropriate, or `a` to wrap a clickable element:

```vue
<CaomeiCard as="article" title="Article title">
  Body
</CaomeiCard>
```

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-card-bg` | by variant | Background color: `outlined` / `elevated` use `--caomei-color-bg`; `filled` uses `--caomei-color-bg-elevated` |
| `--caomei-card-border` | `--caomei-color-border` | Border color |
| `--caomei-card-radius` | `--caomei-radius-lg` | Border radius |
| `--caomei-card-padding` | from the `padding` step | Padding of each section |
| `--caomei-card-shadow` | `--caomei-shadow-sm` (`0 4px 12px rgb(0 0 0 / 0.08)`) | `elevated` shadow |
| `--caomei-card-shadow-hover` | `--caomei-shadow-md` (`0 8px 24px rgb(0 0 0 / 0.12)`) | `hoverable` hover shadow |

```css
.caomei-card {
    --caomei-card-radius: 4px;
    --caomei-card-bg: var(--caomei-color-bg-elevated);
}
```

> The `padding` step writes `--caomei-card-padding` via `:where()` at zero specificity, so you can override that variable directly on `.caomei-card` to adjust padding.

## Accessibility

- The card is a generic container and does not bake in a `role` or heading level; the `title` prop renders as a plain `div`, so pass a real heading element such as `<h3>` through the `title` slot when heading semantics are needed. That prop also intercepts the native HTML `title` tooltip attribute; use another approach when a native tooltip is required.
- For clickable cards, prefer wrapping a native interactive element rather than binding a click handler to the container; when using `as="a"`, include an `href` for keyboard focus, or wrap with a native `button` instead.

## Migration from PrimeVue

Both PrimeVue's `Panel` and `Card` map to this library's `CaomeiCard`:

| PrimeVue | This component |
| --- | --- |
| `<Panel :header="…">` | `<CaomeiCard :title="…">` (or the `#title` / `#header` slot) |
| Panel `#header` / Card `#header` | `#header` |
| Card `#title` | `#title` (or the `title` prop) |
| Card `#subtitle` | `subtitle` prop (string only, **no slot equivalent**) |
| Card default content | Default slot |
| Panel / Card `#footer` | `#footer` |
| Panel `#icons` | `#extra` |
| Panel collapsible (`toggleable` / `collapsed`) | Not implemented: use `CaomeiAccordion` |
| — | `variant` (`outlined` / `elevated` / `filled`), `padding`, `hoverable` and `as` are new here |

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="card" />
