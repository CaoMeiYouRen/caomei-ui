# 响应式设计

本文档定义 caomei-ui 的**断点语义**、**窄屏行为矩阵**与**验收标准**，并登记分批适配清单。断点的实现约束见[开发规范 §7](../standards/development.md)；与主题 / 浮层稳定性相关的约定见[主题与样式 §5](./theming.md)。

> **现状快照（2026-09-16）**：`src/` 内共 33 处 `@media` —— 28 处 `prefers-reduced-motion`、3 处 `prefers-color-scheme`（暗色）、**仅 2 处宽度类**（`src/components/dialog/dialog.vue:202`、`src/components/confirm-dialog/confirm-dialog.vue:187`，均为 `@media (width <= 640px)`）。库内无 `breakpoint` / `responsive` props，亦无基于视口宽度的 `matchMedia` 监听（`src/composables/use-theme.ts` 的 `matchMedia` 用于暗色模式，与视口宽度无关）。

## 1. 目标与边界

**目标**：组件在桌面与窄屏下均可用——默认形态保持桌面表现，窄屏时由组件自己收敛 chrome（宽度 / 换行 / 滚动 / 截断）。

**库内职责**（使用方无法替代修复，必须由组件收敛）：

- 浮层 / 面板的宽度越界；
- 组件自身容器的横向溢出；
- 多成员布局（按钮条、分段选择）的换行或滚动；
- 长文本的截断策略。

**使用方职责**（库不内建）：

- 页面级栅格、堆叠与断点驱动的显示 / 隐藏；
- 控件宽度上限（[主题与样式 §4](./theming.md)：文本类控件默认不设上限，宽度由使用层容器控制）；
- 表格列取舍与卡片化（`DataTable` 列定义与卡片形态在消费方）；
- 页面语言下的文案长度控制。

**非目标**：移动端独立包；触摸手势（左滑返回 / 下拉刷新）；基于 JS 的视口分支与 `breakpoint` props；容器查询（Container Queries）；`DataTable` 卡片化；触摸目标尺寸（a11y 独立议题，见 §5）。

## 2. 断点语义

| 断点 | 字面量 | 语义（视口区间） | 库内职责 |
| --- | --- | --- | --- |
| sm | `@media (width <= 640px)` | 手机（≤640px） | 窄屏下会溢出 / 越界的组件必须在此收敛 |
| md | `@media (width <= 768px)` | 平板（641–1023px）；该字面量在手机宽度同样命中，与 sm 规则叠加生效 | 默认沿用桌面形态；仅当桌面形态在平板宽度**必然**溢出时才收敛 |
| lg | 默认形态（不写媒体查询） | 桌面（≥1024px） | 组件的默认形态 |

- **方向**：桌面优先。收敛统一用 `@media (width <= <断点>)`；同一组件内不得用 `min-width` 表达同一条件。确需在更宽视口切换增强形态时，须在该组件内注释说明理由。
- **字面量白名单**：宽度查询只允许 `640` / `768` / `1024`。`@media` 不支持 CSS 自定义属性，故不使用 token（同[设计规范 §2.3](./design-spec.md)）。该白名单在[开发规范 §7](../standards/development.md) 与[设计规范 §2.3](./design-spec.md) 中作为实现约束复述，三处取值须一致，变更时同步。
- **与下游对齐**：三个值与下游 momei 的断点变量一致（`styles/_variables.scss` 的 `$breakpoint-sm/md/lg` = 640 / 768 / 1024）。momei 另有 960 / 1200 / 1280 等布局断点，属使用方页面布局职责，库不跟进。
- **降级原则**：窄屏只收敛形态，不隐藏功能。信息可被截断（省略号）或被收纳进滚动容器，但不得出现「桌面可见、窄屏消失且无替代路径」的功能。

## 3. 窄屏行为矩阵

「现状」列的取证位置为组件源码；「期望行为」列为验收依据。

