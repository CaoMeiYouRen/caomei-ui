# Editable

Edits a piece of text in place — handy for titles, nicknames and notes where space is tight. Wraps the Reka UI `Editable` primitives and exposes seven parts: root, area, preview, input and three action triggers.

## Basic usage

Focusing the preview starts editing (`activationMode` defaults to `focus`); press Enter to submit and `Esc` to revert. `CaomeiEditablePreview` stays in the Tab order, so keyboard users never need a pointer to get started.

<demo
    vue="../examples/editable/basic.vue"
    ssg="true"
/>

## Controlled value and action triggers

`v-model` holds the controlled value and `@submit` reports the submitted value; `CaomeiEditableEditTrigger` / `SubmitTrigger` / `CancelTrigger` turn edit / submit / cancel into explicit buttons. With `submitMode="none"` only the submit trigger submits (neither Enter nor blur does).

<demo
    vue="../examples/editable/controlled.vue"
    ssg="true"
/>

## Interaction and accessibility

- **Starting to edit**: `activationMode="focus"` (default) edits on focus; `"dblclick"` only on double click. The preview has `tabindex="0"`, so it is keyboard reachable.
- **Submitting**: `submitMode` is `enter` (Enter only), `blur` (blur only, default), `both`, or `none` (submit trigger only). Submitting writes back to `v-model` and emits `submit`.
- **Reverting**: `Esc` or the cancel trigger only leaves edit mode — it does **not** write the intermediate input back and does not emit `submit`.
- **Read-only and disabled**: `readonly` lets you enter edit mode to view but rejects input; `disabled` renders a disabled input and never writes back (the root carries `data-disabled`).
- **Accessible names**: inline editing has no visible label, so `CaomeiEditableInput`'s `label` provides the input's name; pass `label` to the triggers too (icon-only buttons need a name).
- Focus is moved to the input when editing starts (`selectOnFocus` selects the existing text).

## Props

| Component | Main props |
|------|------|
| `CaomeiEditable` | `v-model`, `placeholder`, `disabled`, `readonly`, `activationMode`, `submitMode`, `selectOnFocus`, `startWithEditMode`, `maxLength` |
| `CaomeiEditableArea` | — |
| `CaomeiEditablePreview` | — |
| `CaomeiEditableInput` | `label` |
| `CaomeiEditableEditTrigger` / `SubmitTrigger` / `CancelTrigger` | `label` |

## Style customization

| Variable | Default | Description |
|------|------|------|
| `--caomei-editable-min-height` | `--caomei-control-height-md` | Minimum height of the inline editor |
| `--caomei-editable-input-width` | `12rem` | Width of the input while editing |

<ComponentApi name="editable" />
