# momei 组件使用复核台账

> 用途：Phase 6 主线 M1（需求 2）交付物。以 momei 实际调用为样本，逐组件核对 caomei-ui 现有能力，产出「满足 / 需增强 / 需新组件」结论，作为 M3 组件补全与后续 Phase 7 迁移的输入。
>
> 数据基准：2026-09-14，本地 momei 仓库快照。本台账为静态 API 比对，未实际运行 momei，也未改动任何代码。

## 1. 结论摘要

- **规模**：momei 共使用 **59 个 PrimeVue 组件**、**1515 个组件开标签用法**，分布于 100+ 个 `.vue` 文件。
- **判定分布**：满足 **21** 项（含需重写模板者）、需增强 **23** 项、需新组件 **15** 项（归并为 **11 个逻辑组件**）。
- **最关键结论**：
  1. **数据类差距最大**。`DataTable` + `Column`（22 + 153 次、20 个文件）依赖排序、Lazy 分页、行选择、冻结列、行列插槽与 class/style；而 caomei-ui `DataTable` 目前仅核心行列模型（`data-table/table-features.ts` 为 `tableFeatures({})`），列通过 `columns` prop 而非 `<Column>` 子组件声明，属**结构性差距**。
  2. **Button 形态缺口高频**。`Button` 356 次调用中，`severity`（约 185）、`text`（约 163）、`rounded`（约 102）、`outlined`（约 32）均无等价能力。
  3. **对象选项映射普遍缺失**。`Select` / `MultiSelect` / `SelectButton` 的 `option-label` / `option-value` 与数值型 value 不支持（当前 `value: string` 固定）。
  4. **图标体系需整体改写**。PrimeVue 用 `icon="pi pi-x"` 字符串，caomei-ui 统一走 `#icon` 插槽 + `@lucide/vue`。
  5. `IconField` / `InputIcon` 可由 `Input` 的 `prefix` / `suffix` 插槽承载，**无需独立组件**（原 M3 候选可降级）。

## 2. 复核方法

- **统计口径**：对 `.vue` 文件的组件**开标签**计数（非行数、非文件数）；排除 `node_modules` / `.nuxt` / `.output` / 测试目录等。踩坑记录：用 `[\s>/]` 作标签尾字符会漏掉「标签独占一行」的用法，须用 `\b` 或行尾断言；同时须以「`<` 前一字符非标识符」守卫，排除 TS 泛型（如 `ref<Tag[]>`、`$fetch<PaginatedData<Tag>>`）被误计为组件标签。
- **用法抽取**：解析每个开标签的属性名与插槽名（quote-aware），聚合为 `/tmp/opencode/momei-pv-attrs.json`。
- **caomei-ui API 来源**：`docs/.vitepress/data/component-meta.json`（由 `vue-component-meta` 生成），并回读 `src/components/<name>/types.ts` 与 `.vue` 核对语义。
- **抽样实证**：对每个组件抽取 2–3 个 momei 实际用法文件逐行核对（见各缺口条目证据路径）。

## 3. 使用台账

### 3.1 表单输入类

