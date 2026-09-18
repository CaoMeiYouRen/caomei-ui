# 响应式设计

本文档定义 caomei-ui 的**断点语义**、**窄屏行为矩阵**与**验收标准**，并登记分批适配清单。断点的实现约束见[开发规范 §7](../standards/development.md)；与主题 / 浮层稳定性相关的约定见[主题与样式 §5](./theming.md)。

> **现状快照（2026-09-16）**：`src/` 内共 33 处 `@media` —— 28 处 `prefers-reduced-motion`、3 处 `prefers-color-scheme`（暗色）、**仅 2 处宽度类**（`src/components/dialog/dialog.vue:202`、`src/components/confirm-dialog/confirm-dialog.vue:187`，均为 `@media (width <= 640px)`；行号以快照日期为准）。库内无 `breakpoint` / `responsive` props，亦无基于视口宽度的 `matchMedia` 监听（`src/composables/use-theme.ts` 的 `matchMedia` 用于暗色模式，与视口宽度无关）。
>
> **2026-09-18 更新**：新增 `Dialog.breakpoints`（使用方传入视口上限 → 生成媒体查询），仍**无 JS 视口分支**、无 `matchMedia` 视口监听；见 §2 使用方断点数据与 §3 矩阵 #17。

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
- 步骤条方向选择（横向步骤条在窄屏需纵向排布时，由使用方改 `orientation="vertical"`）；
- 页面语言下的文案长度控制。

**非目标**：移动端独立包；触摸手势（左滑返回 / 下拉刷新）；基于 JS 的视口分支与通用 `breakpoint` props（**例外**：`Dialog.breakpoints` 为下游迁移对齐项，按使用方传入的视口上限生成媒体查询，不使用 `matchMedia` / 视口监听，见 §2 与 §3 #17）；容器查询（Container Queries）；`DataTable` 卡片化；触摸目标尺寸（a11y 独立议题，见 §5）。

## 2. 断点语义

| 断点 | 字面量 | 语义（视口区间） | 库内职责 |
| --- | --- | --- | --- |
| sm | `@media (width <= 640px)` | 手机（≤640px） | 窄屏下会溢出 / 越界的组件必须在此收敛 |
| md | `@media (width <= 768px)` | 平板窄侧（641–768px）；该字面量在手机宽度同样命中，与 sm 规则叠加生效 | 默认沿用桌面形态；组件形态在 768px 及以下**可能**溢出时用此档收敛（仅在实际放不下时改变形态，如换行 / 组内滚动）。**769–1023px 无档可用**：该区间维持桌面形态，如需覆盖须显式登记理由 |
| lg | 默认形态（不写媒体查询） | 桌面（≥1024px） | 组件的默认形态 |

- **方向**：桌面优先。收敛统一用 `@media (width <= <断点>)`；同一组件内不得用 `min-width` 表达同一条件。确需在更宽视口切换增强形态时，须在该组件内注释说明理由。
- **字面量白名单**：宽度查询只允许 `640` / `768` / `1024`。`@media` 不支持 CSS 自定义属性，故不使用 token（同[设计规范 §2.3](./design-spec.md)）。该白名单在[开发规范 §7](../standards/development.md) 与[设计规范 §2.3](./design-spec.md) 中作为实现约束复述，三处取值须一致，变更时同步。
- **使用方断点数据**：`Dialog.breakpoints` 的键由使用方传入（属使用方数据、非库内静态规则），不受上条字面量白名单约束；库建议取 640 / 768 / 1024，迁移期实测用量为 `1199px` / `575px`，均按 `width <=` 语义处理。命中多个断点时以最窄档为准（与键顺序无关）。
- **与下游对齐**：三个值与下游 momei 的断点变量一致（`styles/_variables.scss` 的 `$breakpoint-sm/md/lg` = 640 / 768 / 1024）。momei 另有 960 / 1200 / 1280 等布局断点，属使用方页面布局职责，库不跟进。
- **降级原则**：窄屏只收敛形态，不隐藏功能。信息可被截断（省略号）或被收纳进滚动容器，但不得出现「桌面可见、窄屏消失且无替代路径」的功能。

