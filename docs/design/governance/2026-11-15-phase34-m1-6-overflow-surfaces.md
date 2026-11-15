# Phase 34 M1-6：P1 overflow 面与截断前提（Tag / Breadcrumb / Menu / DataTable）

> 创建时间：2026-11-15
> 触发：用户「继续推进剩余待办」。范围与验收口径见 [Phase 34 登记批次](./2026-11-14-phase34-registration.md) §2 的 M1-6 行。

## 1. 交付面（7 文件）

| 面 | 文件 |
|:---|:---|
| 溢出触发面（6 源文件） | `tag/tag.vue`（标签文本）、`breadcrumb/breadcrumb-item.vue`（链接项 / 文本项）、`menu/menu-item.vue`（普通项）、`menu/sub-menu.vue`（子菜单触发器标签）、`menu/menu.vue`（共享项样式）、`data-table/data-table.vue`（表头 / 默认单元格文本 + 列宽上限下发） |
| 单测（1） | `tooltip/overflow-surfaces.test.ts`（四个面集中覆盖） |

治理索引与记录本体属登记 / 留痕，不计入上表。登记预算 ≈ 6（4 源文件 + 截断样式 + 单测），实测 7 = 6 源文件 + 单测：登记预期的独立「截断样式」文件没有出现（配方内联进各组件 scoped 样式，−1），而 Menu 占 3 个文件（普通项 / 子菜单触发器 / 共享项样式，+2）。**未新增任何公开 prop**。

## 2. 决策

1. **复用 `CaomeiTooltipText` 的 `auto` 模式**：四个面都包一层提示文本组件，内容取可见文本（`onMeasure` 同步），只在 `scrollWidth > clientWidth + 1` 时挂载提示。命中「溢出显示 / 未溢出静默」。
2. **截断前提是本条的主体**：溢出检测依赖「元素真的有宽度上限且 `scrollWidth` 能大于 `clientWidth`」，所以四处都补了同一条配方（内联在各组件 scoped 样式里，未另建样式文件）——`overflow: hidden`（把内层最小内容宽归零，否则 `min-content` 恒等于整段文本）+ `white-space: nowrap` + `text-overflow: ellipsis` + 可覆盖的宽度上限变量：
   - Tag：`--caomei-tag-label-max-width`（默认 `100%`），宿主 `max-width: 100%` 让标签可被容器压缩；
   - Breadcrumb：`--caomei-breadcrumb-label-max-width`（默认 `100%`），项 `max-width: 100%` + 链接 / 文本 `min-width: 0`；
   - Menu：`--caomei-menu-item-label-max-width`（默认 `100%`），项宽本就是菜单宽（`width: 100%`）；
   - DataTable：**只有绝对长度的列宽**（`px` / `rem` / `ch` 等）才驱动截断，上限经 `textStyle` 以 `calc(<列宽> - 2 × 单元格横向内边距)` 逐列下发到文本盒，并加 `caomei-data-table__text--truncate` 类。百分比与关键字一律不加配方：`width: '20%'` 的列若把 `20%` 直接当 `max-width`，百分比在单元格内容盒里会二次取基准（`20% × 20%`），短文本也会被截成省略号并弹提示；`auto` / `min-content` 在 `max-width` 上无意义。未设列宽的列保持既有换行行为。
