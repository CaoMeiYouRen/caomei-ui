# Menu

A navigation menu organises page-level navigation (sidebars and top bars) using the WAI-ARIA **disclosure navigation** pattern (`nav` + list + expandable submenus); submenu expansion is powered by Reka's `Collapsible` primitive. Compose it with `CaomeiMenu`, `CaomeiMenuItem` and `CaomeiSubMenu`.

## Basic usage

`CaomeiMenu` renders a `nav` + `ul`; `CaomeiMenuItem` renders a link when `href` is given and a button otherwise; mark the current page with `current` (mapped to `aria-current="page"`).

<demo
    vue="../examples/menu/basic.vue"
    ssg="true"
/>

## Horizontal layout and controlled expansion

`orientation` accepts `vertical` (default, sidebars) or `horizontal` (top bars). A `CaomeiSubMenu`'s expansion can be controlled with `v-model:open`, or seeded with `default-open`.

<demo
    vue="../examples/menu/orientation.vue"
    ssg="true"
/>

## Keyboard navigation

| Key | Behaviour |
| --- | --- |
| `ArrowDown` / `ArrowUp` | Vertical: move between focusable items (no wrap; stops at the ends) |
| `ArrowRight` / `ArrowLeft` | Horizontal: move between items; vertical: expand / collapse the focused submenu (focus moves into the first panel item on expand, back to the trigger on collapse) |
| `Home` / `End` | Jump to the first / last item |
| `Escape` | Collapse the enclosing submenu and return focus to its trigger |
| `Enter` / `Space` | Activate the item (follow the link / click the button); on a submenu trigger, toggle expansion |

A collapsed submenu panel is **unmounted** by Presence, so its items leave both the keyboard sequence and the accessibility tree. **Collapsing (`ArrowLeft` / `Escape`) requires focus to be inside the panel**: while focus sits on an expanded trigger neither key acts (so stray keystrokes are not swallowed).

## Accessibility

- The container is a `nav` (`label` maps to `aria-label`) plus `ul[role="list"]`: `list-style: none` removes list semantics in Safari, hence the explicit `role="list"`.
- Items are native links or buttons; the current item emits `aria-current="page"` via `current` (`step` / `location` / `date` / `time` are also accepted).
- Submenu triggers emit `aria-expanded` and `aria-controls` (pointing at the panel container).
- Disabled items emit `aria-disabled="true"` (links also drop `href` and their tab stop) and are excluded from the arrow-key sequence.
- The component ships **no built-in text**: nothing is rendered when `label` is omitted; provide one per navigation region when a page has several.

## Menu vs DropdownMenu

| | Menu (this component) | DropdownMenu |
| --- | --- | --- |
| Semantics | **Navigation**: a set of page destinations | **Actions**: a set of commands |
| Structure | A persistent `nav` list; submenus expand in place | Trigger plus a floating menu above the content |
| Tier | Flows in the document (no floating tier) | Floating tier `--caomei-z-dropdown` (1050) |
| Typical use | Sidebar / top-bar navigation, settings sections | "More actions", context-menu style commands |

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-menu-gap` | `2px` | Gap between items / between panel and trigger |
| `--caomei-menu-indent` | `--caomei-space-4` | Submenu panel indent |
| `--caomei-menu-item-gap` | `--caomei-space-2` | Gap between icon and text inside an item |
| `--caomei-menu-item-padding` | `--caomei-space-2 --caomei-space-3` | Item padding |
| `--caomei-menu-item-radius` | `--caomei-radius-md` | Item corner radius |
| `--caomei-menu-item-hover-bg` | `--caomei-color-bg-elevated` | Hover background |
| `--caomei-menu-item-current-bg` | `--caomei-color-bg-elevated` | Current item background |
| `--caomei-menu-item-current-color` | `--caomei-color-primary` | Current item text colour |

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `<Menu :model>` / `<Menubar :model>` (items render as a popup or a command bar) | Declarative `<CaomeiMenu>` + `<CaomeiMenuItem>` / `<CaomeiSubMenu>` (navigation semantics, expands in place) |
| `MenuItem`'s `label` / `icon` / `url` / `target` | Item content goes in the default slot (icons via `@lucide/vue`); links use the native `href` attribute |
| `MenuItem`'s `items` (nesting) | Wrap children in `<CaomeiSubMenu>` |
| `MenuItem`'s `command` | A button item (no `href`) listens to the native `click` |
| `PanelMenu` / `TieredMenu` | Nested `<CaomeiSubMenu>` (one per level) |
| `<Breadcrumb :model>` | `<CaomeiBreadcrumb>` + `<CaomeiBreadcrumbItem>` |
| `appendTo` / `baseZIndex` / `popup` | **Not applicable**: a navigation menu flows in the document and produces no overlay (use `CaomeiDropdownMenu` for floating action menus) |

**Known intentional differences**: ① this component uses **navigation** semantics (`nav` + list + `aria-current`) rather than the WAI-ARIA `menu` / `menubar` roles — PrimeVue's `Menubar` uses the `menubar` role, so any automation asserting on that role must be updated after migration; ② submenus expand in place (disclosure) instead of popping up as overlays; ③ keyboard navigation is handled by this component (arrow keys, Home / End, Escape), which PrimeVue's navigation menus do not provide.

### Differences from Element Plus `el-menu`

| Element Plus | This component |
| --- | --- |
| `<el-menu>` + `<el-menu-item>` + `<el-sub-menu>` | `<CaomeiMenu>` + `<CaomeiMenuItem>` + `<CaomeiSubMenu>` |
| `default-active` + `index` (string index for the active item) | Per-item `current` (mapped to `aria-current`, no global index) |
| `router` / `route` (built-in route navigation) | Use `href`, or wrap a `RouterLink` yourself |
| `collapse` (shrink the whole bar to icons) | **Not provided**: compose the collapsed form yourself (here "collapse" refers to submenu expansion) |
| `mode="horizontal"` / `"vertical"` | `orientation` (`horizontal` / `vertical`) |
| `unique-opened` (one submenu at a time) | **Not provided**: several submenus may be open at once (make them mutually exclusive via `v-model:open` if needed) |
| `@select` / `@open` / `@close` events | Items listen to the native `click`; expansion can be observed via `v-model:open` |
| `ellipsis` / `popper-*` / `background-color` styling props | Style via CSS variables and class names; no ellipsis collapsing and no popup submenus |

<ComponentApi name="menu" />
