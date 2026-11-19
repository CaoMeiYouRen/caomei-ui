# Rating

Rating collects or displays a score: five stars and whole-step increments by default, with optional half stars and both read-only and disabled states.

## Basic usage

`v-model` is a numeric score (`0` when nothing is selected). The accessible name resolves as explicit `label` > forwarded `aria-label` > the built-in text of the current locale (the read-only locale text in read-only mode).

<demo
    vue="../examples/rating/basic.vue"
    ssg="true"
/>

## Maximum and step

- `max`: number of stars rendered, `5` by default; arrow keys and clicks use this count.
- `step`: `1` (default, whole stars) or `0.5` (half stars). Half stars come from step slicing — each star is split into two interactive indicators, so hovering the left half previews a half star.
- Values snap to the nearest `step` for display: with `0.5`, `2.3` renders as `2.5`. This only affects painting; neither the model nor `aria-checked` is rewritten (they change through interaction only).

## Read-only and disabled

- `readonly`: shows the current score without interaction (not focusable, cannot change), and the rating carries `aria-readonly`.
- `disabled`: semantics of a disabled control, with reduced opacity; equally non-interactive.
- Both switch off the hover preview so a read-only rating never follows the pointer.

## Accessibility

- The root is `role="radiogroup"`; its name resolves as explicit `label` > forwarded `aria-label` > built-in locale text (separate fallbacks for interactive and read-only).
- Every interactive step is `role="radio"` named after its numeric value (such as `3.5`); the unit lives in the group name, avoiding plural mistakes across languages.
- Keyboard: `Tab` reaches the current score or the first item, arrow keys (← → ↑ ↓) move and commit, and `Space` selects the focused item.

## Form integration

Rating shares the same field contract as other state-type fields: pass `id` / `name` / `label` / `invalid` directly, and inside `CaomeiFormItem` the slot scope binds `id` and `aria-*` onto the rating root (`role="radiogroup"`); when `name` is present the current score is submitted through a hidden control.

```vue
<CaomeiFormItem label="Service rating" name="score" hint="Used for satisfaction metrics" :error="errors.score">
    <template #default="{ id, name: fieldName, invalid, ...aria }">
        <CaomeiRating
            :id="id"
            v-bind="aria"
            :name="fieldName"
            v-model="form.score"
            :invalid="invalid"
        />
    </template>
</CaomeiFormItem>
```

An unrated field has the model `0`, so while interactive and with `name` present `score=0` is submitted (`readonly` / `disabled` do not submit); the component has no "empty" state — omit the field yourself before submitting when "not rated" must not be sent.

## Style customisation

| Variable | Default | Description |
|----------|---------|-------------|
| `--caomei-rating-icon-size` | follows the `size` preset | Icon size (`sm` / `md` / `lg`) |
| `--caomei-rating-gap` | `--caomei-space-1` | Gap between stars |
| `--caomei-rating-empty-color` | `--caomei-color-border` | Empty star colour |
| `--caomei-rating-fill-color` | `--caomei-color-primary-text` | Filled star colour |

## Migrating from PrimeVue

| PrimeVue `Rating` | This component |
| --- | --- |
| `v-model` numeric score | Same name |
| `stars` | `max` |
| `cancel` (click the current score again to clear) | `clearable` |
| `readonly` | Same name (plus `aria-readonly`) |
| `disabled` | Same name |
| Icon driven by templates / style slots | Built-in `star` semantic icon, replaceable with `provideIconOverrides()` |

> See [Migrating from PrimeVue](/en-US/guide/primevue-migration) for the flow and common pitfalls.

<ComponentApi name="rating" />
