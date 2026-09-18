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

## Strength feedback

With `feedback` (off by default) a strength meter and text are shown: visible while focused or filled, and while empty and unfocused only the screen-reader live region remains.

- Off by default (unlike PrimeVue, which defaults to on): external-service credentials (secret / token fields) usually need no strength feedback, so they can simply omit it; user-chosen passwords (such as the admin password in an installation wizard) should pass `feedback` explicitly.
- Focusing an empty field inserts the strength area and pushes the content below it down by about one line (the input itself does not move); this is an intentional trade-off for field-level helper text.
- The strength rules match PrimeVue's defaults: strong needs lower- and upper-case plus digits and at least 8 characters; medium needs any two character classes and at least 6 characters; any other non-empty value is weak.
- Text comes from the built-in locales (`password.prompt` / `weak` / `medium` / `strong`) and can be overridden with `promptLabel` / `weakLabel` / `mediumLabel` / `strongLabel`.
- The meter uses the `danger` / `warning` / `success` tokens, overridable through the matching CSS variables.

<demo
    vue="../examples/password/feedback.vue"
    ssg="true"
/>

> PrimeVue's `mediumRegex` / `strongRegex` are not implemented (no downstream usage); the strength rules are currently fixed. Ask if you need custom rules.

## Toggle button text

The toggle button uses built-in localized labels ("Show password" / "Hide password"), overridable via `showLabel` / `hideLabel`.

## Accessibility

- The toggle button is `type="button"` with an `aria-label` (which follows the state) and `aria-pressed` expressing whether the plain text is currently shown; it is disabled together with the field when `disabled`.
- All other accessibility behavior (`label` / `invalid` / `aria-describedby` forwarding and so on) is inherited from [Input](/en-US/components/input).
- `type` is managed internally (`password` / `text`); an externally passed `type` is ignored to avoid accidentally turning off the mask. Use [Input](/en-US/components/input) when a fixed type is needed.
- Events `focus` / `blur` / `change` / `enter` / `clear` and the `focus()` / `blur()` methods are forwarded, usable for form validation.

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `feedback` | `feedback` (**intentional default change**: PrimeVue defaults to `true`, this library to `false` — 24 of momei's 32 usages are external-service credential fields where a strength meter adds nothing; pass `:feedback="true"` explicitly for user-chosen passwords) |
| `prompt-label` / `weak-label` / `medium-label` / `strong-label` | `promptLabel` / `weakLabel` / `mediumLabel` / `strongLabel` (built-in text by default) |
| `toggle-mask` | Built-in toggle button (no prop needed) |
| `show-clear` | `clearable` (inherited from `CaomeiInput`) |
| `size` (`small` / `large`) | `size` (`sm` / `lg`) |
| `invalid` | Same name |

**Not implemented**: `medium-regex` / `strong-regex` (fixed strength rules), `mask-icon` / `unmask-icon`, `variant`, `append-to`.

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="password" />