| # | 行为模式 | 组件 | 手机（≤640） | 平板（641–1023） | 桌面（≥1024） | 现状 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 对话框型浮层 | Dialog / ConfirmDialog | `calc(100vw - 2 × space-4)` 内收 | `min(90vw, 480 / 400px)` | `min(90vw, 既定宽度)` | 已实现（`dialog.vue:202`、`confirm-dialog.vue:187`）；footer 多按钮不换行待补 |
| 2 | 侧边抽屉 | Drawer | 左右向 `min(90vw, size)`；上下向 `min(90vh, size)` | 同左 | 同左 | 已实现（`drawer.vue:156,171`） |
| 3 | 下拉型浮层面板 | DropdownMenu | 面板宽不超过可用宽；长选项文本省略号 | 同左 | 内容驱动（`min-width: 9rem`） | **待补 `max-width`**（`dropdown-menu-content.vue:44`） |
| 4 | 选择器浮层面板 | Select / MultiSelect / AutoComplete | 面板宽取 `max(触发器宽, 内容宽)` 且不超过可用宽；选项文本省略号 | 同左 | `min-width` = 触发器宽 | **待补 `max-width`**（`select.vue:357`、`multi-select.vue:326`、`auto-complete.vue:563`） |
| 5 | 定宽复合面板 | ColorPicker | `min(260px, 100vw - 2 × space-4)` | 260px | 260px | **待补**（`color-picker.vue:171,187` 固定 260px） |
| 6 | 含日历面板 | DatePicker / Calendar | 面板落在视口内（内容定宽，最多占满可用宽） | 同左 | 内容定宽 `max-content` | 待实测确认（`date-picker.vue:253`） |
| 7 | 横向操作条 | Toolbar / ButtonGroup / SplitButton | 允许换行；成员完整可见（不裁切、不压缩到不可读） | 默认沿用桌面形态 | `inline-flex` 单行 | **待补**（`toolbar.vue:38`、`button-group.vue:23,42`、`split-button.vue:129`） |
| 8 | 分段选择 | SelectButton | 允许换行或横向滚动；禁止裁切 | 同左 | 单行等宽分段 | **待补**（`select-button.vue:136` `overflow: hidden` + `:159` `nowrap`） |
| 9 | 宽表格 | DataTable | 容器横向滚动 + 表头不换行 | 同左 | 按列宽展示 | 已实现（`data-table.vue:580`）；卡片化归使用方 |
| 10 | 横向步骤条 | Stepper（`orientation="row"`） | 待定策略（横向滚动 / 隐藏描述 / 使用方转 `column`） | 同左 | 等宽横向 | **待决策**（`stepper-list.vue:27`） |
| 11 | 分页 | Paginator | 自动换行 | 同左 | 单行 | 已实现（`paginator.vue:124`） |
| 12 | 标签页 | Tabs | 列表横向滚动 | 同左 | 单行 | 已实现（`tabs-list.vue:29`） |
| 13 | 长文本容器 | FileUpload 文件名、面板选项文本 | `min-width: 0` + 省略号 | 同左 | 同左 | 已实现（`file-upload.vue:331`）；面板选项文本随 #3 / #4 收敛 |
| 14 | 表单控件宽度 | Input 家族 / Slider / InputNumber | `width: 100%`，上限由使用方容器决定 | 同左 | 默认 `max-width` token | 已实现（`input.vue:122`、`slider.vue:140`、`input-number.vue:258`） |
| 15 | 单元素展示 | Card / Tag / Badge / Message / Skeleton / Image / Avatar | 随容器自适应 | 同左 | 同左 | 无风险（`image.vue:149`、`message.vue:104` 为 `width: 100%`；`card.vue:135` 宽度随容器；`tag.vue:73`、`avatar.vue:91`、`badge.vue:81` 为随内容 / 定尺寸元素；`skeleton.vue:78` 宽度默认 `100%`） |
| 16 | 触摸目标 | Checkbox / RadioButton / Switch、`control-height-sm` | 待决策（见 §5） | — | — | **待决策**（`checkbox.vue:129` 18px、`radio-button.vue:85` 18px、`switch.vue:52` 40px） |

