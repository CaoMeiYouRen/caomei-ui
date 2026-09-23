# TagsInput

A tags input lets users enter multiple free-text tags: commit with Enter or a delimiter, remove tags by clicking, with an optional count limit and duplicate rejection. It wraps Reka UI's `TagsInput` primitive.

## Basic usage

`v-model` binds the tag array (`string[]`); `placeholder` hints how to enter tags, and `label` provides the accessible name when there is no visible label (same convention as Input / Select — no `aria-label` is rendered when omitted).

<demo
    vue="../examples/tags-input/basic.vue"
    ssg="true"
/>

## Committing and removing

- **Enter** commits the current input as a tag; typing the `delimiter` (default `,`, a regular expression is also accepted) commits as well.
- **Pasting** splits the pasted text by the delimiter and adds tags in bulk (`addOnPaste` defaults to `true`, the opposite of upstream Reka's default; pass `false` to disable).
- `addOnTab` / `addOnBlur` control committing on Tab / blur; both default to `false` (keeping Tab's focus-moving semantics).
- **Removing**: click the delete button on a tag; keyboard users press `Backspace` in the input to first select the last tag and press again to remove it; with a tag already selected both `Backspace` / `Delete` remove it (arrow keys move the selection between tags, the selected state is exposed as `data-state="active"`).
- Emits `addTag` / `removeTag` (payload: the tag text) and `invalidInput` (payload: the rejected input).

## Count and duplicates

- `max` limits the number of tags; additions beyond it are rejected and reported through `invalidInput`; unlimited by default.
- `allowDuplicate` defaults to `false` (**the opposite of PrimeVue `InputChips`'s default**): duplicate input is rejected and reported through `invalidInput`; pass `allowDuplicate` explicitly to allow duplicates.
- Rejected input (duplicate / beyond `max`) **stays in the input** so it can be corrected — it is not cleared automatically; there is **no programmatic entry point to clear that draft text** (the draft lives in Reka's inner input, not in `v-model`), so remount the component with `:key` if clearing is required.
- With `showClear` enabled and tags present, a clear button is rendered (accessible name defaults to the current locale's "Clear", overridable with `clearLabel`); clearing only resets the model and emits `update:modelValue` — it does not emit `removeTag` per tag.

<demo
    vue="../examples/tags-input/limits.vue"
    ssg="true"
/>

## States and sizes

`size` offers `sm` / `md` / `lg` (default `md`); `invalid` maps to `aria-invalid` plus the error-state outline; `disabled` is forwarded to the input and disables all interaction.

## Form and accessibility

- `name` + `required` render a hidden control inside a `<form>` to trigger native validation; the array value is expanded as `name[index]`.
- `id` lands on the inner input for `<label for>` association; `label` provides `aria-label`.
- Every tag renders as `role="group"` (naming is allowed there, avoiding the spec deviation of Reka emitting `aria-labelledby` on `role=generic`); the delete button's accessible name comes from Reka via `aria-labelledby` pointing at the tag text (announced as "tag name, button", without the word "delete").
- The delete button is `tabindex="-1"` (not part of the Tab sequence): keyboard removal goes through "select with arrow keys + `Backspace` / `Delete`", matching Reka's keyboard model.
- When tags exist the field root exposes `data-filled="true"` for `CaomeiFloatLabel`'s float detection.

<demo
    vue="../examples/tags-input/form.vue"
    ssg="true"
/>

## Scope

- `v-model` is `string[]`: only string tag values are supported. Reka's object-value forms (`convertValue` / `displayValue`) are not exposed.
- Custom tag content (PrimeVue's `#chip`), icon replacement (`removeTokenIcon` / `chipIcon`) and `variant` (`outlined` / `filled`) are not implemented.
- Adding or removing tags only affects the model; `size` / `invalid` / `disabled` are unaffected.
- Clearing (`showClear`) does not emit `removeTag` per tag, only `update:modelValue` (same as Reka's `TagsInputClear`).

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-tags-input-min-height` | `--caomei-control-height-md` | Minimum field height |
| `--caomei-tags-input-padding-block` | `--caomei-space-1` | Field block padding |
| `--caomei-tags-input-padding-inline` | `--caomei-space-3` | Field inline padding |
| `--caomei-tags-input-font-size` | `--caomei-font-size-md` | Field font size |

The field is `width: 100%` with no width cap; constrain it at the usage site with a container or `max-width`.

## Migration from PrimeVue

| PrimeVue (`InputChips`, formerly `Chips`) | This component |
|----------|--------|
| `modelValue` | The same-named prop (`string[]`) |
| `separator` | `delimiter` (default `,`, also accepts a regular expression) |
| `max` | The same-named prop |
| `allowDuplicate` (default `true`) | The same-named prop but **defaulting to `false`** (duplicates rejected); pass `true` explicitly to allow duplicates |
| `addOnBlur` | The same-named prop (default `false`) |
| `inputId` | `id`; `ariaLabel` → `label`; `ariaLabelledby` is forwarded to the input |
| `invalid` / `disabled` / `placeholder` | The same-named props |
| `fluid` | Drop it: the field is `width: 100%` by default |
| `inputClass` / `inputStyle` / `inputProps` | Override via the root `class` / `style` (they land on the field root element); other native attributes are forwarded to the input |
| — | `showClear` / `clearLabel`, `size`, `addOnPaste`, `addOnTab` and `label` are new here or have changed defaults |

> **`CaomeiTagsInput` is the first choice for migrating `Chips`**: PrimeVue `Chips` (the pre-v4 name of `InputChips`) is semantically equivalent (free-text multi-value entry), so migrate to `CaomeiTagsInput` first; `AutoComplete + multiple` is downgraded to a **fallback** — it is a search-select with an options panel, which differs from this component's "free text + tags" semantics, and is only needed when async suggestions are required.

**Not implemented**: the `#chip` / `#chipicon` slots, `removeTokenIcon` / `chipIcon`, `variant` (`outlined` / `filled`), `pt` / `dt` / `unstyled`, and object tag values.

> For the workflow, common pitfalls and the per-component index see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="tags-input" />
