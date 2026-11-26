# Menubar

A desktop-style horizontal menu bar: a row of triggers sharing popup menus, with only one menu open at a time. Wraps the Reka UI `Menubar` primitives and exposes menu / trigger / content / item layers.

## Basic usage

`CaomeiMenubar` is the container, `CaomeiMenubarMenu` groups a trigger with its content and `value` identifies that menu. Items accept `disabled` and a display-only `shortcut` hint.

<demo
    vue="../examples/menubar/basic.vue"
    ssg="true"
/>

## Grouped items

Items can be grouped for readability: a group is a plain element (`role="group"` plus a name) and does not change keyboard order. No built-in group component is provided; group labels and separators are organised by the consumer.

<demo
    vue="../examples/menubar/grouped.vue"
    ssg="true"
/>

## Controlled open state

`v-model` pairs with each `CaomeiMenubarMenu`'s `value`: writing a `value` opens that menu and closing falls back to an empty string. The controlled value only affects the open state, not focus. A menu without `value` gets a Reka-generated id that cannot be addressed later, so controlled usage should always pass one.

## Non-modal semantics

The menubar is a non-modal popup: opening a menu does **not** isolate the page, so the background stays clickable and focusable; clicking outside or switching to another trigger closes it, and `Esc` closes it and returns focus to the trigger. Use `CaomeiDropdownMenu` (pass `modal`) or a dialog when modal behaviour is required.

## Keyboard and accessibility

- When several menubars coexist, give each an accessible name (the root forwards `aria-label`) so no unnamed `menubar` widget is exposed.
- The bar is `role="menubar"`; triggers are `role="menuitem"` with `aria-haspopup="menu"`. Left / right arrows move between triggers (`loop` controls wrapping) and `Home` / `End` jump to the first / last one.
- `Enter` / `Space` toggle the menu and `ArrowDown` opens it; inside the content arrows move, and `Esc` closes it and returns focus to the trigger.
- Disabled items carry `data-disabled` and cannot be focused or activated; `shortcut` is display only and binds no keys.

## Props

| Component | Main props |
|------|------|
| `CaomeiMenubar` | `v-model`, `loop`, `dir` |
| `CaomeiMenubarMenu` | `value` |
| `CaomeiMenubarTrigger` | `disabled` |
| `CaomeiMenubarContent` | `side`, `sideOffset`, `align`, `alignOffset`, `loop`, `forceMount` |
| `CaomeiMenubarItem` | `disabled`, `shortcut`, `textValue` |

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-menubar-gap` | `--caomei-space-1` | Spacing between triggers |
| `--caomei-menubar-padding` | `--caomei-space-1` | Bar padding |
| `--caomei-menubar-border` | `--caomei-color-border` | Bar border |
| `--caomei-menubar-bg` | `--caomei-color-bg-elevated` | Bar background |
| `--caomei-menubar-trigger-padding-x` | `--caomei-space-3` | Trigger horizontal padding |
| `--caomei-menubar-trigger-padding-y` | `--caomei-space-1` | Trigger vertical padding |
| `--caomei-menubar-trigger-active-bg` | `--caomei-color-bg` | Trigger hover / open background |
| `--caomei-menubar-content-padding` | `--caomei-space-1` | Menu content padding |
| `--caomei-menubar-content-border` | `--caomei-color-border` | Menu content border |
| `--caomei-menubar-content-bg` | `--caomei-color-bg-elevated` | Menu content background |
| `--caomei-menubar-min-width` | `9rem` | Menu content min-width |
| `--caomei-menubar-z-index` | `--caomei-z-dropdown` | Menu content z-index |
| `--caomei-menubar-item-gap` | `--caomei-space-2` | Item text/shortcut gap |
| `--caomei-menubar-item-padding-x` | `--caomei-space-2` | Item horizontal padding |
| `--caomei-menubar-item-padding-y` | `--caomei-space-2` | Item vertical padding |
| `--caomei-menubar-item-highlighted-bg` | `--caomei-color-bg-elevated` | Item highlight background |

<ComponentApi name="menubar" />
