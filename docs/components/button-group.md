# ButtonGroup 按钮组

按钮组把多个按钮拼接为单一控件：相邻按钮的边框自动合并、内侧圆角去除，常用于一组紧密相关的操作。

## 基础用法

<demo
    vue="../examples/button-group/basic.vue"
    ssg="true"
/>

## 图标与垂直组合

`orientation="vertical"` 让按钮纵向堆叠：

<demo
    vue="../examples/button-group/variants.vue"
    ssg="true"
/>

## 边框拼接约定

- 成员按 DOM 顺序拼接：首成员保留起始侧圆角、末成员保留结束侧圆角，中间成员去圆角。
- 非末成员的内侧边框被移除，避免相邻边框叠成 2px 双线；聚焦成员会自动抬升到相邻按钮之上。
- 成员保持各自的内容宽度（`display: inline-flex` 容器随内容收缩）。

## 无障碍

- 容器仅承担布局职责，不改变成员的语义、焦点顺序与 ARIA 属性。
- 只放图标按钮时，请为按钮提供可访问名（如 `Button` 的 `label`）。

## 样式定制

按钮组不提供组级圆角变量：外侧圆角沿用各成员自身的圆角（默认 `--caomei-radius-md`，`Button` 的 `rounded` 则为 `--caomei-radius-full`），组仅负责去除成员内侧圆角与边框。

<ComponentApi name="button-group" />
