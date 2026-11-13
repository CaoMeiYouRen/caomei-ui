# Tooltip 增强分析：原生 `title` 的现状与组件接入评估

> 创建时间：2026-11-14
> 触发：用户发现 `CaomeiButton` 等组件在页面中显示的是**系统原生提示**，询问其归属，并要求评估「用 `CaomeiTooltip` 替代默认提示、仅在文本溢出或纯图标时展示」的落点。
> 性质：只读分析 + 落点评估；**未改代码、未登记条目**。建议批次见 §6，待裁定。

## 1. 结论

1. **归属**：`title` 不是本项目封装的，也不是 Reka 上游封装的——它是**原生 HTML 属性**，经组件的 attrs 透传落到真实 DOM 上，由浏览器渲染系统 tooltip。
   - `CaomeiButton`：`inheritAttrs: false` + `rootAttrs = useLabelAttrs(label)`，消费者写的 `title` 原样落在 `<button>` 上；
   - 其他组件按三种透传路径之一处理（`useAttrForwarding` / `useLabelAttrs` / 显式 `v-bind="attrs"`），凡透传者 `title` 同样落原生属性；未透传的组件不会出现 `title`；
   - Reka 只提供 `TooltipRoot/Trigger/Content` 原语，不接管 `title`。
2. **不应「全量替换」**：`Alert` / `Card` / `Dialog` / `Drawer` / `Message` / `Accordion` 的 `title` 是**标题语义 prop**（渲染为标题文本），与提示无关，不得改。
3. **需要增强的是两类触发面**：① **纯图标触发**（无可读文本，如关闭 / 清空 / 分页 / 步进按钮）；② **单行截断文本**（`text-overflow: ellipsis` 的按钮、表格单元格、Tag、面包屑等）。
4. **建议路线**：先做 **Button（覆盖下游最高频用法）**，抽共享的 `useOverflowTooltip`（溢出检测）与统一的 Tooltip 包装；其余组件按 §4 清单分批接入；原生 `title` 在接入组件内**剥离并转为 tooltip 内容**，避免双提示。

## 2. 现状核查

| 面 | 事实 |
|:---|:---|
| `CaomeiButton` | `inheritAttrs: false`，`rootAttrs` 由 `useLabelAttrs` 生成 → `title` / `aria-label` 等原生属性落到 `<button>`；`iconOnly` 时强制 `aria-label = label` |
| 其他组件 | 透传路径有三种：`useAttrForwarding`（19 个）/ `useLabelAttrs` / 显式 `v-bind="attrs"`（36 处）；未透传的组件 `title` 不会出现。凡透传者 `title` 同样成为原生属性 |
| `CaomeiTooltip` | 已封装 Reka：Provider（`delayDuration` 700 / `skipDelayDuration` 300 / `disabled` / `disableHoverableContent` / `ignoreNonKeyboardFocus` / `disableClosingTrigger`）+ Trigger / Content / Arrow；面板 `role="tooltip"` 只作**描述**（`aria-describedby`），不进入可访问名 |
| 前置条件 | `CaomeiTooltipProvider` 必须放在应用根部；**当前文档站 layout 未放置**（下游也需自行放置） |
| 语义边界 | Tooltip = 只读短提示；Popover = 可交互内容；两者不可互换 |

## 3. 触发条件设计

| 模式 | 判据 | 说明 |
|:---|:---|:---|
| `icon-only` | 组件无可见文本（`iconOnly` / 仅有图标插槽） | 直接启用；`aria-label` 仍由组件提供，tooltip 只作视觉补充 |
| `overflow` | 有可见文本且 `scrollWidth > clientWidth + 1`（测量元素需 `min-width: 0`；`+1` 为亚像素容差） | **前提**：目标元素已具备 `white-space: nowrap` + 定宽/`max-width` + `overflow: hidden` + `text-overflow: ellipsis`。缺前提的组件（Button / Tag / DataTable / Breadcrumb / Menu）需先补截断样式，否则 `scrollWidth > clientWidth` 恒不成立；另需 `ResizeObserver` + `document.fonts.ready` + slot 变化重测 |
| 不启用 | 有可见文本且未溢出；纯装饰图标；标题类 `title` prop | 避免噪声与双提示 |