| PrimeVue 组件 | 用量 / 文件 | caomei-ui 对应 | 判定 | 缺口要点 |
| --- | --- | --- | --- | --- |
| InputText | 178 / 57 | `CaomeiInput` | 满足 | `fluid` 默认全宽；`@input` 经 attrs 透传到原生 input |
| InputNumber | 39 / 15 | `CaomeiInputNumber` | 需增强 | 缺 `use-grouping` 开关（恒 false）；缺 `min/max-fraction-digits`（仅单 `precision`）；`show-buttons` → `controls` |
| Textarea | 31 / 24 | `CaomeiTextarea` | 需增强 | 缺 `auto-resize`；`rows` / `resize` 可用 |
| Password | 32 / 12 | `CaomeiPassword` | 需增强 | 缺 `feedback` 强度指示 |
| Checkbox | 20 / 13 | `CaomeiCheckbox` | 需增强 | 缺分组值数组（数组 v-model + `:value`）；`binary` 用法满足 |
| RadioButton | 12 / 4 | `CaomeiRadioGroup` + `CaomeiRadioButton` | 满足（需重写） | `name` 上移到 group；`input-id` → `id` |
| ToggleSwitch | 47 / 16 | `CaomeiSwitch` | 需增强（轻） | 缺 `change` 事件（改用 `@update:model-value`）；`input-id` → `id` |
| SelectButton | 9 / 6 | `CaomeiSelectButton` | 满足（需重写） | options 仅 `{ label, value }`（无字段名映射）；`size` `small` → `sm` |
| MultiSelect | 8 / 4 | `CaomeiMultiSelect` | 需增强 | options 仅 `{ label, value }` 且 value 仅 string（不支持数值 id）；`display=chip` / `filter` / `append-to=body` 已满足 |
| Select | 73 / 39 | `CaomeiSelect` | 需增强 | 缺对象选项映射 + 数值 value、`show-clear`、`filter`、`#option` 插槽 |
| Dropdown | 5 / 3 | `CaomeiSelect`（旧名） | 需增强 | 同 Select 的对象选项映射缺口 |
| DatePicker | 6 / 4 | 无 | 需新组件 | 日期 + 时间选择（`show-time` / `hour-format` / `date-format` / `show-icon`） |
| ColorPicker | 2 / 2 | 无 | 需新组件 | 颜色选择，`format` |
| AutoComplete | 2 / 1 | 无 | 需新组件 | 异步建议（`@complete`）、`dropdown`、`multiple`；`MultiSelect` 仅本地过滤 |
| Slider | 3 / 1 | `CaomeiSlider` | 满足 | `min` / `max` / `step` / `v-model` 一致 |
| IconField | 10 / 9 | `CaomeiInput` `#prefix` / `#suffix` | 满足（需重写） | `icon-position=left` → prefix，缺省 → suffix |
| InputIcon | 10 / 9 | 无独立组件（随 Input 插槽） | 满足（需重写） | 并入前缀 / 后缀插槽 |
| InputGroup | 6 / 3 | 无 | 需新组件 | 缺组合容器；并排 Input + Button 的边框拼接语义需专用组件 |

### 3.2 展示与反馈类

| PrimeVue 组件 | 用量 / 文件 | caomei-ui 对应 | 判定 | 缺口要点 |
| --- | --- | --- | --- | --- |
| Button | 356 / 103 | `CaomeiButton` | 需增强 | `severity`×185、`text`×163、`rounded`×102、`outlined`×32、`:badge`×2、`icon-pos`×7 无等价；`icon` 字符串需改插槽 |
| Tag | 127 / 51 | `CaomeiTag` | 需增强 | `severity` → `tone` 有损（secondary / info / contrast）；`value` → 默认插槽；缺 `rounded`；`icon` 字符串 |
| Badge | 5 / 4 | `CaomeiBadge` | 满足 | `severity` → `tone` 映射即可 |
| Message | 51 / 31 | `CaomeiMessage` | 需增强 | `severity` 含 `error` / `secondary` / `contrast`；`variant="simple|text"`×14；`size="small"`×14 |
| Card | 33 / 20 | `CaomeiCard` | 满足 | `#content` → default、`#title` / `#subtitle` / `#footer` 对应 |
| Divider | 37 / 19 | 无 | 需新组件 | 水平 / 垂直、`type`、带文本内容分割线 `align`（10 处） |
| Skeleton | 26 / 8 | `CaomeiSkeleton` | 满足 | `width` / `height` 支持；注意默认形状差异 |
| ProgressSpinner | 14 / 13 | `CaomeiProgressSpinner` | 需增强 | 缺 `stroke-width`×7、`animation-duration`；仅 `sm|md|lg`，无任意 px |
| ProgressBar | 8 / 5 | `CaomeiProgressBar` | 满足 | `:show-value="false"` 与默认一致；无 `show-value=true` |
| Image | 11 / 10 | `CaomeiImage` | 需增强 | `preview` 点击放大（10 处）完全缺失；`#indicatoricon` 插槽 |
| Avatar | 3 / 3 | `CaomeiAvatar` | 满足 | `image` → `src`、`label` → `fallback`；size 取值体系不同 |
| Toolbar | 1 / 1 | `CaomeiToolbar` | 需增强 | 无 `#start/#center/#end` 分区布局（仅 default 插槽） |
| Panel | 3 / 2 | 无 | 需新组件 | `:header` 静态分区容器；与 Accordion（可折叠）/ Card 均不等价 |
| ButtonGroup | 1 / 1 | 无 | 需新组件 | 相邻按钮圆角 / 边框合并布局 |
| SplitButton | 2 / 1 | 无 | 需新组件 | 主按钮 + 下拉菜单组合（`:model` MenuItem） |

