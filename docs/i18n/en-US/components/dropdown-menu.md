# DropdownMenu

A dropdown menu expands a set of actions from a trigger and supports groups, disabled items, checkboxes, radio selection and separators; it wraps Reka UI DropdownMenu.

## Basic usage

`CaomeiDropdownMenu` is the logical root container (it renders no DOM), `CaomeiDropdownMenuTrigger` opens it, and `CaomeiDropdownMenuContent` holds the items (it internally portals to `body`). Items can show a shortcut hint via `shortcut`.

<demo
    vue="../examples/dropdown-menu/basic.vue"
    ssg="true"
/>

> Put `class` / `style` on the trigger or the content; the root container renders no DOM, so other attributes on it have no effect.

## Groups and separators

`CaomeiDropdownMenuGroup` groups items together, `CaomeiDropdownMenuLabel` provides a non-focusable group label, and `CaomeiDropdownMenuSeparator` draws a separator.

## Checkbox and radio selection

- `CaomeiDropdownMenuCheckboxItem` supports a boolean `v-model` (or `'indeterminate'`) for the checked state.
- `CaomeiDropdownMenuRadioGroup` + `CaomeiDropdownMenuRadioItem` form a radio group; `v-model` carries the selected value, and an item's `value` must be unique within the group.

The menu closes after clicking an item by default; calling `event.preventDefault()` in the `select` event (or `@select.prevent` in templates) keeps it open, which suits repeated checkbox toggling.

<demo
    vue="../examples/dropdown-menu/checkable.vue"
    ssg="true"
/>

## Data-driven item model

`CaomeiDropdownMenuContent`'s `model` takes a `DropdownMenuModelItem[]`, which suits migration from PrimeVue's `MenuItem`: items render in array order, `separator: true` renders a separator (other fields are ignored), and every other entry calls `command` when selected. `model` renders before the default slot and the two can coexist (use the slot for more complex structures).

<demo
    vue="../examples/dropdown-menu/model.vue"
    ssg="true"
/>

| Field | Type | Default | Description |
|------|------|------|------|
| `label` | `string` | — | Item label |
| `icon` | `Component` | — | Item icon; pass a `@lucide/vue` component (**string classes are not accepted**) |
| `command` | `(event: DropdownMenuCommandEvent) => void` | — | Selection callback; the payload is `{ item, originalEvent }` |
| `disabled` | `boolean` | `false` | Whether the item is disabled (excluded from keyboard navigation and never calls `command`) |
| `separator` | `boolean` | `false` | Render a separator (other fields are ignored) |

> When you need a per-item class or a nested submenu, use declarative items instead (`v-for` + `CaomeiDropdownMenuItem`); see the migration section for the unimplemented entries.
>
> `label` doubles as the item's accessible name and its typeahead text; icon-only entries should still provide one.

## Disabled

A trigger's `disabled` disables the whole menu; an item's `disabled` disables only that item (it is excluded from keyboard navigation and does not emit `select`).

<demo
    vue="../examples/dropdown-menu/disabled.vue"
    ssg="true"
/>

## Modal mode

The default `modal: false` is non-modal: it does not lock page scroll, does not disable outside interaction and does not trap focus, which suits ordinary action menus. Passing `modal` enters modal mode: it locks page scroll, traps focus and hides background content.

<demo
    vue="../examples/dropdown-menu/modal.vue"
    ssg="true"
/>

## Composite component API

| Component | Key props | Description |
|------|-----------|------|
| `CaomeiDropdownMenu` | `v-model:open`, `modal` (default `false`), `dir` | Logical root container, no DOM |
| `CaomeiDropdownMenuTrigger` | `disabled`, `unstyled` | Trigger, renders `<button>`; `as-child` + `unstyled` reuses a custom button without inheriting the built-in skin |
| `CaomeiDropdownMenuContent` | `model`, `side` (`bottom`), `sideOffset` (`4`), `align` (`start`), `alignOffset` (`0`), `loop` (`true`), `forceMount` | Popup panel, contains a Portal; `model` provides data-driven items |
| `CaomeiDropdownMenuItem` | `disabled`, `shortcut`, `textValue` | Regular item, emits `select` |
| `CaomeiDropdownMenuCheckboxItem` | `v-model`, `disabled`, `shortcut`, `textValue` | Checkbox item, emits `select` |
| `CaomeiDropdownMenuRadioGroup` | `v-model` | Radio group container |
| `CaomeiDropdownMenuRadioItem` | `value`, `disabled`, `shortcut`, `textValue` | Radio item, emits `select` |
| `CaomeiDropdownMenuGroup` | — | Group container |
| `CaomeiDropdownMenuLabel` | — | Group label, not focusable |
| `CaomeiDropdownMenuSeparator` | — | Separator |

> Items use their text content for typeahead by default; with complex content or a `shortcut`, pass `textValue` to keep the shortcut hint out of the match.

## Accessibility

