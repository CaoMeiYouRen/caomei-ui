# Input 输入框

输入框用于接收用户的单行文本输入。

## 基础用法

通过 `v-model` 双向绑定输入值。

<demo
    vue="../examples/input/basic.vue"
    ssg="true"
/>

## 尺寸

通过 `size` 切换尺寸，支持 `sm` / `md` / `lg`。

<demo
    vue="../examples/input/sizes.vue"
    ssg="true"
/>

## 状态

`disabled` 禁用、`readonly` 只读、`invalid` 标记校验失败（映射 `aria-invalid`）。

<demo
    vue="../examples/input/states.vue"
    ssg="true"
/>

## 可清除

设置 `clearable` 后，有值时显示清除按钮；点击会清空值并抛出 `clear` 事件。

<demo
    vue="../examples/input/clearable.vue"
    ssg="true"
/>

## 前后缀与密码

通过 `prefix` / `suffix` 插槽在输入框两侧放置图标或文本；`type="password"` 即为密码框。

<demo
    vue="../examples/input/slots.vue"
    ssg="true"
/>

## 无障碍

- `label` 用于无可见标签时提供可访问名，映射为 `aria-label`。请使用该 prop，直接传入原生 `aria-label` 会被组件覆盖。
- `invalid` 时输出 `aria-invalid="true"`，配合外部错误文案使用。
- 清除按钮使用内建多语言标签，可通过 `clearLabel` 覆盖。
- `class` 落在根元素；`maxlength` / `required` / `aria-describedby` 等原生属性透传到内部 `input`。

## 事件

除 `update:modelValue` 外，还提供 `focus`、`blur`、`change`、`enter`、`clear`；并通过 `defineExpose` 暴露 `focus()` / `blur()`。

> 宽度：默认 `width: 100%` 以适配表单栅格；如需限制宽度，在使用层通过容器或 `max-width` 控制。

<ComponentApi name="input" />