### 3.3 浮层 / 数据 / 导航类

| PrimeVue 组件 | 用量 / 文件 | caomei-ui 对应 | 判定 | 缺口要点 |
| --- | --- | --- | --- | --- |
| Dialog | 37 / 32 | `CaomeiDialog` | 需增强 | `v-model:visible` → `open`、`header` → `title`（必填）；缺 `show-header`、`breakpoints`、`@hide` |
| ConfirmDialog | 6 / 6 | `CaomeiConfirmDialog` + `useConfirm` | 需增强 | `require({...})` 回调 → `confirm()` Promise；无 `icon` |
| Toast | 9 / 9 | `CaomeiToastProvider` + `useToast` | 满足 | `severity/summary/detail/life` → `tone`/`title`/`description`/`duration` |
| Popover | 5 / 4 | `CaomeiPopover`（+Trigger/Content） | 需增强 | 缺命令式 `toggle(event)` / `show(event)` 锚点定位（现仅 `v-model:open`） |
| Drawer | 3 / 3 | 无 | 需新组件 | 四向 `position` + header 侧滑抽屉 |
| Menu | 3 / 2 | `CaomeiDropdownMenu` | 需增强 | 缺 `:model` 数据驱动 + `:popup` + `toggle(event)` + command/separator 项 |
| DataTable | 22 / 20 | `CaomeiDataTable` | 需增强 | 缺排序 / Lazy 分页 / 行选择 / `data-key` / loading / 响应式 |
| Column | 153 / 20 | 无（仅 `DataTableColumn` 类型 / `columns` prop） | 需增强 | 缺 `field` 嵌套、`sortable`、`selection-mode`、`#body` / `#header`、`body-class` / `header-class` / `header-style`、`frozen` / `align-frozen` |
| DataView | 1 / 1 | 无 | 需新组件 | `layout="grid|list"` + `#grid` / `#list` / `#empty` + loading（仅 1 处，可临时降级） |
| Paginator | 3 / 3 | `CaomeiPaginator` | 需增强 | 模型不同（`v-model:first` + `rows` + `total-records` + `@page` vs `page` + `itemsPerPage`）；缺 `template` 与每页条数选择 |
| Tabs | 6 / 6 | `CaomeiTabs` | 满足 | `v-model:value` → 默认 `v-model` |
| Tab | 23 / 6 | `CaomeiTabTrigger` | 满足 | `value` 对应 |
| TabList | 6 / 6 | `CaomeiTabList` | 满足 | 对应 |
| TabPanels | 6 / 6 | 普通容器替代 | 满足 | 无需专门组件 |
| TabPanel | 23 / 6 | `CaomeiTabContent` | 满足 | `value` 对应 |
| Accordion | 3 / 3 | `CaomeiAccordion` | 满足 | `multiple` → `type="multiple"`；`value` → model / `defaultValue` |
| AccordionPanel | 6 / 3 | `CaomeiAccordionItem` | 满足 | `value` 对应 |
| AccordionHeader | 6 / 3 | `CaomeiAccordionItem` `#trigger` / `title` | 满足 | 内建 |
| AccordionContent | 6 / 3 | `CaomeiAccordionItem` 默认插槽 | 满足 | 内建 |
| Stepper | 1 / 1 | 无 | 需新组件 | 步骤容器（`v-model:value` / `linear`） |
| Step | 6 / 1 | 无 | 需新组件 | 步骤定义（`value`） |
| StepList | 1 / 1 | 无 | 需新组件 | 步骤条容器 |
| StepPanels | 1 / 1 | 无 | 需新组件 | 面板容器 |
| StepPanel | 6 / 1 | 无 | 需新组件 | `value` + `v-slot="{ activateCallback }"` 跳步控制 |
| FileUpload | 1 / 1 | `CaomeiFileUpload` | 需增强 | 缺 `mode` / `max-file-size` / `auto` / `choose-label`；无上传事件（仅选择） |
| ToggleButton | 1 / 1 | `CaomeiToggleButton` | 需增强 | 缺 `on-label` / `off-label` 状态文案 |