**无障碍约束**：tooltip 不能替代 `aria-label` / 可见文本；`iconOnly` 未传 `label` 时 Button 当前不会补 `aria-label` → 接入前须强制 `label` 或加开发期告警；tooltip 文本与 `aria-label` 相同时会重复朗读，需区分内容或纯视觉补充不给 `aria-describedby`；`disabled` 元素不触发 pointer 事件（需外层包裹或 `as-child`）；移动端无 hover，仅键盘 focus 可用；tooltip 内不放交互内容。

## 4. 需要增强的组件清单

### P0（高频 / 纯图标，先做）

| 组件 | 触发面 | 现状 | 模式 |
|:---|:---|:---|:---|
| `CaomeiButton` | 全部（尤其 `iconOnly`；文本按钮长文案） | 原生 `title`（若有）；**当前无截断 CSS**（无 `nowrap` / `max-width` / `ellipsis`）→ U1 需同时补截断样式与视觉基线 | icon-only / overflow |
| `CaomeiToolbar` 按钮 / 链接 | 图标工具条 | `aria-label` | icon-only |
| `CaomeiPaginator` | 首 / 上 / 页码 / 下 / 末 | 仅 `aria-label` | icon-only |
| `CaomeiDialog` / `CaomeiDrawer` | 关闭按钮 | 仅 `aria-label` | icon-only |
| `CaomeiSplitButton` | 菜单触发器（chevron） | 无文本 | icon-only |

### P1（表单与数据展示的截断面）

| 组件 | 触发面 | 模式 |
|:---|:---|:---|
| `CaomeiSelect` / `MultiSelect` / `AutoComplete` / `TagsInput` | 清除按钮（icon-only）；触发器长选中值（已有 ellipsis） | icon-only / overflow |
| `CaomeiDataTable` | 表头 / 单元格长文本 | **当前无 ellipsis**（仅表头 `nowrap`、单元格无定宽裁切）→ 需先补截断样式，overflow 模式才有触发面 |
| `CaomeiTag` | 长标签文本 | 仅 `nowrap`、无 `max-width` → 需先补截断前提；overflow |
| `CaomeiBreadcrumb` | 长路径项 | 无截断声明 → 需先补前提；overflow |
| `CaomeiMenu` / `SubMenu` | 子菜单指示器 / 长菜单项 | 无截断声明 → 需先补前提；icon-only / overflow |
| `CaomeiCalendar` | 上 / 下月导航 | icon-only |
| `CaomeiInputNumber` | 步进按钮 | icon-only |
| `CaomeiPassword` | 显示 / 隐藏切换 | icon-only |
| `CaomeiFileUpload` | 操作按钮 | icon-only |
| `CaomeiColorPicker` | 触发器色块 / 面板内 8 处图标按钮 | icon-only |
| `CaomeiDatePicker` | 触发器图标 | icon-only |
| `CaomeiImage` | 预览 / 关闭按钮 | icon-only |
| `CaomeiAlert` / `CaomeiMessage` | `closable` 关闭按钮 | icon-only |

### P2（低频）

`Avatar`（名称截断）、`Badge`（数字）、`Stepper`（长标题）、`Toast`（关闭按钮）。

### 明确不改

`Alert` / `Card` / `Dialog` / `Drawer` / `Message` / `Accordion` 的 `title` prop（标题语义）；表单 label；纯装饰图标。

## 5. 接入方式（三选一或组合）

