# InputNumber 数字输入框

数字输入框用于录入数值，支持范围限制、步进与小数精度。

## 基础用法

通过 `v-model` 双向绑定数值，类型为 `number | null`（清空时为 `null`）。

<demo
    vue="../examples/input-number/basic.vue"
    ssg="true"
/>

## 尺寸

通过 `size` 切换尺寸，支持 `sm` / `md` / `lg`。

<demo
    vue="../examples/input-number/sizes.vue"
    ssg="true"
/>

## 范围、步进与精度

`min` / `max` 在失焦与步进时钳制取值；`step` 控制步进；`precision` 控制小数位数。

> 提交时机：输入在失焦或按 Enter 时提交 `v-model`，清空提交为 `null`。
> `step` 需大于 0，否则回退为 1；`precision` 需为 0–100 的整数，否则不取整。取整在失焦、Enter、步进与 Home / End 时生效，且先按精度取整再钳制到 `min` / `max`。
> 当 `min` / `max` 的小数位多于 `precision` 时，提交值会按 `precision` 取整，因此可能略小于边界值（不会越界）。
> 外部驱动的 `v-model` 变更会即时回填输入框。
> `name` 用于随原生表单提交，需将组件置于 `<form>` 内；表单外不会渲染隐藏输入。

<demo
    vue="../examples/input-number/step.vue"
    ssg="true"
/>

## 状态

`disabled` 禁用、`readonly` 只读、`invalid` 标记校验失败；`controls="false"` 隐藏增减按钮。

<demo
    vue="../examples/input-number/states.vue"
    ssg="true"
/>

## 无障碍

- `label` 用于无可见标签时提供可访问名，映射为 `aria-label`；请使用该 prop，直接传入原生 `aria-label` 会被组件覆盖。
- `invalid` 时输出 `aria-invalid="true"`。
- 输入为 `role="spinbutton"`，支持方向键步进、PageUp / PageDown 十倍步进、Home / End 跳至 `min` / `max`；`min` / `max` 映射 `aria-valuemin` / `aria-valuemax`。
- 增减按钮使用内建多语言标签（增加 / 减少），可通过 `increaseLabel` / `decreaseLabel` 覆盖；到达 `min` / `max` 时自动禁用，并支持长按连续步进。
- `class` 落在根元素；`required` 等原生属性透传到内部 `input`。

## 事件与暴露

除 `update:modelValue`（失焦或 Enter 时提交）外，还提供 `focus`、`blur`、`change`（载荷为规范化后的 `number | null`，失焦、Enter 与点击增减按钮时触发）；并通过 `defineExpose` 暴露 `focus()` / `blur()` 与内部 `inputRef`。

> 键盘方向键 / PageUp / PageDown 步进同样会更新 `v-model`，但不单独触发 `change`（`change` 仅在上述提交时机触发）。

> 宽度：默认 `width: 100%`，并由 `--caomei-input-number-max-width` 设可覆盖的 `max-width`（详见[主题与样式设计 §4.1](../design/theming.md)）；撑满所在列可覆盖该变量为 `none`。

<ComponentApi name="input-number" />
