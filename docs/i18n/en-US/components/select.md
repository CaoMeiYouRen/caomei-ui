# Select

A select chooses a single value from a list of options; it wraps Reka UI Select.

## Basic usage

Two-way bind the selected value with `v-model` and pass the options via `options`.

<demo
    vue="../examples/select/basic.vue"
    ssg="true"
/>

## Object options

`options` accepts arbitrary objects; `optionLabel` / `optionValue` set the fields (or accessor functions) for the display text and the value. Values may be strings or numbers.

<demo
    vue="../examples/select/object-options.vue"
    ssg="true"
/>

> For a searchable single-select (PrimeVue `Select filter`), use [`CaomeiAutoComplete`](./auto-complete.md) instead: Reka Select fixes `role="listbox"` on its panel, so a search input inside it would violate `aria-required-children` — `filter` is therefore not provided on Select.
>
> Field resolution: the string form of `optionLabel` / `optionValue` supports `a.b` dot-paths. When `optionValue` does not resolve to a string or number (`null`, a boolean, a missing field), that option is **not rendered**; when `optionLabel` resolves to no text, the option's text is empty and the trigger falls back to `placeholder`.

## Clear

`showClear` renders a clear button **when a value is selected**; clicking it sets the model to `null` and returns focus to the trigger. Its accessible name defaults to the current locale's "Clear" text and can be overridden with `clearLabel`.

<demo
    vue="../examples/select/clear.vue"
    ssg="true"
/>

## Custom options

The `#option` slot customizes the panel option content; it receives `option` (the **raw** option object) and `selected` (whether it is the selected one). Without it, the mapped display text is rendered.

Slot content is rendered on a **single line** and truncated with an ellipsis (the panel width converges to the available width on narrow screens; see matrix #4 in [Responsive design](/design/responsive), Chinese), so control truncation yourself for multi-line or rich option content.

<demo
    vue="../examples/select/option-slot.vue"
    ssg="true"
/>

## Sizes

Switch the size with `size`; supports `sm` / `md` / `lg`.

<demo
    vue="../examples/select/sizes.vue"
    ssg="true"
/>

## States

`disabled` disables, `invalid` marks a validation failure; a per-option `disabled` disables a single option.

<demo
    vue="../examples/select/states.vue"
    ssg="true"
/>

## Accessibility

- Built on Reka UI's native ARIA semantics, with keyboard navigation (arrow keys / Enter / Esc / type-ahead).
- `label` provides an accessible name when there is no visible label and maps to `aria-label`.
- When `invalid`, it outputs `aria-invalid="true"`.
- Keep readable text inside custom `#option` content: Reka relies on a snapshot of the option text for type-ahead, so icon-only content degrades that jump (the trigger label always comes from `optionLabel` and is unaffected by slot content).

## Events and exposed

No events besides `update:modelValue`; the option list is passed in a controlled way via `options`.

> Controlled behavior: when `modelValue` is not in `options`, the trigger falls back to showing `placeholder`, but the model value stays controlled and is not cleared automatically; if you need it cleared, reset it in the consumer after watching `options` change.

> Width: `width: 100%` by default, with an overridable `max-width` set by `--caomei-select-max-width` (see [Theming and styles §4.1](/design/theming), Chinese). To fill its column, set the variable to `none` on the field wrapper `.caomei-select__field` or any ancestor (setting it on the trigger `.caomei-select` has no effect). The clear button width is controlled by `--caomei-select-clear-width` (default `1.25rem`, also set on the field wrapper or an ancestor).
>
> Scroll: the page scroll is not locked when expanded by default (`bodyLock` defaults to `false`) to avoid layout jumps from the disappearing scrollbar; on mobile the background may therefore scroll — pass `body-lock` to lock it.

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `options` | Same name |
| `option-label` / `option-value` | `optionLabel` / `optionValue` (field name or accessor function; `a.b` dotted paths supported; options whose resolved value is not a `string` / `number` are not rendered) |
| `optionDisabled` | The `disabled` field on the option object |
| `showClear` | `showClear` (clears the model to `null` and returns focus to the trigger) |
| `fluid` | Drop it: a `20rem` cap applies by default; set `--caomei-select-max-width` to `none` for true full width |
| `inputId` | `id`; `aria-label` → `label` |
| `size` (`small` / `large`) | `size` (`sm` / `lg`) |
| — | The `#option` slot (receiving the raw option object and its selected state) is new here |

**Searchable single select**: PrimeVue's `filter` is **not implemented** — Reka Select keeps `role="listbox"` on the panel element, so a search box inside it would become an owned child of the listbox and violate WAI-ARIA `aria-required-children`; use `CaomeiAutoComplete` for searchable single select (it **allows free text**, a difference from PrimeVue's "value must come from the options" — see the [AutoComplete page](./auto-complete.md) and the [Backlog](/plan/backlog), Chinese).

**Not implemented**: `filter` / `filterPlaceholder` / `filterMatchMode` / `filterFields`, `editable`, `optionGroupLabel` / `optionGroupChildren`, `scrollHeight` / `dataKey`, `variant` (`outlined` / `filled`), `labelId` / `labelStyle` / `labelClass`, `appendTo` and panel style/class forwarding.

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="select" />
