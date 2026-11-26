# NavigationMenu

Site-level navigation: a set of triggers sharing one content viewport, opened by hover or by click / keyboard toggling without jumping between panels. Wraps the Reka UI `NavigationMenu` primitives and exposes menu / trigger / content / link layers.

## Basic usage

`CaomeiNavigationMenu` is the container (list + content viewport). `CaomeiNavigationMenuTrigger` combines a list item with its trigger, and **the content must go into the `#content` slot**: the trigger component renders only its default slot inside the button, so content belongs beside the trigger within the list item; interactive non-teleported elements placed in the default slot would end up nested inside the button.

<demo
    vue="../examples/navigation-menu/basic.vue"
    ssg="true"
/>

## Content panels

The panel is rendered by Reka into the root viewport and the viewport sizes itself to the active panel; a panel can hold links, copy or any layout.

<demo
    vue="../examples/navigation-menu/panel.vue"
    ssg="true"
/>

## Interaction semantics

- Navigation menus are **non-modal**: the background stays interactive while open, and clicking outside or switching triggers closes the menu.
- Hover opens after `delayDuration` (200ms by default) and `skipDelayDuration` controls the window where moving between menus skips the delay. With the keyboard, `Enter` / `Space` toggle, `ArrowDown` enters the first link **once open**, and `Esc` closes and returns focus to the trigger.
- `v-model` pairs with a trigger's `value`: writing a `value` opens that menu and closing writes back an empty string; without `v-model` the component is uncontrolled. A trigger without `value` gets a Reka-generated id that cannot be addressed later, so controlled usage should always pass one.

## Keyboard and accessibility

- The root is a `nav` element (implicit `role="navigation"`); `aria-label` is forwarded as the navigation name, and triggers expose `aria-expanded` / `aria-controls`.
- Panels default to `role="group"` and take their accessible name from the trigger; pass `role` to override.
- Use `active` on the current page link to map `aria-current="page"`.

## Props

| Component | Main props |
|------|------|
| `CaomeiNavigationMenu` | `v-model`, `delayDuration`, `skipDelayDuration`, `orientation`, `dir` |
| `CaomeiNavigationMenuTrigger` | `value`, `disabled`, `#content` slot |
| `CaomeiNavigationMenuContent` | `forceMount` |
| `CaomeiNavigationMenuLink` | `active` |

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-navigation-menu-gap` | `--caomei-space-1` | Spacing between triggers |
| `--caomei-navigation-menu-padding` | `--caomei-space-1` | Bar padding |
| `--caomei-navigation-menu-border` | `--caomei-color-border` | Bar border |
| `--caomei-navigation-menu-bg` | `--caomei-color-bg-elevated` | Bar background |
| `--caomei-navigation-menu-trigger-gap` | `--caomei-space-1` | Gap between trigger icon and text |
| `--caomei-navigation-menu-trigger-padding-x` | `--caomei-space-3` | Trigger horizontal padding |
| `--caomei-navigation-menu-trigger-padding-y` | `--caomei-space-1` | Trigger vertical padding |
| `--caomei-navigation-menu-trigger-active-bg` | `--caomei-color-bg` | Trigger hover / open background |
| `--caomei-navigation-menu-content-min-width` | `12rem` | Panel min-width |
| `--caomei-navigation-menu-content-padding` | `--caomei-space-2` | Panel padding |
| `--caomei-navigation-menu-content-border` | `--caomei-color-border` | Panel border |
| `--caomei-navigation-menu-content-bg` | `--caomei-color-bg-elevated` | Panel background |
| `--caomei-navigation-menu-link-padding-x` | `--caomei-space-2` | Link horizontal padding |
| `--caomei-navigation-menu-link-padding-y` | `--caomei-space-2` | Link vertical padding |
| `--caomei-navigation-menu-link-active-bg` | `--caomei-color-bg` | Link hover / current background |
| `--caomei-navigation-menu-z-index` | `--caomei-z-dropdown` | Content viewport z-index |

<ComponentApi name="navigation-menu" />
