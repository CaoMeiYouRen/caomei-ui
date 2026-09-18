# Tabs

Tabs switch between a set of sibling panels, showing only one at a time; it wraps Reka UI Tabs.

## Basic usage

Tabs use a compound API: `CaomeiTabs` holds the current item `v-model` and root-level config such as `orientation`, `CaomeiTabList` / `CaomeiTabTrigger` form the trigger list, and `CaomeiTabContent` holds each panel's content. A trigger's `value` corresponds one-to-one with a panel's `value`.

<demo
    vue="../examples/tabs/basic.vue"
    ssg="true"
/>

> `CaomeiTabList` needs an accessible name: use `aria-label` when there is no visible title, or `aria-labelledby` to associate a visible title; without one, a screen reader cannot describe the purpose of the tab set.

## Orientation

`orientation="vertical"` switches to a vertical layout, and keyboard navigation changes to the up / down arrow keys.

<demo
    vue="../examples/tabs/vertical.vue"
    ssg="true"
/>

## Controlled and uncontrolled

- Controlled: pass `v-model`, and the current item is decided entirely by external state.
- Uncontrolled: pass `default-value` to set the initial item; after interaction the current value is maintained internally.

`CaomeiTabs` emits `update:modelValue` with the `value` of the activated trigger.

## Disabled and manual activation

- `CaomeiTabTrigger`'s `disabled` disables a single item, and a disabled trigger is excluded from the keyboard navigation sequence.
- With `activationMode="manual"`, focusing no longer switches automatically; activate with a click or Enter / Space. The default `automatic` activates on focus.

> `activationMode` takes effect at initialization; changing it dynamically at runtime does not change the already-established activation behavior (a Reka internal limitation).

<demo
    vue="../examples/tabs/states.vue"
    ssg="true"
/>

## Composite component API

Besides the root component API below, each part of the compound component has one responsibility:

| Component | Key props | Description |
|------|-----------|------|
| `CaomeiTabs` | `v-model`, `defaultValue`, `orientation`, `activationMode`, `unmountOnHide`, `dir` | Root container, provides context |
| `CaomeiTabList` | `loop` (default `true`) | Trigger list, renders `role="tablist"` |
| `CaomeiTabTrigger` | `value`, `disabled` | Trigger, renders `role="tab"` |
| `CaomeiTabContent` | `value`, `forceMount` | Panel, renders `role="tabpanel"` |

`unmountOnHide` defaults to `true`, so inactive panel content is unmounted; when set to `false`, panels stay in the DOM with `hidden`, which helps browser find-in-page or form retention.

## Accessibility

- It follows the WAI-ARIA Tabs pattern: `role="tablist"` / `role="tab"` / `role="tabpanel"`, associated via `aria-controls` and `aria-labelledby`.
- Keyboard: `ArrowLeft` / `ArrowRight` (horizontal) or `ArrowUp` / `ArrowDown` (vertical) to switch, `Home` / `End` to jump to the first / last available item, and `Tab` to enter the current panel.
- A disabled trigger outputs `disabled` and `data-disabled` and is excluded from keyboard navigation.
- The focus ring uses `:focus-visible` and respects `prefers-reduced-motion`.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-tabs-gap` | `--caomei-space-2` | Gap between the list and the panel |
| `--caomei-tabs-list-gap` | `--caomei-space-1` | Gap between triggers |
| `--caomei-tabs-border` | `--caomei-color-border` | List divider color |
| `--caomei-tabs-trigger-gap` | `--caomei-space-1` | Gap between the icon and the text inside a trigger |
| `--caomei-tabs-trigger-padding-x` | `--caomei-space-3` | Trigger horizontal padding |
| `--caomei-tabs-trigger-padding-y` | `--caomei-space-2` | Trigger vertical padding |
| `--caomei-tabs-trigger-color` | `--caomei-color-text-muted` | Default trigger text color |
| `--caomei-tabs-trigger-active-color` | `--caomei-color-primary` | Active trigger text color |
| `--caomei-tabs-indicator` | `--caomei-color-primary` | Active indicator bar color |

```css
.caomei-tabs {
    --caomei-tabs-indicator: #16a34a;
    --caomei-tabs-trigger-active-color: #16a34a;
}
```

## Migration from PrimeVue

PrimeVue v4 composes tabs from five components; this library merges them into four:

| PrimeVue | This component |
| --- | --- |
| `<Tabs v-model:value>` | `<CaomeiTabs v-model>` |
| `<TabList>` | `<CaomeiTabList>` |
| `<Tab :value :disabled>` | `<CaomeiTabTrigger :value :disabled>` |
| `<TabPanels>` + `<TabPanel :value>` | `<CaomeiTabContent :value>` (the `TabPanels` container layer is merged into the panel component) |
| `v-model:value` | `v-model` (the value domain is the same `string \| number`) |
| `lazy` (default `false`; with `true` hidden panels are not rendered) | `unmountOnHide` (default `true`; same direction, opposite default — see below) |
| `selectOnFocus` (default `false`) | `activationMode` (`automatic` / `manual`; same direction, opposite default — see below) |
| v3 `<TabView v-model:activeIndex>` + `<TabPanel :header>` | `<CaomeiTabs v-model>` + `<CaomeiTabTrigger>` / `<CaomeiTabContent>`; the index becomes an explicit `value` identifier |
| — | `orientation`, `dir`, `CaomeiTabList`'s `loop` and `CaomeiTabContent`'s `forceMount` are new here |

> Two fields point the same way but default opposite, so set them explicitly when migrating: `lazy` defaults to `false` (DOM kept) against `unmountOnHide`'s `true` (unmounted) — pass `:unmount-on-hide="false"` to keep the DOM; `selectOnFocus` defaults to `false` (no activation on focus) against `activationMode`'s `automatic` (activate on focus) — pass `activation-mode="manual"` to keep focus-only navigation.

> **Intentional differences**: ① `activationMode` takes effect at initialization; switching it at runtime does not change the established activation behaviour (a Reka implementation limitation); ② `unmountOnHide` unmounts content by default, whereas PrimeVue's `lazy` keeps the DOM by default.

**Not implemented (registered as a follow-up; this section will be updated when it ships)**: `scrollable` / `showNavigators` and the `#previcon` / `#nexticon` slots (scroll navigation buttons; the list scrolls natively here when it overflows), `tabindex` (root-level; triggers are individually focusable), the `as` / `asChild` polymorphic rendering of `Tab` and `TabPanel` (including the `asChild` scope of `TabPanel`'s default slot), and the v4-deprecated `TabPanel` fields supported only by `TabView` (`header` / `disabled` / `headerStyle` / `headerClass` / `headerProps` / `headerActionProps` / `contentStyle` / `contentClass` / `contentProps` and the `#header` slot — the header text uses `CaomeiTabTrigger`'s default slot, disabling uses the trigger's `disabled`, and panel styling goes through class names and CSS variables).

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="tabs" />
