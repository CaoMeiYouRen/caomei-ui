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

<ComponentApi name="accordion" />
