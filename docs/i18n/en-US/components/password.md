# Password

The password field derives from [Input](/en-US/components/input) and adds a plain-text visibility toggle plus password autofill semantics on top of text input.

## Basic usage

Two-way bind with `v-model`; the right-side button toggles between masked and plain text, and the button's accessible name follows the state.

<demo
    vue="../examples/password/basic.vue"
    ssg="true"
/>

## Sizes

Passes through Input's `size`; supports `sm` / `md` / `lg`.

## States and autofill

`disabled` / `readonly` / `invalid` / `clearable` behave as in Input; `autocomplete` defaults to `current-password`, and sign-up or password-change flows should pass `new-password` explicitly to work with browser password managers.

<demo
    vue="../examples/password/states.vue"
    ssg="true"
/>

## Toggle button text

The toggle button uses built-in localized labels ("Show password" / "Hide password"), overridable via `showLabel` / `hideLabel`.

## Accessibility

- The toggle button is `type="button"` with an `aria-label` (which follows the state) and `aria-pressed` expressing whether the plain text is currently shown; it is disabled together with the field when `disabled`.
- All other accessibility behavior (`label` / `invalid` / `aria-describedby` forwarding and so on) is inherited from [Input](/en-US/components/input).
- `type` is managed internally (`password` / `text`); an externally passed `type` is ignored to avoid accidentally turning off the mask. Use [Input](/en-US/components/input) when a fixed type is needed.
- Events `focus` / `blur` / `change` / `enter` / `clear` and the `focus()` / `blur()` methods are forwarded, usable for form validation.

<ComponentApi name="password" />