## 3. 窄屏行为矩阵

「现状」列的取证位置为组件源码；「期望行为」列为验收依据。

| # | 行为模式 | 组件 | 手机（≤640） | 平板（641–1023） | 桌面（≥1024） | 现状 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 对话框型浮层 | Dialog / ConfirmDialog | `calc(100vw - 2 × space-4)` 内收；页脚放不下时换行 | `min(90vw, 480 / 400px)` | `min(90vw, 既定宽度)`；页脚单行（放不下时换行） | 已实现（窄屏宽度见 `dialog.vue:203,205`、`confirm-dialog.vue:188,190`；页脚 `flex-wrap: wrap` 见 `dialog.vue:178`、`confirm-dialog.vue:173`） |
| 2 | 侧边抽屉 | Drawer | 左右向 `min(90vw, size)`；上下向 `min(90vh, size)` | 同左 | 同左 | 已实现（`drawer.vue:156,171`） |
| 3 | 下拉型浮层面板 | DropdownMenu | 面板宽不超过可用宽；长选项文本省略号 | 同左 | 内容驱动（`min-width: 9rem`） | 已实现（`dropdown-menu-content.vue:49-50`：`max-width` 取 `--reka-dropdown-menu-content-available-width`，`min-width` 用 `min()` 同步收敛；文本省略号见 `:93`） |
| 4 | 选择器浮层面板 | Select / MultiSelect / AutoComplete | 面板宽取 `max(触发器宽, 内容宽)` 且不超过可用宽；选项文本省略号 | 同左 | `min-width` = 触发器宽 | 已实现（`select.vue:363-364`、`multi-select.vue:331-332`、`auto-complete.vue:568-569`：`max-width` 取 `--reka-{select,combobox}-content-available-width`，`min-width` 以 `min(触发器宽, 可用宽)` 同步收敛；文本省略号见 `select.vue:394`、`multi-select.vue:365`、`auto-complete.vue:602`） |
| 5 | 定宽复合面板 | ColorPicker | `min(260px, 可用宽)`（可用宽由 popper 给出，含碰撞内边距，故面板始终落在视口内） | 260px | 260px | 已实现（`color-picker.vue:190` portal 形态 `min(260px, var(--reka-popover-content-available-width, 260px))`；`:172` 内联形态 `min(260px, 100%)` 跟随容器） |
| 6 | 含日历面板 | DatePicker / Calendar | 面板落在视口内（内容定宽，最多占满可用宽 / 高） | 同左 | 内容定宽 `max-content` | 已实现（`date-picker.vue:261-263`：portal 面板 `max-width` / `max-height` 取 `--reka-popover-content-available-{width,height}`（回退 `none`）+ `overflow: auto` 滚动降级；内联 Calendar 为 `inline-block` 内容驱动 198×213）。**已知边界**：内联日历**容器宽 < 198px（内容宽）**时撑出容器——使用方需保证容器 ≥ 198px 或自行约束宽度；组件未暴露多月份配置。实测与基线见[批次 3 记录](./governance/2026-09-17-m2-batch3-calendar-baseline.md) |
| 7 | 横向操作条 | Toolbar / ButtonGroup / SplitButton | Toolbar 换行；ButtonGroup / SplitButton 组内横向滚动（换行会破坏拼接边框 / 圆角）；成员不裁切、不压缩到不可读，超出部分横向滚动可达 | 同手机（md 档，仅在实际放不下时生效） | `inline-flex` 单行 | 已实现（`toolbar.vue:110-123` 横向形态 `flex-wrap: wrap` + `max-width: 100%`，并含三分区容器各自的 `flex-wrap`；`button-group.vue:59-75` `max-width: 100%` + `overflow: auto hidden`（简写：横向滚动 / 纵向裁切），成员焦点环内缩（点出 `.caomei-button` 使特异性 0-4-0 压过 Button 的 scoped 规则）；SplitButton 经 `CaomeiButtonGroup` 继承） |
| 8 | 分段选择 | SelectButton | 选项按内容宽换行、行内均分剩余空间（**宽度不再严格相等**），且纵向不得裁切（容器高度随行数增长） | 同手机（md 档，仅在实际放不下时生效） | 单行等宽分段 | 已实现（`select-button.vue:178-198`：`flex-wrap: wrap` + `height: auto` + 选项 `flex: 1 1 auto` + 按 size 档位补 `min-height`（减 2px 抵消根边框，单行高度不变）；`flex-basis` 为 0 时选项永远排在一行并被裁切）。**已知边界**：单个约 35 字的超长选项在 320px 视口下自身即超宽、页面仍会横向溢出——批次前同用例实测一致（非本批引入），自动化用例应取现实标签长度，或由使用方对超长选项自行约束宽度 |
| 9 | 宽表格 | DataTable | 容器横向滚动 + 表头不换行 | 同左 | 按列宽展示 | 已实现（`data-table.vue:580`）；卡片化归使用方 |
| 10 | 横向步骤条 | Stepper（`orientation="row"`） | 不内建自动转换：随容器压缩；需纵向时由使用方改 `orientation="vertical"` | 同左 | 等宽横向 | 维持（`stepper-list.vue:27` 固定 `flex-direction: row`，无自动转换；随容器压缩由 `stepper-item.vue:31,34` 的 `flex: 1 1 0` + `min-width: 0` 承担；决策见 §5） |
| 11 | 分页 | Paginator | 自动换行 | 同左 | 单行 | 已实现（`paginator.vue:124`） |
| 12 | 标签页 | Tabs | 列表横向滚动 | 同左 | 单行 | 已实现（`tabs-list.vue:29`） |
| 13 | 长文本容器 | FileUpload 文件名、面板选项文本 | `min-width: 0` + 省略号 | 同左 | 同左 | 已实现（`file-upload.vue:331`）；面板选项文本随 #3 / #4 收敛 |
| 14 | 表单控件宽度 | Input 家族 / Slider / InputNumber | `width: 100%`，上限由使用方容器决定 | 同左 | 默认 `max-width` token | 已实现（`input.vue:122`、`slider.vue:140`、`input-number.vue:258`） |
| 15 | 单元素展示 | Card / Tag / Badge / Message / Skeleton / Image / Avatar | 随容器自适应 | 同左 | 同左 | 无风险（`image.vue:149`、`message.vue:104` 为 `width: 100%`；`card.vue:135` 宽度随容器；`tag.vue:73`、`avatar.vue:91`、`badge.vue:81` 为随内容 / 定尺寸元素；`skeleton.vue:78` 宽度默认 `100%`） |
| 16 | 触摸目标 | Checkbox / RadioButton / Switch、`control-height-sm` | 维持现状（不做 ≥44px 提升，决策见 §5） | — | — | 维持（`checkbox.vue:129` 18px、`radio-button.vue:85` 18px、`switch.vue:52` 40px、`theme.css:43` 控件高度 28px） |
| 17 | 浮层断点宽度 | Dialog（`breakpoints`） | 使用方传入的视口上限 → 面板宽度；命中多个取最窄档 | 同左 | 未传时按 `size` 档位宽度 | 已实现（`dialog.vue` 按实例属性选择器注入媒体查询 + `breakpoints.ts` 解析 / 生成；键须 px、值须安全长度，非法条目忽略；未使用 `!important`、无视图口监听） |

