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

> `step` 需大于 0，否则回退为 1；`precision` 需为非负整数，否则忽略取整。
> 聚焦输入期间，外部驱动的 `v-model` 变更不会回填输入框，失焦后同步。

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
- 增减按钮使用内建多语言标签（增加 / 减少），可通过 `increaseLabel` / `decreaseLabel` 覆盖；到达 `min` / `max` 时自动禁用。
- `class` 落在根元素；`required` 等原生属性透传到内部 `input`。

## 事件与暴露

除 `update:modelValue` 外，还提供 `focus`、`blur`、`change`（载荷为规范化后的 `number | null`，失焦与步进时触发）；并通过 `defineExpose` 暴露 `focus()` / `blur()` 与内部 `inputRef`。

> 宽度：默认 `width: 100%`，并由 `--caomei-input-number-max-width` 设可覆盖的 `max-width`（详见[主题与样式设计 §4.1](../design/theming.md)）；撑满所在列可覆盖该变量为 `none`。

<ComponentApi name="input-number" />
