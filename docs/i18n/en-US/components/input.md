# Input

An input receives a single line of text from the user.

## Basic usage

Two-way bind the value with `v-model`.

<demo
    vue="../examples/input/basic.vue"
    ssg="true"
/>

## Sizes

Switch the size with `size`; supports `sm` / `md` / `lg`.

<demo
    vue="../examples/input/sizes.vue"
    ssg="true"
/>

## States

`disabled` disables, `readonly` makes it read-only, and `invalid` marks a validation failure (maps to `aria-invalid`).

<demo
    vue="../examples/input/states.vue"
    ssg="true"
/>

## Clearable

With `clearable`, a clear button appears when there is a value; clicking it clears the value and emits `clear`.

<demo
    vue="../examples/input/clearable.vue"
    ssg="true"
/>

## Prefix / suffix and password

Use the `prefix` / `suffix` slots to place icons or text on either side; `type="password"` renders a password field — see [Password](/en-US/components/password) for an enhanced wrapper with a visibility toggle.

<demo
    vue="../examples/input/slots.vue"
    ssg="true"
/>

## Accessibility

- `label` provides an accessible name when there is no visible label and maps to `aria-label`. Use this prop; `label` takes precedence over a passed-in `aria-label`, and the passed-in value applies when `label` is not provided (or empty).
- When `invalid`, it outputs `aria-invalid="true"` to pair with external error text.
- The clear button uses a built-in localized label, overridable via `clearLabel`.
- `class` lands on the root element; native attributes such as `maxlength` / `required` / `aria-describedby` are forwarded to the inner `input`.

## Events

Besides `update:modelValue`, it also provides `focus`, `blur`, `change`, `enter`, `clear`; `focus()` / `blur()` are exposed via `defineExpose`.

> Width: `width: 100%` by default to fit form grids; to constrain the width, control it at the usage site with a container or `max-width` (see [Theming and styles §4.1](/design/theming), Chinese).

<ComponentApi name="input" />
