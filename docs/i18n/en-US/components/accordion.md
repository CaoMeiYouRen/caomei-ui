# Accordion

The accordion organizes content into sections that expand / collapse one at a time when the heading is clicked; it wraps Reka UI Accordion.

## Basic usage

`CaomeiAccordion` holds the `v-model` expanded items, and `CaomeiAccordionItem` defines a single section: `value` is the unique identifier, `title` is the trigger text, and the default slot is the panel content.

`type="single"` (default) expands only one item at a time; `collapsible` allows clicking an expanded item again to collapse it.

<demo
    vue="../examples/accordion/basic.vue"
    ssg="true"
/>

## Multiple mode

`type="multiple"` allows several items to be expanded at once, in which case `v-model` / `defaultValue` is an array of strings.

<demo
    vue="../examples/accordion/multiple.vue"
    ssg="true"
/>

## Default expanded and disabled

`defaultValue` sets the initially expanded item; an item's `disabled` disables that single item, and the root component's `disabled` disables the whole accordion. The lower part of the example also demonstrates a custom trigger via the `#trigger` slot.

<demo
    vue="../examples/accordion/states.vue"
    ssg="true"
/>

## Custom trigger

`title` carries plain text only; for rich content such as icons, use the `#trigger` slot instead (see the lower part of the example above). Panel content uses the default slot.

> `CaomeiAccordionItem`'s `title` is a component prop and intercepts the native HTML `title` tooltip attribute; use another approach when a native tooltip is required.

## Composite component API

| Component | Key props | Description |
|------|-----------|------|
| `CaomeiAccordion` | `v-model`, `type`, `defaultValue`, `collapsible`, `disabled`, `unmountOnHide` | Root container, provides context |
| `CaomeiAccordionItem` | `value` (required), `title`, `disabled`; `#trigger` / default slot | A single section, rendering an `h3` heading and the trigger internally |

`unmountOnHide` defaults to `true`, unmounting panel content when collapsed; when set to `false`, the content stays in the DOM marked with `hidden="until-found"`, so it can be located by in-page find in browsers that support the attribute (Chromium-based) and is easier to retain for forms.

## Accessibility

- It follows the WAI-ARIA Accordion pattern: the heading wraps a native `<button>` trigger in `<h3>`, `aria-expanded` reflects the expanded state, and the panel is `role="region"` associated with the trigger via `aria-labelledby`.
- Keyboard: `ArrowUp` / `ArrowDown` move focus between triggers, `Home` / `End` jump to the first / last item, and `Enter` / Space expands or collapses.
- A disabled item outputs `disabled` and `aria-disabled` and is excluded from interaction and keyboard navigation.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-accordion-border` | `--caomei-color-border` | Container border and divider color |
| `--caomei-accordion-radius` | `--caomei-radius-md` | Container border radius |
| `--caomei-accordion-trigger-gap` | `--caomei-space-3` | Gap between the trigger text and the indicator arrow |
| `--caomei-accordion-trigger-padding-x` | `--caomei-space-4` | Trigger horizontal padding |
| `--caomei-accordion-trigger-padding-y` | `--caomei-space-3` | Trigger vertical padding |
| `--caomei-accordion-title-gap` | `--caomei-space-2` | Gap between the icon and the text in a custom trigger |
| `--caomei-accordion-panel-padding` | `--caomei-space-3` | Panel vertical padding (horizontal reuses the trigger padding) |

```css
.caomei-accordion {
    --caomei-accordion-border: #d4d4d8;
    --caomei-accordion-radius: 12px;
}
```

## Migration from PrimeVue

PrimeVue v4 composes the accordion from four components; this library merges them into two:

| PrimeVue | This component |
| --- | --- |
| `<Accordion v-model:value>` + `<AccordionPanel :value>` + `<AccordionHeader>` + `<AccordionContent>` | `<CaomeiAccordion v-model>` + `<CaomeiAccordionItem :value :title>` |
| `v-model:value` | `v-model` (the value domain is `string \| string[]`; `number` must be converted to a string) |
| `multiple` (default `false`) | `type="multiple"` (default `single`; the attribute changes from the boolean `multiple` to the `type` enum, with the same default semantics) |
| `lazy` (default `false`; with `true` hidden panels are not rendered) | `unmountOnHide` (default `true`; same direction, opposite default — see below) |
| `<AccordionHeader>` text | `title` (use the `#trigger` slot for rich content) |
| `<AccordionContent>` | Default slot |
| Panel-level `disabled` | Item `disabled` (a root-level `disabled` is also available) |
| v3 `activeIndex` (deprecated in v4) / `header` | The string value of `v-model` / `title` |
| — | `collapsible`, `defaultValue` (uncontrolled initial expansion), root-level `disabled` and the `#trigger` slot are new here |

> `lazy` and `unmountOnHide` point the same way but default opposite: `lazy` defaults to `false` (DOM kept), `unmountOnHide` defaults to `true` (unmounted). After migration `:lazy="true"` needs no change (unmounting is the default); pass `:unmount-on-hide="false"` when the DOM must be kept.

> **Intentional differences**: ① PrimeVue's single mode is **always collapsible** (clicking the expanded item again clears it), while this library defaults to `collapsible=false`; pass `collapsible` explicitly for the same behaviour; ② the trigger is a native `<button>` wrapped in `<h3>` (as recommended by the WAI-ARIA Accordion pattern), whereas PrimeVue v4 renders a bare `<button>`; ③ the indicator arrow is the built-in `ChevronDown` (rotated 180° when expanded), with no `expandIcon` / `collapseIcon`.

**Not implemented (registered as a follow-up; this section will be updated when it ships)**: `expandIcon` / `collapseIcon` and the `#expandicon` / `#collapseicon` slots (custom indicator icons; a rich trigger can carry its own icon through `#trigger`, while the built-in arrow is kept and is not removed by `#trigger`), `tabindex` (root-level; triggers are individually focusable), `selectOnFocus` (expand on focus), the `as` / `asChild` polymorphic rendering of `AccordionPanel` and `AccordionHeader`, the `#toggleicon` slot of `AccordionHeader`, and the v4-deprecated `update:activeIndex` / `tab-open` / `tab-close` / `tab-click` events (use `v-model` instead).

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="accordion" />
