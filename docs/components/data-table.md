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
| `width` | `string` | 列宽，如 `120px` / `20%`；百分比不驱动截断与提示，见「长文本截断与提示」 |
| `align` | `'left' \| 'center' \| 'right'` | 水平对齐，默认 `left` |
| `sortable` | `boolean` | 该列是否可排序（表头渲染为排序按钮） |
| `sortFn` | `'alphanumeric' \| 'text' \| 'basic'` | 排序函数，默认 `alphanumeric` |
| `headerClass` / `bodyClass` | `string` | 表头 / 数据单元格自定义 class |
| `headerStyle` / `bodyStyle` | `CSSProperties` | 表头 / 数据单元格自定义样式 |
| `frozen` | `'left' \| 'right'` | 冻结列（横向滚动时吸边） |
| `expander` | `boolean` | 标记为行展开列：单元格渲染展开 / 收起切换按钮、表头留空（需配合 `#expansion` 插槽） |

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

`sortable` 列点击表头即可排序（首次升序，可用 `sortDescFirst` 改为首次降序）。传入 `sortField` + `sortOrder` 进入**受控排序**并在变化时抛出 `sort` 事件；运行时传入或移除 `sortField` 会在受控与自持之间切换，受控时需在 `sort` 事件中回写 `sortField` / `sortOrder`。非受控时同样抛出 `sort`（供观察，排序状态由组件自持）。

排序键按「升 → 降 → 移除」循环：对已排序的列，第三击会把排序移除（`sort` 载荷的 `sortOrder` 为空字符串）。

<demo
    vue="../examples/data-table/sorting.vue"
    ssg="true"
/>

### 多列排序

`sortMode="multiple"` 开启多列排序，用 `v-model:multiSortMeta`（`DataTableSortMeta[]`，**按优先级排列**）双向绑定排序键。

- **按住 Cmd / Ctrl 点击表头**把该列追加为下一个排序键（已在列表中的列则切换其方向，不影响其它键）；**不按修饰键**点击则收敛为该列的单列排序（对齐 PrimeVue 语义）。
- `order` 取 `1`（升序）/ `-1`（降序）；`order: 0` 的条目会被忽略。新键首次参与排序的方向由 `sortDescFirst` 决定（默认 `false` 升序）。
- 已参与排序的表头显示优先级序号；多列同时排序时各表头分别带 `aria-sort`。
- 提供 `multiSortMeta` 即进入**受控模式**（点击只抛出 `update:multiSortMeta`，需自行回写），移除后回到自持；两种模式都会抛出 `update:multiSortMeta`。
- 多列模式下 `sort` 载荷额外带 `multiSortMeta`（完整排序键），`sortField` / `sortOrder` 仍取第一优先级的键。
- `sortMode` 需在挂载时确定；`sortMode="multiple"` 与单列模式互斥。

