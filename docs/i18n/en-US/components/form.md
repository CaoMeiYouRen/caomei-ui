# Form

`CaomeiForm` / `CaomeiFormItem` are an **independent composition layer**: `Form` owns layout, submit orchestration and the minimal validation layer, while `FormItem` owns the label, hint, error and accessibility ids. Built-in validation covers three cases only — required (expressed through `validate`), a custom function, and server-error back-fill. It ships **no rules DSL** and does not change the existing field contracts; the controlled `invalid` / `error` channels keep working.

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
| `invalid` | `true` when controlled `invalid` is set, local validation fails or a server error applies |

## Form props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `novalidate` | `boolean` | `false` | Disables native validation bubbles (maps to `novalidate`) |
| `errors` | `Record<string, string \| string[] \| undefined>` | — | Server-side / submit-back errors keyed by field `name`; empty values mean no error |
| `validationMode` | `'onSubmit' \| 'onBlur' \| 'onChange'` | `'onSubmit'` | Form-level default validation timing; a field can override it |

## FormItem props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | generated | Control id; an explicit value wins |
| `name` | `string` | — | Form field name; used for `errors` matching and value-map assembly |
| `label` | `string` | — | Visible label text; generates the `aria-labelledby` target |
| `hint` | `string` | — | Helper hint text, associated through `aria-describedby` |
| `error` | `string` | — | Controlled error text; non-empty means invalid and has the highest priority |
| `required` | `boolean` | `false` | Renders a visual required marker only; no control semantics |
| `invalid` | `boolean` | `false` | Forces the invalid state (red without a message is allowed) |
| `modelValue` | `unknown` | — | **Read-only** value channel: hands the value to `validate` and the form value map; never emits `update:modelValue` |
| `validate` | `(value, values) => string \| string[] \| null \| undefined \| void \| Promise<…>` | — | Field validator; a message means invalid, an empty value means valid |
| `validationMode` | `'onSubmit' \| 'onBlur' \| 'onChange'` | inherits `Form` | Field-level validation timing |

## Field binding

The 13 fields fall into three inheritance surfaces; no single binding rule fits all of them:

| Inheritance surface | Components | Binding guidance |
| --- | --- | --- |
| `FieldProps` + identity | AutoComplete / Input / InputNumber / MultiSelect / Select / TagsInput / Textarea | Bind `id` / `name` / `aria-*` / `invalid` |
| `FieldStateProps` + identity | Checkbox / CheckboxGroup / RadioGroup / Rating / SelectButton | Same as above; group roots are `role=group` / `radiogroup` and use `aria-labelledby` for the accessible name |
| Identity only | Switch | Bind `id` / `name` / `aria-*`; **do not bind `invalid`** — Switch has no validation-state channel, so the error text is associated through `aria-describedby` |

Where `id` and `aria-*` land is decided by each field component (for example, InputNumber / TagsInput keep `id` on the field root and `aria-*` on the inner accessible control; that is exactly why the whole object is forwarded to the component). For group controls, `aria-describedby` lands on the group root rather than each item.

## Built-in minimal validation

Required, a custom function and server-error back-fill are built in. The value comes through the read-only `modelValue` channel, and cross-field validation reads other fields from `values`:

<demo
    vue="../examples/form/builtin-validation.vue"
    ssg="true"
/>

```vue
<CaomeiForm :errors="errors" @submit="onSubmit">
    <CaomeiFormItem label="Name" name="name" :model-value="name" :validate="validateName">
        <template #default="{id, name: fieldName, invalid, ...aria}">
            <CaomeiInput :id="id" v-model="name" :name="fieldName" :invalid="invalid" v-bind="aria" />
        </template>
    </CaomeiFormItem>
    <CaomeiFormItem label="Confirm password" name="confirm" :model-value="confirm" :validate="validateConfirm">
        <template #default="{id, name: fieldName, invalid, ...aria}">
            <CaomeiInput :id="id" v-model="confirm" type="password" :name="fieldName" :invalid="invalid" v-bind="aria" />
        </template>
    </CaomeiFormItem>
</CaomeiForm>
```

