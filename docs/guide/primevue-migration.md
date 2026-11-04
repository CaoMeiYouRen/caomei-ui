# 从 PrimeVue 迁移

本页面向从 PrimeVue（v4）迁移到 caomei-ui 的使用方，给出可执行的迁移路径与常见陷阱。

> **逐组件的精确映射以[设计规范 §7](../design/design-spec.md) 为唯一事实源**——本页只讲流程、通用约定与注意事项，不重复映射表；组件页的「从 PrimeVue 迁移」节与 §7 口径一致（位置约定见[文档与演示站 §4](../design/documentation-site.md)）。

## 迁移流程

1. **并存接入**：本库与 PrimeVue 可共存——组件前缀 `Caomei`、类名前缀 `caomei-`、设计 token 前缀 `--caomei-`，与 PrimeVue 的 `p-*` / `--p-*` 命名空间不冲突。并存期建议按**路由 / 页面白名单**逐页切换，避免一次性替换带来的回归面失控。
2. **主题与 token**：先把 PrimeVue 主题变量映射到本库 token（`--p-*` → `--caomei-*`），再替换组件；token 语义与覆盖配方见[主题与样式设计 §4](../design/theming.md)。默认主题与暗色随包自带（基础层为 `caomei-ui/theme.css`），`data-preset` 可切换预设。
3. **组件替换**：先按下一节的「迁移策略」判定每个组件是直接替换还是先桥接，再按[设计规范 §7](../design/design-spec.md) 的映射表逐组件替换；影响面最大的三类差异优先处理——受控字段命名、图标形态、语义色/尺寸档位（见[常见陷阱](#常见陷阱)）。
4. **文案与语言**：组件内建文案（关闭 / 清除 / 分页 / 加载中等）通过 `CaomeiConfigProvider` 注入语言与自定义文案，未注入时回退简体中文；见[内建文案与语言](../components/locale.md)。
5. **逐页验证**：每页切换后核对交互、可访问名、窄屏形态与暗色表现；窄屏验收口径见[响应式设计 §4](../design/responsive.md)。

## 迁移策略：直接替换还是桥接

迁移前先按**单个组件的影响面**决定替换方式，不要对所有组件用同一种改法。

| 判定信号 | 直接替换 | 先桥接、再逐页收敛 |
| --- | --- | --- |
| 使用点数 | 少且集中（本文经验值，未做量化验证） | 多，且跨页面 / 跨共享组件 |
| 差异面 | 标签与少量 prop 改名 | 受控字段、事件载荷、插槽、类型契约同时变化 |
| 旧契约的消费方 | 只有当前页面自用 | 父组件、共享组件、e2e / 视觉断言或外部调用方依赖旧 props / 事件（如 `@hide`） |
| 差异性质 | 语义等价改名 | 需要一个并存期（命令式 API、指令、全局 token） |

判定为直接替换时按 §7 映射表逐处改完即可，**不要为省改动先造桥接层**——桥接层自身要维护、要在收口时清退。只有桥接能明显收缩改动面时才引入，并且优先落在改动面更小的一层：样式 / token → 函数 / 映射 → 组件。

### 桥接的三种形态

| 层次 | 适用信号 | 做法 | 实测样例 |
| --- | --- | --- | --- |
| 样式 / token | 未迁移页面仍由 PrimeVue 供主题 | 把 `--p-*` 并存映射到 `--caomei-*`，保留 `--p-*` 给未迁移组件 | momei 在全局样式末尾追加语义 token 桥接块，映射方向固定为 `--p-* → --caomei-*`，浅色 / 暗色计算值由契约测试锁定 |
| 函数 / 映射 | 枚举改名、取值换算、命令式 API 成批出现 | 用 util、映射表或 Promise 适配层收敛，调用点只换入口 | dependfix 把 `TagSeverity` 收敛为 `ComponentTone`；`pi pi-*` 图标（63 处 / 30 个）走统一映射表 |
| 组件 | 使用点跨文件，旧 props / 事件 / 插槽契约仍被依赖 | 薄封装保留旧契约，内部换 caomei-ui，调用点只换标签 | momei 用 `<AppTooltip>` 承接 `v-tooltip`（84 处 / 36 文件），设置项的 `null → ''` 用薄适配层在边界归一；dependfix 用 `computed` 为 Drawer 桥接既有 `visible` 契约并补发 `hide`（见[常见陷阱](#常见陷阱)） |

组件桥接的典型触发条件：差异需要逐处改名（`v-model:visible` → `open`）、库侧没有对应事件（`Drawer` 无 `hide`）、类型契约收窄（字段组件只收 `string | undefined`），或调用点数量已明显超过桥接层本身的体量。反过来，只有 1~2 处调用点时，桥接层比直接改更贵。

> 桥接形态的取证见 momei [迁移方案 §5.2 / §5.5 / §6.2](https://github.com/CaoMeiYouRen/momei/blob/master/docs/design/governance/2026-09-18-primevue-to-caomei-ui-migration-plan.md)（token 桥接 / 浮层接线 / 属性级映射）与 dependfix [迁移记录 §15.12](https://github.com/dependfix/dependfix/blob/master/docs/design/governance/caomei-ui-migration.md)（快照：momei 2026-11-03、dependfix 2026-10-31）；两仓经验只用于说明做法，具体差异仍以 §7 与各组件页为准。

### 桥接层约束与清退

- **集中存放并标注临时性**：桥接文件写明「为何桥接、覆盖哪些差异、移除条件」，与业务组件分开（适配组件放 `components/`，映射与换算放 `utils/`）。
- **只桥接契约，不复刻观感**：映射旧 props / 事件 / 类型即可，不要为像素对齐加样式覆盖；外观差异按[常见陷阱](#常见陷阱)与 §7 登记为有意差异。
- **token 桥接不要放进具名 `@layer`**：库侧基础层未分层且后加载，写进 `@layer` 的桥接会被其 `:root` 覆盖并**静默失效**（像素与构建都不报错）；选择器取 `html:root` 一类高于库侧 `:root` 的特异性。
- **`as-child` 场景要透传 attrs**：桥接组件若会被外层触发器当作子节点（如 Tooltip 嵌在 `DropdownMenuTrigger` / `PopoverTrigger` 内），必须 `inheritAttrs: false` 并把 `$attrs` 绑到内层触发器，否则外层 `aria-*` 与事件被吞。
- **注意 Nuxt 自动导入命名**：`components/` 子目录的组件按目录前缀命名（`settings/setting-input.vue` → `AdminSettingsSettingInput`），桥接层放子目录时要么显式 import、要么写全名，否则标签静默解析为未知元素，页面少渲染控件且不报错。
- **调用点归零即清退**：桥接层属可删除代码；迁移收口时按移除条件删除，暂不能删的登记到 [Backlog](../plan/backlog.md)，不长期保留。

## 常见陷阱

| 主题 | PrimeVue | caomei-ui | 处理 |
| --- | --- | --- | --- |
| 受控字段命名 | `v-model:visible` / `v-model:value` | `v-model:open` / `v-model` | 逐个受控字段改名，不要只改组件标签 |
| 语义色 | `severity` | `tone` + `variant` | `secondary` / `contrast` → `neutral`；`info` → `primary`（有损近似） |
| 尺寸档位 | `small` / `large` | `sm` / `lg` | 旧档位名会被类型检查拦下 |
| 图标 | `icon="pi pi-x"` 字符串类名 | `#icon` 插槽 + `@lucide/vue` 组件 | 字符串类名不被识别，须换成组件；见[图标](../components/icons.md) |
| 浮层标题 | `header` | `title` | Dialog / Drawer 等浮层同步改名 |
| 校验态 | `class="p-invalid"` | `:invalid` | 由 class 改为受控 prop |
| 全宽 | `fluid` | 默认 `width: 100%` | 迁移时删除 `fluid`；**选择器家族另有 `20rem` 宽度上限**，需要真正全宽时把对应上限 token 覆盖为 `none`（见 §7 与[主题与样式 §4.1](../design/theming.md)）。**例外**：`Button` 改用 `block`（撑满父容器）、`SplitButton` 未实现 `fluid`（按内容宽度） |
| 选项字段 | `option-label` / `option-value` | `optionLabel` / `optionValue` | 语义一致，仅命名风格不同 |
| 可搜索单选 | `Select` + `filter` | 改用 `CaomeiAutoComplete` | Reka Select 无 filter primitive（面板内搜索框违反 ARIA 结构），差异见 §7 与 [Backlog](../plan/backlog.md) |
| 标签录入 | `Chips`（v4 起为 `InputChips` 的旧名） | `CaomeiTagsInput`（**首选**）；`CaomeiAutoComplete` + `multiple`（备选） | `separator` → `delimiter`；`allowDuplicate` **默认相反**（本库默认拒绝重复）；见 §7 与 [TagsInput](../components/tags-input.md) |
| 事件载荷 | 如 `Switch` 的 `change` 传原生事件 | 传切换后的布尔值 | 事件名相同、载荷不同，回调签名需同步 |
| Button 纯图标形态 | — | 新增 `iconOnly` boolean prop；开启时按钮变为方形、图标居中、不渲染文本，**需配合 `label` 提供可访问名**（映射 `aria-label`）；此时 `iconPosition` 被忽略 | 见 [Button](../components/button.md) 与 [#iconOnly 形态](../components/button.md#纯图标按钮) |
| Select 触发器自定义显示 | — | 新增 `#value` 插槽（作用域 `{ option, label, selected }`），仅影响触发器显示，面板仍用 `#option` | 见 [Select](../components/select.md) 与 [#自定义触发器显示](../components/select.md#自定义触发器显示) |
| Button `iconOnly` 时 `iconPosition` 失效 | — | `iconOnly=true` 时图标始终居中、`iconPosition` 被忽略，**必须提供 `label`**（否则无 `aria-label`） | 见 [Button](../components/button.md) 与 [#纯图标按钮](../components/button.md#纯图标按钮) |
| 插槽命名 | 列级 `#body` / `#header` | `#cell-{key}` / `#header-{key}` | 按列 `key` 命名，作用域字段口径见组件页 |
| 表格排序模型 | `sort-mode` / `multi-sort-meta` / `default-sort-order` | `sortMode` / `multiSortMeta` / `sortDescFirst` | 多列为受控模型（`v-model:multiSortMeta`）；`default-sort-order` 改**表格级** `sortDescFirst`（本库不提供列级）；**不要为复刻逐列 `default-sort-order` 全局开启 `sortDescFirst`**——实测会令非业务列的点击循环偏离 PrimeVue；默认方向用 `multiSortMeta` 初值承载；见 §7 与 [DataTable](../components/data-table.md) |
| 表格分组与行展开 | `row-group-mode` / `group-rows-by` / `expandable-row-groups` / `expanded-rows` / `Column expander` | 同名 camelCase + `v-model:expandedRowGroups` / `v-model:expandedRows` + `#groupheader` / `#expansion` | 分组按**连续同值**切分、可折叠分组缺省全部收起；展开列写作 `{ key, expander: true }`；分组字段列会在数据行保留空白占位（PrimeVue 省略），需要列数一致时按 `groupRowsBy` 过滤 `columns`；见 §7 与 [DataTable](../components/data-table.md) |
| 命令式浮层 | `ref.toggle(event)` / `show(event)` / `hide()`（以事件坐标为锚点） | 声明式触发器 | 把原触发按钮本身作为 `CaomeiPopoverTrigger` / `CaomeiDropdownMenuTrigger`（锚点即该按钮）；`as-child` 复用自定义按钮时加 `unstyled`，`hide()` 改受控 `v-model:open`（Popover 也可用 `<CaomeiPopoverClose>`）；见 [Popover](../components/popover.md) 与 [DropdownMenu](../components/dropdown-menu.md) |
| Tooltip 接入 | `v-tooltip` 指令（含 `v-tooltip:left` 等方向修饰符）/ `<Tooltip>` | `<CaomeiTooltipProvider>`（应用根部一次）+ `<CaomeiTooltip>` / `CaomeiTooltipTrigger` / `CaomeiTooltipContent`；方向改用 `side` + `align` | `showDelay` → `delayDuration`（Provider 级或单条）；**未提供独立隐藏延迟**；无指令式挂载，须显式包一层触发器（`as-child` 复用原元素）；见 §7 与 [Tooltip](../components/tooltip.md) |
| 表格受控状态回写 | `v-model:*` 只读日志 / 不回写 | 必须监听并回写 `multiSortMeta` / `expandedRowGroups` / `expandedRows` / `selection` / `page` | 不回写时内建排序、分组折叠、行展开、选择与翻页按钮**无效果**；受控数组请替换引用而非原地增删；见 [DataTable](../components/data-table.md)「范围与约定」 |
| 表格行状态与分页基准 | `expandedRows` 可为 `Record<key, boolean>`（另有行对象数组形态）；`first` 为 0 基偏移；`rows` / `totalRecords` | `expandedRows` 为 `string[]` 行 key；`selection` 载荷为 `T \| T[] \| null`；`page` 为 1 基；`itemsPerPage` / `total` | `lazy` + 选择 / 展开必须显式 `rowKey`；`selection` 用 `Array.isArray` 窄化后回写；`page = floor(first / rows) + 1`；分页报表在分页器旁自渲染 |
| 表头全选作用域 | 客户端分页表头全选 = 过滤后整表 | `multiple` 表头全选**只作用当前页**；跨页选择由父级 `selection` 聚合 | 需要「全选全部筛选结果」时自建选择栏；`lazy` 下同样只作用当前页；见 §7 与 [DataTable](../components/data-table.md) |
| 表格密度与表级结构 | `size="small"`；表级 `#header` / `#footer` | 无 `size` prop；密度用页面级 CSS 覆盖 `.caomei-data-table__th` / `__td` 内边距；无表级 header / footer 插槽 | 标题改用 `caption`，操作区放在表格容器外；不要指望 `size` 静默生效；见 §7 与 [DataTable](../components/data-table.md) |
| 选择器宽度与包裹层 | `fluid`；在组件上写宽度 | 默认带 `20rem` 上限；`--caomei-select-max-width: none` 写在**字段外层或祖先**；`class` / `style` 落在触发器 | 全局覆盖被库 `:root` 压过时用 `:root:root`；需要定宽时在包裹容器上设，不写触发器；见 [Select](../components/select.md) |
| 表单控件选择器与事件时序 | `input[type=checkbox]`；`@input` 读取新值 | Checkbox 的可点击控件是 `button[role="checkbox"]`（`.caomei-checkbox__control`），组件根仍是 `div.caomei-checkbox`；Input / Textarea 透传的 `@input` 先于 v-model 写回 | e2e / 单测选择器改用 `button.caomei-checkbox__control`；依赖新值的同步逻辑改用 `@update:model-value`；见 [Checkbox](../components/checkbox.md) 与 [Input](../components/input.md) |
| CSS 选择器与浮层事件 | 按组件名推断 `.caomei-datatable` / `.caomei-dialog`；依赖 `@hide` | 多词组件逐词 kebab-case（`.caomei-data-table`）；Dialog / Drawer / ConfirmDialog / Popover / DropdownMenu 等无裸根类，用 `__content` / `__overlay`；Toast / Select 等仍有根类或触发器类；排序状态用 `th[aria-sort]`；Drawer 只 emit `update:open` | 写选择器前先 `rg` 产物核实；需要 `hide` 语义时用 `computed` 桥接 `v-model:open` 后补发；见 §7 / [Drawer](../components/drawer.md) |
| 提示条拆分与外观 | `Message` 单组件；soft 档带同色边框 | `Message` + `Alert` 拆分（Alert 默认不进 live region）；soft 档无可见边框 | 需要播报用 `Message`；不要为复刻边框加覆盖，除非设计确认；见 §7 与 [Message](../components/message.md) / [Alert](../components/alert.md) |
| ScrollPanel | `<ScrollPanel>` | 无对应组件 | 改用原生滚动容器 + CSS（`max-height` / `overflow: auto`）；固定表头等能力需自行实现；见 [Backlog](../plan/backlog.md) |
| 未实现项 | — | 见 §7 各组件行的「未实现 / 未暴露」 | 迁移前先读该行，避免按 PrimeVue 文档写了不生效的 prop |

> 上表是**通用**提醒；某个组件是否有对应能力、差异是否属有意，一律以[设计规范 §7](../design/design-spec.md) 该组件的行为准。

> **经验来源（仅作取证，不作映射事实源）**：表中「表格受控状态 / 行状态 / 分页 / 选择器宽度 / 表单控件时序 / CSS 选择器 / 浮层事件」等条目来自 dependfix 的 PrimeVue → caomei-ui 实测迁移（2026-09-28 ~ 2026-10-31），逐条取证见该仓 [`docs/design/governance/caomei-ui-migration.md`](https://github.com/dependfix/dependfix/blob/master/docs/design/governance/caomei-ui-migration.md) §15（取证快照：2026-10-31）。组件能力仍以 §7 与各组件页为准。

## 逐组件对照入口

下表的组件均在[设计规范 §7](../design/design-spec.md) 有登记映射，按组件侧栏分组排列；组件名直接链到组件页，「从 PrimeVue 迁移」节在**页尾**（`API` 之前）给出该组件的映射表。

| 分组 | 组件 |
| --- | --- |
| 基础与布局 | [Avatar](/components/avatar)、[Badge](/components/badge)、[Button](/components/button)、[ButtonGroup](/components/button-group)、[Card](/components/card)（对应 PrimeVue `Panel`）、[Divider](/components/divider)、[Image](/components/image)、[SplitButton](/components/split-button)、[Tag](/components/tag) |
| 表单输入 | [Checkbox](/components/checkbox) / [CheckboxGroup](/components/checkbox-group)、[FileUpload](/components/file-upload)、[FloatLabel](/components/float-label)、[Input](/components/input)、[InputGroup](/components/input-group)、[InputNumber](/components/input-number)、[Password](/components/password)、[RadioGroup](/components/radio-group)、[Slider](/components/slider)、[Switch](/components/switch)、[TagsInput](/components/tags-input)、[Textarea](/components/textarea) |
| 选择器 | [AutoComplete](/components/auto-complete)、[Calendar](/components/calendar) / [DatePicker](/components/date-picker)、[ColorPicker](/components/color-picker)、[MultiSelect](/components/multi-select)、[Select](/components/select)、[SelectButton](/components/select-button)、[ToggleButton](/components/toggle-button) |
| 反馈与浮层 | [Alert](/components/alert)、[ConfirmDialog](/components/confirm-dialog)、[Dialog](/components/dialog)、[Drawer](/components/drawer)、[Message](/components/message)、[Popover](/components/popover)、[Toast](/components/toast)、[Tooltip](/components/tooltip) |
| 数据展示 | [DataTable](/components/data-table)、[DataView](/components/data-view)、[Paginator](/components/paginator)、[ProgressBar](/components/progress-bar)、[ProgressSpinner](/components/progress-spinner)、[Skeleton](/components/skeleton) |
| 导航与操作 | [Accordion](/components/accordion)、[Breadcrumb](/components/breadcrumb)、[DropdownMenu](/components/dropdown-menu)、[Menu](/components/menu)、[Stepper](/components/stepper)、[Tabs](/components/tabs)、[Toolbar](/components/toolbar) |
| 高级组件 | [Chart](/components/chart) |

> 组件页的「从 PrimeVue 迁移」节与 §7 不一致时**以 §7 为准**（漂移视为文档缺陷）。上表按 §7 当前已登记的组件维护；**它不宣称穷尽**——§7 新增条目时本表随之补齐。未出现在表中的组件以其组件页的 API / 「范围与约定」为准（§7 有登记时以 §7 为准）。组件页的「从 PrimeVue 迁移」节已覆盖全部在 §7 有映射的组件页；Row / Col / RichTextEditor 无 §7 映射，按其组件页说明处理。

## 迁移后自检

- [ ] 受控字段（`v-model:*`）与事件名按下表口径改完，且类型检查通过；
- [ ] 表格的 `multiSortMeta` / `expandedRowGroups` / `expandedRows` / `selection` / `page` 均已在 `@update:*` 回写，并在真实页面点击内建排序、分组折叠、行展开、选择与翻页验证；
- [ ] `lazy` 表格已显式提供 `rowKey`；`expandedRows` 使用 `string[]`，`selection` 载荷已窄化；分页 `first` 已换算为 1 基 `page`；
- [ ] 表头全选「只作用当前页」的业务影响已确认；需要跨页全选时由父级 `selection` / 选择栏承载；
- [ ] `size="small"` 等表格密度写法已移除，改用 CSS 内边距覆盖；表级 `#header` / `#footer` 内容已移到表格容器外；
- [ ] 选择器宽度上限与包裹层已核对（`--caomei-select-max-width` / `:root:root` / 字段外层）；
- [ ] 表单控件的 e2e / 单测选择器不再依赖原生 `input`；依赖新值的同步逻辑改用 `@update:model-value`；
- [ ] CSS 选择器按产物类名 / `aria-sort` 编写，浮层 `hide` 事件已桥接；
- [ ] 引入过桥接层（token / 函数 / 组件）时，每个桥接文件都有移除条件；调用点已归零的已删除，未清退项已登记 Backlog；
- [ ] 桥接组件在 `as-child` 场景已 `inheritAttrs: false` 并把 `$attrs` 绑到内层触发器；放在 `components/` 子目录的桥接组件按目录前缀命名或显式 import；
- [ ] Tooltip 的 `CaomeiTooltipProvider` 已在应用根部放置，触发器为显式组合；
- [ ] `Message` / `Alert` 的 live region 与 soft 档外观差异已确认；
- [ ] 字符串图标名已全部替换为 `@lucide/vue` 组件；
- [ ] `severity` / `small` / `large` / `fluid` 等 PrimeVue 专有命名已清除（含模板、类型与样式覆盖）；
- [ ] 浮层（Dialog / Drawer / Popover / DropdownMenu）的打开、关闭、遮罩、Esc、焦点回归在真实页面复验；
- [ ] 窄屏（≤640 / ≤768）与暗色下逐页核对，无横向溢出、无文案缺失；
- [ ] 内建文案语言已按需注入（多语言站点）；
- [ ] 涉及「有意差异」的组件已在页面上确认表现符合预期（差异清单见 §7）。

## 相关阅读

- [设计规范 §7：迁移映射规范](../design/design-spec.md)（逐组件映射的唯一事实源）
- [主题与样式设计](../design/theming.md)（token 与覆盖配方）
- [响应式设计](../design/responsive.md)（窄屏验收口径）
- [图标](../components/icons.md)、[内建文案与语言](../components/locale.md)
- [组件总览](../components/index.md)