## 4. 验收标准

**视口**：mobile 390×844、tablet 768×1024、desktop 1280×800（≥1024 位作为形态回归）。

**断言**（对每个进入批次的组件，按其矩阵行的期望行为）：

1. **无横向溢出**：页面与组件根（或最近的容器）不得出现非预期横向溢出；**矩阵明确允许内部滚动**的组件（ButtonGroup / SplitButton / Tabs / DataTable）以「容器 `overflow-x` 在 sm / md 档为 `auto` / `scroll`、桌面（lg，默认形态）为 `visible`，且成员自身不被裁切（成员 `scrollWidth <= clientWidth + 1`）」判定，并在内容确实超宽（`scrollWidth > clientWidth`）时按档位核验确有滚动量；
2. **浮层 / 面板在视口内**：`left >= 0 && right <= innerWidth`（需要滚动的面板另满足内容可滚动可达）；
3. **关键内容不丢失**：按钮 / 选项文本完整可见，或按矩阵明确允许省略号（省略号场景须保留可访问名或 `title`）；**换行类容器不得出现纵向裁切**（`scrollHeight <= clientHeight + 1`，且每个成员的 rect 完整落在容器 client rect 内——只测横向 `scrollWidth` 会漏检被固定高度裁掉的行）；
4. **桌面无回归**：1280×800 下组件几何与计算样式与批次实施前的基线一致；基线（截图或计算样式快照）随该批次的验证记录归档；
5. **0 console error**；
6. **面板不窄于触发器**（仅「面板宽度匹配触发器」的浮层组件：Select / MultiSelect / AutoComplete）：可用宽足够时面板宽 `>= 触发器宽 - 1` —— 该断言用于守卫 `min(触发器宽, 可用宽)` 收敛语义与 Reka 变量重命名导致的静默失效。

