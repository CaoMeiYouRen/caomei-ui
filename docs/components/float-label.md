# FloatLabel 浮动标签

浮动标签把 `<label>` 叠加在表单字段上：`over`（默认）在空值时居中充当占位提示，聚焦或有值时上浮到字段上方；`in` 让标签常驻字段顶部、字段内容下移。

## 基础用法

`over` 变体下，标签在空值时居中，字段有值或获得焦点时上浮到字段上方（不占用字段内部空间，不会压住输入值）：

<demo
    vue="../examples/float-label/basic.vue"
    ssg="true"
/>

## 搭配选择器

成员可以是任意表单控件，例如选择器：

<demo
    vue="../examples/float-label/with-select.vue"
    ssg="true"
/>

## in 变体

`variant="in"` 让标签固定在字段顶部，字段为标签预留空间：

<demo
    vue="../examples/float-label/in.vue"
    ssg="true"
/>

## 使用约定

- 默认插槽内需包含一个字段与一个**直接子级** `<label>`，并通过 `for` 关联字段的 `id`。
- 「有值」判断依赖字段根元素暴露的 `data-filled` 属性；`CaomeiInput` / `Textarea` / `Select` / `MultiSelect` / `InputNumber` 均已支持，原生 `<input>` / `<textarea>` 还会通过非空 `placeholder` 与聚焦态触发上浮。
- `MultiSelect` 由 Reka `ComboboxRoot` 渲染出包裹层，字段并非直接子级；`FloatLabel` 已按后代匹配兼容该情况，其余控件仍建议作为直接子级。
- 一个 `FloatLabel` 内建议只放一个字段：`over` 的「有值」判定会匹配任意后代 `data-filled`。
- 成员提供非空 `placeholder` 时，`over` 的空值标签也会上浮，以免与占位文本重叠。
- `in` 变体会统一字段高度（忽略 `size` 档位，取 `--caomei-float-label-in-min-height`），以保证标签与内容有稳定间距。
- 自定义字段可通过在字段根元素暴露 `data-filled`（有值）或 `data-has-placeholder`（有非空占位文本）接入 `over` 浮动态。
- `over` 变体在字段上方浮出标签，因此会通过 `margin-block-start` 预留间距（见 `--caomei-float-label-over-space`）；置 `0` 可由使用方自行控制。
- `in` 变体通过顶部内边距为标签预留空间，目前适配 `Input` / `Select` / `MultiSelect` / `Textarea`；`InputNumber` 请使用 `over`。

## 浏览器兼容

浮动态依赖 CSS `:has()` 选择器，需 Chrome 105+ / Edge 105+ / Safari 15.4+ / Firefox 121+。不支持 `:has()` 的环境会退化为标签常驻居中（`over` 字段有值时标签会压住输入值），建议按上述基线接入或改用 `variant="in"`（`in` 变体不依赖 `:has()` 定位标签）。

## 无障碍

- 标签仍为语义化 `<label>`，通过 `for` 与字段关联；`over` 变体下标签设 `pointer-events: none` 以免遮挡文本选择。
- 聚焦态标签使用主题主色；`aria-invalid` 或字段的 `invalid` 态会切换为危险色。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-float-label-inset` | `--caomei-space-3` | 标签距字段起始侧内边距 |
| `--caomei-float-label-color` | `--caomei-color-text-muted` | 标签默认颜色 |
| `--caomei-float-label-focus-color` | `--caomei-color-primary` | 聚焦态标签颜色 |
| `--caomei-float-label-invalid-color` | `--caomei-color-danger` | 校验失败态标签颜色 |
| `--caomei-float-label-over-space` | `--caomei-space-4` | `over` 在字段上方预留的间距（置 `0` 可关闭） |
| `--caomei-float-label-over-top` | `calc(-1 * var(--caomei-space-4))` | `over` 上浮后标签距字段顶部的位置（负值表示在字段上方） |
| `--caomei-float-label-over-textarea-top` | `--caomei-space-2` | `over` 下多行文本框空值标签位置 |
| `--caomei-float-label-in-top` | `--caomei-space-1` | `in` 变体标签距顶部位置 |
| `--caomei-float-label-in-min-height` | `--caomei-control-height-lg` | `in` 变体字段最小高度 |
| `--caomei-float-label-in-padding-top` | `--caomei-space-4` | `in` 变体为标签预留的顶部空间 |
| `--caomei-float-label-in-padding-bottom` | `--caomei-space-1` | `in` 变体字段底部内边距 |
| `--caomei-float-label-transition-duration` | `0.15s` | 过渡时长 |

<ComponentApi name="float-label" />
