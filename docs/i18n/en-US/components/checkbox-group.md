# CheckboxGroup

The checkbox group collects the checked values of a set of checkboxes into one value array, and adds group accessibility semantics, whole-array form submission and an optional select-all / indeterminate item. It wraps Reka UI CheckboxGroup.

## Basic usage

Pass the option list via `options` and bind the value array with `v-model`; the default slot may be used instead for custom children (each child must provide `value`, while the array model is handled by the group).

<demo
    vue="../examples/checkbox-group/basic.vue"
    ssg="true"
/>

## Select all and indeterminate

`selectAll` renders a built-in select-all item: checked when everything is selected, indeterminate when only some are, and unchecked when nothing (or no selectable option) is selected. Clicking writes or clears the **selectable** values; disabled options are excluded from select-all (their previously selected values are kept). The text defaults to the current locale's "Select all" text and is overridable via `selectAllText`.

<demo
    vue="../examples/checkbox-group/select-all.vue"
    ssg="true"
/>

## Sizes, disabled and validation

`size` / `disabled` / `invalid` apply to both the group and the options it renders; `label` maps to the group's own accessible name. Disabled opacity is not applied at the group level (each child already handles `--caomei-disabled-opacity`), avoiding a double fade.

## Keyboard behavior

The native per-item tab order is kept by default; with `rovingFocus` the group keeps a single tab stop and the arrow keys move between options (Reka's roving focus).

## Form integration

With `name`, a hidden control is generated per selected value named `name[index]` when inside a `<form>`, so the form collects them directly; `required` targets that hidden control (requires `name`). The group already submits every child value, so **children do not need their own `name`** (a child inside the group context renders no hidden control of its own, so passing one adds nothing). With nothing selected and `required` set, the hidden control degrades to a single `name` (no index) so native required validation still fires.

```vue
<form>
  <CaomeiCheckboxGroup v-model="fruits" :options="options" name="fruits" label="Fruits" />
  <button type="submit">Submit</button>
</form>
```

## Accessibility

- The root is `role="group"` whose accessible name comes from `label`; `invalid` maps to `aria-invalid`.
- The select-all item and the options are ordinary checkboxes; the indeterminate state maps to `aria-checked="mixed"`, and `disabled` is passed down per item.
- The hidden controls generated from the group `name` and the item controls share one source, and keyboard / screen-reader order follows render order.

## Style customization

Styles are based on CSS variables and kept low-specificity for easy overriding:

| Variable | Default | Description |
|------|------|------|
| `--caomei-checkbox-group-gap` | `--caomei-space-2` | Vertical gap between the group items |

```css
.caomei-checkbox-group {
    --caomei-checkbox-group-gap: 8px;
}
```

> The size-derived variable (font size) is declared by the component on its own element and must be overridden on `.caomei-checkbox-group` itself; setting it on an ancestor such as `:root` has no effect.

## Migration from PrimeVue

| PrimeVue | This component |
| --- | --- |
| `<CheckboxGroup v-model="array" name>` (group context plus default slot only) | `CaomeiCheckboxGroup` is shape-compatible (put children in the default slot; `name` covers the whole group's submission) |
| — | `options` (renders children via `optionLabel` / `optionValue`), `selectAll` (select-all / mixed, disabled items excluded), `selectAllText`, `label` (group accessible name) and `rovingFocus` (defaults to `false`, keeping native per-item Tab order) are new here |
| `inputId` (on children) | `id` |

**Intentional differences**: the group layer adds no disabled opacity (children handle it, avoiding a double fade); while inside a group, a child does **not** render its own hidden control — `name` lives on the group, so children need not pass `name`. **Not implemented**: PrimeVue `CheckboxGroup`'s `formControl` is not exposed (`invalid` is covered by this component's `invalid`).

> For the workflow and shared pitfalls see [Migration from PrimeVue](/en-US/guide/primevue-migration).

<ComponentApi name="checkbox-group" />