## 4. 验收标准

**视口**：mobile 390×844、tablet 768×1024、desktop 1280×800（≥1024 位作为形态回归）。

**断言**（对每个进入批次的组件，按其矩阵行的期望行为）：

1. **无横向溢出**：组件根或最近的滚动容器满足 `scrollWidth <= clientWidth + 1`；
2. **浮层 / 面板在视口内**：`left >= 0 && right <= innerWidth`（需要滚动的面板另满足内容可滚动可达）；
3. **关键内容不丢失**：按钮 / 选项文本完整可见，或按矩阵明确允许省略号；省略号场景须保留可访问名或 `title`，不得出现无提示的信息丢失；
4. **桌面无回归**：1280×800 下组件几何与计算样式与批次实施前的基线一致；基线（截图或计算样式快照）随该批次的验证记录归档；
5. **0 console error**。

浮层组件另须通过[测试规范 §5.1](../standards/testing.md) 的页面稳定性测量（遮罩完整、`in-flow` 不位移、CLS 归因）。

**承载方式**：布局断言只由 Playwright 多视口用例承担（happy-dom 无布局引擎，组件单测不写几何断言）；文档站 demo（`.demo-row`）与 `playground` 作为人工核对入口。

## 5. 判定门槛与分批清单

**门槛**：矩阵「现状」列为「待补 / 待决策」且属于**库内职责**的组件才进入批次；属使用方职责或已具备收敛能力的组件不进入。

| 批次 | 组件 | 依据 |
| --- | --- | --- |
| 批次 1 | Select、MultiSelect、AutoComplete、DropdownMenu | 同一缺陷类：浮层面板缺宽度上限（矩阵 #3 / #4），修法一致 |
| 批次 2 | Toolbar、ButtonGroup、SelectButton、SplitButton、ColorPicker、Dialog / ConfirmDialog（footer 换行） | 窄屏必现溢出或裁切（矩阵 #1 / #5 / #7 / #8） |
| 批次 3 | Stepper（横向窄屏策略）、DatePicker / Calendar（实测后按需） | 需先定策略或先实测（矩阵 #6 / #10） |
| 不纳入 | DataTable 卡片化、页面级栅格、触摸目标 | 前两项属使用方职责；触摸目标见下 |

**偏差与决策请求**：

- **批次口径偏差**：登记门槛写「判为需适配的 Tier 0 / Tier 1 组件为一批」（Tier 分层见[组件设计](./components.md)）。经源码核对，Tier 0 / Tier 1 中多数组件的窄屏形态已收敛（矩阵 #1 的面板宽度、#9、#11，以及 #14 中的 Input 家族），库内**浮层面板宽度**类仅 Select / MultiSelect 待补；而「必现溢出 / 裁切」的项既有 Tier 0 / Tier 1 的 Dialog、ConfirmDialog（footer 换行），也有 Tier 2 / Tier 3 的布局类（Toolbar、ButtonGroup、SelectButton、ColorPicker）。故批次 1 以**缺陷类**为单位（含同缺陷类的 AutoComplete（Tier 3）、DropdownMenu（Tier 2）），批次 2 承接其余必现溢出的横向布局类。偏差已在[待办事项](../plan/todo.md) 登记。
- **待决策 ①**：触摸目标是否提升到 ≥44px 命中区（当前 Checkbox / RadioButton 视觉尺寸 18px、Switch 40px、`control-height-sm` 28px）。属 a11y 议题，涉及全部小尺寸控件的视觉 / 命中原语，需单独决策。
- **待决策 ②**：Stepper 横向窄屏策略取「横向滚动」「隐藏描述文案」还是「由使用方转 `column`」。
