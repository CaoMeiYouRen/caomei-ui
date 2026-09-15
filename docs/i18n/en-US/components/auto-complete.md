# AutoComplete

> Migration: PrimeVue `Select filter` (searchable single-select) maps to this component; note that it supports free input (Enter / blur commits arbitrary text) — if the value must come from the option list, see the "AutoComplete 严格选项模式" item in the [Backlog](/plan/backlog) (Chinese).

AutoComplete is an input that combines asynchronous suggestions with free input: you can pick from the suggestion list or type any text as the value. It wraps Reka UI Combobox.

## Basic usage

`v-model` is a `string` in single-select mode. Clicking the trigger on the right or focusing the input opens the suggestion panel, and typing filters by `label`.

<demo
    vue="../examples/auto-complete/basic.vue"
    ssg="true"
/>

Options can be strings (where `label` equals `value`) or `{ label, value, disabled? }` objects. `value` must be a non-empty string, unique within a single component.

## Async suggestions

Listen to the `complete` event to fetch suggestions on demand: it fires after input pauses for `debounce` milliseconds (300 by default) with the current input text. Use `loading` to show a loading indicator while fetching.

<demo
    vue="../examples/auto-complete/async.vue"
    ssg="true"
/>

> Continuous typing resets the timer, so `complete` fires once after the input actually pauses.
>
> By default Reka filters suggestions again on the client by `label`, so suggestions returned by a fuzzy / semantic server search whose `label` does not contain the query are filtered out. Enable `ignore-filter` for such cases and make sure the server results are relevant.

## Multiple

Enable `multiple` to select several values; `v-model` becomes `string[]`, selected values render as removable tags, and the input only shows the placeholder when there are no tags.

<demo
    vue="../examples/auto-complete/multiple.vue"
    ssg="true"
/>

## Free input and clear

- In single-select mode, pressing `Enter` or blurring after typing free text commits the text as `modelValue` (if a suggestion is highlighted, it is selected instead).
- Selecting a suggestion commits its `value` and renders its `label` back into the input.
- In single-select mode with `clearable` (default `true`), a clear button appears when there is a value; it is hidden when `clearable` is `false` or in multiple mode.
- `complete` fires after input pauses, and `select` fires when a value is committed (selecting a suggestion or committing free text); in multiple mode, clicking a selected item to deselect it also fires `select` with the toggled value, while removing a value via the tag remove button only fires `update:modelValue`.

## Accessibility

- Reka Combobox gives the input `role="combobox"` and `aria-autocomplete`, and associates the panel via `aria-expanded` / `aria-controls`.
- Use `label` for an accessible name when there is no visible label; `id` lands on the inner input for an external `<label for>`.
- The empty state and the open trigger use localized text (`autoComplete.empty` / `autoComplete.open`), overridable via `emptyLabel` / `openLabel`.
- Disabled suggestions output `data-disabled` and cannot be selected.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-auto-complete-max-width` | `--caomei-select-max-width` | Maximum field width |
| `--caomei-select-max-width` | `20rem` | Default width cap for select-like controls |

```css
.caomei-auto-complete {
    --caomei-auto-complete-max-width: 28rem;
}
```

<ComponentApi name="auto-complete" />
