# 组件设计

本文档定义 caomei-ui 的组件分层与最小组件集。组件集依据下游项目（afdian-linker / caomei-auth / momei / rss-impact-next / dependfix-platform）实际使用面统计得出。

## 1. 组件分层

| 层 | 内容 | 示例 |
|----|------|------|
| Primitive 层 | Reka UI 原始件，不直接对外 | Select / Dialog 等组件内部使用的 primitive |
| 封装 / 自建层 | Reka UI 封装，或原生元素 + 样式 / 变体 | 封装：Select、Dialog、Switch、Toast、Checkbox / CheckboxGroup；自建：Button、Input、Card、Tag / Badge |
| 复合层 | 多 primitive 组合 | DataTable、ConfirmDialog、MultiSelect、Form / FormItem |
| Provider 层 | renderless 上下文组件（仅默认插槽，无 DOM） | ConfigProvider（内建文案注入，消费 `useLocale` / `provideLocale`） |
| 服务层 | composables | useToast、useConfirm、useTheme |

### 1.1 实现方式决策原则

- **优先封装 Reka UI 已有组件**；仅当 Reka UI 缺失对应组件，或对应组件无法满足设计需要（交互语义 / 无障碍 / 布局结构）时才自建。
- 自建前须核对 [Reka UI 官方文档](https://reka-ui.com/docs/overview/introduction) 的 Components 导航与本地 `reka-ui` 导出，确认确无可用 primitive。
- 封装层只承担样式、变体、尺寸、语义 token 与服务封装，不重复实现 primitive 已提供的交互与无障碍。
- 组件清单以「Reka UI 对应」列为准维护：新增组件时先判定能否封装，再决定是否自建。
- Reka UI 文档站无 `/docs/components` 索引页（404）；组件清单以任一组件页的侧栏导航或本地 `reka-ui` 导出为准，外链统一指向 [官方简介](https://reka-ui.com/docs/overview/introduction)。

## 2. Tier 0：必选（10 个）

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
| CheckboxGroup | 封装 CheckboxGroup（分组值数组 + 全选 / 半选） | CheckboxGroup |
| Editable | 封装 | EditableRoot / EditableArea / EditablePreview / EditableInput / EditableEditTrigger / EditableSubmitTrigger / EditableCancelTrigger | 稳定 | 行内编辑：聚焦 / 双击进入、回车与失焦提交、Esc 回退、只读与禁用、激活态焦点管理（**已实现**） |

## 3. Tier 1：强烈推荐（8 个）

在 Tier 0 基础上覆盖至约 95%。

| 组件 | 实现方式 | Reka UI 对应 |
|------|----------|--------------|
| Message / Alert | 自建（业务语义包装）；`Alert` 是 `Message` 的**语义预设包装**，与本体共用同一外观层与 token，仅收敛语义（静态档）与变体（无 `simple`） | 无 |
| Password | Input 派生（Tier 0 已含基础能力，此处为增强） | 无 |
| Picker | 自建（与 TimePicker wheel 共用交互） | 无（复用 `use-wheel-column`） | 稳定 | 通用滚轮选择器：单列 / 多列、吸附与动量收敛、循环（键盘与点击）、键盘导航；与 `TimePicker` 共用同一份滚轮逻辑（**已实现**） |
| ProgressSpinner | 封装 Progress 派生 | Progress |
| MultiSelect | 封装 Combobox | Combobox |
| ConfirmDialog | 封装 AlertDialog + 服务 | AlertDialog |
| Avatar | 封装 Avatar | Avatar |
| Paginator | 封装 Pagination | Pagination |
| Switch（统一 ToggleSwitch / InputSwitch） | 封装 Switch（文档 / 测试已补齐） | Switch |

## 4. Tier 2：按需（11 个）

| 组件 | 实现方式 | Reka UI 对应 |
|------|----------|--------------|
| Tabs（含 TabList/TabContent） | 封装 Tabs | Tabs |
| Accordion | 封装 Accordion | Accordion |
| Menu / DropdownMenu | 封装 DropdownMenu | DropdownMenu |
| Image | 自建（img + 懒加载 + 点击预览） | Dialog（预览遮罩模态） |
| SelectButton / SegmentedControl | 封装 ToggleGroup | ToggleGroup |
| FileUpload | 自建 | 无 |
| Cell / CellGroup | 自建（行布局 + 分组容器） | 无 |
| Tabbar / TabbarItem | 自建（展示层，不接 vue-router） | 无 |
| NavBar | 自建（路由级页头，不接 vue-router） | 无 |
| ActionSheet | 组合（`Drawer position="bottom"`） | Dialog 派生 |
| Empty | 自建（图标 / 图片 + 标题 / 说明 + 操作区） | 无 |

> 分档依据：Cell / Tabbar / NavBar / ActionSheet / Empty 属移动端壳层与页面级空态，单项职责薄、可组合（ActionSheet 复用 Drawer，Empty 复用 dataView 文案，NavBar 为自建页头），故列 Tier 2「按需」；不因移动端场景整体升档。NavBar 同时是 §11.5 三条准入标准的例外项（第 1 条不成立、第 2 条存疑）。

## 5. Tier 3：长尾（按需）

> 依据 2026-09-11 调研文档《自建组件库（基于 Reka UI）— 最小组件集评估》于 2026-09-13 重新评估：除少数纯样式 / 布局组件外，Tier 3 大多有 Reka UI 对应 primitive，**优先封装**；Reka 标注为 **Alpha** 的组件（Drawer、日期类、Color 系列）存在 API 变动风险，落地时需锁定 Reka 版本并补回归。优先级为「中」的 7 个候选已于 Phase 4 完成（6 个封装 Reka 稳定 primitive + Skeleton 自建纯样式，见 [待办归档](../plan/todo-archive.md)）。Alpha 组件与其余自建件（Drawer / DatePicker / ColorPicker / SplitButton / DataView 等）经用户决策延后至 [Phase 7](../plan/roadmap.md)、不阻塞首版发布。
>
> **本表由 `check:design-catalog` 对账**（行成员集合与「（已实现）」标记 ↔ [文档与演示站 §11](./documentation-site.md) 的登记表，接入 `governance:check`）：行对应 §11 已登记组件时须标「（已实现）」，标「（已实现）」的行必须有组件名登记于 §11。新增 / 调整本表后须同步 §11（或反之）。

| 组件 | 实现方式 | Reka UI 对应 | Reka 成熟度 | 说明 |
|------|----------|--------------|:-:|------|
| Skeleton | 自建 | 无 | — | 纯样式（CSS 动画），成本低（**已实现**） |
| BackTop | 自建 | 无 | — | 常驻回顶按钮：window / 选择器 / 元素目标、阈值显隐、reduced-motion 兜底（**已实现**） |
| TimePicker | 自建 | 无（未采用 `TimeField`：12 小时制 ARIA 与多语日序不可用） | — | 三段数字输入 + 可选滚轮弹层（`input` / `wheel` / `both`）、默认含秒并补 0（`showSeconds` / `pad`）、本地化日序、12 / 24 小时制、步进与时间区间（**已实现**） |
| Divider | 自建（布局 + variants） | 无（Reka `Separator` 仅单元素语义，无内容插槽与两段线结构） | — | 水平 / 垂直、带内容与线型（**已实现**） |
| Rating | 封装 | Rating | Alpha | 星级评分：整星 / 半星、只读与禁用；内置 `star` 语义图标（**已实现**） |
| RadioGroup / RadioButton | 封装 | RadioGroup | 稳定 | 表单基础控件（**已实现**） |
| ProgressBar | 封装 | Progress | 稳定 | 确定进度，与 ProgressSpinner 同源（**已实现**） |
| Popover | 封装 | Popover | 稳定 | 通用浮层（**已实现**） |
| Slider | 封装 | Slider | 稳定 | （**已实现**） |
| Stepper | 封装 | Stepper | 稳定 | 步骤导航（**已实现**） |
| Toolbar | 封装 | Toolbar | 稳定 | （**已实现**） |
| ToggleButton | 封装 | Toggle | 稳定 | 单按钮开关态（**已实现**） |
| Drawer | 封装 Dialog 派生（四向定位 + 滑入动画） | Dialog（Reka `Drawer` 为 Vaul 形态、不负责面板定位，未采用） | 稳定 | 四向 `position`（默认 `left`）；见 [设计规范 §7](./design-spec.md)（**已实现**） |
| DatePicker / Calendar | 封装 | DatePicker / Calendar / DateField / RangeCalendar | Alpha | 日期类整体 Alpha（**已实现**；范围选择零用量未实现，见 [设计规范 §7](./design-spec.md)） |
| ColorPicker | 封装（组合 ColorArea / ColorSlider / ColorField；色板自建单选组） | Color 系列 | Alpha | 组合 color primitive，色板不用 `ColorSwatchPicker`（见 [设计规范 §7](./design-spec.md)）（**已实现**） |
| InputGroup / FloatLabel | 自建 | 无 | — | Reka 2.10.4 无通用表单字段包装（Field / Form），仅 Label 与各类型 `*Field`（**注**：2.11.0 已提供 `FormRoot` / `Field*`，见 §5 末段）；`InputGroup` 负责成员边框 / 圆角拼接，`FloatLabel` 提供 `over` / `in` 两态（**已实现**） |
| Form / FormItem | 自建（组合层） | 无 | — | 表单布局与提交编排；`FormItem` 以 5 键插槽作用域提供 `id` / `name` / `aria-*` / `invalid`，不含 rules 引擎（**已实现**） |
| ButtonGroup | 自建（布局 + 成员边框 / 圆角拼接） | 无 | — | 相邻按钮边框 / 圆角合并（**已实现**） |
| Row / Col | 自建（CSS Grid 24 栅格） | 无 | — | 栅格行 / 列：gutter、偏移、排序与断点覆盖（`sm` / `md` / `lg`）（**已实现**） |
| Splitter | 封装 | SplitterGroup / SplitterPanel / SplitterResizeHandle | 稳定 | 水平 / 垂直分栏：尺寸约束、折叠 / 展开、键盘调整与嵌套；受控布局对无事件折叠按渲染态回读兜底（**已实现**） |
| Watermark | 自建（canvas 平铺） | 无 | — | 文本 / 图片水印：旋转、透明度、间距、偏移与层级；DOM / 尺寸变化后下一帧重建，卸载即停止；遮罩 `aria-hidden`，像素级篡改不覆盖（**已实现**） |
| Carousel | 封装（`embla-carousel-vue`） | 无（`embla-carousel-vue` 为运行时依赖） | 稳定 | 水平 / 垂直轮播：循环、每页张数（含 `auto`）、间距、受控页索引、上一页 / 下一页与指示点；容器与页带轮播语义，键盘与拖拽翻页（**已实现**） |
| Anchor | 自建（scroll-spy） | 无 | — | 锚点导航：窗口 / 容器判定线激活、嵌套缩进、点击对齐判定线、pushState 与 hashchange 同步（**已实现**） |
| NavigationMenu | 封装 | NavigationMenuRoot / NavigationMenuTrigger / NavigationMenuContent / NavigationMenuLink | 稳定 | 站点级导航菜单：悬停 / 点击切换开合、共享内容视口、受控展开；内容经 Teleport 进视口，非模态（**已实现**） |
| HoverCard | 封装 | HoverCardRoot / HoverCardTrigger / HoverCardContent / HoverCardArrow | 稳定 | 悬停 / 聚焦浮出的补充信息卡：延迟、方位与箭头；非模态，焦点离开 / Esc 关闭（**已实现**） |
| Menubar | 封装 | MenubarRoot / MenubarMenu / MenubarTrigger / MenubarContent / MenubarItem | 稳定 | 桌面式菜单栏：一组触发器共享弹出菜单、受控展开、方向键 / Home / End / Esc 与焦点归还；条目支持禁用与快捷键提示（**已实现**） |
| ContextMenu | 封装 | ContextMenu | 稳定 | 右键 / 触屏长按：数据条目（图标 / 快捷键 / 危险 / 禁用 / command）+ Group / Label / Item / Separator 子组件；复用浮层隔离与受控开合（**已实现**） |
| QRCode | 封装（可选 peer `qrcode`，按需加载） | 无（`qrcode` 为编码内核） | — | 文本 / 链接编码：尺寸、容错级别、静区、配色、居中图标与插槽；失败清空旧图并 `role="alert"`（**已实现**） |
| Tour | 自建（遮罩挖空 + 目标定位 + 模态滚动锁） | 无 | — | 分步引导：`steps` 驱动、受控步骤、挖空高亮与翻转钳位、滚动 / 尺寸变化重算、`Escape` 归还焦点（**已实现**） |
| Tooltip | 封装（+ 一次性 Provider） | Tooltip | 稳定 | 悬停 / 聚焦即显的只读提示；不构成焦点陷阱，描述经隐藏 `role="tooltip"` 元素接线；库内图标触发器与长文本面内建提示（Button 需 `tooltip` 开启，其余默认开启）（**已实现**） |
| Menu | 自建（disclosure 导航 + Reka `Collapsible`） | Collapsible（子菜单展开） | 稳定 | 导航菜单（含 `SubMenu` / `MenuItem` 子件）：方向键序列、子菜单就地展开、`aria-current` 标记当前项（**已实现**） |
| Breadcrumb | 自建（容器 + 有序列表 + `aria-current`） | 无 | — | 层级导航（含 `BreadcrumbItem` 子件）：分隔符经 prop 定制、末级标记当前页（**已实现**） |
| AutoComplete | 封装 | Combobox | 稳定 | 异步建议 + 自由输入（**已实现**） |
| Panel | 不新建 | — | — | 由 `Card` 的 `title` / `header` / `footer` 承载；可折叠场景用 `Accordion` |
| SplitButton | 自建（Button + DropdownMenu 组合） | 无 | — | Reka `Splitter` 为分栏布局，不适用（**已实现**） |
| DataView | 自建（`layout` grid / list + 插槽） | 无 | — | 列表 / 网格两态 + 加载 / 空态（**已实现**） |
| Sidebar | 自建（布局） | 无 | — | 移动端抽屉可复用 Dialog / Drawer |
| TagsInput | 封装 | TagsInput | 稳定 | 标签录入：多值 `v-model`、自由文本、回车 / 分隔符提交、标签删除、数量 / 去重约束（**已实现**） |
| InputOtp | 封装 | PinInput | 稳定 | 验证码输入：定长输入格、数字 / 字母数字模式、粘贴分发、完成事件与逐字可访问名（**已实现**） |
| TagGroup | 封装 | TagGroupRoot / TagGroupItem / TagGroupItemText / TagGroupItemDelete | 稳定 | 标签组：单选 / 多选、方向键移动、Delete 移除、禁用项与整组禁用、`v-model`（**已实现**） |
| Popconfirm | 自建（Popover + Button 组合） | 无（Popover 承载开合与隔离，按钮为库内 Button） | 稳定 | 气泡确认：就近二次确认、危险语气、加载 / 禁用、受控开合与焦点归还（**已实现**） |
| Result | 自建（展示层） | 无 | — | 结果页：语义状态与 403 / 404 / 500、图标 / 标题 / 描述 / 操作区、尺寸档与 live region（**已实现**） |
| Descriptions | 自建（`dl` / `dt` / `dd` 语义） | 无 | — | 描述列表：列数与跨列、带边框、标签宽度、水平 / 垂直布局、响应式降列与长内容折行（**已实现**） |
| Transfer | 自建（双列表 + 原生复选框） | 无 | — | 穿梭框：候选 / 已选两栏、搜索、禁用、受控值集合（**已实现**） |
| Cascader | 自建（Popover + 多级列 + 原生按钮） | 无 | — | 级联选择：多级路径、`changeOnSelect`、清除、禁用与分隔符（**已实现**） |
| Timeline | 自建（`ol` / `li` 语义） | 无 | — | 时间轴：单侧 / 交替布局、反转顺序、语气色节点、自定义图标（**已实现**） |
| Tree | 封装 | Tree | Alpha | 树形控件：`items` 递归数据、展开 / 折叠、单选 / 多选、节点禁用、受控与非受控、方向键与 `Home` / `End` 导航（**已实现**）；大列表用 `TreeVirtualizer` |
| TreeSelect | 自建（Popover + Tree 组合） | 无（Popover 承载浮层与隔离） | — | 树形选择：键值单选 / 多选、已选回显、清空、禁用、打开态隔离与 320 / 390 窄屏碰撞收敛（**已实现**） |
| Countdown | 自建（展示层 + 定时器） | 无 | — | 倒计时：目标时间归一、`DD` / `HH` / `mm` / `ss` / `SSS` 模板、到点停表冻结与 `finish` 去重、回拨不恢复（**已实现**） |
| Statistic | 自建（展示层） | 无 | — | 统计数值：精度 / 千分位 / 前后缀 / 加载态，空值与非法输入降级为占位；不做数字滚动动画（**已实现**） |
| Chart | 封装（第三方库轻量包装） | 无（内核 `vue-echarts` + `echarts`，均**可选 peer**） | 稳定 | 图表：`option` 原样透传、容器自适应（`autoresize` 默认开启）、内核按需加载并在缺失时降级占位；**不代注册**图表类型与组件；**主题由宿主 token 派生**（暗色 / 预设联动）、语言与数字 / 日期格式跟随 `useLocaleCode()`（**已实现**） |
| RichTextEditor | 封装（第三方库轻量包装） | 无（内核 `md-editor-v3`） | 稳定 | Markdown 富文本编辑器：`v-model` 绑定源码、暗色 / 语言跟随宿主自动联动、图片上传能力；内核为**可选 peer 依赖**、按需加载（**已实现**） |

Reka UI 还提供以下未纳入本清单的 primitive，可按需封装（清单以本地 `reka-ui` 导出为准）：ScrollArea（滚动面板已评估不自研，见 [Backlog §3](../plan/backlog.md)）、Separator（Divider 已自建，未采用）、PinInput、Field（字段 ARIA）、MonthPicker / YearPicker、Listbox。**候选取舍与优先级见 [Backlog §1.11](../plan/backlog.md)**：本清单只描述可用 primitive，不承载候选决策。

## 6. 不自研

| 能力 | 建议 |
|------|------|
| 富文本 Editor | **已实现**（[`CaomeiRichTextEditor`](../components/rich-text-editor.md)）：轻量封装 `md-editor-v3`（**可选 peer 依赖**、按需加载内核与样式），暗色 / 国际化联动内建；不自研内核。「兼容主题」（对齐编辑器内部 token）后置，触发条件为下游提出编辑器视觉与宿主不一致 |
| Chart | **已实现**（[`CaomeiChart`](../components/chart.md)）：轻量封装 `vue-echarts` + `echarts`（两者均为**可选 peer 依赖**、按需加载），容器自适应与占位降级内建；**不自研内核**。按需注册由使用方承担，以控制内核体积 |
| Galleria / Carousel | 引入 embla-carousel-vue（headless）+ 自建样式 |
| Knob / MeterGroup / OrganizationChart / TreeTable 等长尾 | 下游按需引入 Element Plus 或自留 |

## 7. composables

| composable | 职责 |
|------------|------|
| `useToast` | 轻提示，基于 Reka UI Toast |
| `useConfirm` | 确认对话框，基于 AlertDialog |
| `useTheme` | 主题/暗色模式管理 |
| `useLocale` | 读取当前注入的组件内建文案 |
| `provideLocale` | 向下提供组件内建文案（非组件 / 自定义 Provider 场景） |

> 服务式 composable 的运行时状态用 provide/inject 的 per-provider store（而非模块级单例），以满足「组件库不引入全局 store」并保证 SSR 每请求隔离；自增 id 等序列同样置于 store 闭包内。`provideLocale` 为 Provider 入口（对应 §1 Provider 层），列入本表便于查找；其合并、回退与运行时切换见[内建文案与语言](../components/locale.md)。

## 8. 组件开发顺序

1. Button（验证 tsdown + SFC + 样式抽取 + 子路径导出）
2. Input（验证 v-model）
3. Select（验证 Reka UI primitive 包装）
4. Dialog + Toast（验证 Portal / Teleport / SSR）
5. DataTable（最复杂，最后攻坚）
