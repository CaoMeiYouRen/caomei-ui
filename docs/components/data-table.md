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
| `accessor` | `string \| (row) => unknown` | 取值字段名（支持 `a.b` 点号嵌套）或函数 |
| `cell` | `(context) => VNodeChild` | 自定义单元格内容，`context` 含 `row` / `value` / `index`；同名列插槽存在时被其覆盖 |
| `width` | `string` | 列宽，如 `120px` / `20%` |
| `align` | `'left' \| 'center' \| 'right'` | 水平对齐，默认 `left` |
| `sortable` | `boolean` | 该列是否可排序（表头渲染为排序按钮） |
| `sortFn` | `'alphanumeric' \| 'text' \| 'basic'` | 排序函数，默认 `alphanumeric` |
| `headerClass` / `bodyClass` | `string` | 表头 / 数据单元格自定义 class |
| `headerStyle` / `bodyStyle` | `CSSProperties` | 表头 / 数据单元格自定义样式 |
| `frozen` | `'left' \| 'right'` | 冻结列（横向滚动时吸边） |

<demo
    vue="../examples/data-table/custom-cell.vue"
    ssg="true"
/>

## 列插槽

除列定义里的 `cell` 函数外，还可用**按列 key 命名的作用域插槽**自定义单元格与表头；插槽优先于 `cell` 函数，未提供插槽的列保持原有行为。

| 插槽 | 作用域 | 说明 |
|------|--------|------|
| `#cell-{key}` | `{ row, value, index, column }` | 该列的单元格内容 |
| `#header-{key}` | `{ column }` | 该列的表头内容；可排序列中渲染在排序按钮内部，排序交互保留 |

<demo
    vue="../examples/data-table/column-slots.vue"
    ssg="true"
/>

> 插槽名中的 `{key}` 即列定义里的 `key`（如 `key: 'status'` 对应 `#cell-status`）；`column` 为该列的完整定义，便于按列配置渲染。插槽名按字符串匹配，**不做键校验**——`key` 写错不会报错，只会静默回退到默认取值。
>
> 作用域中的 `index` 是**数据源行索引**（与 `cell` 函数上下文一致），排序后不随显示位置变化；若要展示"显示序号"，请按当前渲染顺序自行计算，不要直接用 `index`。
>
> 可排序列的 `#header-{key}` 渲染在排序 `<button>` 内部，**请勿在其中放置按钮或链接**等可交互元素（会形成嵌套交互控件并破坏键盘语义）。

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
|----------|--------|
| `<Column field="x" :header="…">` | `columns` 数组中的 `{ key: 'x', header: … }`（`key` 兼作默认取值字段） |
| `<template #body="{ data }">` / `#body="slotProps"` | `<template #cell-{key}="{ row, value, index }">`（`data` 对应 `row`，`slotProps.data` 同理） |
| 列级 `<template #header>` | `<template #header-{key}="{ column }">` |
| 表级 `<template #header>` / `#footer` | 无表级 header / footer 插槽；标题改用 `caption`，操作区放在表格容器外 |
| `frozen` + `align-frozen="left" \| "right"` | `frozen: 'left' \| 'right'`（单个字段同时表达是否冻结与停靠方向） |
| `<Column selection-mode="multiple" />` | 表格级 `selectionMode="multiple"`；选择列固定渲染在首列，**其宽度与样式不可配置**（内建 `1%` 宽 + 内边距） |

## 排序

`sortable` 列点击表头即可排序（首次升序）。传入 `sortField` + `sortOrder` 进入**受控排序**并在变化时抛出 `sort` 事件；运行时传入或移除 `sortField` 会在受控与自持之间切换，受控时需在 `sort` 事件中回写 `sortField` / `sortOrder`。非受控时同样抛出 `sort`（供观察，排序状态由组件自持）。

<demo
    vue="../examples/data-table/sorting.vue"
    ssg="true"
/>

## 行选择

`selectionMode` 为 `multiple` / `single` 时首列渲染选择框；用 `v-model:selection` 双向绑定（`multiple` 为数组，`single` 为单行或 `null`）。`multiple` 模式表头提供全选框；运行时传入或移除 `selection` 会在受控与自持之间切换，`selectionMode` 需在挂载时确定。非受控时同样抛出 `update:selection`（供观察）。

<demo
    vue="../examples/data-table/selection.vue"
    ssg="true"
/>

## 分页

`paginator` 显示分页器，`rows` 设置每页条数；用 `v-model:page` 绑定当前页码（受控）。未启用 `paginator` 时不切片，整表渲染全部行。`lazy` 为真时按服务端分页处理：不再对传入的 `data` 切片（`data` 应为本页数据），总页数由 `totalRecords` 决定（缺省回退 `data.length`，服务端分页建议始终传入），页码变化抛出 `page`（`{ page, rows, first, pageCount }`）。`lazy` 需在挂载时确定。

<demo
    vue="../examples/data-table/pagination.vue"
    ssg="true"
/>

## 冻结列

`frozen` 支持 `'left'` / `'right'`，使列在横向滚动时吸边。吸边偏移按冻结列声明的 px `width` 累计（非 px 或未声明按 150px 估算），请为冻结列显式设置 px `width`，并建议每侧不超过一列。存在冻结列时表格会按 px 宽度之和设置 `min-width` 以保证可横向滚动；同侧多列时按末端累计偏移。

> 冻结列需要不透明背景：行背景默认值由 `transparent` 调整为 `--caomei-color-bg`，悬浮 / 选中态以该色为底混合；如需透明行背景，请覆盖 `--caomei-data-table-row-bg` 并自行确保吸边单元格不透视。

<demo
    vue="../examples/data-table/frozen.vue"
    ssg="true"
/>

## 加载态

`loading` 为真时渲染加载行并标注 `aria-busy`；文案默认取当前语言的「加载中」，可用 `loadingText` 覆盖。

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
- 当前已支持列定义与列插槽、排序、行选择、分页、冻结列与加载态。

## 无障碍

- 使用语义化 `<table>` / `<thead>` / `<tbody>`，表头单元格带 `scope="col"`。
- 建议通过 `caption` 提供表格标题，或在使用层提供可见说明。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-data-table-border` | `--caomei-color-border` | 单元格分隔线颜色 |
| `--caomei-data-table-head-bg` | `--caomei-color-bg-elevated` | 表头背景色 |
| `--caomei-data-table-row-bg` | `--caomei-color-bg` | 行背景色 |
| `--caomei-data-table-striped-bg` | `--caomei-color-bg-elevated` | 斑马纹背景色 |
| `--caomei-data-table-row-hover-bg` | 文字色 4% 混合 | 行悬浮背景色 |
| `--caomei-data-table-selected-bg` | 主色 8% 混合 | 选中行背景色 |

<ComponentApi name="data-table" />
