# Descriptions 描述列表

描述列表以「标签 / 内容」成对展示一组只读字段，常用于详情页的基础信息区。使用 `dl` / `dt` / `dd` 语义，由 `CaomeiDescriptions` 与 `CaomeiDescriptionsItem` 组合。

## 基础用法

`columns` 控制桌面档列数（1–6，默认 3），`labelWidth` 控制标签列宽度；每个条目通过 `label` 提供标签，默认插槽提供值。

<demo
    vue="../examples/descriptions/basic.vue"
    ssg="true"
/>

## 列数与跨列

- `columns` 只影响桌面档；≤1024px 最多 2 列，≤640px 固定单列。
- 条目 `span` 跨列；超过当前列数时按整行处理（不会产生隐式列或横向溢出）。
- `columns` 超出 1–6 时夹取到边界。

<demo
    vue="../examples/descriptions/layout.vue"
    ssg="true"
/>

## 带边框与布局

- `bordered` 把每个条目渲染为带边框的单元；标签区带浅色分隔，适合详情页表格形态。
- `layout="vertical"` 把标签放到内容上方；默认 `horizontal` 同行展示。
- `size` 取 `sm` / `md`（默认）/ `lg`，控制标签 / 内容字号与条目间距。

## 响应式与长内容

- 响应式只消费**视口**宽度：320 / 768 / 1280 分别落在单列 / 两列 / 按 `columns` 三档。
- 标签与内容均使用 `overflow-wrap: anywhere`，超长连续字符串会在条目内折行，不撑破容器。
- 跨列条目在 ≤1024px 按整行处理，避免 `span` 大于当前列数。

## 与 DataTable 的边界

- `Descriptions` 用于**只读的键值对**展示（详情页、抽屉内的基础信息），不支持排序、筛选、分页或行选择。
- `DataTable` 用于**多行结构化数据**；需要列排序、筛选、分页、选择或展开时用 DataTable，即使只有一行数据。
- 需要可编辑的字段请用 `Form` / `FormItem`，本组件不承载输入控件。

## 无障碍

- 根为 `dl`，每个条目的标签为 `dt`、内容为 `dd`，读屏器可按「术语 / 描述」成对朗读。
- 带边框形态不改变语义；`span` 只影响视觉布局，不改变 DOM 顺序。
- 值区域允许放链接、按钮等交互元素，组件不接管其焦点。

## 样式定制

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `--caomei-descriptions-gap` | `--caomei-space-3` | 非边框形态的条目间距 |
| `--caomei-descriptions-label-width` | `auto`（由 `labelWidth` 写入） | 标签列宽度 |
| `--caomei-descriptions-cell-padding` | `--caomei-space-2 --caomei-space-3` | 带边框单元格内边距 |
| `--caomei-descriptions-label-size` | 由尺寸档决定 | 标签字号 |
| `--caomei-descriptions-value-size` | 由尺寸档决定 | 内容字号 |

<ComponentApi name="descriptions" />
