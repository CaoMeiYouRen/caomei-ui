# Paginator 分页

分页用于在数据分片间切换，基于 Reka UI Pagination 封装。

## 基础用法

通过 `v-model:page` 双向绑定当前页，`total` 与 `itemsPerPage` 决定总页数（缺省每页 10 条）。

<demo
    vue="../examples/paginator/basic.vue"
    ssg="true"
/>

## 首尾与省略

`showEdges` 显示首页 / 末页按钮，`siblingCount` 控制当前页两侧显示的页码数量；页数较多时自动以省略号收起。

<demo
    vue="../examples/paginator/edges.vue"
    ssg="true"
/>

## 状态

`total` 为 0 时仅显示第 1 页并禁用翻页；`disabled` 禁用全部控件。

<demo
    vue="../examples/paginator/states.vue"
    ssg="true"
/>

## 每页条数

提供 `rowsPerPageOptions` 后，分页器末尾渲染每页条数选择器；切换时抛出 `update:itemsPerPage`，并**保留当前首行偏移** `(page - 1) * itemsPerPage`、按新每页条数重新推导页码（对齐 PrimeVue 的 `first` 语义）——偏移不足一页时回到第 1 页。选择器可访问名默认取当前语言的「每页条数」，可用 `rowsPerPageLabel` 覆盖。

<demo
    vue="../examples/paginator/rows-per-page.vue"
    ssg="true"
/>

> 未提供 `rowsPerPageOptions` 时不渲染选择器，行为与既有版本一致；`itemsPerPage` 仍为受控 prop，配合 `v-model:items-per-page` 使用时由父级接收新值。

## 从 PrimeVue 迁移

| PrimeVue | caomei-ui |
| --- | --- |
| `v-model:first`（0 基偏移） | `v-model:page`（1 基页码） |
| `:rows` | `:items-per-page` |
| `:total-records` | `:total` |
| `@page="({ page, rows, first }) => ..."` | 监听 `update:page` / `update:itemsPerPage`；需要偏移时按 `(page - 1) * itemsPerPage` 换算 |
| `:rows-per-page-options` | `rowsPerPageOptions`（切换时监听 `update:itemsPerPage`） |
| `template`（含 `CurrentPageReport`） | **未实现**：分页器不提供模板插槽与「第 x / 共 y 页」报表；如需报表，在分页器旁按 `page` / `itemsPerPage` / `total` 自行渲染（见上方示例的区间文本） |

## 无障碍

- 根节点为 `<nav>`，可访问名优先级为 `label` > 透传 `aria-label` > 当前语言分页文案（默认中文「分页」）；未提供 `label`（或传空串）时透传值生效；同一页面存在多个分页器时建议分别命名，便于 landmark 导航区分。
- 页码与翻页按钮均为原生 `<button>`；当前页输出 `aria-current="page"`，省略号标记为 `aria-hidden`。
- 页码与翻页按钮具备内建可访问名（默认取当前语言文案），可通过 `pageLabel` / `firstLabel` / `previousLabel` / `nextLabel` / `lastLabel` 覆盖；`pageLabel` 中的 `{page}` 会替换为页码。
- 首页 / 末页按钮在第一页 / 末页时自动禁用，翻页按钮在边界同样禁用。
- 每页条数选择器默认可访问名为「每页条数」，可用 `rowsPerPageLabel` 覆盖；其选项为各档位数值。
- 控件在窄屏自动换行，避免水平溢出。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-paginator-gap` | `4px` | 控件间距 |
| `--caomei-paginator-control-size` | `32px` | 控件最小宽度与高度 |
| `--caomei-paginator-radius` | `--caomei-radius-sm` | 控件圆角 |
| `--caomei-paginator-bg` | `--caomei-color-bg` | 控件背景色 |
| `--caomei-paginator-border` | `--caomei-color-border` | 控件描边色 |
| `--caomei-paginator-color` | `--caomei-color-text` | 控件文字色 |
| `--caomei-paginator-active-bg` | `--caomei-color-primary` | 当前页背景与描边色 |
| `--caomei-paginator-active-color` | `--caomei-color-primary-foreground` | 当前页文字色 |
| `--caomei-paginator-rows-width` | `6rem` | 每页条数选择器宽度（仅提供 `rowsPerPageOptions` 时生效） |

```css
.caomei-paginator {
    --caomei-paginator-active-bg: #16a34a;
    --caomei-paginator-control-size: 36px;
}
```

<ComponentApi name="paginator" />