- **Return value**: a returned message means invalid, an empty value means valid; only the first non-empty message of an array is rendered. Booleans are not supported: the type does not accept them; at runtime `false` means valid while `true` is rendered as the error message.
- **Timing**: `onSubmit` (default) shows no error before the first submit, then revalidates on change; `onBlur` validates when focus leaves the field (moves between inner controls do not trigger); `onChange` validates on value change.
- **Cross-field**: the second argument `values` is the form-level value map keyed by field `name`; fields without `name` are excluded.
- **Server errors**: `Form.errors` matches by `name` exactly; once the value changes, that field's server error yields until the server sends a new one (a new `errors` object or a changed message). Send a new object (`ref` / `computed` replaced as a whole); do not rely on mutating the same object with the same message.
- **Priority**: controlled `error` > local `validate` > server `errors` > `invalid` alone. A throwing validator counts as a failure (red, no message, `console.error`).
- `modelValue` is **read-only**: the component never writes the field value back, so keep `v-model` on the inner field component; when it is missing the component warns once and validates against `undefined`.

## Validation and errors (controlled channel)

A non-empty `error` implies an invalid state and renders a `role="alert"` error row. `invalid` can be used alone (for example, mark the field red before showing text). `aria-describedby` includes both the `hint` and `error` ids when both are rendered:

<demo
    vue="../examples/form/validation.vue"
    ssg="true"
/>

- Without the built-in validation, you can still write the result into `error` / `invalid` yourself.
- The error row is announced through `role="alert"`; clearing `error` after fixing the value restores the field.
- The invalid state also switches the label colour and adds the `caomei-form-item--invalid` class for global overrides.

## Submit orchestration

`CaomeiForm` renders a native `<form>`; the submit event **always calls `preventDefault()`**. `submit` is emitted only when validation passes; otherwise the first invalid field in document order receives focus:

```vue
<CaomeiForm @submit="handleSubmit">…</CaomeiForm>
```

- `submit` is not emitted when validation fails; use the field error rows or `errors` changes to detect a blocked submit.
- Async validation is awaited before deciding; with consecutive submits only the latest one settles (older submits neither steal focus nor emit `submit`).
- The `submit()` instance method calls native `requestSubmit()`, so native validation runs and the same `submit` event chain is reused.
- The instance also exposes `form` (the root `<form>` element, read-only semantics); naming it `form` instead of `formRef` is a deliberate semantic choice. The component does not promise reactive updates from that reference; read it directly when DOM access is needed.
- `novalidate` is forwarded to the native attribute to disable browser validation bubbles.
- Native attributes such as `action` / `method` are still forwarded to the root `<form>`, but they do not navigate — the `submit` event owns the submit logic.
- The component does not add loading / duplicate-submit guards; use a `loading` prop or guard inside the `submit` handler.

## Required and labels

- `required` renders a **visual asterisk only** (`aria-hidden`); it does not inject `required` / `aria-required`. Bind the required semantics per field family (for example the native `required` on Input / Textarea, or the `required` prop on Checkbox / CheckboxGroup / RadioGroup / Switch), or hand it to `validate`.
- `FormItem` renders a `<span id>` as the visible label and associates it through `aria-labelledby`; it does not render `<label for>` because group roots are not labelable. The unified form avoids an invalid `for`.
- When click-to-focus on the label is required, use `FloatLabel`, or draw your own `<label for>` for a single control and pass the same explicit `id` to `FormItem` (note that InputNumber / TagsInput keep `id` on the field root, so this does not apply to them).
- Hint / error only enter `aria-describedby` when actually rendered, so no dangling references are produced.

## Relationship with FloatLabel

- `FormItem` places the label **above** the control, suitable for regular forms; `FloatLabel` floats the label **inside** the control, suitable for compact layouts.
- Do not use both visible labels on the same field, or the field gets two accessible names; when a floating label is needed, keep only the `FloatLabel` `<label>` and let `FormItem` own hint / error.

## Migration from PrimeVue

| PrimeVue | This library |
| --- | --- |
| `Form` (`rules` / `validate`) | **No rules DSL**: use `Form`'s `errors` for server errors and `FormItem`'s `validate` for required / custom checks; declarative rule tables and async request orchestration are not supported |
| `FormField` | `CaomeiFormItem` + default slot scope; bind `id` / `name` / `aria-*` / `invalid` per the field table above |
| `Form`'s `validateOn` (submit / blur / change) | `validationMode` (`onSubmit` / `onBlur` / `onChange`), default on `Form`, overridable per `FormItem` |
| `Form`'s `errors` back-fill | Same-named `errors`: keyed by field `name`, value is a message or a message list |
| Native submit of `Form` | `CaomeiForm` always calls `preventDefault()` and owns submit through the `submit` event; `submit()` reuses native `requestSubmit()`; `submit` is not emitted when validation fails |

> See [Migration from PrimeVue](/en-US/guide/primevue-migration) for the workflow and common pitfalls.

<ComponentApi name="form" />