| 方案 | 做法 | 优点 | 缺点 |
|:---|:---|:---|:---|
| **A 指令 `v-tooltip`** | 全局指令读取元素 `title` / `aria-label`，按条件挂 Tooltip 并移除原生 `title` | 模板零改动、可一次性迁移存量页面 | 指令需全局 Provider；动态文本 / SSR / `disabled` 处理复杂；类型与条件配置弱 |
| **B 组件内建 `tooltip` prop** | Button 等组件接受 `tooltip?: boolean \| string \| { content?: string, mode?: 'auto' \| 'always' }`，内部包 `CaomeiTooltip` | 类型安全、条件精确、可测 | 每个组件都要改；`title` 透传语义变化需文档 |
| **C 组合（推荐）** | 共享 `useOverflowTooltip` + `CaomeiTooltipText` 包装；Button / Toolbar / Paginator 等 P0 组件内建；其余用包装组件 | 覆盖面与成本平衡 | 需要一次 API 设计（`tooltip` prop 形态） |

**推荐 C**：先定义 `tooltip` prop 契约（`boolean | string | { content?: string, mode?: 'auto' | 'always' }`，`true` 时取 `aria-label` / 文本），Button 首发；P0 其余组件复用同一 composable；指令方案留作后续批量迁移的可选路径。

## 6. 建议批次（未登记）

| 批次 | 内容 | 规模 |
|:---|:---|:---|
| **U1** | `useOverflowTooltip` + `CaomeiTooltip` 集成契约 + **Button**（icon-only / overflow + 截断 CSS + 视觉基线） | 3 ~ 5 文件 + 单测 |
| **U2** | P0 其余：Toolbar / Paginator / Dialog·Drawer 关闭 / SplitButton | 5 ~ 8 文件 |
| **U3** | P1 表单与数据展示（Select 族 / DataTable / Tag / Breadcrumb / Menu / Calendar / InputNumber / Password / FileUpload / ColorPicker / DatePicker / Image / Alert·Message） | 10+ 文件，建议拆两条 |
| **U4** | 文档站与下游 Provider 放置、示例与迁移说明 | 文档 + 示例 |

## 7. 风险与验收

1. **双提示**：接入组件必须移除原生 `title`（或在文档声明不再透传），否则系统 tooltip 与组件 tooltip 同时出现。
2. **溢出检测的时机**：字体加载、容器 resize、slot 文本变化、`v-if` 挂载；需 `ResizeObserver` + `fonts.ready` + `nextTick`，并提供 SSR 安全降级（服务端不显示）。
3. **`disabled` 元素**：原生 `disabled` 不触发 pointer 事件，Tooltip 触发器需包一层可接收事件的元素；这是 Radix/Reka 的已知边界。
4. **移动端**：无 hover，tooltip 只在键盘 focus 时出现；不得把关键信息只放在 tooltip 里。
5. **Provider 缺失**：组件内建 tooltip 后，下游未放 `CaomeiTooltipProvider` 的页面会**运行时抛错**——需内建 Provider 兜底或列为迁移前置。
6. **验收**：溢出时显示 / 未溢出不显示（面板不挂载、无 `aria-describedby`）/ icon-only 显示 / `iconOnly` 无 `label` 的告警 / disabled 行为 / 键盘 focus / 无原生 `title` 双提示 / 可访问名不变；真实 Chromium 断言（几何 + `aria-describedby` + 无 `title` 属性）；下游显式 `title` 失效需迁移说明。

## 8. Review Gate

- **audit-depth**：R1 / R2 `standard`（只读分析 + 落点评估，≤10 分钟），R3 `quick`（只复核文本残留）。
- **R1**（`standard`）：`Reject`（2 blocker / 6 warning / 5 suggest）——DataTable 与 Button 的「已有截断」与源码不符（均无 ellipsis / 截断 CSS）；透传路径、P1 漏项、overflow 前提、`iconOnly` 无 `label`、prop 形态、§8 占位等已同批处置。
- **R2**（`standard`）：`Reject`（0 blocker / 3 warning）——§1 透传结论、方案 C 契约、U3 清单三处未同步；已订正。
- **R3**（`quick`）：`Pass`（0 blocker / 0 warning）。
- **复查基线**：本记录 §1 / §3 / §4 / §5 / §6 / §7；`docs/design/governance/index.md` 该条目摘要。
