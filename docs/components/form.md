# Form 表单

`CaomeiForm` / `CaomeiFormItem` 是**独立组合层**：`Form` 负责布局与提交编排，`FormItem` 负责标签、提示、错误与可访问性 id。它**不内建 rules 引擎**，也不修改既有字段契约；校验状态由使用方以 `invalid` / `error` 受控传入。

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
| `invalid` | `invalid` 或非空 `error` 任一成立时为 `true` |

## FormItem 属性

`CaomeiFormItem` 的属性：

| 属性 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 自动生成 | 控件 id；显式传入时优先 |
| `name` | `string` | — | 表单字段名，原样透传给插槽作用域 |
| `label` | `string` | — | 可见标签文本；提供时生成 `aria-labelledby` 目标 |
| `hint` | `string` | — | 辅助提示文本，经 `aria-describedby` 关联 |
| `error` | `string` | — | 错误文本；非空时自动视为校验失败并渲染 `role="alert"` 行 |
| `required` | `boolean` | `false` | 仅渲染可见必填标记，不注入控件语义 |
| `invalid` | `boolean` | `false` | 强制校验失败态；`error` 非空时自动为 true |

## 字段绑定

12 个字段按三类继承面逐项绑定，不能假设一套绑定通吃：

| 继承面 | 组件 | 绑定建议 |
| --- | --- | --- |
| `FieldProps` + 身份 | AutoComplete / Input / InputNumber / MultiSelect / Select / TagsInput / Textarea | 绑定 `id` / `name` / `aria-*` / `invalid` |
| `FieldStateProps` + 身份 | Checkbox / CheckboxGroup / RadioGroup / SelectButton | 同上；组型控件的根为 `role=group` / `radiogroup`，可访问名走 `aria-labelledby` |
| 仅 `FieldIdentityProps` | Switch | 绑定 `id` / `name` / `aria-*`；**不要绑定 `invalid`**——Switch 没有校验状态通道，错误文案通过 `aria-describedby` 关联 |

`id` 与 `aria-*` 的最终落点由各字段组件决定（例如 InputNumber / TagsInput 的 `id` 在字段根、`aria-*` 在内层可访问控件；这也正是统一交给组件转发的原因）。组型控件的 `aria-describedby` 作用于组根，不作用于每个子项。

## 校验与错误

`error` 非空时自动视为校验失败并渲染 `role="alert"` 的错误行；`invalid` 可单独使用（例如仅在提交前标红、暂不显示文案）。`aria-describedby` 会同时包含 `hint` 与 `error` 的 id：

<demo
    vue="../examples/form/validation.vue"
    ssg="true"
/>

- 校验规则不在组件内：使用方把校验结果写入 `error` / `invalid`。
- 错误行出现后由 `role="alert"` 播报；修正字段后清空 `error` 即恢复。
- 失败态同时切换标签颜色与外层 `caomei-form-item--invalid` 类，便于统一覆盖。

## 提交编排

`CaomeiForm` 渲染原生 `<form>`；提交事件**始终调用 `preventDefault()`** 后抛出 `submit`，由使用方接管：

```vue
<CaomeiForm @submit="handleSubmit">…</CaomeiForm>
```

- `submit()` 实例方法走原生 `requestSubmit()`，因此会执行原生校验并复用同一条 `submit` 事件链。
- 实例同时暴露 `form`（根 `<form>` 元素，只读语义）；命名为 `form` 而非 `formRef` 是刻意的语义取舍，组件不承诺该引用变化触发响应式更新，需要 DOM 操作时直接读取即可。
- `novalidate` 透传原生属性，可关闭浏览器原生校验气泡。
- `action` / `method` 等原生属性仍会透传到根 `<form>`，但不会触发页面跳转——提交逻辑由 `submit` 事件接管。
- 组件不自带 loading / 防重复提交；需要时在 `submit` 处理器中使用 `loading` prop 或先置位。

## 必填与标签

- `required` **只渲染可见星号**（`aria-hidden`），不会向控件注入 `required` / `aria-required`；必填语义由使用方按字段族绑定（例如 Input / Textarea 的原生 `required`，Checkbox / CheckboxGroup / RadioGroup / Switch 的 `required` prop）。
- `FormItem` 渲染 `<span id>` 作为可见标签，统一通过 `aria-labelledby` 关联，不渲染 `<label for>`：组型控件的根不是 labelable 元素，统一方案避免无效 `for`。
- 需要「点击标签聚焦控件」时，可改用 `FloatLabel`，或为单控件自绘 `<label for>` 并给 `FormItem` 传入同一个显式 `id`（注意 InputNumber / TagsInput 的 `id` 落在字段根，不适用于该方式）。
- hint / error 都只在实际渲染时进入 `aria-describedby`，不会产生悬空引用。

## 与 FloatLabel 的关系

- `FormItem` 的标签在控件**上方**，适合常规表单布局；`FloatLabel` 的标签浮在控件**内部**，适合紧凑布局。
- 同一字段不要同时使用两者的可见标签，否则会出现两个可访问名；需要浮标签时，仅保留 `FloatLabel` 的 `<label>`，`FormItem` 只负责 hint / error。

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| `Form`（rules / validate） | **无等价 rules 引擎**；用 `CaomeiForm` 负责布局与提交，校验由使用方计算后写入 `invalid` / `error` |
| `FormField` | `CaomeiFormItem` + 默认插槽作用域；按上方字段表绑定 `id` / `name` / `aria-*` / `invalid` |
| `Form` 的原生提交 | `CaomeiForm` 恒 `preventDefault()`，通过 `submit` 事件接管；`submit()` 复用原生 `requestSubmit()` |

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="form" />
