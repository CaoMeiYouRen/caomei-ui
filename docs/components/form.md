# Form 表单

`CaomeiForm` / `CaomeiFormItem` 是**独立组合层**：`Form` 负责布局、提交编排与最小校验，`FormItem` 负责标签、提示、错误与可访问性 id。内建校验只覆盖「必填（由 `validate` 表达）/ 自定义函数 / 服务端错误回填」三类，**不提供 rules DSL**，也不修改既有字段契约；既有受控 `invalid` / `error` 通道继续可用。

## 基础用法

`FormItem` 的默认插槽作用域提供 `id` / `name` / `aria-labelledby` / `aria-describedby` / `invalid`，把需要的键绑定到内部字段组件即可：

<demo
    vue="../examples/form/basic.vue"
    ssg="true"
/>

```vue
<CaomeiForm @submit="onSubmit">
    <CaomeiFormItem label="名称" name="name" hint="请输入名称">
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

## 插槽作用域

| 键 | 说明 |
| --- | --- |
| `id` | 控件 id；显式传入 `id` 时优先，否则按实例生成（SSR 安全） |
| `name` | 表单字段名，原样透传 |
| `aria-labelledby` | 可见标签的 id；无 `label` 时为 `undefined` |
| `aria-describedby` | 实际渲染的 hint / error 的 id 列表；二者都缺省时为 `undefined` |
| `invalid` | 受控 `invalid` / 本地校验失败 / 服务端错误任一成立时为 `true` |

## Form 属性

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `novalidate` | `boolean` | `false` | 关闭浏览器原生校验气泡（映射原生 `novalidate`） |
| `errors` | `Record<string, string \| string[] \| undefined>` | — | 服务端 / 提交回填错误，键为字段 `name`；空值视为无错误 |
| `validationMode` | `'onSubmit' \| 'onBlur' \| 'onChange'` | `'onSubmit'` | 表单级默认校验时机，字段可覆盖 |

## FormItem 属性

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 自动生成 | 控件 id；显式传入时优先 |
| `name` | `string` | — | 表单字段名；`errors` 匹配与值集汇总均以它为准 |
| `label` | `string` | — | 可见标签文本；提供时生成 `aria-labelledby` 目标 |
| `hint` | `string` | — | 辅助提示文本，经 `aria-describedby` 关联 |
| `error` | `string` | — | 受控错误文本；非空即失败，优先级最高 |
| `required` | `boolean` | `false` | 仅渲染可见必填标记，不注入控件语义 |
| `invalid` | `boolean` | `false` | 强制失败态（可只标红不显示文案） |
| `modelValue` | `unknown` | — | **只读**值通道：把字段当前值交给 `validate` 与表单值集；不会 emit `update:modelValue` |
| `validate` | `(value, values) => string \| string[] \| null \| undefined \| void \| Promise<…>` | — | 字段校验函数；返回文案即失败、返回空值即通过 |
| `validationMode` | `'onSubmit' \| 'onBlur' \| 'onChange'` | 继承 `Form` | 字段级校验时机 |

## 字段绑定

13 个字段按三类继承面逐项绑定，不能假设一套绑定通吃：

| 继承面 | 组件 | 绑定建议 |
| --- | --- | --- |
| `FieldProps` + 身份 | AutoComplete / Input / InputNumber / MultiSelect / Select / TagsInput / Textarea | 绑定 `id` / `name` / `aria-*` / `invalid` |
| `FieldStateProps` + 身份 | Checkbox / CheckboxGroup / RadioGroup / Rating / SelectButton | 同上；组型控件的根为 `role=group` / `radiogroup`，可访问名走 `aria-labelledby` |
| 仅 `FieldIdentityProps` | Switch | 绑定 `id` / `name` / `aria-*`；**不要绑定 `invalid`**——Switch 没有校验状态通道，错误文案通过 `aria-describedby` 关联 |

`id` 与 `aria-*` 的最终落点由各字段组件决定（例如 InputNumber / TagsInput 的 `id` 在字段根、`aria-*` 在内层可访问控件；这也正是统一交给组件转发的原因）。组型控件的 `aria-describedby` 作用于组根，不作用于每个子项。

## 内建最小校验

必填、自定义函数与服务端错误回填三类能力内建；值通过 `modelValue` 只读通道提供，跨字段校验从 `values` 取其它字段的值：

<demo
    vue="../examples/form/builtin-validation.vue"
    ssg="true"
/>

```vue
<CaomeiForm :errors="errors" @submit="onSubmit">
    <CaomeiFormItem label="名称" name="name" :model-value="name" :validate="validateName">
        <template #default="{id, name: fieldName, invalid, ...aria}">
            <CaomeiInput :id="id" v-model="name" :name="fieldName" :invalid="invalid" v-bind="aria" />
        </template>
    </CaomeiFormItem>
    <CaomeiFormItem label="确认密码" name="confirm" :model-value="confirm" :validate="validateConfirm">
        <template #default="{id, name: fieldName, invalid, ...aria}">
            <CaomeiInput :id="id" v-model="confirm" type="password" :name="fieldName" :invalid="invalid" v-bind="aria" />
        </template>
    </CaomeiFormItem>
