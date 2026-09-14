# 组件设计

本文档定义 caomei-ui 的组件分层与最小组件集。组件集依据下游项目（afdian-linker / caomei-auth / momei / rss-impact-next / dependfix-platform）实际使用面统计得出。

## 1. 组件分层

| 层 | 内容 | 示例 |
|----|------|------|
| Primitive 层 | Reka UI 原始件，不直接对外 | Select / Dialog 等组件内部使用的 primitive |
| 封装 / 自建层 | Reka UI 封装，或原生元素 + 样式 / 变体 | 封装：Select、Dialog、Switch、Toast、Checkbox；自建：Button、Input、Card、Tag / Badge |
| 复合层 | 多 primitive 组合 | DataTable、ConfirmDialog、MultiSelect |
| 服务层 | composables | useToast、useConfirm、useTheme |

### 1.1 实现方式决策原则

- **优先封装 Reka UI 已有组件**；仅当 Reka UI 缺失对应组件，或对应组件无法满足设计需要（交互语义 / 无障碍 / 布局结构）时才自建。
- 自建前须核对 [Reka UI 官方文档](https://reka-ui.com/docs/overview/introduction) 的 Components 导航与本地 `reka-ui` 导出，确认确无可用 primitive。
- 封装层只承担样式、变体、尺寸、语义 token 与服务封装，不重复实现 primitive 已提供的交互与无障碍。
- 组件清单以「Reka UI 对应」列为准维护：新增组件时先判定能否封装，再决定是否自建。
- Reka UI 文档站无 `/docs/components` 索引页（404）；组件清单以任一组件页的侧栏导航或本地 `reka-ui` 导出为准，外链统一指向 [官方简介](https://reka-ui.com/docs/overview/introduction)。

## 2. Tier 0：必选（9 个）

覆盖下游约 80% 使用场景。

| 组件 | 实现方式 | Reka UI 对应 |
|------|----------|--------------|
| Button | 自建（原生 button + variants） | 无 |
| DataTable + Column | 自建（@tanstack/vue-table） | 无 |
| Input 家族（Input / Textarea / Password / InputNumber） | Input / Textarea / Password 自建（原生 input）；InputNumber 封装 NumberField | 文本输入无；InputNumber → NumberField |
| Tag / Badge | 自建（span + variants） | 无 |
| Select | 封装 Select | Select |
| Dialog | 封装 Dialog | Dialog |
| Toast | 封装 Toast + 服务封装 | Toast |
| Card | 自建（布局 + variants） | 无 |
| Checkbox | 封装 Checkbox | Checkbox |

## 3. Tier 1：强烈推荐（8 个）

在 Tier 0 基础上覆盖至约 95%。

| 组件 | 实现方式 | Reka UI 对应 |
|------|----------|--------------|
| Message / Alert | 自建（业务语义包装） | 无 |
| Password | Input 派生（Tier 0 已含基础能力，此处为增强） | 无 |
| ProgressSpinner | 封装 Progress 派生 | Progress |
| MultiSelect | 封装 Combobox | Combobox |
| ConfirmDialog | 封装 AlertDialog + 服务 | AlertDialog |
| Avatar | 封装 Avatar | Avatar |
| Paginator | 封装 Pagination | Pagination |
| Switch（统一 ToggleSwitch / InputSwitch） | 封装 Switch（文档 / 测试已补齐） | Switch |

## 4. Tier 2：按需（6 个）

| 组件 | 实现方式 | Reka UI 对应 |
|------|----------|--------------|
| Tabs（含 TabList/TabContent） | 封装 Tabs | Tabs |
| Accordion | 封装 Accordion | Accordion |
| Menu / DropdownMenu | 封装 DropdownMenu | DropdownMenu |
| Image | 自建（img + 懒加载） | 无（可选 AspectRatio 比例容器） |
| SelectButton / SegmentedControl | 封装 ToggleGroup | ToggleGroup |
| FileUpload | 自建 | 无 |

## 5. Tier 3：长尾（按需）

> 依据 2026-09-11 调研文档《自建组件库（基于 Reka UI）— 最小组件集评估》于 2026-09-13 重新评估：除少数纯样式 / 布局组件外，Tier 3 大多有 Reka UI 对应 primitive，**优先封装**；Reka 标注为 **Alpha** 的组件（Drawer、日期类、Color 系列）存在 API 变动风险，落地时需锁定 Reka 版本并补回归。优先级为「中」的 7 个候选已于 Phase 4 完成（6 个封装 Reka 稳定 primitive + Skeleton 自建纯样式，见 [待办归档](../plan/todo-archive.md)）。Alpha 组件与其余自建件（Drawer / DatePicker / ColorPicker / SplitButton / DataView 等）经用户决策延后至 [Phase 7](../plan/roadmap.md)、不阻塞首版发布。

| 组件 | 实现方式 | Reka UI 对应 | Reka 成熟度 | 说明 |
|------|----------|--------------|:-:|------|
| Skeleton | 自建 | 无 | — | 纯样式（CSS 动画），成本低 |
| Divider | 自建（布局 + variants） | 无（Reka `Separator` 仅单元素语义，无内容插槽与两段线结构） | — | 水平 / 垂直、带内容与线型（**已实现**） |
| RadioGroup / RadioButton | 封装 | RadioGroup | 稳定 | 表单基础控件 |
| ProgressBar | 封装 | Progress | 稳定 | 确定进度，与 ProgressSpinner 同源 |
| Popover | 封装 | Popover | 稳定 | 通用浮层 |
| Slider | 封装 | Slider | 稳定 | |
| Stepper | 封装 | Stepper | 稳定 | 步骤导航（**已实现**） |
| Toolbar | 封装 | Toolbar | 稳定 | |
| ToggleButton | 封装 | Toggle | 稳定 | 单按钮开关态 |
| Drawer | 封装（优先） | Drawer | Alpha | 亦可由 Dialog 派生；Alpha 需锁版本（**Phase 7 第一阶段 M4**） |
| DatePicker / Calendar | 封装 | DatePicker / Calendar / DateField / RangeCalendar | Alpha | 日期类整体 Alpha（**Phase 7 第一阶段 M4**） |
| ColorPicker | 封装（组合 ColorArea / ColorField / ColorSlider / ColorSwatchPicker） | Color 系列 | Alpha | 组合多个 color primitive（**Phase 7 第一阶段 M4**） |
| InputGroup / FloatLabel | 自建 | 无 | — | Reka 2.10.4 无通用表单字段包装（Field / Form），仅 Label 与各类型 `*Field`；`InputGroup` 负责成员边框 / 圆角拼接，`FloatLabel` 提供 `over` / `in` 两态（**已实现**） |
| ButtonGroup | 自建（布局 + 成员边框 / 圆角拼接） | 无 | — | 相邻按钮边框 / 圆角合并（**已实现**） |
| AutoComplete | 封装 | Combobox | 稳定 | 异步建议 + 自由输入（**已实现**） |
| Panel | 不新建 | — | — | 由 `Card` 的 `title` / `header` / `footer` 承载；可折叠场景用 `Accordion` |
| SplitButton | 自建（Button + DropdownMenu 组合） | 无 | — | Reka `Splitter` 为分栏布局，不适用（**Phase 7 第一阶段 M4**） |
| Sidebar | 自建（布局） | 无 | — | 移动端抽屉可复用 Dialog / Drawer |

Reka UI 还提供以下未纳入本清单的 primitive，可作为后续候选按需封装：Tooltip、HoverCard、Menubar、ContextMenu、NavigationMenu、ScrollArea、Separator（Divider 已自建，未采用）、PinInput、TagsInput、Editable、Tree（Tree 为 Alpha）。

## 6. 不自研

| 能力 | 建议 |
|------|------|
| 富文本 Editor | 引入 Tiptap / Quill / Lexical |
| Chart | 引入 Chart.js / ECharts |
| Galleria / Carousel | 引入 embla-carousel-vue（headless）+ 自建样式 |
| Knob / MeterGroup / OrganizationChart / TreeTable 等长尾 | 下游按需引入 Element Plus 或自留 |

## 7. composables

| composable | 职责 |
|------------|------|
| `useToast` | 轻提示，基于 Reka UI Toast |
| `useConfirm` | 确认对话框，基于 AlertDialog |
| `useTheme` | 主题/暗色模式管理 |

> 服务式 composable 的运行时状态用 provide/inject 的 per-provider store（而非模块级单例），以满足「组件库不引入全局 store」并保证 SSR 每请求隔离；自增 id 等序列同样置于 store 闭包内。

## 8. 组件开发顺序

1. Button（验证 tsdown + SFC + 样式抽取 + 子路径导出）
2. Input（验证 v-model）
3. Select（验证 Reka UI primitive 包装）
4. Dialog + Toast（验证 Portal / Teleport / SSR）
5. DataTable（最复杂，最后攻坚）
