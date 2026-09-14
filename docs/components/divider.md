# Divider 分隔线

分隔线用于区隔内容区块，支持水平 / 垂直方向、内容插槽与线型。

## 基础用法

<demo
    vue="../examples/divider/basic.vue"
    ssg="true"
/>

## 带内容

提供默认插槽时，内容显示在分隔线中间；`align` 控制内容对齐（`left` / `center` / `right`，仅水平方向生效）。

<demo
    vue="../examples/divider/with-content.vue"
    ssg="true"
/>

## 线型与垂直

`variant` 支持 `solid` / `dashed` / `dotted`；`orientation="vertical"` 渲染垂直分隔线（常用于并排操作之间）。

<demo
    vue="../examples/divider/variants.vue"
    ssg="true"
/>

## 无障碍

- 渲染 `role="separator"` 并设置 `aria-orientation`。
- 内容插槽仅用于水平方向；垂直方向不渲染内容。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-divider-color` | `--caomei-color-border` | 线条颜色 |
| `--caomei-divider-thickness` | `1px` | 线条粗细 |
| `--caomei-divider-margin` | `--caomei-space-4 0` | 水平分隔线外边距 |
| `--caomei-divider-vertical-margin` | `--caomei-space-2` | 垂直分隔线左右外边距 |
| `--caomei-divider-gap` | `--caomei-space-3` | 带内容时内容与两侧线条的间距 |

<ComponentApi name="divider" />
