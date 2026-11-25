# ContextMenu

ContextMenu opens a contextual menu at the pointer (or on a touch long-press) inside a target area. It wraps Reka UI's `ContextMenu`, keeping item, separator, shortcut and danger semantics aligned with the dropdown menu.

## Basic usage

`CaomeiContextMenu` wraps the trigger area and the menu content; `model` on `CaomeiContextMenuContent` holds data-driven items and `command` runs on selection with `{ item, originalEvent }`. `shortcut` only renders the shortcut text — it does not bind keys.

<demo
    vue="../examples/context-menu/basic.vue"
    ssg="true"
/>

## Groups, labels and shortcuts

Use the subcomponents for group headings or custom content: `CaomeiContextMenuGroup` + `CaomeiContextMenuLabel` + `CaomeiContextMenuItem` + `CaomeiContextMenuSeparator`. Items support `danger`, `disabled` and `shortcut`.

<demo
    vue="../examples/context-menu/groups.vue"
    ssg="true"
/>

## Disabled items

Disabled items stay in the menu but ignore clicks and keyboard selection; `data-disabled` is available as a styling hook. Data items express it with `disabled: true`.

<demo
    vue="../examples/context-menu/disabled.vue"
    ssg="true"
/>

## Subcomponent props

| Component | Main props |
|------|------|
| `CaomeiContextMenu` | `modal` (modal mode, default `false`) |
| `CaomeiContextMenuContent` | `model` (data items), `loop` (keyboard looping, default `true`), `forceMount` |
| `CaomeiContextMenuTrigger` | `unstyled` (drop the trigger class) |
| `CaomeiContextMenuItem` | `disabled`, `shortcut`, `danger`, `textValue` |
| `CaomeiContextMenuGroup` / `CaomeiContextMenuLabel` / `CaomeiContextMenuSeparator` | Attributes pass through to the matching Reka primitive |

## Open state, keyboard and focus

- `v-model:open` controls visibility; once open, Reka provides arrow-key navigation, Enter to select and Escape to close.
- The trigger generates no box (`display: contents`) and carries no `tabindex`: the menu opens from the pointer, and keyboard users need an entry point from the caller (for example listening for Shift+F10 on a focusable element and writing `v-model:open`).
- After Escape, focus returns to the element focused before opening (usually the page or the surrounding modal content), not to the trigger itself. The component guarantees this (also with `forceMount`); if a consumer such as `command` has already moved focus into a new container, it is not stolen back.
- While open the background is `inert` through the existing overlay wiring, the trigger is kept as the second isolation root, and everything is restored on close.

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-context-menu-z-index` | `--caomei-z-dropdown` | Panel stacking (above modal content) |
| `--caomei-context-menu-min-width` | `10rem` | Panel min width |
| `--caomei-context-menu-padding` | `--caomei-space-1` | Panel padding |
| `--caomei-context-menu-radius` | `--caomei-radius-md` | Panel radius |
| `--caomei-context-menu-bg` | `--caomei-color-bg-elevated` | Panel background |
| `--caomei-context-menu-border` | `--caomei-color-border` | Panel border |
| `--caomei-context-menu-item-padding-y` | `--caomei-space-2` | Item vertical padding |
| `--caomei-context-menu-item-highlighted-bg` | `--caomei-color-bg-elevated` | Keyboard highlight (override when equal to the panel background) |
| `--caomei-context-menu-danger-bg` | 12% tint of the danger color | Danger item highlight |

<ComponentApi name="context-menu" />
