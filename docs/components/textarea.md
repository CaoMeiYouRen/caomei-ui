# Textarea 多行输入

多行文本输入框，适用于备注、描述等场景。

## 基础用法

通过 `v-model` 双向绑定输入值。

<demo
    vue="../examples/textarea/basic.vue"
    ssg="true"
/>

## 尺寸与行数

通过 `size` 切换尺寸，`rows` 控制初始可见行数。

<demo
    vue="../examples/textarea/sizes.vue"
    ssg="true"
/>

## 状态与调整尺寸

`disabled` 禁用、`readonly` 只读、`invalid` 标记校验失败；`resize` 控制是否允许手动调整尺寸。

<demo
    vue="../examples/textarea/states.vue"
    ssg="true"
/>

## 无障碍

- `label` 用于无可见标签时提供可访问名，映射为 `aria-label`；请使用该 prop，直接传入原生 `aria-label` 会被组件覆盖。
- `invalid` 时输出 `aria-invalid="true"`。
- `class` 落在根元素；`maxlength` / `required` 等原生属性透传到内部 `textarea`。

## 事件与暴露

除 `update:modelValue` 外，还提供 `focus`、`blur`、`change`；并通过 `defineExpose` 暴露 `focus()` / `blur()` 与内部 `textareaRef`。

<ComponentApi name="textarea" />