## 4. 缺口清单

### 4.1 需新组件（11 个逻辑组件）

> `DataTable + Column` 属「需增强」（见 4.2）而非新组件，不在本表。

| 组件 | 用量 | 说明 |
| --- | --- | --- |
| Divider | 37 | 水平 / 垂直 + 内容分割线 `align` |
| Drawer | 3 | 四向侧滑抽屉（可由 Dialog 派生或封装 Reka Drawer，Alpha） |
| Stepper 系列 | 1（6 个 StepPanel） | Stepper / Step / StepList / StepPanels / StepPanel 归一为一个组件族 |
| DatePicker / Calendar | 6 | Reka Alpha，需锁版本 + 回归 |
| InputGroup / FloatLabel | 6 | 组合容器（Input + Button 等并排边框拼接） |
| Panel | 3 | 带标题栏的静态分区容器（先评估能否由 Accordion / Card 承接） |
| SplitButton | 2 | 主操作 + 下拉菜单组合 |
| AutoComplete | 2 | 异步建议 + 自由输入（Reka Combobox 可承载） |
| ColorPicker | 2 | Reka Alpha color 系列组合 |
| ButtonGroup | 1 | 相邻按钮圆角 / 边框合并布局 |
| DataView | 1 | `layout` grid / list + 插槽（仅 1 处，优先级最低） |

> `IconField` / `InputIcon` 经复核可用 `Input` 的 `prefix` / `suffix` 插槽替代，**不列入需新组件**；如需开发体验可另作可选便利封装。

### 4.2 需增强（现有组件）