**键盘聚焦（滚动类容器的追加口径，2026-09-17 用户裁定）**：按**聚焦前**的实际几何分档判定——

- 聚焦前该成员与容器 client rect **完全不相交**（完全落在滚动区外）⇒ 聚焦后必须**完整**落在容器 client rect 内；
- 聚焦前该成员已与容器可视区相交 ⇒ 聚焦后必须仍相交（不得被滚出可视区）。

> **为何不是「无条件完整可见」**：Chromium 的焦点滚动只在聚焦元素与滚动区**完全不相交**时才介入（触发后按居中滚动）；若聚焦前已存在一条像素级可见边（例如前一个成员居中滚动后留下的窄边），浏览器不再滚动，聚焦成员可能只露出几像素。该行为已在无组件 CSS 的纯 HTML 夹具上复现同构几何，判为**非本库特有**。用户裁定（2026-09-17，选项 A）采纳上述分档口径，**不**为此要求组件新增 `focusin` 主动滚动；「无条件完整可见」作为增强候选登记于 [Backlog §1.5](../plan/backlog.md)（含作用域 / 页面纵向滚动副作用 / RTL 等待评估项）。

浮层组件另须通过[测试规范 §5.1](../standards/testing.md) 的页面稳定性测量（遮罩完整、`in-flow` 不位移、CLS 归因）。

**承载方式**：布局断言只由 Playwright 多视口用例承担（happy-dom 无布局引擎，组件单测不写几何断言）；文档站 demo（`.demo-row`）与 `playground` 作为人工核对入口。常驻用例位于 `test/e2e/**`（`pnpm test:e2e`，夹具为 `test/e2e/fixtures/` 下的 Vite 应用，被测对象是 `src/` 源码）；配置见仓库根 `playwright.config.ts`，三个 project 对应本节视口。

**验证记录归档**：批次验证记录与截图落 `test-results/<批次>/`（gitignored 任务态，供人工查看）；**结论与关键实测值必须同步落可提交位置**（本文件该批次行、`docs/plan/todo.md` 交付状态或提交信息），不得只留在 gitignored 目录。断言 4 的**「改动前基线」**（改动前数值表 + 计算样式快照 + 已知边界）落 `docs/design/governance/[YYYY-MM-DD]-<批次>-baseline.md`（可提交），取证脚本与原始 JSON 落 `test-results/<批次>/`（gitignored，供复现）；示例见[批次 3 基线记录](./governance/2026-09-17-m2-batch3-calendar-baseline.md)。自 2026-09-17 起，断言 1 / 2 / 3（含键盘聚焦子句，按分档口径）/ 5 / 6 由常驻 Playwright 用例承载（`test/e2e/**`），批次交付以 `pnpm test:e2e` 为可复现基线；**断言 4 仍需批次自身的基线归档**，常驻用例只覆盖其形态回归部分（如窄屏规则在桌面不生效）。

