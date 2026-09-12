# DataTable 表格

表格用于展示结构化数据，基于 `@tanstack/vue-table` 的无头能力自建渲染，默认提供极简表样式与空态。

## 基础用法

`data` 传入行数据，`columns` 传入列定义；`key` 同时作为默认取值字段，`rowKey` 用于稳定行标识。

<demo
    vue="../examples/data-table/basic.vue"
    ssg="true"
/>

## 列定义

`DataTableColumn` 常用字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | `string` | 列唯一标识，同时作为默认取值字段 |
| `header` | `string` | 表头文本，缺省显示 `key` |
| `accessor` | `string \| (row) => unknown` | 取值字段名或函数 |
| `cell` | `(context) => VNodeChild` | 自定义单元格内容，`context` 含 `row` / `value` / `index` |
| `width` | `string` | 列宽，如 `120px` / `20%` |
| `align` | `'left' \| 'center' \| 'right'` | 水平对齐，默认 `left` |

<demo
    vue="../examples/data-table/custom-cell.vue"
    ssg="true"
/>

## 空态

`data` 为空时渲染空态，默认文案取自当前语言；可用 `empty` 插槽自定义，或用 `emptyText` 覆盖文案。

<demo
    vue="../examples/data-table/empty.vue"
    ssg="true"
/>

## 行样式

- `hoverable` 控制行悬浮高亮（默认开启）。
- `striped` 开启斑马纹行。
- `caption` 渲染表格标题，供无障碍使用。

<demo
    vue="../examples/data-table/striped.vue"
    ssg="true"
/>

## 范围与约定

- `data` 为浅响应：更新时请替换数组引用（`data.value = [...]`），原地 `push` / `splice` 不会触发重新渲染。
- `key` 与 `accessor` 使用字符串字段名，不做字段级类型校验；需要类型安全取值时用 `accessor` 函数。
- 当前仅提供列定义与空态渲染，暂不支持排序 / 分页 / 行选择 / 分组。

## 无障碍

- 使用语义化 `<table>` / `<thead>` / `<tbody>`，表头单元格带 `scope="col"`。
- 建议通过 `caption` 提供表格标题，或在使用层提供可见说明。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-data-table-border` | `--caomei-color-border` | 单元格分隔线颜色 |
| `--caomei-data-table-head-bg` | `--caomei-color-bg-elevated` | 表头背景色 |
| `--caomei-data-table-row-bg` | `transparent` | 行背景色 |
| `--caomei-data-table-striped-bg` | `--caomei-color-bg-elevated` | 斑马纹背景色 |
| `--caomei-data-table-row-hover-bg` | 文字色 4% 混合 | 行悬浮背景色 |

<ComponentApi name="data-table" />
