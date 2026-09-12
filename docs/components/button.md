# Button 按钮

按钮用于触发一个操作。

## 基础用法

<demo
    vue="../examples/button/basic.vue"
    ssg="true"
/>

## 变体

通过 `variant` 切换视觉变体。

<demo
    vue="../examples/button/variants.vue"
    ssg="true"
/>

## 尺寸

通过 `size` 切换尺寸。

<demo
    vue="../examples/button/sizes.vue"
    ssg="true"
/>

## 状态

`loading` 时按钮自动禁用并显示加载指示；`block` 时撑满父容器宽度。

<demo
    vue="../examples/button/states.vue"
    title="禁用、加载与 Block"
    description="点击加载按钮可查看 loading 状态。"
    ssg="true"
/>

## 无障碍

- `label` 用于无可见文本（仅图标）时提供可访问名，映射为 `aria-label`。
- 加载态通过 `aria-busy` 标注，并沿用原生 `disabled` 阻止交互。

<ComponentApi name="button" />
