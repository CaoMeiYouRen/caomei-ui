# TagGroup

Keeps a set of tags in one container: use it as a **selection control** (single or multiple) or as a set of **removable filter chips**. Wraps the Reka UI `TagGroup` primitives and exposes four parts: root, item, text and delete trigger.

## Basic usage

With `selectionMode="multiple"` clicking a tag toggles it; `"single"` selects one; `none` (the default) shows tags without selection. Arrow keys move focus between tags in the same group.

<demo
    vue="../examples/tag-group/basic.vue"
    ssg="true"
/>

## Removable tags

`CaomeiTagGroupItemDelete` removes the tag from the selection and emits `remove`; callers usually update their own list from it. Removal is enabled by **the root listening to `remove`** (without a listener the delete trigger does nothing), so a tag never looks removable without the semantics behind it.

<demo
    vue="../examples/tag-group/removable.vue"
    ssg="true"
/>

## Interaction and accessibility

- **Selection**: `selectionMode` is `none` (default), `single` or `multiple`; `v-model` is a string for `single` and an array for `multiple`. `disallowEmptySelection` keeps at least one tag selected.
- **Keyboard**: items use a roving tabindex and arrow keys move focus within the group (`loop` is on by default); `Delete` / `Backspace` removes the focused tag.
- **Removal**: the delete trigger's accessible name comes from the tag text by default (Reka points `aria-labelledby` at the tag), so put **only an icon** inside it; pass `label` (for example "Remove Frontend") to supply a custom name.
- **Disabled**: `disabled` on `CaomeiTagGroup` disables the whole group; `disabled` on `CaomeiTagGroupItem` disables a single tag (no selection, no removal).
- Give the container an accessible name (for example `aria-label="Skill tags"`) so assistive technologies know what the group represents.

## Props

| Component | Main props |
|------|------|
| `CaomeiTagGroup` | `v-model`, `selectionMode`, `disallowEmptySelection`, `disabled`, `loop` |
| `CaomeiTagGroupItem` | `value`, `disabled`, `textValue` |
| `CaomeiTagGroupItemText` | — |
| `CaomeiTagGroupItemDelete` | `label` |

## Events

| Event | Payload | Description |
|------|------|------|
| `remove` | the removed tag's value | Emitted when a tag is removed through the delete trigger or `Delete` / `Backspace` |

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-tag-group-gap` | `--caomei-space-2` | Gap between tags |
| `--caomei-tag-group-item-border` | `--caomei-color-border` | Tag border |
| `--caomei-tag-group-item-radius` | `--caomei-radius-sm` | Tag corner radius |
| `--caomei-tag-group-item-bg` | `--caomei-color-bg-elevated` | Tag background |
| `--caomei-tag-group-item-active-border` | `--caomei-color-primary` | Selected border |
| `--caomei-tag-group-item-active-bg` | `--caomei-color-primary` | Selected background |

<ComponentApi name="tag-group" />