3. **提示触发器的落点**：Tag / Breadcrumb / Menu 都落在**可见文本自身**（包围槽内容），DataTable 落在**表头 / 默认单元格文本**上。自定义 `cell` / `#cell-*` / `#header-*` 槽的渲染结果不包裹——由使用方自行决定是否包 `CaomeiTooltipText`。
4. **Breadcrumb 的 `z-index` 修正**：链接带 `.caomei-hit-target`，其 `::after` 是 24×24 的不可见命中区，绘制在文本之上；悬停链接中部时事件落在伪元素上，提示触发器收不到 `pointermove`（实测「长链接中段悬停无反应」）。文本盒改为 `position: relative` + `z-index: var(--caomei-z-raise)` 绘制在命中区之上，点击仍冒泡到链接，命中区语义不变。
5. **Breadcrumb 文本盒用块级而非行内块**：`overflow: hidden` 的行内块基线取盒子底边，把行盒从 18px 抬高到 21px——`hit-target` 的 P2 断言（宿主短边 < 18px，证明 24px 命中区不可见）因此失败。改 `display: block` 后链接高度回到 18px，截断与提示均不受影响。
6. **Menu 子菜单指示器不挂提示**：指示器是装饰性图标（`aria-hidden="true"`），展开语义由触发器的 `aria-expanded` 表达；再挂提示会与触发器同名重复朗读。登记 §2 写的「Menu 子菜单指示器 icon-only」**不采纳**，本批把「Menu 长项」落在**触发器标签**上——标签被截断时悬停显示全文。
7. **Menu 项插槽整体包裹属已知可见变更**：`CaomeiMenuItem` / `CaomeiSubMenu` 的槽内容被包进一个文本盒，项级 `flex` 的 `gap` 不再作用于「图标 + 文本」之间（间距退回模板空白），多节点内容在截断时按盒裁切。图标出口（`icon` prop / `#icon` 槽）需改公开 API，列为遗留 F16；组件页由 M1-8 写明「截断针对整段插槽文本」。
8. **DataTable 默认文本用 VNode 包装**：`cell` 默认分支返回 `h(CaomeiTooltipText, …, () => text)`，`header` 改为返回 VNode 的函数（`FlexRender` 支持函数型 header）。空值仍返回空字符串，不渲染空盒；自定义 `cell` / `#cell-*` / `#header-*` 不包裹。
9. **提示只覆盖指针路径**：文本盒是不可聚焦的 `span`，宿主链接 / 菜单项获得焦点不会弹提示（单测对此有专门断言）。读屏不受影响（截断只是视觉裁切，文本仍在 DOM 中）；纯键盘的视力用户拿不到展开后的全文，登记为已知边界（M1-8 文档说明，F17 一并评估）。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 单测 | 新增 11 例（Tag 2：未溢出静默 + 溢出显示 / 关闭按钮名；Breadcrumb 3：链接项与文本项 / 未溢出静默 + 宿主聚焦不打开 / 链接可访问名；Menu 2：普通项未溢出静默 + 溢出显示 / 子菜单触发器；DataTable 4：绝对列宽表头与单元格 / 百分比列宽不加配方 / 未设列宽保持换行 / 自定义 cell 不包裹）；全量 169 文件 / 3299 例通过 |
| 真实 Chromium | 逐面核对：Tag（336 > 137）、Breadcrumb（336 > 240）、Menu 普通项（336 > 176）与子菜单触发器标签、DataTable 绝对列宽的表头与单元格（336 > 96，`max-width` 取 `max(1ch, calc(120px − 24px 内边距))`）出现省略号并在悬停时给出全文；反向对照：百分比列宽（`20%`）的短文本 28 = 28 不截断、不弹提示，未设列宽的单元格保持 `white-space: normal`、行高 53px（两行）且无提示 |
| 命中测试 | Breadcrumb 链接悬停中部即可触发提示（`z-index` 修正前不触发），链接高度仍为 18px |
| `capture:styles` | 0 差异（399 项） |
| 视觉回归 | 42 passed（0 diff）——既有夹具文本未受限，截断前提不改变注册视觉面 |
| E2E | `hit-target` / `menu-navigation` / `data-table-sort-width` / `data-table-keyboard-scroll` / `density` 54 passed（含 P2 行高受限目标「视觉盒 < 18px」与面包屑分隔符 / 当前页断言） |

> 并行负载 flaky：`date-picker` 的键盘区间用例在一次全量首跑失败，隔离运行与复跑均通过；本批未触及 date-picker，与改动无因果。

