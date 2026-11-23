# Tabbar

The tab bar switches top-level views on mobile. It is a **presentation layer**: `v-model` only tracks the selected value and it **does not integrate vue-router or switch pages**; navigation is up to the consumer after a click.

## Basic usage

`CaomeiTabbar` owns a single selected value; a `CaomeiTabbarItem` whose `value` matches it carries `aria-current="page"`.

<demo
    vue="../examples/tabbar/basic.vue"
    ssg="true"
/>

## Data-driven items and custom content

- Pass `items` as `{ value, label, icon, badge, disabled }`; items render in order and the default slot is ignored when `items` is present.
- The `#item` slot (scope `{ item, active }`) replaces the item label; the item's own `#icon` slot (scope `{ active }`) customises the icon.
- Pass icons as `@lucide/vue` components, not class-name strings.

| `CaomeiTabbarItem` prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| number` | required | Compared with `v-model` to derive the active state |
| `label` | `string` | `''` | Label text |
| `icon` | `Component` | — | Icon component |
| `badge` | `string \| number` | — | Badge content |
| `disabled` | `boolean` | `false` | Disabled; emits no event on click |

| Slot | Scope | Description |
| --- | --- | --- |
| `default` | `{ active }` | Label content |
| `icon` | `{ active }` | Icon content |

## Disabled items and badges

Disabled items cannot be clicked and do not emit `update:modelValue`; `badge` overlays a badge on the icon's top-right and falls back to a standalone badge when there is no icon.

## Safe area and pinning

- The container's bottom padding adds `--caomei-safe-area-bottom` so it clears the iPhone home indicator.
- `fixed` pins the bar with `position: fixed` (stacking via `--caomei-z-sticky`); by default it is not pinned, leaving layout to the consumer.

## Accessibility

- The root is a `nav`; its accessible name comes from `label` > forwarded `aria-label` > the locale's "Main navigation" text. A `NavBar` defaults to the locale's "Navigation bar", so the two names differ by default; if you set the same `label` on both (or forward the same `aria-label`), the page ends up with two identically named `nav` landmarks, so keep them distinct.
- Only the selected item carries `aria-current="page"`, at most one at a time.
- Items are native `button` elements, keyboard reachable one by one; the bar does not hijack arrow keys.

## Style customization

| Variable | Default | Description |
| --- | --- | --- |
| `--caomei-tabbar-bg` | `--caomei-color-bg` | Bar background |
| `--caomei-tabbar-border` | `--caomei-color-border` | Top divider |
| `--caomei-tabbar-item-min-height` | `--caomei-control-height-lg` | Item height floor (≥44px) |
| `--caomei-tabbar-icon-size` | `22px` | Icon font size |
| `--caomei-tabbar-padding-y` / `--caomei-tabbar-padding-x` | `--caomei-space-1` | Container block / inline padding |
| `--caomei-tabbar-gap` | `--caomei-space-1` | Gap between items |
| `--caomei-tabbar-item-gap` | `--caomei-space-1` | Gap between icon and label inside an item |

> The table lists common override hooks, not every variable; other `--caomei-tabbar-*` variables can be overridden too.

<ComponentApi name="tabbar" />