- It follows the WAI-ARIA Menu Button pattern: the trigger button outputs `aria-haspopup="menu"` and `aria-expanded`, items render semantically as `menuitem` / `menuitemcheckbox` / `menuitemradio`, and the panel is `role="menu"`.
- Keyboard: on the trigger, `Enter` / Space / `ArrowDown` opens and focuses the first item; between items use `ArrowUp` / `ArrowDown` to move, `Home` / `End` to jump, `Enter` / Space to select, and `Esc` to close and return focus to the trigger.
- The default `modal: false` is non-modal: it does not disable outside interaction, lock page scroll or trap focus (`Tab` can move out of the menu), avoiding layout shift from the disappearing scrollbar (see [Theming and styles §5.1](/design/theming#_5-1-浮层滚动锁与布局稳定性), Chinese); passing `modal` locks page scroll, traps focus and hides the background.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-dropdown-menu-z-index` | `1050` | Panel stacking level (above Dialog's 1001, below Toast's 1100) |
| `--caomei-dropdown-menu-min-width` | `9rem` | Panel minimum width (converges to `min(9rem, available width)` on narrow screens; the maximum is the available width too — see matrix #3 in [Responsive design](/design/responsive), Chinese) |
| `--caomei-dropdown-menu-padding` | `--caomei-space-1` | Panel padding |
| `--caomei-dropdown-menu-bg` | `--caomei-color-bg` | Panel background color |
| `--caomei-dropdown-menu-border` | `--caomei-color-border` | Panel border color |
| `--caomei-dropdown-menu-item-gap` | `--caomei-space-2` | Gap between elements inside an item |
| `--caomei-dropdown-menu-item-padding-x` | `--caomei-space-2` | Item horizontal padding |
| `--caomei-dropdown-menu-item-padding-y` | `--caomei-space-2` | Item vertical padding |
| `--caomei-dropdown-menu-item-highlighted-bg` | `--caomei-color-bg-elevated` | Item highlighted background |
| `--caomei-dropdown-menu-indicator-width` | `1em` | Width of the checkbox / radio indicator slot |
| `--caomei-dropdown-menu-separator-color` | `--caomei-color-border` | Separator color |
| `--caomei-dropdown-menu-trigger-gap` | `--caomei-space-1` | Gap between elements inside the trigger |
| `--caomei-dropdown-menu-trigger-padding-x` | `--caomei-space-3` | Trigger horizontal padding |
| `--caomei-dropdown-menu-trigger-padding-y` | `--caomei-space-2` | Trigger vertical padding |
| `--caomei-dropdown-menu-trigger-border` | `--caomei-color-border` | Trigger border color |
| `--caomei-dropdown-menu-trigger-bg` | `--caomei-color-bg` | Trigger background color |

```css
.caomei-dropdown-menu__content {
    --caomei-dropdown-menu-min-width: 12rem;
    --caomei-dropdown-menu-item-highlighted-bg: #f1f5f9;
}
```

## Migration from PrimeVue

PrimeVue's `<Menu :model :popup>` + `ref.toggle(event)` is an imperative popup anchored to an external element; here the API is declarative: **the original trigger button is itself the trigger** (the anchor is that button, equivalent to `toggle(event)`'s event-coordinate anchoring) and the panel always portals out. The per-point landing is in the table below.

```vue
<!-- PrimeVue: imperative, anchored to the event coordinates -->
<Button icon="pi pi-ellipsis-h" @click="toggle" />
<Menu ref="menu" :model="items" :popup="true" />
```

```ts
const menu = ref()
const toggle = (event: Event): void => menu.value.toggle(event)
```

```vue
<!-- caomei-ui: the original button is the trigger, same anchor -->
<CaomeiDropdownMenu>
  <CaomeiDropdownMenuTrigger as-child unstyled>
    <CaomeiButton variant="secondary" label="Actions">
      <template #icon><CaomeiIcon :icon="Ellipsis" /></template>
    </CaomeiButton>
  </CaomeiDropdownMenuTrigger>
  <CaomeiDropdownMenuContent :model="items" />
</CaomeiDropdownMenu>
```

| PrimeVue | This component |
| --- | --- |
| `<Menu :model="items" :popup="true" />` | `<CaomeiDropdownMenu>` + `<CaomeiDropdownMenuTrigger>` + `<CaomeiDropdownMenuContent :model="items" />` |
| `:popup` (popup mode) | No equivalent prop: the panel always portals out here, so drop it during migration |
| `ref.toggle(event)` / `show(event)` (anchored to event coordinates) | Make the original trigger button itself the `CaomeiDropdownMenuTrigger` (the anchor is that button); add `unstyled` when reusing a custom button with `as-child`, otherwise the built-in skin merges onto the child |
| `hide()` | Controlled `v-model:open` (on the root) |
| `model`'s `label` / `icon` / `command` / `disabled` / `separator` | Same field names on `model`; `icon` changes from a string class to an `@lucide/vue` component; the `command` payload `{ originalEvent, item }` → `{ item, originalEvent }` (same shape) |
| `#item` / `#itemicon` slots | Default slot + `model.icon`; use declarative items when you need full control |
| `append-to` / `auto-z-index` / `base-z-index` | Not implemented (the panel is always attached to `body`; layering goes through `--caomei-dropdown-menu-z-index`) |
| `show` / `hide` events | Listen to `v-model:open` |
| `aria-label` / `aria-labelledby` | The panel's accessible name is forwarded as attributes to `CaomeiDropdownMenuContent` |

**Not implemented / not exposed**: `MenuItem.items` (nested submenus; migrate to flat groups via `CaomeiDropdownMenuGroup` + `CaomeiDropdownMenuLabel`), `MenuItem.class` / `style` / `key` (per-item class and inline style; use declarative items with native attributes instead), `MenuItem.url` / `target` (navigation; navigate inside `command`), `MenuItem.visible` (filter the array in the caller) and the function forms of `label` / `disabled` (pass a boolean for `disabled`); the `#start` / `#end` / `#submenulabel` slots, `tabindex`, and PrimeVue's `unstyled` (which strips theme styles — different from the Trigger's `unstyled`, which drops the trigger skin).

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="dropdown-menu" />
