# Phase 27 M3-1 PrimeVue 迁移经验回收交付记录

> 创建时间：2026-11-04
> 依据：[Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §2 M3-1；[从 PrimeVue 迁移](../../guide/primevue-migration.md)（中英）。
> 定位：把 dependfix 的 PrimeVue → caomei-ui 实测迁移经验回收到指南，并将能力缺口与文档缺口分开登记。
> 边界：不实现库侧能力、不决定 `v-tooltip` 指令形态、不改 [设计规范 §7](../design-spec.md) 映射与任何组件实现。

## 1. 交付范围

- **中英指南**：`docs/guide/primevue-migration.md` / `docs/i18n/en-US/guide/primevue-migration.md`。
  - 「常见陷阱」新增 10 行：Tooltip 接入 / 表格受控状态回写 / 表格行状态与分页基准 / 表头全选作用域 / 表格密度与表级结构 / 选择器宽度与包裹层 / 表单控件选择器与事件时序 / CSS 选择器与浮层事件 / 提示条拆分与外观 / ScrollPanel。
  - 既有「表格排序模型」「表格分组与行展开」两行补强（不新增重复行）。
  - 「逐组件对照入口」补齐 §7 已登记但表中缺失的 5 个条目：Alert / Tooltip / Menu / Breadcrumb / Chart；新增「高级组件」分组行。
  - 「迁移后自检」新增 9 项：表格受控回写、行状态与分页、表头全选作用域、密度与表级结构、选择器宽度、表单选择器与事件时序、CSS 选择器与浮层事件、Tooltip Provider、Message / Alert 差异。
  - 表下新增「经验来源」注记，指向 dependfix 迁移记录 §15；该注记只作取证，不构成映射事实源。
- **未改**：`src/**`、`test/**`、`docs/design/design-spec.md`、组件页与 API 元数据。
- **计数不变**：组件目录 **57**、根导出组件名 **96**、包根导出名 **330**、API 面 **517 / 86 / 71 / 18**、`exports` **13**、token 有效冻结面 **381**、locale 10 语 / 28 命名空间 / 80 键、画廊 16 项 / 7 分组、§11 登记 56 成员。

## 2. 经验取证

| 指南条目 | 回收内容 | 取证位置 |
| :--- | :--- | :--- |
| Tooltip 接入 | Provider 放在应用根部；`v-tooltip` 指令改为显式触发器组合；方向改 `side` + `align`；`showDelay` → `delayDuration`；无独立隐藏延迟 | caomei-ui §7 `Tooltip 迁移映射`；[Tooltip 组件页](../../components/tooltip.md)；[Phase 24 M4-2 记录](./2026-10-15-phase24-m4-2-tooltip.md) |
| 表格受控状态回写 | `multiSortMeta` / `expandedRowGroups` / `expandedRows` / `selection` / `page` 必须在 `@update:*` 回写，否则内建控件无效果 | dependfix [`caomei-ui-migration.md`](https://github.com/dependfix/dependfix/blob/master/docs/design/governance/caomei-ui-migration.md) §15.9 第 3 条、§15.10 第 3 条、§15.11 第 2 / 3 条；commit `73945a87` / `69ecad10` / `5019c9f2` |
| 表格行状态与分页基准 | `expandedRows` 为 `string[]` 行 key；`selection` 载荷 `T \| T[] \| null`；`lazy` 需显式 `rowKey`；`first`（0 基）→ `page`（1 基） | 同上 §15.10 第 4 / 5 条、§15.11 第 2 / 3 / 4 条；commit `69ecad10` / `5019c9f2`；类型面见 §7 `DataTable 迁移映射` 与 `src/components/data-table/types.ts` |
| 表头全选作用域 | 表头全选只作用当前页；跨页选择由父级 `selection` 聚合 | 同上 §15.16 第 2 条、§15.17 第 1 条；commit `fdbb4e57` / `9bc7c677` |
| 表格密度与表级结构 | 无 `size` prop；密度用页面级 CSS 覆盖 `.caomei-data-table__th` / `__td` 内边距；无表级 `#header` / `#footer` 插槽 | 同上 §15.9 第 5 条、§15.10 第 8 条、§15.11 第 6 条；commit `69ecad10` / `5019c9f2` |
| 表格排序模型（补强） | 不为复刻逐列 `default-sort-order` 全局开启 `sortDescFirst`；默认方向用 `multiSortMeta` 初值承载 | 同上 §15.10 第 1 条；commit `69ecad10` |
| 表格分组与行展开（补强） | 分组列在数据行保留空白占位；需要列数一致时按 `groupRowsBy` 过滤 `columns` | 同上 §15.10 第 2 条；commit `69ecad10` |
| 选择器宽度与包裹层 | `20rem` 上限；`--caomei-select-max-width: none` 写在字段外层或祖先；全局覆盖用 `:root:root` | 同上 §15.12 第 3 条；commit `f9f1a059` |
| 表单控件选择器与事件时序 | Checkbox 的可点击控件是 `button[role="checkbox"]`（`.caomei-checkbox__control`），组件根仍是 `div.caomei-checkbox`；Input / Textarea 的 `@input` 先于 v-model 写回 | 同上 §15.12 第 3 条；commit `f9f1a059` |
| CSS 选择器与浮层事件 | 多词组件逐词 kebab-case；Dialog / Drawer / ConfirmDialog / Popover / DropdownMenu 等无裸根类，用 `__content` / `__overlay`；Toast / Select 等仍有根类或触发器类；排序状态用 `th[aria-sort]`；Drawer 只 emit `update:open` | 同上 §15.8、§15.12 第 3 条；commit `73945a87` / `f9f1a059` |
| 提示条拆分与外观 | `Message` + `Alert` 拆分；Alert 默认不进 live region；soft 档无可见边框 | 同上 §15.12 第 3 条、§15.13 第 6 条；commit `f9f1a059` / `406fd1f2` |
| ScrollPanel | 无对应组件；改用原生滚动容器 + CSS | 同上 §15.3、§15.11 第 5 条；commit `5019c9f2`；[Backlog](../../plan/backlog.md) §1.2 |
| 入口表补齐 | Alert / Tooltip / Menu / Breadcrumb / Chart 均在 §7 有映射但原表未列 | caomei-ui §7 `Alert` / `Tooltip` / `Menu` / `Breadcrumb` / `Chart 迁移映射`；对应组件页；[Phase 24 M4-2](./2026-10-15-phase24-m4-2-tooltip.md) / [M4-3](./2026-10-15-phase24-m4-3-navigation-skeleton.md) / [M4-4](./2026-10-15-phase24-m4-4-alert.md) / [M5-1](./2026-10-15-phase24-m5-1-chart-wrapper.md) / [M5-2](./2026-10-15-phase24-m5-2-chart-theme-locale.md) 记录 |

## 3. 能力缺口（库侧，未在本条实现）

| 缺口 | 影响 | 现状 / 取证 | 本条处置 |
| :--- | :--- | :--- | :--- |
| `DataTable` 无表级 `#header` / `#footer` 插槽 | 表级操作区与标题需移到表格外 | §7 `DataTable 迁移映射` 与组件页已声明；dependfix §15.11 第 6 条 | 仅在指南登记，不改组件 |
| `DataTable` 无 `#paginator` 模板 / 分页报表 | 页码报表需在分页器旁自渲染 | §7 `Paginator 迁移映射` 已声明；dependfix §15.11 第 3 条 | 仅在指南登记，不改组件 |
| `DataTable` 无 `size` prop | 密度只能用 CSS 覆盖 | §7 `DataTable 迁移映射` 与组件页已声明；dependfix §15.9 第 5 条 | 仅在指南登记，不改组件 |
| `ScrollPanel` 无对应组件 | 日志区等需原生滚动容器 + CSS | §7 无该条映射；dependfix §15.3、§15.11 第 5 条；Backlog §1.2 已裁定「不自研」 | 仅在指南登记，不新增组件 |
| `Tooltip` 无独立隐藏延迟、无指令式挂载 | `hideDelay` 类需求需改交互或等待后续能力 | §7 `Tooltip 迁移映射` 与组件页已声明 | 仅登记；**指令形态不在本条决定** |
| `Drawer` 无 `hide` 事件 | 依赖 `@hide` 的清理逻辑需桥接 | §7 `Drawer 迁移映射` 已声明；dependfix §15.12 第 3 条 | 仅在指南登记，不改组件 |
| `Select` 无 `filter` / `loading` | 可搜索单选改 `AutoComplete`；加载态需外部表达 | §7 `Select` 家族映射已声明；dependfix §15.12 第 3 条 | 仅在指南登记，不改组件 |

## 4. 有意差异（已声明，不视为缺口）

| 差异 | 说明 | 取证 |
| :--- | :--- | :--- |
| DataTable 表头全选只作用当前页 | 与 PrimeVue「过滤后整表」不同；跨页由父级选择栏承载 | §7 `DataTable 迁移映射`；dependfix §15.16 / §15.17 |
| Message / Alert soft 档无可见边框 | 与 PrimeVue 浅底 + 同色边框不同；已由下游接受 | §7 `Message` / `Alert 迁移映射`；dependfix §15.12 第 3 条、§15.13 第 6 条 |
| Tooltip 提示只作描述、不进入可访问名 | `role="tooltip"` 落在视觉隐藏元素上，`aria-describedby` 指向它 | §7 `Tooltip 迁移映射`；`docs/components/tooltip.md` |
| 分组字段列保留空白占位 | PrimeVue 省略该列导致与表头错位；本库保留占位以维持列对齐 | §7 `DataTable 迁移映射`；dependfix §15.10 第 2 条 |

## 5. 文档缺口（本条已补 / 仍留）

**已补**

- 入口表缺 `Tooltip`：已补；同批回扫出 `Alert` / `Menu` / `Breadcrumb` / `Chart` 四个同类漂移并一并补齐。
- 陷阱表缺表格受控回写、行状态类型、分页基准、表头全选作用域、密度与表级结构、选择器宽度、表单选择器与时序、CSS 选择器与浮层事件、Message / Alert 拆分、ScrollPanel：已补 10 行。
- 自检清单缺上述验证项：已补 9 项。
- 指南未标注经验来源：已在表下加注 dependfix 迁移记录 §15 的取证入口。

**仍留**

- `v-tooltip` 指令形态（是否提供指令 + 方向修饰符）未决定；本条只记录现有声明式映射，符合登记边界。
- `Chart` 的 ECharts / Chart.js 内核差异只在入口表出现，细节仍指向 §7 与组件页；如升级护航需要，可在后续条目展开。
- 入口表与 §7 的成员集合没有自动对账守卫；本条为人工回扫，后续可评估机检（当前不新增高误报守卫）。
- `Form` / `Row` / `Col` / `RichTextEditor` 未进入入口表，原因是 §7 无对应 PrimeVue 映射；`Form` 有独立迁移节，按指南脚注由组件页承接。
- `docs/design/components.md` §5 仍把 `ScrollArea` 列为后续候选，与 Backlog §1.2 的「不自研」裁定尚未同步；本条不改该文件，登记为后续文档同步项。

## 6. 验证证据

- `pnpm docs:check` → **exit 0**（含 i18n parity、链接、锚点、结构、示例引用；中英指南 5 个 H2 对齐）。
- `pnpm lint:md:check` → **exit 0**。
- `pnpm governance:check` → **exit 0**（含治理记录索引、计数、规划编号）。
- `pnpm docs:build` → **exit 0**（build complete，无 dead link / 渲染错误）。
- `pnpm verify` → **exit 0**（最终复跑：146 个测试文件 / 2871 passed；含 lint、typecheck、build、docs:build 与 governance:check）。

## 7. Review Gate

- **audit-depth**：`standard`（中英指南内容 + 跨载体取证 + 缺口分类；时间盒 ≤ 10 分钟）。
- **R1（`standard`）：`Reject`**（1 blocker / 4 warning / 3 suggest）。已修复：ScrollPanel 取证指针改为 §15.3 / §15.11 第 5 条 + commit `5019c9f2`；密度 / CSS 选择器 / 入口表取证重指；R1 修复期间 `todo.md` 暂恢复「待执行」（R2 通过后已置「已完成」）；指南脚注限定为「§7 有映射的组件页」；浮层根类表述限定到具体组件；Checkbox「根」改为「可点击控件」；`ScrollArea` 与 Backlog 的未同步登记为后续文档项；经验来源标注取证快照。
- **R2（`quick` delta）：`Pass`**（0 blocker / 0 warning / 0 阻塞 suggest）。R1 的 1 blocker / 4 warning / 3 suggest 全部关闭；定向复查记录 §2 / §3 / §5 / §7 与中英指南相关行，`docs:check` / `lint:md:check` / `governance:check` 均 exit 0。
- **复查基线**：HEAD `d6ae100` + 当前工作区。

## 8. 未覆盖边界

- 未改任何组件 / 类型 / 样式 / 测试 / 构建产物；本批无运行时行为变化。
- 未改 [设计规范 §7](../design-spec.md)；指南新增内容不构成第二事实源。
- 未对 dependfix 仓库做任何改动；取证为其治理记录与提交的只读引用。
- 未发布版本；1.1.0 相关口径仍由发布条目承接。
