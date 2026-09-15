# DataView 数据视图

数据视图用同一组数据在列表与网格两种布局间切换：`layout` 决定渲染 `list` 还是 `grid` 插槽，条目结构与网格列数由插槽内容自行定义。自建实现，不依赖 Reka UI。

## 基础用法

`value` 为数据列表，`layout` 选择布局（默认 `list`）；`#list` / `#grid` 插槽收到 `{ items }`，内容由使用方自行排版。

<demo
    vue="../examples/data-view/basic.vue"
    ssg="true"
/>

## 布局切换

`layout` 为受控 prop，可与任意分段控件组合实现列表 / 网格切换；`#header` 与 `#footer` 插槽渲染在内容区之外，适合放布局切换、筛选或统计信息。

<demo
    vue="../examples/data-view/layouts.vue"
    ssg="true"
/>

## 加载与空态

`loading` 为真时显示加载提示并在根元素标注 `aria-busy`，优先于内容与空态；`value` 为空数组或未提供时进入空态，缺省文案取内建 locale，可用 `emptyText` 覆盖或 `#empty` 插槽完全自定义。

<demo
    vue="../examples/data-view/states.vue"
    ssg="true"
/>

## 插槽

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| `header` | — | 头部区域，渲染在内容区之外 |
| `footer` | — | 底部区域，渲染在内容区之外 |
| `list` | `{ items }` | `layout="list"` 时的内容 |
| `grid` | `{ items }` | `layout="grid"` 时的内容 |
| `empty` | `{ layout }` | 空态内容，缺省渲染 `emptyText` |

> 只渲染与当前 `layout` 匹配的插槽：`layout="grid"` 且未提供 `#grid` 时内容区为空（不会回退到 `#list`）。

> 迁移映射（PrimeVue → caomei-ui）：`value` → `value`（`null` 与空数组均视为空态）；`layout` → `layout`（默认同为 `list`，取值 `list` / `grid`）；`#list` / `#grid` / `#empty` / `#header` / `#footer` → 同名插槽，`#list` / `#grid` 同样收到 `{ items }`，`#empty` 额外收到 `layout`。**已知差异**：PrimeVue v4 的 `DataView` 没有 `loading` prop（官方建议用骨架屏自行表达加载态），下游传入的 `:loading` 目前不生效；本组件提供 `loading` 与 `loadingText`。PrimeVue 的 `grid` 模式只切换根类名与插槽、不内置网格列（官方要求搭配 Tailwind 等 CSS grid），本组件同样由使用方内容层决定列定义；PrimeVue 的空态文案取全局 `config.locale.emptyMessage`，本组件改为内建 locale `dataView.empty`，可用 `emptyText` / `#empty` 覆盖。**未实现（下游零用量）**：分页（`paginator` / `rows` / `first` / `totalRecords` / `alwaysShowPaginator` / `paginatorPosition` / `paginatorTemplate` / `pageLinkSize` / `rowsPerPageOptions` / `currentPageReportTemplate`）、排序（`sortField` / `sortOrder`）、`lazy`、`dataKey`，以及 `#paginatorcontainer` / `#paginatorstart` / `#paginatorend` 插槽。

## 无障碍

- `loading` 时根元素标注 `aria-busy="true"`，加载文案缺省取内建 locale 的「加载中」，可用 `loadingText` 覆盖。
- 空态文案默认本地化，`emptyText` 与 `#empty` 均可覆盖。
- 布局切换属于使用方内容层的交互，请为其控件提供可访问名（示例中的 `label`）。

<ComponentApi name="data-view" />