## 5. 判定门槛与分批清单

**门槛**：矩阵「现状」列为「待补 / 待实测确认 / 待决策」且属于**库内职责**的组件才进入批次；属使用方职责或已具备收敛能力的组件不进入。截至 2026-09-17 三个批次均已交付，矩阵无「待补 / 待实测确认 / 待决策」行（#10 / #16 为「维持」，其余为「已实现 / 无风险」）。

| 批次 | 组件 | 依据 |
| --- | --- | --- |
| 批次 1（已交付 2026-09-16） | Select、MultiSelect、AutoComplete、DropdownMenu | 同一缺陷类：浮层面板缺宽度上限（矩阵 #3 / #4），修法一致 |
| 批次 2（已交付 2026-09-16） | Toolbar、ButtonGroup、SelectButton、SplitButton、ColorPicker、Dialog / ConfirmDialog（footer 换行） | 窄屏必现溢出或裁切（矩阵 #1 / #5 / #7 / #8） |
| 批次 3（已交付 2026-09-17） | DatePicker / Calendar | 需先实测确认（矩阵 #6）→ 实测确认面板缺可用宽上限，按批次 1 同源修法收敛；基线见[批次 3 记录](./governance/2026-09-17-m2-batch3-calendar-baseline.md) |
| 不纳入 | DataTable 卡片化、Dialog 转全屏、页面级栅格、Stepper 方向转换、触摸目标 | 均属使用方职责或已由用户决策维持现状（见下） |

**偏差与决策记录**：

- **批次口径偏差**：登记门槛写「判为需适配的 Tier 0 / Tier 1 组件为一批」（Tier 分层见[组件设计](./components.md)）。经源码核对，Tier 0 / Tier 1 中多数组件的窄屏形态已收敛（矩阵 #1 的面板宽度、#9、#11，以及 #14 中的 Input 家族），库内**浮层面板宽度**类仅 Select / MultiSelect 待补；而「必现溢出 / 裁切」的项既有 Tier 0 / Tier 1 的 Dialog、ConfirmDialog（footer 换行），也有 Tier 2 / Tier 3 的布局类（Toolbar、ButtonGroup、SelectButton、ColorPicker）。故批次 1 以**缺陷类**为单位（含同缺陷类的 AutoComplete（Tier 3）、DropdownMenu（Tier 2）），批次 2 承接其余必现溢出的横向布局类。偏差已在[待办事项](../plan/todo.md) 登记。
- **已决策 ①（2026-09-16，用户）**：触摸目标**暂不提升**到 ≥44px 命中区，维持现有视觉尺寸（Checkbox / RadioButton 18px、Switch 40px、`control-height-sm` 28px）。后续如需提升，须引入不改变视觉尺寸的不可见命中区原语，候选登记见 [Backlog §1.5](../plan/backlog.md)。
- **已决策 ②（2026-09-16，用户）**：Stepper 横向窄屏**由使用方适配**——组件不内建横向→纵向的自动转换或滚动策略，需纵向形态时由使用方改 `orientation="vertical"`（已登记于 [Stepper 组件文档](../components/stepper.md) 与本节 §1 使用方职责）。
- **已决策 ③（2026-09-16，用户）**：「DataTable 转卡片列表」「Dialog 转全屏」**不作为默认行为**，窄屏以响应式适配（横向滚动 / 内收宽度 / 换行 / 截断）为主；卡片化与全屏化仅在业务需要时由使用方实现（结论与 §1 非目标一致）。
