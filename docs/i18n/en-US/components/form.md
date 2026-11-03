# Form

`CaomeiForm` / `CaomeiFormItem` are an **independent composition layer**: `Form` owns layout and submit orchestration, while `FormItem` owns the label, hint, error and accessibility ids. It ships **no rules engine** and does not change the existing field contracts; validation state is controlled by the consumer through `invalid` / `error`.

## Basic usage

The default slot scope of `FormItem` provides `id` / `name` / `aria-labelledby` / `aria-describedby` / `invalid`. Bind the keys you need to the inner field component:

<demo
    vue="../examples/form/basic.vue"
    ssg="true"
/>

```vue
<CaomeiForm @submit="onSubmit">
    <CaomeiFormItem label="Name" name="name" hint="Enter a name">
        <template #default="{id, name: fieldName, invalid, ...aria}">
            <CaomeiInput
                :id="id"
                v-model="formName"
                :name="fieldName"
                :invalid="invalid"
                v-bind="aria"
            />
        </template>
    </CaomeiFormItem>
</CaomeiForm>
```

## Slot scope

| Key | Description |
| --- | --- |
| `id` | Control id; an explicit `id` wins, otherwise generated per instance (SSR-safe) |
| `name` | Form field name, passed through |
| `aria-labelledby` | Id of the visible label; `undefined` when `label` is absent |
| `aria-describedby` | Id list of the rendered hint / error; `undefined` when both are absent |
| `invalid` | `true` when `invalid` is set or `error` is non-empty |

## FormItem props

`CaomeiFormItem` props:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | generated | Control id; an explicit value wins |
| `name` | `string` | — | Form field name, passed through to the slot scope |
| `label` | `string` | — | Visible label text; generates the `aria-labelledby` target |
| `hint` | `string` | — | Helper hint text, associated through `aria-describedby` |
| `error` | `string` | — | Error text; a non-empty value implies invalid and renders a `role="alert"` row |
| `required` | `boolean` | `false` | Renders a visual required marker only; no control semantics |
| `invalid` | `boolean` | `false` | Forces the invalid state; automatically true when `error` is non-empty |

## Field binding

The 12 fields fall into three inheritance surfaces; no single binding rule fits all of them:

| Inheritance surface | Components | Binding guidance |
| --- | --- | --- |
| `FieldProps` + identity | AutoComplete / Input / InputNumber / MultiSelect / Select / TagsInput / Textarea | Bind `id` / `name` / `aria-*` / `invalid` |
| `FieldStateProps` + identity | Checkbox / CheckboxGroup / RadioGroup / SelectButton | Same as above; group roots are `role=group` / `radiogroup` and use `aria-labelledby` for the accessible name |
| Identity only | Switch | Bind `id` / `name` / `aria-*`; **do not bind `invalid`** — Switch has no validation-state channel, so the error text is associated through `aria-describedby` |

Where `id` and `aria-*` land is decided by each field component (for example, InputNumber / TagsInput keep `id` on the field root and `aria-*` on the inner accessible control; that is exactly why the whole object is forwarded to the component). For group controls, `aria-describedby` lands on the group root rather than each item.

## Validation and errors

A non-empty `error` implies an invalid state and renders a `role="alert"` error row. `invalid` can be used alone (for example, mark the field red before showing text). `aria-describedby` includes both the `hint` and `error` ids when both are rendered:

<demo
    vue="../examples/form/validation.vue"
    ssg="true"
/>

- Validation rules are not built in: the consumer writes the result into `error` / `invalid`.
- The error row is announced through `role="alert"`; clearing `error` after fixing the value restores the field.
- The invalid state also switches the label colour and adds the `caomei-form-item--invalid` class for global overrides.

## Submit orchestration

`CaomeiForm` renders a native `<form>`; the submit event **always calls `preventDefault()`** and then emits `submit`, so the consumer owns the submit logic:

```vue
<CaomeiForm @submit="handleSubmit">…</CaomeiForm>
```

- The `submit()` instance method calls native `requestSubmit()`, so native validation runs and the same `submit` event chain is reused.
- The instance also exposes `form` (the root `<form>` element, read-only semantics); naming it `form` instead of `formRef` is a deliberate semantic choice. The component does not promise reactive updates from that reference; read it directly when DOM access is needed.
- `novalidate` is forwarded to the native attribute to disable browser validation bubbles.
- Native attributes such as `action` / `method` are still forwarded to the root `<form>`, but they do not navigate — the `submit` event owns the submit logic.
- The component does not add loading / duplicate-submit guards; use a `loading` prop or guard inside the `submit` handler.

## Required and labels

- `required` renders a **visual asterisk only** (`aria-hidden`); it does not inject `required` / `aria-required`. Bind the required semantics per field family (for example the native `required` on Input / Textarea, or the `required` prop on Checkbox / CheckboxGroup / RadioGroup / Switch).
- `FormItem` renders a `<span id>` as the visible label and associates it through `aria-labelledby`; it does not render `<label for>` because group roots are not labelable. The unified form avoids an invalid `for`.
- When click-to-focus on the label is required, use `FloatLabel`, or draw your own `<label for>` for a single control and pass the same explicit `id` to `FormItem` (note that InputNumber / TagsInput keep `id` on the field root, so this does not apply to them).
- Hint / error only enter `aria-describedby` when actually rendered, so no dangling references are produced.

## Relationship with FloatLabel

- `FormItem` places the label **above** the control, suitable for regular forms; `FloatLabel` floats the label **inside** the control, suitable for compact layouts.
- Do not use both visible labels on the same field, or the field gets two accessible names; when a floating label is needed, keep only the `FloatLabel` `<label>` and let `FormItem` own hint / error.

## Migration from PrimeVue

| PrimeVue | This library |
| --- | --- |
| `Form` (rules / validate) | **No equivalent rules engine**; use `CaomeiForm` for layout and submit, compute validation in the consumer and write `invalid` / `error` |
| `FormField` | `CaomeiFormItem` + default slot scope; bind `id` / `name` / `aria-*` / `invalid` per the field table above |
| Native submit of `Form` | `CaomeiForm` always calls `preventDefault()` and owns submit through the `submit` event; `submit()` reuses native `requestSubmit()` |

> See [Migration from PrimeVue](/guide/primevue-migration) for the workflow and common pitfalls.

<ComponentApi name="form" />