</CaomeiForm>
```

- **返回值**：`validate` 返回文案即失败、返回空值即通过；数组只渲染首个非空文案。不支持布尔约定：类型层面不接受布尔；运行时 `false` 视为通过，`true` 会被当作错误文案渲染。
- **校验时机**：`onSubmit`（默认）首次提交前不展示错误，提交过一次后转为变更复检；`onBlur` 在焦点离开字段时校验（字段内子控件间移动不触发）；`onChange` 在值变更时校验。
- **跨字段**：第二个参数 `values` 是表单级值集，键为各字段 `name`；未声明 `name` 的字段不进入值集。
- **服务端错误**：`Form.errors` 以 `name` 精确匹配；字段值再次变化时该字段的服务端错误让位，直到服务端重新下发（传入新的 `errors` 对象或该字段文案变化）。服务端重发请使用新对象（`ref` / `computed` 整体替换），不要依赖同一对象原地改同文案。
- **优先级**：受控 `error` > 本地 `validate` > 服务端 `errors` > 仅 `invalid`；校验器抛错按失败处理（只标红、不显示文案，同时 `console.error`）。
- `modelValue` 是**只读**通道：组件不会写回字段值，`v-model` 仍应绑在内部字段组件上；忘记传 `modelValue` 时组件会告警一次并按 `undefined` 校验。

## 校验与错误（受控通道）

`error` 非空时自动视为校验失败并渲染 `role="alert"` 的错误行；`invalid` 可单独使用（例如仅在提交前标红、暂不显示文案）。`aria-describedby` 会同时包含 `hint` 与 `error` 的 id：

<demo
    vue="../examples/form/validation.vue"
    ssg="true"
/>

- 不想使用内建校验时，仍可把校验结果写入 `error` / `invalid` 自行控制。
- 错误行出现后由 `role="alert"` 播报；修正字段后清空 `error` 即恢复。
- 失败态同时切换标签颜色与外层 `caomei-form-item--invalid` 类，便于统一覆盖。

## 提交编排

`CaomeiForm` 渲染原生 `<form>`，提交事件**始终调用 `preventDefault()`**；校验通过才抛出 `submit`，失败时聚焦文档顺序上的首个无效字段：

```vue
<CaomeiForm @submit="handleSubmit">…</CaomeiForm>
```

- 校验失败不抛出 `submit`；需要区分「提交被拦下」时，以字段错误行或 `errors` 变化为准。
- 异步校验会等待结果再决定；连续提交时只有最近一次提交的结果生效（旧提交不会抢焦点或抛出 `submit`）。
- `submit()` 实例方法走原生 `requestSubmit()`，因此会执行原生校验并复用同一条 `submit` 事件链。
- 实例同时暴露 `form`（根 `<form>` 元素，只读语义）；命名为 `form` 而非 `formRef` 是刻意的语义取舍，组件不承诺该引用变化触发响应式更新，需要 DOM 操作时直接读取即可。
- `novalidate` 透传原生属性，可关闭浏览器原生校验气泡。
- `action` / `method` 等原生属性仍会透传到根 `<form>`，但不会触发页面跳转——提交逻辑由 `submit` 事件接管。
- 组件不自带 loading / 防重复提交；需要时在 `submit` 处理器中使用 `loading` prop 或先置位。

## 必填与标签

- `required` **只渲染可见星号**（`aria-hidden`），不会向控件注入 `required` / `aria-required`；必填语义由使用方按字段族绑定（例如 Input / Textarea 的原生 `required`，Checkbox / CheckboxGroup / RadioGroup / Switch 的 `required` prop），或直接交给 `validate`。
- `FormItem` 渲染 `<span id>` 作为可见标签，统一通过 `aria-labelledby` 关联，不渲染 `<label for>`：组型控件的根不是 labelable 元素，统一方案避免无效 `for`。
- 需要「点击标签聚焦控件」时，可改用 `FloatLabel`，或为单控件自绘 `<label for>` 并给 `FormItem` 传入同一个显式 `id`（注意 InputNumber / TagsInput 的 `id` 落在字段根，不适用于该方式）。
- hint / error 都只在实际渲染时进入 `aria-describedby`，不会产生悬空引用。

## 与 FloatLabel 的关系

- `FormItem` 的标签在控件**上方**，适合常规表单布局；`FloatLabel` 的标签浮在控件**内部**，适合紧凑布局。
- 同一字段不要同时使用两者的可见标签，否则会出现两个可访问名；需要浮标签时，仅保留 `FloatLabel` 的 `<label>`，`FormItem` 只负责 hint / error。

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| `Form`（`rules` / `validate`） | **无 rules DSL**：用 `Form` 的 `errors` 承接服务端错误，用 `FormItem` 的 `validate` 写必填 / 自定义校验；不支持声明式字段规则表与异步请求编排 |
| `FormField` | `CaomeiFormItem` + 默认插槽作用域；按上方字段表绑定 `id` / `name` / `aria-*` / `invalid` |
| `Form` 的 `validateOn`（submit / blur / change） | `validationMode`（`onSubmit` / `onBlur` / `onChange`），可在 `Form` 设默认、在 `FormItem` 覆盖 |
| `Form` 的 `errors` 回填 | 同名 `errors`：键为字段 `name`，值为文案或文案数组 |
| `Form` 的原生提交 | `CaomeiForm` 恒 `preventDefault()`，通过 `submit` 事件接管；`submit()` 复用原生 `requestSubmit()`；校验失败时不抛出 `submit` |

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="form" />
