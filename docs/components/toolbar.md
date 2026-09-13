# Toolbar 工具条

工具条用于将一组操作控件组织为单一键盘导航区域，基于 Reka UI Toolbar 封装，由 `CaomeiToolbar` 与 `CaomeiToolbarButton` / `CaomeiToolbarLink` / `CaomeiToolbarSeparator` / `CaomeiToolbarToggleGroup` / `CaomeiToolbarToggleItem` 组合使用。

## 基础用法

工具条内部使用 roving focus：`CaomeiToolbarButton` / `CaomeiToolbarLink` / `CaomeiToolbarToggleItem` 共享一个 Tab 停靠点，进入后用方向键在控件间移动。`label` 提供无可见标题时的可访问名。

<demo
    vue="../examples/toolbar/basic.vue"
    ssg="true"
/>

## 开关分组

将开关条目放入 `CaomeiToolbarToggleGroup`，可实现加粗 / 斜体等按下态操作；条目同样纳入工具条的 roving focus。`type="multiple"` 为多选（各条目独立开关），`type="single"` 为单选。

<demo
    vue="../examples/toolbar/toggle.vue"
    ssg="true"
/>

> 工具条内的 `CaomeiToggleButton`（独立开关按钮）不参与工具条的 roving focus，会形成额外的 Tab 停靠点；需要纳入键盘漫游时请使用 `CaomeiToolbarToggleItem`。

## 方向

`orientation="vertical"` 切换为垂直工具条，方向键同步切换为上下移动。

<demo
    vue="../examples/toolbar/vertical.vue"
    ssg="true"
/>

## 无障碍

- 容器渲染为 `role="toolbar"`，输出 `aria-orientation`；`label` 映射 `aria-label`。
- roving focus：`CaomeiToolbarButton` / `CaomeiToolbarLink` / `CaomeiToolbarToggleItem` 共享一个 Tab 停靠点，方向键在可聚焦控件间移动（默认首尾循环，`loop=false` 关闭）。
- 分隔线渲染为 `role="separator"`；其 `data-orientation` 等于工具条方向（水平工具条上的分隔线视觉为竖线）。
- `CaomeiToolbarButton` 渲染为原生 `<button>`，`CaomeiToolbarLink` 渲染为锚点，禁用按钮移出焦点序列。
- 聚焦时显示 `:focus-visible` 描边，并遵循 `prefers-reduced-motion`。

## 组合件 API

| 组件 | 关键属性 | 说明 |
|------|----------|------|
| `CaomeiToolbarButton` | `disabled`、`label` | 操作按钮，渲染为原生 `<button>`，默认插槽为内容 |
| `CaomeiToolbarLink` | `label`（`href` 等经属性透传） | 链接，渲染为锚点，默认插槽为内容 |
| `CaomeiToolbarSeparator` | — | 功能组之间的分隔线，方向自动 |
| `CaomeiToolbarToggleGroup` | `type`（`single` / `multiple`）、`disabled`、`name`、`required`、`label` | 开关分组容器，`v-model` 绑定选中值；方向随工具条 |
| `CaomeiToolbarToggleItem` | `value`（必填）、`disabled`、`label` | 开关条目，`value` 需与组模型对应 |

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-toolbar-gap` | `--caomei-space-1` | 控件间距 |
| `--caomei-toolbar-padding` | `--caomei-space-1` | 工具条内边距 |
| `--caomei-toolbar-border` | `--caomei-color-border` | 边框色 |
| `--caomei-toolbar-radius` | `--caomei-radius-md` | 圆角 |
| `--caomei-toolbar-bg` | `--caomei-color-bg` | 背景色 |
| `--caomei-toolbar-button-gap` | `--caomei-space-1` | 按钮内图标与文本间距 |
| `--caomei-toolbar-button-size` | `--caomei-control-height-md` | 按钮高度与最小宽度 |
| `--caomei-toolbar-button-padding-x` | `--caomei-space-2` | 按钮水平内边距 |
| `--caomei-toolbar-button-radius` | `--caomei-radius-sm` | 按钮圆角 |
| `--caomei-toolbar-button-active-bg` | `--caomei-color-primary` | 开关条目按下态背景色 |
| `--caomei-toolbar-button-active-color` | `--caomei-color-primary-foreground` | 开关条目按下态文字色 |
| `--caomei-toolbar-separator` | `--caomei-color-border` | 分隔线颜色 |
| `--caomei-toolbar-separator-margin` | `--caomei-space-1` | 分隔线外边距 |

```css
.caomei-toolbar {
    --caomei-toolbar-radius: 999px;
    --caomei-toolbar-button-size: 32px;
}
```

<ComponentApi name="toolbar" />
