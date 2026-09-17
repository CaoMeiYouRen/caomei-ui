# SplitButton

A split button pairs a main button with a dropdown button: the main button triggers the default action, while the dropdown reveals a set of secondary actions. Built in-house by composing `CaomeiButton` and `CaomeiDropdownMenu`.

## Basic usage

The main button emits `click`; the dropdown menu is described by `model`, and each item runs its `command` callback. Put the main button's visible text in the default slot and its icon in the `#icon` slot; `label` is the main button's **invisible accessible name** (maps to `aria-label`, for icon-only usage), and `menuLabel` does the same for the menu button.

<demo
    vue="../examples/split-button/basic.vue"
    ssg="true"
/>

## Appearance and states

The main and menu buttons share `variant` / `tone` / `size` / `rounded`; the menu button shows only an icon and keeps a built-in accessible name. `disabled` disables both buttons, while `loading` only puts the main button into the loading state (the dropdown stays usable).

<demo
    vue="../examples/split-button/options.vue"
    ssg="true"
/>

## Menu data

`model` is an array of menu items; each item supports:

| Field | Description |
| --- | --- |
| `label` | Menu item text |
| `icon` | Menu item icon; pass a `@lucide/vue` icon component |
| `command` | Selection callback receiving `{ item, originalEvent }` |
| `disabled` | Whether the item is disabled |
| `separator` | Render as a separator (other fields are ignored) |

The menu side is controlled by `menuSide` (default `bottom`) and `menuAlign` (default `end`).

> Migration mapping (PrimeVue → caomei-ui): `label` → the default slot (visible text); this library unifies `label` as the **invisible accessible name** (see the development standards), so pass `label` only for icon-only buttons. `icon` → the `#icon` slot (main button; pass a `@lucide/vue` component, not a class-name string); `model` → `model` (`MenuItem`'s `label` / `icon` / `command` / `disabled` are supported; `icon` takes a component); `severity` → `tone`; `text` → `variant="ghost"`; `outlined` → `variant="secondary"`; `size="small"` / `"large"` → `sm` / `lg`; `rounded` → `rounded`. **Not implemented / not exposed (no downstream usage)**: `MenuItem`'s `items` submenu, `url` / `target` navigation, `menuButtonIcon` / `dropdownIcon` (fixed menu-button icon), `menuButtonProps` / `buttonProps` (use root attributes and the `#icon` slot instead), `raised` / `plain`, `appendTo` / `baseZIndex` / `autoZIndex` (the panel is portaled with fixed layering); `fluid` is not implemented (content width).

> The root element is a `CaomeiButtonGroup` (reusing its two-button splice rules); attributes such as `class` / `style` / `id` fall through to that container. ButtonGroup-specific props such as `orientation` are not part of the SplitButton API; do not pass them.

## Accessibility

- The main button's accessible name resolves as `label` > forwarded `aria-label` (there is no built-in fallback text); the menu button's built-in accessible name ("More actions") is overridable via `menuLabel`.
- The menu button exposes `aria-haspopup="menu"` and `aria-expanded`, and the menu supports arrow-key navigation and Esc to close (provided by Reka DropdownMenu).

<ComponentApi name="split-button" />