- **Button**：补 `severity` 语义档（或明确 `tone` 映射）、`text` / `outlined` 形态、`rounded`、`badge` 角标、`icon` 位置；图标改 `#icon` 插槽。证据：`momei/components/admin/posts/post-editor-header.vue`、`post-audit-badge.vue`。
- **DataTable + Column**：启用 `tableFeatures`（sorting / pagination / row-selection）或自建；补 `lazy` + `@page` / `@sort`、`v-model:selection` / `selection-mode`、`data-key`、`#body` / `#header`、列 `body-class` / `header-class` / `header-style`、点号嵌套字段、`frozen` / `align-frozen`、loading。证据：`momei/pages/admin/posts/index.vue`、`pages/admin/users/index.vue`。
- **Select / Dropdown / MultiSelect / SelectButton**：对象选项字段映射（`option-label` / `option-value`）、非 string value、`show-clear`、`filter`、`#option` 插槽（Combobox 原生支持筛选，需暴露）。
- **Message**：补 `variant` `simple` / `text` 与 `size`；`severity` 补 `error` 别名与 `secondary` / `contrast` 映射。
- **Tag**：补 `rounded` / `outlined`，`severity` 映射规范化。
- **Image**：补 `preview` 点击放大 / 遮罩与 `#indicatoricon`。
- **ProgressSpinner**：补 `stroke-width` / `animation-duration` 或文档化 CSS 变量。
- **Toolbar**：补 `#start` / `#center` / `#end` 分区插槽（或明确 default + 子组件的迁移写法）。
- **Dialog**：补 `show-header`、`breakpoints`（响应式断点）、`@hide`；`title` 可选化。
- **ConfirmDialog**：`useConfirm` 支持 `icon`。
- **Popover**：评估是否补命令式 `toggle(event)` / 以事件坐标为锚点。
- **DropdownMenu（Menu）**：评估补 `:model` 数据驱动 + `:popup`，或明确迁移为声明式子组件。
- **Paginator**：明确 `@page` 偏移模型 → 页码模型的迁移写法；评估补每页条数选择。
- **InputNumber**：补 `use-grouping`、`min-fraction-digits` / `max-fraction-digits`。
- **Textarea**：补 `auto-resize`。
- **Password**：补 `feedback` 强度指示。
- **Checkbox**：补分组值数组（`CheckboxGroup`）。
- **Switch**：评估补 `change` 事件（或统一用 `@update:model-value`）。
- **FileUpload**：补 `mode` / `max-file-size` / `auto` / `choose-label` 与上传事件。
- **ToggleButton**：补 `on-label` / `off-label`。

### 4.3 迁移映射规范（跨组件）

| 维度 | PrimeVue | caomei-ui | 说明 |
| --- | --- | --- | --- |
| 语义色 | `severity` | `tone` + `variant` | `primary→primary`、`success→success`、`warn→warning`、`error/danger→danger`、`secondary/contrast→neutral`；`info→primary`。`secondary` / `contrast` 有损，需在 M2 规范或组件层明确 |
| 尺寸 | `small` / `large` | `sm` / `lg` | |
| 图标 | `icon="pi pi-x"` 字符串 | `#icon` 插槽 + `@lucide/vue` | 全量改写 |
| 受控字段 | `v-model:visible` / `v-model:value` / `v-model:first` | `v-model:open` / `v-model` / `page` | |
| 浮层标题 | `header` | `title`（Dialog 必填） | |
| 校验态 | `class="p-invalid"` | `:invalid` | |
| 全宽 | `fluid` | 默认全宽 | 迁移时应删除 `fluid`，否则经 attrs 透传到内层控件 |

> momei 中另出现 `severity="help"`（2 处）与疑似异常值 `severity="severity"`（3 处），迁移时需一并核对来源。

## 5. 对 Phase 6 M3 的输入

- **M3 原 9 项候选全部成立**，但其中 `IconField / InputIcon` 经复核可降级为「Input 插槽替代（可选便利封装）」。
- **新增需新组件候选**：`AutoComplete`、`ButtonGroup`、`DataView`（低优先级）。
- **需增强清单（4.2）体量与组件补全相当**，其中 `Button` 与 `DataTable + Column` 是 momei 迁移的关键路径，建议在 M3 中优先。
- **建议 M3 范围按此台账重新排序**：优先补 `Divider`（37）/ `InputGroup`（6）/ `Stepper`（步骤流）/ `Drawer`（3）/ `DatePicker`（6）等缺口组件与 `Button` / `DataTable` 增强；`AutoComplete` / `DataView` / `ButtonGroup` 视迁移实际需要取舍。

## 6. 未决与待确认

- PrimeVue `severity` 中 `secondary` / `contrast` / `info` 的语义归属需在 M2 设计规范中定稿。
- `Panel` 能否由 `Accordion` / `Card` 承接、`Popover` / `Menu` 命令式 API 是否补齐，属 M3 方案评审项，本台账不预先决策。
- momei 用量为静态统计值，已排除 TS 泛型假阳性（如 Tag 严格计数 127）与测试目录；迁移实施时以真实替换清单复核。
