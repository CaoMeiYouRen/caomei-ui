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

## 自动增高

设置 `autoResize` 后，高度随内容自动增减，不再出现滚动条；`rows` 仍作为初始最小高度，`resize` 会固定为 `none`（手动拖拽的尺寸会在下一次测量时被覆盖）。

<demo
    vue="../examples/textarea/auto-resize.vue"
    ssg="true"
/>

> 高度不设上限，需要封顶时在使用层给 `.caomei-textarea__control` 叠加 `max-height`（超出后由原生 `overflow-y: auto` 滚动）。

## 状态与调整尺寸

`disabled` 禁用、`readonly` 只读、`invalid` 标记校验失败；`resize` 控制是否允许手动调整尺寸。

<demo
    vue="../examples/textarea/states.vue"
    ssg="true"
/>

## 无障碍

- `label` 用于无可见标签时提供可访问名，映射为 `aria-label`；`label` 优先级高于透传的 `aria-label`，未提供（或为空）时透传值生效。
- `invalid` 时输出 `aria-invalid="true"`。
- `class` 落在根元素；`maxlength` / `required` 等原生属性透传到内部 `textarea`。

## 事件与暴露

除 `update:modelValue` 外，还提供 `focus`、`blur`、`change`；并通过 `defineExpose` 暴露 `focus()` / `blur()` 与内部 `textareaRef`。

> 宽度：默认 `width: 100%` 以适配表单栅格；如需限制宽度，在使用层通过容器或 `max-width` 控制（详见[主题与样式设计 §4.1](../design/theming.md)）。

<ComponentApi name="textarea" />