<demo
    vue="../examples/data-table/sorting-multiple.vue"
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
> 同时开启 `striped` 时，斑马纹按 `<tbody>` 子节点顺序（`nth-child`）计算，分组标题行与**行展开区**都会占用一个序号、使数据行的条纹相位相对未分组时发生偏移；可折叠分组或行展开的展开 / 收起还会改变后续行的奇偶，条纹落点随之平移。
>
> **与 PrimeVue 的有意差异**：PrimeVue 在 subheader 模式下直接不渲染分组字段列的数据单元格，会让数据行整体左移一列、与表头错位（[primefaces/primevue#6496](https://github.com/primefaces/primevue/issues/6496)）；本库改为渲染空白占位单元格以保持列对齐，分组值的展示仍以分组标题行为准。

### 可折叠分组

设置 `expandableRowGroups` 后，分组标题行渲染内建切换按钮（原生 `<button>` + chevron，带 `aria-expanded` 与可访问名、键盘可达），用于折叠 / 展开该分组的数据行。

- **缺省（未提供 `expandedRowGroups`）时分组全部收起**（对齐 PrimeVue）——此时只渲染分组标题行；需要初始展开时用 `v-model:expandedRowGroups` 给出初始值。
- 用 `v-model:expandedRowGroups`（`string[]`）双向绑定展开的分组键集合；提供该 prop 即进入**受控模式**（点击只抛出 `update:expandedRowGroups`，是否采纳由父级决定），移除后回到自持。下方示例未传该 prop（自持模式）故初始全部收起，需要初始展开时传入初始值（如 `['前端']`）。
- 抛出 `rowgroupExpand` / `rowgroupCollapse`，载荷 `{ originalEvent, data }`，`data` 为分组键。
- 分组键取分组字段值的字符串形式（`null` / `undefined` 归一为空串）；**非连续的同值分组共用同一分组键**，切换会同时影响它们；字符串化后相同的不同取值（如数字 `1` 与字符串 `'1'`）也会共用同一键。
- 收起只影响渲染，不影响分页器总条数（总条数按 `data` / `totalRecords` 计算）。
- 切换按钮的可访问名默认取当前语言的「展开分组」/「收起分组」，可用 `expandRowGroupLabel` / `collapseRowGroupLabel` 覆盖。

<demo
    vue="../examples/data-table/grouping-expandable.vue"
    ssg="true"
/>

## 行展开

在列定义中把某一列标记为 `expander: true`，该列的数据单元格即渲染**展开 / 收起切换按钮**（原生 `<button>` + chevron，带 `aria-expanded`、`aria-controls` 与可访问名，键盘可达），该列表头**始终留空**（即使提供了 `header`，也不渲染表头文本 / 排序按钮 / 列插槽；若声明多个 `expander` 列，仅首个生效）。展开区由 `#expansion` 插槽承载，可放任意嵌套内容（如子表格、明细列表）。

- 用 `v-model:expandedRows`（`string[]`，行 key，口径同 `rowKey`）双向绑定展开的行集合；提供该 prop 即进入**受控模式**（点击只抛出 `update:expandedRows`，是否采纳由父级决定），移除后回到自持（缺省初始为空，即全部收起）。
- 抛出 `rowExpand` / `rowCollapse`，载荷 `{ originalEvent, data }`，`data` 为该行数据。
- **必须提供 `#expansion` 插槽**才有可见展开区；未提供时展开态与事件仍生效（与 PrimeVue 一致）。
- 展开行横跨全部数据列（含选择列与展开列），因此**不参与冻结列吸边**；展开列请显式设置 px `width`。
- **`lazy` 下必须提供 `rowKey`**：服务端分页的 `data` 只含当前页，缺省按**页内索引**生成 key 会与其它页撞 id。未提供时自持展开态在 `data` 引用被替换时重置（不额外抛出 `update:expandedRows`），受控 `expandedRows` 也无法稳定跨页（开发期告警）。非 `lazy` 下**建议提供 `rowKey`**：缺省按行索引生成 key，**整体替换 `data`（数据刷新）** 后展开态会错位（排序与客户端分页只重排行引用、不改变 key）。

| 插槽 | 作用域 | 说明 |
|------|--------|------|
| `#expansion` | `{ data, index }` | `data` 为该行数据、`index` 为该行在当前渲染行序中的索引（0 基，口径同 `#groupheader`，与 `#cell-{key}` 的数据源索引不同） |

<demo
    vue="../examples/data-table/row-expansion.vue"
    ssg="true"
/>

> 切换按钮的可访问名默认取当前语言的「展开行」/「收起行」，可用 `expandRowLabel` / `collapseRowLabel` 覆盖。

## 行选择

`selectionMode` 为 `multiple` / `single` 时首列渲染选择框；用 `v-model:selection` 双向绑定（`multiple` 为数组，`single` 为单行或 `null`）。`multiple` 模式表头提供全选框，作用域由 `selectAllScope` 决定：

- **`page`（默认）**：只作用于**当前页**。客户端分页下切换页面不会清除其它页已选行，表头状态（全选 / 半选）也只反映当前页；未启用分页时等同于全选整表。默认值与既有行为逐项一致。
- **`all`**：作用于当前 `data` 的**全部行**（客户端分页下即整表）。表头状态按整表计算，点击一次选中全部数据行，再点一次全部取消。
- **`lazy`（服务端分页）**：不推断未加载页。默认 `page` 保持既有行为（受控下同样只抛出当前页）；仅 `selectAllScope="all"` 时仍只切当前页，但受控 `selection` 下点击抛出「当前页 + 其它页保留项」的合并结果，**不会清空未加载页已选中的行**（同 key 的过期对象会被当前页对象去重）。
- 受控 `selection` 优先：提供 `selection` 时表头状态由受控值计算，点击只抛出 `update:selection`，是否采纳由父级决定。

`lazy` 下请显式提供 `rowKey`（缺省按页内索引，翻页后无法稳定标识行）。运行时传入或移除 `selection` 会在受控与自持之间切换，`selectionMode` 与 `selectAllScope` 需在挂载时确定（运行期切换只影响后续交互，不重算既有选择）。非受控时同样抛出 `update:selection`（供观察）。

> `selectAllScope="all"` 时默认可访问名仍是「全选当前页」，与实际动作不符：请通过 `selectAllLabel` 覆盖为「全选全部行」一类文案（开发期会给出提醒）。

> 与 PrimeVue 的有意差异：PrimeVue 客户端分页的表头全选作用于过滤后的整表。本库默认保持「当前页」，需要整表语义时显式传 `selectAllScope="all"`。

<demo
    vue="../examples/data-table/selection.vue"
    ssg="true"
/>

## 密度与选择列

不提供 `size` prop；密度通过 token 调整，选择列宽度与内边距同样可配。覆盖写在表格容器或任意祖先上即可，无需再为 `.caomei-data-table__th` / `__td` 写选择器：

```css
.demo-compact {
    --caomei-data-table-cell-padding-block: 4px;
    --caomei-data-table-cell-padding-inline: 8px;
    --caomei-data-table-selection-column-width: 48px;
    --caomei-data-table-selection-cell-padding-inline: 4px;
}
```

<demo
    vue="../examples/data-table/density.vue"
    ssg="true"
/>

> 块级 / 行内内边距同时作用于表头、数据单元格、分组标题行、展开区与空态（空态在 `--caomei-space-4` 基础上叠加块级内边距）；选择列宽度作用于表头与数据行。默认值分别为 `--caomei-space-2` / `--caomei-space-3` / `1%` / `--caomei-space-2`，不覆盖时与升级前一致。

## 分页

`paginator` 显示分页器，`rows` 设置每页条数；用 `v-model:page` 绑定当前页码（受控）。提供 `rowsPerPageOptions` 后在分页器渲染每页条数选择器，切换时抛出 `update:rows`（配合 `v-model:rows` 使用），并按保留首行偏移的语义重新推导页码（受控分页下同时抛出 `update:page`，裁剪与否由父级决定）。未启用 `paginator` 时不切片，整表渲染全部行。`lazy` 为真时按服务端分页处理：不再对传入的 `data` 切片（`data` 应为本页数据），总页数由 `totalRecords` 决定（缺省回退 `data.length`，服务端分页建议始终传入），页码变化抛出 `page`（`{ page, rows, first, pageCount }`）。`lazy` 需在挂载时确定。`lazy` 下行选择**按页收敛**：受控 `selection` 只映射当前页行，`update:selection` 也只含当前页行（`selectAllScope="all"` 时为例外，见「行选择」）；未受控时 `data` **引用被替换**（翻页或同页刷新）会清空内部选择，清空不额外抛出 `update:selection`，原地修改同一数组不会触发（请替换引用）。需要跨页保留时由父级聚合受控 `selection`。

**页码自动重置与父级配合**

- **默认行为**：客户端分页下，**替换 `data` 引用**（刷新 / 删除 / 过滤后重新取数）或排序变化会**回到第一页**（上游 `autoResetPageIndex` 的默认）；原地修改同一数组不触发。`lazy`（服务端分页）默认**不重置**。需要保留当前页时传 `:auto-reset-page-index="false"`（仅建议用于客户端分页）。
- **受控分页**：自动重置会**同时抛出 `update:page` 与 `page`（第 1 页）**，是否采纳由父级决定——刷新期间两者都需忽略（或由父级暂缓处理），数据落定后再写回 `page`。
- **越界页回收**：受控分页下组件不做页码钳位，数据缩水使当前页越界时由父级把 `page` 回收为有效页（如 `Math.min(page, Math.max(1, Math.ceil(total / rows)))`）。**非受控分页**仅在 `rows` / `totalRecords` 变化时按既有逻辑钳位并抛出一次 `update:page`；默认（自动重置开启）替换 `data` 引用会回到第 1 页，关闭自动重置后 `data` 缩水不会以钳位方式自愈，需要自愈时请改用受控 `page`。
- **每页条数**：建议用 `v-model:rows` 持久化（如 localStorage）；**非受控分页**下 `totalRecords` 变化只钳位页码，不会回退用户已选的每页条数。

> 分页容器默认右对齐（`flex-end`），与 PrimeVue 分页器默认居中不同；需要居中等其它对齐时覆盖 `--caomei-data-table-pagination-justify`（见「样式定制」），无需选择器级覆盖。

<demo
    vue="../examples/data-table/pagination.vue"
    ssg="true"
/>

## 逐格提示与批量表

默认单元格（未使用 `cell` 渲染函数）自带逐格提示：文本被截断时悬停显示全文。每个单元格对应一个提示实例，行多列多的大表会随之增加挂载开销（本机参考：60 行 × 8 列比 `cell` 渲染多约 0.5～0.6 秒挂载、多 480 个提示实例）。

批量渲染时可用 `:cell-tooltips="false"` 关闭逐格提示：单元格不再挂提示接线，绝对列宽下的单行省略与列宽上限保持不变，`cell` 自定义渲染与表头提示也不受影响。默认开启（渲染结果与之前一致）；需要保留提示又担心规模时，优先给关键列写 `cell`，其余列关闭开关。

## 固定表头与滚动

设置 `scrollable` 后，表格根容器按 `scrollHeight` 限高并成为纵向滚动区：表头吸顶、分页器吸底，表体在容器内滚动。`scrollHeight` 取 `number` 时按 `px` 归一化（`240` → `240px`），取 `string` 时原样作为 CSS 长度（如 `'60vh'` / `'18rem'`）；缺省不限高，容器按内容自然高度渲染。

- 未设置 `scrollable` 时渲染与滚动行为完全不变（根容器仍只在横向溢出时滚动）。
- 表头与分页器用 `position: sticky` 实现，不改变表格结构、不复制表头；`prefers-reduced-motion` 与该模式无关（无动画）。
- 冻结列、行展开、`selectionMode`、排序与 `paginator` 已做浏览器回归（含「冻结表头在横向滚动后仍是最上层」的命中测试）；行分组只影响表体行结构、不改变表头与滚动容器，未单独做组合回归。
- 根容器仍常驻 `tabindex="0"`，键盘用户可聚焦后纵向滚动（见「无障碍」）。
- 限高值应不小于「表头 + 一行」的高度：更小的限高会让表头独占滚动端口、数据行需滚动才能进入（`overflow: auto` 不会把内容压扁，也不会自动抬高容器）。
- 字符串需是有效 CSS 长度（数字 + 单位，或 `calc()` / `min()` / `max()` / `clamp()`）；纯数字字符串按 `px` 处理，空值、`0`、负数、`Infinity` 与无法解析的字符串都不生成限高（后者在开发期告警）。

<demo
    vue="../examples/data-table/scrollable.vue"
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
- `multiSortMeta` / `selection` / `expandedRows` / `expandedRowGroups` 同为浅响应：受控回写时请替换数组引用（原地增删不会触发重新渲染）。
- `key` 与 `accessor` 使用字符串字段名，不做字段级类型校验；需要类型安全取值时用 `accessor` 函数。
- 当前已支持列定义与列插槽、排序（含多列排序）、行分组、行展开、行选择、分页、冻结列与加载态。

## 长文本截断与提示

表头与默认单元格文本在列宽不足时单行省略，悬停显示全文；装得下时完全静默。**只有列宽为绝对长度时才截断**：

- `columns[].width` 取 `px` / `rem` / `em` / `ch` / `ex` / `cm` / `mm` / `in` / `pt` / `pc`（小写）时生效，文本上限按「列宽 − 单元格横向内边距」计算（列宽小于左右内边距之和时按 `1ch` 兜底，不会塌成 0 宽）；
- 百分比不参与截断（会以单元格内容盒为基准二次取百分比，短文本也会被误截断），`auto` / `min-content` 一类关键字与视口单位（`vh` / `vw` / `vmin` / `vmax`）同理；
- 未设列宽的列保持既有换行行为；
- 可排序表头的上限未扣排序指示器的预留宽（图标 14px + 间距；多列排序另含序号 `1ch`），声明了列宽的可排序列会略宽于声明值。

提示只覆盖指针悬停：触发器是文本盒本身、不可聚焦，聚焦排序按钮不会弹出提示。

自定义 `cell` 函数与 `#cell-*` / `#header-*` 插槽的渲染结果**不包裹**提示；需要时把内容包进 `CaomeiTooltipText`（`mode="auto"`），并自行给出单行省略样式。

## 无障碍

- 使用语义化 `<table>` / `<thead>` / `<tbody>`，表头单元格带 `scope="col"`。
- 可折叠分组的内建切换按钮为原生 `<button>`，带 `aria-expanded` 与可访问名（默认取当前语言，可用 `expandRowGroupLabel` / `collapseRowGroupLabel` 覆盖），键盘可达。
  - 该按钮的 `aria-label` **随状态切换**（收起态为「展开分组」、展开态为「收起分组」），与 `aria-expanded` 表达的状态并存；这是本库的取舍（名称描述动作），若希望名称恒定，可在使用层把两个 label 覆盖为同一文案，由 `aria-expanded` 单独承载状态。
- 行展开列的内建切换按钮同样是原生 `<button>`，带 `aria-expanded`、`aria-controls`（指向展开行）与可访问名（默认取当前语言，可用 `expandRowLabel` / `collapseRowLabel` 覆盖），键盘可达；展开列的表头留空。
- 多列排序时每个已排序的表头分别带 `aria-sort`；优先级序号为可见文本（会并入表头按钮的可访问名，与 PrimeVue 一致）。
- 根滚动容器常驻 `tabindex="0"`：横向溢出时键盘用户可 `Tab` 进入，并用方向键横向滚动（焦点环仅在键盘聚焦时出现）。提供 `caption` 时容器带 `role="group"` 并以 `caption` 作为可访问名；未提供时保持可聚焦但不伪造可访问名。
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
| `--caomei-data-table-expansion-bg` | `--caomei-color-bg-elevated` | 行展开区背景色 |
| `--caomei-data-table-cell-padding-block` | `--caomei-space-2` | 表头 / 单元格 / 分组标题 / 展开区 / 空态的块级内边距 |
| `--caomei-data-table-cell-padding-inline` | `--caomei-space-3` | 表头 / 单元格 / 分组标题 / 展开区 / 空态的行内内边距 |
| `--caomei-data-table-selection-column-width` | `1%` | 选择列宽度（表头与数据行） |
| `--caomei-data-table-selection-cell-padding-inline` | `--caomei-space-2` | 选择列行内内边距 |
| `--caomei-data-table-pagination-justify` | `flex-end` | 分页容器主轴对齐（PrimeVue 默认居中，可设为 `center`） |
| `--caomei-data-table-pagination-sticky-bg` | `--caomei-color-bg` | `scrollable` 下吸底分页器的背景色（避免滚动行从下方透出） |

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
|----------|--------|
| `<Column field="x" :header="…">` | `columns` 数组中的 `{ key: 'x', header: … }`（`key` 兼作默认取值字段） |
| `<template #body="{ data }">` / `#body="slotProps"` | `<template #cell-{key}="{ row, value, index }">`（`data` 对应 `row`，`slotProps.data` 同理） |
| 列级 `<template #header>` | `<template #header-{key}="{ column }">` |
| 表级 `<template #header>` / `#footer` | 无表级 header / footer 插槽；标题改用 `caption`，操作区放在表格容器外 |
| `frozen` + `align-frozen="left" \| "right"` | `frozen: 'left' \| 'right'`（单个字段同时表达是否冻结与停靠方向） |
| `<Column selection-mode="multiple" />` | 表格级 `selectionMode="multiple"`；选择列固定渲染在首列，宽度与内边距可用 `--caomei-data-table-selection-column-width` / `-selection-cell-padding-inline` 配置 |
| 表头全选作用域（客户端分页） | 默认 `page` = **当前页**（跨页选择保留）；`selectAllScope="all"` = 当前 `data` 全部行；PrimeVue 的客户端分页表头全选作用于整表 |
| 全选作用域 prop | `selectAllScope`（`'page' \| 'all'`，默认 `'page'`）；`lazy` 下不推断未加载页 |
| `scrollable` + `scrollHeight` | 同名（`scrollable` 布尔、`scrollHeight` 数字按 `px` 归一化或 CSS 长度字符串）；只影响限高与吸顶，不复制表头 |
| `rows-per-page-options` | 同名 `rowsPerPageOptions`，切换抛出 `update:rows` 并按偏移保持语义重新推导页码 |
| `@page="({ page, rows, first }) => …"` | `@page="({ page, rows, first, pageCount }) => …"`（字段口径一致，另带 `pageCount`） |
| `rowGroupMode="subheader"` + `groupRowsBy` | 同名 `rowGroupMode` + `groupRowsBy`；按连续同值切分，分组列在数据行渲染为空白占位（不重复取值） |
| `#groupheader="slotProps"` | `#groupheader="{ data, index, groupValue }"`（`data` / `index` 与 PrimeVue 一致，另提供 `groupValue`）；未提供插槽时回退渲染分组键取值 |
| `#groupfooter` | **不支持**（分组页脚未纳入本轮范围，见[设计规范 §7](../design/design-spec.md)） |
| `expandableRowGroups` | 同名；分组标题行渲染内建切换按钮（原生 `button` + `aria-expanded` + 可访问名） |
| `v-model:expandedRowGroups` | 同名（`string[]` 分组键集合）；受控优先、缺省自持，缺省时全部收起 |
| `@rowgroup-expand` / `@rowgroup-collapse` | `@rowgroup-expand` / `@rowgroup-collapse`；载荷 `{ originalEvent, data }`，`data` 为分组键（PrimeVue 传分组字段原值） |
| `v-model:expandedRows`（+ `dataKey`） | `v-model:expandedRows`（`string[]` 行 key）+ `rowKey`；本库只支持「行 key 数组」形态（PrimeVue 另有行对象数组与 `{ [key]: true }` 记录两种形态）；`lazy` 下必须显式提供 `rowKey` |
| `<Column expander>` | `columns` 数组项 `{ key, expander: true }`；该列表头留空 |
| `#expansion="slotProps"` | `#expansion="{ data, index }"`（`data` 语义对齐；`index` 为显示序号，与 `#cell-{key}` 的数据源索引不同） |
| `@row-expand` / `@row-collapse` | `@row-expand` / `@row-collapse`；载荷 `{ originalEvent, data }`，`data` 为该行数据 |
| `sortMode="multiple"` + `v-model:multiSortMeta` | 同名；`field` 只接受列 key（PrimeVue 允许字段函数）、`order` 为 `1 \| 0 \| -1` |
| `:default-sort-order="-1"` | `sortDescFirst`（**表格级**布尔量；PrimeVue 为列级 / 表格级数值，本库不提供列级） |
> `removableSort` | **未提供开关**；本库排序键固定按「升 → 降 → 移除」循环（与单列排序一致） |

**已知差异（有意）**：
1. PrimeVue 的 `DataTableSortMeta.field` 允许字段函数、`order` 允许 `undefined` / `null`，本库只接受列 key 与 `1 | 0 | -1`；PrimeVue 的 `defaultSortOrder` 有表格级与列级两种形态，本库只提供表格级 `sortDescFirst`；PrimeVue 的 `removableSort` 开关本库未提供，排序键固定按「升 → 降 → 移除」循环。
2. PrimeVue 的 `expandedRows` 支持行对象数组与 `{ [key]: true }` 记录两种形态，本库只支持行 key 数组（`rowKey` 口径）；PrimeVue 的展开按钮 `aria-label` 在展开态取 `aria.expandRow`、收起态取 `aria.collapseRow`，与按钮实际动作相反，本库按动作取名；展开行横跨全部数据列、不参与冻结列吸边；未提供 `#expansion` 槽时无可见展开区。
3. 分组标题行横跨全部数据列、不参与冻结列吸边；PrimeVue 在 subheader 模式下不渲染分组列的数据单元格（数据行整体左移一列、与表头错位），本库保留空白占位以维持列对齐；PrimeVue 的分组切换按钮无 `aria-expanded` 与内建可访问名（仅 chevron），本库补 `aria-expanded` + `aria-label`；`#groupfooter` 与 `rowGroupMode="rowspan"`（行合并）不实现。

> 迁移流程、通用陷阱与逐组件对照入口见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="data-table" />