## 4. Review Gate

- **R1（`standard`，A 实现 / B 记录两分区并发）**：A `Reject`（1 blocker：`columns[].width` 原样灌进 `max-width`，`20%` 会在单元格内容盒里二次取百分比，短文本被截成省略号并弹提示——真实浏览器实测 `clientWidth 16px / scrollWidth 80px`；5 warning：Menu 槽包裹破坏图标与文本间距并裁切多节点、焦点用例不等于真实键盘路径、DataTable 每格一套观察者无退出开关、面包屑缺未溢出用例、`panelText()` 单独无法区分「未挂载」与「未打开」）。B `Pass`（0 blocker；4 warning：预算差异算式、新增用例清单与总数不闭合（F14 同族）、登记行「指示器 icon-only」偏差未点明、默认单元格被强制单行属未披露的行为变更）。
- **R1 修复**：① DataTable 改为「只有绝对长度列宽才加 `--truncate` 类与 `calc(列宽 − 2 × 内边距)` 上限」，百分比 / 关键字不加配方、未设列宽保持换行（真实浏览器反向对照已补）；② 面包屑 / Tag 的 `:deep()` 收窄到本组件的包装类；③ 用例改为指针打开并补「宿主聚焦不打开」「未溢出无 `aria-describedby`」断言（11 例）；④ Menu 槽包裹登记为已知可见变更并新增 F16（`icon` 出口），组件页约束交 M1-8；⑤ DataTable 大表开销新增 F17；⑥ 记录补预算算式、用例清单 1:1 映射、登记行偏差说明。
- **R2（`quick`，两分区修复点）**：A `Pass`（0 blocker；B1 关闭、W1 ~ W5 / S2 落地；4 条 follow-up：`calc` 负值钳制、DataTable 反例未统一双条件断言、可排序表头未扣图标宽度、白名单大小写敏感——前两条本轮收口，后两条并入 F15）。B `Reject`（1 blocker：§3「真实 Chromium」行的总数与实际清单不符，F14 同族复发）→ 已按「不写总数、逐面列出」改写，索引摘要同步去掉手写计数。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F1 / F2 / F4 / F6 | 承接 M1-1 | M4-1、M1-7、M1-8 |
| F7 ~ F9 | 承接 M1-2 | 见 M1-2 记录遗留节 |
| F10 / F11 | 承接 M1-3（F12 已收敛） | 见 M1-3 记录遗留节 |
| F14 | 承接 M1-5：验证表计数须与逐点清单求和一致 | 见 M1-5 记录遗留节 |
| F15 | DataTable 只在列宽命中白名单单位（`px` / `rem` / `em` / `ch` / `ex` / `cm` / `mm` / `in` / `pt` / `pc`，小写）时才截断；百分比、`auto` / `min-content` 一类关键字与视口单位（`vh` / `vw` / `vmin` / `vmax`）一律保持换行、不挂提示。可排序表头的上限未扣排序图标宽度（约 18px），声明列宽的可排序列会略宽于声明值。三条口径均需在 M1-8 的组件页写明 | M1-8 |
| F16 | Menu 项槽被整体包进文本盒：`--caomei-menu-item-gap` 不再作用于「图标 + 文本」，多节点内容截断时按盒裁切；需评估 `icon` prop / `#icon` 槽 | 下一阶段评估（M1-8 先写清约束） |
| F17 | DataTable 默认单元格逐格一套提示接线（`TooltipRoot` + 溢出观察者）；分页关闭的大表为 O(行 × 列)，缺退出开关与规模实测 | 出现性能反馈或大表用例时评估 |

## 6. 复查基线

本记录 §1 ~ §5；四个面的模板与样式（截断配方、`z-index` 修正、块级文本盒、列宽变量下发）；`tooltip/overflow-surfaces.test.ts`。
