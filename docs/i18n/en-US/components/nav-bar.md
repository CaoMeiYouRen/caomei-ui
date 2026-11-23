# NavBar

A route-level page header: back on the left, title in the middle, actions on the right, with optional stickiness and safe area. The component **does not depend on vue-router** — the back button only emits `back`, so history checks and navigation stay with the consumer.

> **Exception note**: NavBar does not meet **criterion 1** of the `caomei-todo` §11.5 three-criterion admission rule, and **criterion 2 is doubtful** (not all three are met). It was accepted as an explicit exception by the user's 2026-11-22 direction; it is not a precedent for "meets all three criteria".

## Basic usage

<demo
    vue="../examples/nav-bar/basic.vue"
    ssg="true"
/>

```vue
<CaomeiNavBar title="Project settings" @back="router.back()">
    <template #end>
        <CaomeiButton size="sm" variant="ghost">Save</CaomeiButton>
    </template>
</CaomeiNavBar>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | — | Title text; the default slot wins |
| `back` | `boolean` | `true` | Whether to render the back button |
| `backLabel` | `string` | the locale's "Back" | Accessible name of the back button |
| `backDisabled` | `boolean` | `false` | Disables the back button (use when there is no history) |
| `sticky` | `boolean` | `false` | Sticks to the top (`position: sticky` + `--caomei-z-sticky`) |
| `safeArea` | `boolean` | `true` | Adds `--caomei-safe-area-top`; the value is **viewport-level**, so pass `false` for a non-sticky bar that needs no extra space |
| `label` | `string` | the locale's "Navigation bar" | Accessible name of the nav landmark |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `back` | — | Back button clicked; the component neither navigates nor reads history |

## Slots

| Slot | Description |
| --- | --- |
| `default` | Title content (wins over `title`); add your own `<h1>` when a heading level is needed |
| `start` | Left area, replacing the default back button |
| `end` | Right action area |

## Sticky and safe area

- Use `sticky` for a sticky header: the layer comes from `--caomei-z-sticky`, so do not write a numeric `z-index`; avoid `overflow: hidden` on ancestors, which would clip inner overlays.
- `safe-area` is on by default and adds `--caomei-safe-area-top`. `env(safe-area-inset-top)` is viewport-level, so a non-sticky bar still grows under `viewport-fit=cover`; pass `:safe-area="false"` when that space is not wanted.
- No extra spacer is needed under a sticky bar: `sticky` stays in flow and occupies its height on first paint.

## Accessibility

- The root is a `nav` landmark; its name is "explicit `label` > forwarded `aria-label` > the locale's Navigation bar". A `Tabbar` defaults to the locale's "Main navigation", so the two names differ by default; if you set the same `label` on both (or forward the same `aria-label`), the page ends up with two identically named `nav` landmarks, so keep them distinct.
- The back button is a native `button` whose `aria-label` comes from `backLabel` or the locale's Back; its visual box is 44px by default (52px under `data-density="touch"`), and `.caomei-hit-target` keeps the hit area at least 24×24.
- The title truncates with `text-overflow: ellipsis` while the full text stays in the DOM; avoid truncating information that is critical for assistive technology.

## Boundary with Toolbar

**Single statement**: `NavBar` is a **page-level** header (a `nav` landmark carrying back and the page title, one per page); `Toolbar` is a **component-level** action bar (`role="toolbar"`, a group of controls with arrow-key order, repeatable within a page). Use `NavBar` for page navigation and `Toolbar` for in-content action bars; do not substitute one for the other.

<ComponentApi name="nav-bar" />
