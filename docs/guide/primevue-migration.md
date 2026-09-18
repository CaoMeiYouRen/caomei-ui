# 从 PrimeVue 迁移

本页面向从 PrimeVue（v4）迁移到 caomei-ui 的使用方，给出可执行的迁移路径与常见陷阱。

> **逐组件的精确映射以[设计规范 §7](../design/design-spec.md) 为唯一事实源**——本页只讲流程、通用约定与注意事项，不重复映射表；组件页的「从 PrimeVue 迁移」节与 §7 口径一致（位置约定见[文档与演示站 §4](../design/documentation-site.md)）。

## 迁移流程

1. **并存接入**：本库与 PrimeVue 可共存——组件前缀 `Caomei`、类名前缀 `caomei-`、设计 token 前缀 `--caomei-`，与 PrimeVue 的 `p-*` / `--p-*` 命名空间不冲突。并存期建议按**路由 / 页面白名单**逐页切换，避免一次性替换带来的回归面失控。
2. **主题与 token**：先把 PrimeVue 主题变量映射到本库 token（`--p-*` → `--caomei-*`），再替换组件；token 语义与覆盖配方见[主题与样式设计 §4](../design/theming.md)。`caomei-ui/styles.css` 提供默认主题与暗色，`data-preset` 可切换预设。
3. **组件替换**：按[设计规范 §7](../design/design-spec.md) 的映射表逐组件替换；影响面最大的三类差异优先处理——受控字段命名、图标形态、语义色/尺寸档位（见下节）。
4. **文案与语言**：组件内建文案（关闭 / 清除 / 分页 / 加载中等）通过 `CaomeiConfigProvider` 注入语言与自定义文案，未注入时回退简体中文；见[内建文案与语言](../components/locale.md)。
5. **逐页验证**：每页切换后核对交互、可访问名、窄屏形态与暗色表现；窄屏验收口径见[响应式设计 §4](../design/responsive.md)。

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
| 事件载荷 | 如 `Switch` 的 `change` 传原生事件 | 传切换后的布尔值 | 事件名相同、载荷不同，回调签名需同步 |
| 插槽命名 | 列级 `#body` / `#header` | `#cell-{key}` / `#header-{key}` | 按列 `key` 命名，作用域字段口径见组件页 |
| 命令式浮层 | `ref.toggle(event)` / `show(event)` / `hide()`（以事件坐标为锚点） | 声明式触发器 | 把原触发按钮本身作为 `CaomeiPopoverTrigger` / `CaomeiDropdownMenuTrigger`（锚点即该按钮）；`as-child` 复用自定义按钮时加 `unstyled`，`hide()` 改受控 `v-model:open`（Popover 也可用 `<CaomeiPopoverClose>`）；见 [Popover](../components/popover.md) 与 [DropdownMenu](../components/dropdown-menu.md) |
| 未实现项 | — | 见 §7 各组件行的「未实现 / 未暴露」 | 迁移前先读该行，避免按 PrimeVue 文档写了不生效的 prop |

> 上表是**通用**提醒；某个组件是否有对应能力、差异是否属有意，一律以[设计规范 §7](../design/design-spec.md) 该组件的行为准。

## 逐组件对照入口

下表的组件均在[设计规范 §7](../design/design-spec.md) 有登记映射，按组件侧栏分组排列；组件名直接链到组件页，「从 PrimeVue 迁移」节在**页尾**（`API` 之前）给出该组件的映射表。

| 分组 | 组件 |
| --- | --- |
| 基础与布局 | [Avatar](/components/avatar)、[Badge](/components/badge)、[Button](/components/button)、[ButtonGroup](/components/button-group)、[Card](/components/card)（对应 PrimeVue `Panel`）、[Divider](/components/divider)、[Image](/components/image)、[SplitButton](/components/split-button)、[Tag](/components/tag) |
| 表单输入 | [Checkbox](/components/checkbox) / [CheckboxGroup](/components/checkbox-group)、[FileUpload](/components/file-upload)、[FloatLabel](/components/float-label)、[Input](/components/input)、[InputGroup](/components/input-group)、[InputNumber](/components/input-number)、[Password](/components/password)、[RadioGroup](/components/radio-group)、[Slider](/components/slider)、[Switch](/components/switch)、[Textarea](/components/textarea) |
| 选择器 | [AutoComplete](/components/auto-complete)、[Calendar](/components/calendar) / [DatePicker](/components/date-picker)、[ColorPicker](/components/color-picker)、[MultiSelect](/components/multi-select)、[Select](/components/select)、[SelectButton](/components/select-button)、[ToggleButton](/components/toggle-button) |
| 反馈与浮层 | [ConfirmDialog](/components/confirm-dialog)、[Dialog](/components/dialog)、[Drawer](/components/drawer)、[Message](/components/message)、[Popover](/components/popover)、[Toast](/components/toast) |
| 数据展示 | [DataTable](/components/data-table)、[DataView](/components/data-view)、[Paginator](/components/paginator)、[ProgressBar](/components/progress-bar)、[ProgressSpinner](/components/progress-spinner)、[Skeleton](/components/skeleton) |
| 导航与操作 | [Accordion](/components/accordion)、[DropdownMenu](/components/dropdown-menu)、[Stepper](/components/stepper)、[Tabs](/components/tabs)、[Toolbar](/components/toolbar) |

> 组件页的「从 PrimeVue 迁移」节与 §7 不一致时**以 §7 为准**（漂移视为文档缺陷）。上表按 §7 当前已登记的组件维护；**它不宣称穷尽**——§7 新增条目时本表随之补齐。未出现在表中的组件以其组件页的 API / 「范围与约定」为准（§7 有登记时以 §7 为准）。组件页的「从 PrimeVue 迁移」节已覆盖全部组件页。

## 迁移后自检

- [ ] 受控字段（`v-model:*`）与事件名按下表口径改完，且类型检查通过；
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
