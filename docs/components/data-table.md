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

## 排序

`sortable` 列点击表头即可排序（首次升序）。传入 `sortField` + `sortOrder` 进入**受控排序**并在变化时抛出 `sort` 事件；运行时传入或移除 `sortField` 会在受控与自持之间切换，受控时需在 `sort` 事件中回写 `sortField` / `sortOrder`。非受控时同样抛出 `sort`（供观察，排序状态由组件自持）。

<demo
    vue="../examples/data-table/sorting.vue"
    ssg="true"
/>

## 行分组

设置 `rowGroupMode="subheader"` 与 `groupRowsBy` 后，表格按分组键把**连续同值**的行聚成一组，并在每组前渲染一行分组标题。`groupRowsBy` 支持 `a.b` 点号嵌套路径，取值口径与列定义的 `accessor` **点号路径形态**一致（`accessor` 为函数时不参与分组取值）。

- 分组以**当前渲染行序**（排序 + 分页后的切片）为准：跨页的同值行会各自出现分组标题行。
- 存在同名 `key` 的列时，该列在数据行中渲染为**空白占位单元格**（不重复显示分组值），表头仍保留该列；占位单元格保留列宽，使其余数据列与表头保持对齐。
- 未同时提供 `rowGroupMode` 与 `groupRowsBy` 时不分组，渲染结果与既有行为一致。

`#groupheader` 插槽可自定义分组标题内容；未提供时回退渲染分组键取值（按 JS 默认字符串化）。

| 插槽 | 作用域 | 说明 |
|------|--------|------|
| `#groupheader` | `{ data, index, groupValue }` | `data` 为分组首行、`index` 为该行在当前渲染行序中的索引（0 基，与 `#cell-{key}` 的数据源索引不同）、`groupValue` 为分组键取值 |

<demo
    vue="../examples/data-table/grouping.vue"
    ssg="true"
/>

> 分组标题行横跨全部数据列，因此**不参与冻结列吸边**；同时使用冻结列与行分组时请评估这一限制。
>
> 同时开启 `striped` 时，斑马纹按 `<tbody>` 子节点顺序（`nth-child`）计算，分组标题行会占用一个序号、使数据行的条纹相位相对未分组时发生偏移。
>
> **与 PrimeVue 的有意差异**：PrimeVue 在 subheader 模式下直接不渲染分组字段列的数据单元格，会让数据行整体左移一列、与表头错位（[primefaces/primevue#6496](https://github.com/primefaces/primevue/issues/6496)）；本库改为渲染空白占位单元格以保持列对齐，分组值的展示仍以分组标题行为准。

## 行选择

`selectionMode` 为 `multiple` / `single` 时首列渲染选择框；用 `v-model:selection` 双向绑定（`multiple` 为数组，`single` 为单行或 `null`）。`multiple` 模式表头提供全选框；运行时传入或移除 `selection` 会在受控与自持之间切换，`selectionMode` 需在挂载时确定。非受控时同样抛出 `update:selection`（供观察）。

<demo
    vue="../examples/data-table/selection.vue"
    ssg="true"
/>

## 分页

`paginator` 显示分页器，`rows` 设置每页条数；用 `v-model:page` 绑定当前页码（受控）。提供 `rowsPerPageOptions` 后在分页器渲染每页条数选择器，切换时抛出 `update:rows`（配合 `v-model:rows` 使用），并按保留首行偏移的语义重新推导页码（受控分页下同时抛出 `update:page`，裁剪与否由父级决定）。未启用 `paginator` 时不切片，整表渲染全部行。`lazy` 为真时按服务端分页处理：不再对传入的 `data` 切片（`data` 应为本页数据），总页数由 `totalRecords` 决定（缺省回退 `data.length`，服务端分页建议始终传入），页码变化抛出 `page`（`{ page, rows, first, pageCount }`）。`lazy` 需在挂载时确定。

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
- 当前已支持列定义与列插槽、排序、行分组、行选择、分页、冻结列与加载态。

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
| `--caomei-data-table-group-bg` | `--caomei-color-bg-elevated` | 分组标题行背景色 |

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
|----------|--------|
| `<Column field="x" :header="…">` | `columns` 数组中的 `{ key: 'x', header: … }`（`key` 兼作默认取值字段） |
| `<template #body="{ data }">` / `#body="slotProps"` | `<template #cell-{key}="{ row, value, index }">`（`data` 对应 `row`，`slotProps.data` 同理） |
| 列级 `<template #header>` | `<template #header-{key}="{ column }">` |
| 表级 `<template #header>` / `#footer` | 无表级 header / footer 插槽；标题改用 `caption`，操作区放在表格容器外 |
| `frozen` + `align-frozen="left" \| "right"` | `frozen: 'left' \| 'right'`（单个字段同时表达是否冻结与停靠方向） |
| `<Column selection-mode="multiple" />` | 表格级 `selectionMode="multiple"`；选择列固定渲染在首列，**其宽度与样式不可配置**（内建 `1%` 宽 + 内边距） |
| `rows-per-page-options` | 同名 `rowsPerPageOptions`，切换抛出 `update:rows` 并按偏移保持语义重新推导页码 |
| `@page="({ page, rows, first }) => …"` | `@page="({ page, rows, first, pageCount }) => …"`（字段口径一致，另带 `pageCount`） |
| `rowGroupMode="subheader"` + `groupRowsBy` | 同名 `rowGroupMode` + `groupRowsBy`；按连续同值切分，分组列在数据行渲染为空白占位（不重复取值） |
| `#groupheader="slotProps"` | `#groupheader="{ data, index, groupValue }"`（`data` / `index` 与 PrimeVue 一致，另提供 `groupValue`）；未提供插槽时回退渲染分组键取值 |
| `#groupfooter` | **不支持**（分组页脚未纳入本轮范围，见[设计规范 §7](../design/design-spec.md)） |

> 迁移流程、通用陷阱与逐组件对照入口见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="data-table" />
