# M1-3 `DataTable` 行展开（expander 列 + `#expansion`）交付与验证记录

> 阶段：Phase 13（组件能力补齐与 dependfix 迁移解阻）→ M1 `DataTable` 能力补齐（dependfix 迁移关键路径）→ M1-3 行展开。
> 范围依据：[下一阶段范围评估 §6 / §11](./2026-09-23-next-stage-scope-evaluation.md)；条目登记：[待办事项](../../plan/todo.md) Phase 13 M1-3；前置条目见 [M1-1 记录](./2026-09-23-m1-1-row-grouping.md) / [M1-2 记录](./2026-09-23-m1-2-expandable-row-groups.md)。

## 1. 范围与目标

为 `CaomeiDataTable` 补**行展开**，**API 命名对齐 PrimeVue**（用户裁定 D2）：`expander` 列 + `v-model:expandedRows` + `#expansion` 槽 + `rowExpand` 事件；受控与自持都支持（用户裁定 D3：受控优先、缺省自持）。

非目标：多列排序（M1-4）、`rowExpandMode`（单行互斥展开）、展开区动画。

## 2. API 契约（对齐 PrimeVue 的命名映射）

| PrimeVue | 本库 | 说明 |
| :--- | :--- | :--- |
| `<Column expander>` | `columns` 数组项 `{ key, expander: true }` | 该列单元格渲染切换按钮、表头**始终留空**（多个 `expander` 列仅首个生效） |
| `v-model:expandedRows`（+ `dataKey`） | 同名（`string[]` 行 key，口径同 `rowKey`） | 受控优先、缺省自持（初始为空 = 全部收起） |
| `#expansion="slotProps"` | `#expansion="{ data, index }"` | `data` 语义对齐；`index` 为显示序号 |
| `@row-expand` / `@row-collapse` | 同名 | 载荷 `{ originalEvent, data }`，`data` 为该行数据 |
| `expandButtonAriaLabel`（`locale.aria.expandRow` / `collapseRow`） | `expandRowLabel` / `collapseRowLabel`（默认取语言文案） | 本库按动作取名（见 §3） |

行为口径：展开行 `<tr class="caomei-data-table__row-expansion" role="row">` + 单个跨列单元格（colspan = 全部列数，含选择列与展开列）；**未提供 `#expansion` 槽时无可见展开区**（展开态与事件仍生效，与上游一致）。

## 3. 有意差异（逐条）

1. **`expandedRows` 只支持行 key 数组**（`rowKey` 口径）。PrimeVue 另有「行对象数组」与 `{ [key]: true }` 记录两种形态。
2. **展开按钮的可访问名按动作取名**：PrimeVue 的 `expandButtonAriaLabel` 在**展开态取 `aria.expandRow`、收起态取 `aria.collapseRow`**（一方源码 `BodyCell.vue#expandButtonAriaLabel`），与按钮实际动作相反；本库展开态用「收起行」、收起态用「展开行」。
3. **展开行横跨全部数据列、不参与冻结列吸边**（同 M1-1 分组标题行）。
4. **`#expansion.index` 为显示序号**（口径同 `#groupheader`，与 `#cell-{key}` 的数据源索引不同）。
5. 未提供 `#expansion` 槽时无可见展开区（与上游一致，已在组件页显式声明）。
6. 补 `aria-controls` 指向展开行，且**仅在展开行实际渲染时输出**（上游始终输出，收起态会引用不存在的 id）。

## 4. 实现落点

- `src/components/data-table/types.ts`：`DataTableColumn.expander`、类型 `DataTableRowExpandEvent<T>` / `DataTableExpansionSlotProps<T>`、props `expandedRows` / `expandRowLabel` / `collapseRowLabel`（含中文 JSDoc + `@en`）。
- `src/components/data-table/index.ts`：导出两个新类型。
- `src/components/data-table/data-table.vue`：
  - `expanderColumnKey` / `isExpanderColumn`（首个 `expander: true` 的列）；
  - 受控状态机 `isRowExpansionControlled` / `controlledExpandedRows` / `internalExpandedRows` / `currentExpandedRows`（watch `deep: true`，与 M1-2 分组展开同构）；行 key 取 tanstack 行 id（即 `rowKey` 解析结果，与选择态同一套标识）；
  - `toggleRowExpansion(originalEvent, rowKey, row)`：受控只抛事件、自持同时更新；两模式都抛 `update:expandedRows` + `rowExpand` / `rowCollapse`；
  - `expansionRowId(rowIndex)` = `${useId()}-expansion-${row.index}`（用**数据源行序**而非行 key，避免 key 含空格等字符产生非法 id）；`expanderControlsId(rowKey, rowIndex)` 仅在展开行实际渲染时返回 id；
  - 表头：`<template v-if="!isExpanderColumn(...)">` 单点守卫（表头文本 / 排序按钮 / 列插槽三条路径统一收敛）；
  - 模板：数据行分支改为 `<template v-else>` 包裹「数据行 + 条件展开行」；数据行单元格新增展开按钮分支；
  - 样式：`.caomei-data-table__row-expander`（inline-flex + `focus-visible` 描边）、`.caomei-data-table__row-expansion` 与跨列单元格（消费 `--caomei-data-table-expansion-bg`）。
- `src/locale/*`：`table` 命名空间新增 `expandRow` / `collapseRow`（5 语种）→ 各 75 条；同步 `scripts/governance/check-locale-keys.test.mjs` 基准键数快照（73 → 75）与 `docs/components/locale.md`（中英）台账。
- `src/components/data-table/data-table.expansion.test.ts`（新增，15 条）：列结构与表头留空 / 自持往返与双向事件 / `aria-controls` ↔ 展开行 id 与收起态不输出 / 多行独立 / 受控不采纳与回写 / 原地变更后退回自持 / 无槽时行为 / 槽作用域 / 无 `expander` 列不生效 / 表头留空（提供 `header` 或 `sortable` 亦然） / 多个 `expander` 仅首个生效 / label 覆盖与 colspan 计入选择列 / 分组 + 展开相对位置 / 空态。
- 文档：中英组件页「行展开」节 + 列定义表 `expander` 行 + 无障碍段 + 样式定制表 + 迁移映射 4 行 + 中英示例 `row-expansion.vue` + [设计规范 §7](../design-spec.md) 映射。

## 5. 验证与证据

### 5.1 质量门（最终 revision，快照 2026-09-23）

- `pnpm lint:check` / `pnpm lint:css:check` / `pnpm lint:md:check`：通过。
- `pnpm typecheck` / `pnpm typecheck:docs`：通过。
- `pnpm test`：**85 文件 / 1718 tests passed**（M1-2 基线 1702；本条目新增 1 文件 / 15 tests，另守卫基准 73 → 75）。
- `pnpm check:locale-keys`：基准 zh-CN 25 命名空间 / **75** 条；5 语种各 75 条。
- `pnpm docs:check`：9 段链全绿（integrity 243 md / links 242 md / structure 204 页 / config-links 158 条 / i18n-parity 58 对 / version / showcase 12 项 / line-count / i18n）。
- `pnpm check:design` / `pnpm test:a11y`（54 tests）：通过。
- `pnpm build` + `pnpm check:build`：通过（8 个 exports 产物齐全）。
- `pnpm capture:styles`：**239 项逐属性 0 差异** vs 冻结基线（未使用 `expander` 列时的零漂移硬门禁）。

### 5.2 V 阶段（`@ui-validator`，真实 Chromium，两轮）

第一轮（修复前）10 项全通过：初始受控展开 1 行且 `aria-expanded` / `aria-label` / chevron 三态一致；往返与提示文案同步；嵌套 `<ul>` / `<li>`；三按钮 `aria-controls` 与展开行 id 全等；Tab 第 4 次命中 + Enter·Space 切换且四步焦点保留；`th=3`（`["","订单号","金额"]`）、数据行 `td=[3,3,3]`、展开单元格 `colspan="3"` 覆盖表格内宽；四档 1440 / 1024 / 768 / 375 溢出 0/0；亮暗实测；中英两页四类噪声全 0；无回归。

第二轮（修复点复验，§8 的 W1 / S2 落地后）：**全通过**——收起态按钮 `aria-controls` 属性存在性 `[true,false,false]`（值 `["v-6-expansion-0", null, null]`）、展开后两按钮分别匹配 `["v-6-expansion-0","v-6-expansion-1"]`、再收起后属性重新消失；展开列 `th` 文本为空且无 `.caomei-data-table__sort`；往返 / 嵌套内容 / `td` 数 / `colspan` / Tab + Enter·Space + 焦点保留 / 四档溢出 0/0 / 亮暗 / 同页分组无变化 / 中英噪声 0 全部复现通过。

未覆盖边界：自持模式与「提供 `header` / `sortable` / 多个 `expander` 列」等组合（示例未覆盖，由单测覆盖）；冻结列 + 行展开同用、选择列 + 行展开的浏览器实景、展开行参与斑马纹 `nth-child` 计数（后者已在组件页 `striped` 说明登记）；像素级美观度比对（验证通道无视觉能力，结论仅基于几何 + DOM/ARIA + 计算样式）。

## 6. 规模

**21 文件 / +936 −79**（唯一口径；复算命令 `git diff 5a9603b --numstat` 求和，base = M1-2 末提交 `5a9603b`（持久 ref），快照 2026-09-23。其余载体不复写该数字，需要时引用本节）。

构成（约值）：库代码面约 290 行（`data-table.vue` / `types.ts` / `index.ts`）+ 5 语种键 12 + 守卫不变量测试 2 + 单测语料约 300 + 双语示例 180 + 组件与设计文档约 65 + 治理载体约 100。

**超阈值说明**（文件数 21 超「建议 10 文件」、行数超「建议 800 行新增」）：

1. **13 个文件为机械性组成**——6 个 2 行级 locale 键追加、1 个守卫不变量测试快照（+2/−2）、2 个 1 行级内置文案台账、2 个双语示例、2 个双语组件页。
2. **不可拆分**——`check-locale-keys` 强制 5 语种结构对等、`docs:check:i18n-parity` 要求中英页成对；拆开提交会使中间提交的门禁红灯。
3. **行数超出主要来自单测语料（约 300 行 / 15 条断言）与双语示例（180 行）**，而非库代码；只看 `src/` 非测试面约 290 行，远低于 800 行。M1 三个条目一致以「断言密度换下游改写量」为取向（M1-1 12 文件 / +768、M1-2 22 文件 / +664）。

审计方（第 1 轮）按 18 文件 / +737 −50 明确接受该理由；本记录定稿后按同一命令重算为 21 文件 / **+936 −79**（增量 = 治理记录与索引 / 进度行，以及 W1 / S2 修复补的 3 条断言）。按交付面拆三次提交（实现与 i18n / 文档与台账 / 治理载体）。

## 7. 结论

M1-3 已交付：行展开在受控与自持两种模式下均有断言，展开按钮为原生 `<button>`、带 `aria-expanded` / `aria-controls`（不悬空）与可访问名、键盘可达且切换后焦点不丢失；未使用 `expander` 列时既有行为与计算样式零漂移。Review Gate 结论见 §8。

## 8. Review Gate

**第 1 轮（`standard` 档 / 时间盒 ≤ 10 分钟）：`Pass`（0 blocker / 1 warning / 5 suggest）**。实测用时 **7 分 21 秒**（宿主时钟 `2026-09-23T13:25:14+08:00` → `13:32:35+08:00`），未超时间盒。

| 编号 | 级别 | 内容 | 处置 |
| :---: | :--- | :--- | :--- |
| W1 | warning | 「expander 列表头留空」此前只在 `tableColumns` 的默认表头路径生效：`headerTitle` 读 `props.columns`，故 `expander + sortable` 会渲染排序按钮并回退出 `key` 文本；多个 `expander` 列时第二列出现「空表头 + 正常内容」的静默错配 | 改为**模板层单点守卫**（`<template v-if="!isExpanderColumn(...)">` 覆盖表头文本 / 排序按钮 / 列插槽三条路径），`tableColumns` 恢复原样；文档与 `expander` 类型注释补充「表头始终留空（即使提供 `header` / `sortable`）；多个 `expander` 列仅首个生效」；补 2 条断言（提供 `header` + `sortable` 时表头仍为空且无排序按钮；多个 `expander` 仅首个渲染按钮） |
| S1 | suggest | 文档称「缺省 `rowKey` 时排序 / 分页会使展开态错位」过宽 | 已按 `createCoreRowModel` 的 `row.index` 语义更正为「**整体替换 `data`（服务端分页 / 懒加载 / 数据刷新）** 才会错位；排序与客户端分页只重排行引用」（中英） |
| S2 | suggest | 收起态 / 无槽时 `aria-controls` 指向不存在的 id（悬空引用） | 已改为条件输出（`expanderControlsId()` 仅在展开行实际渲染时返回 id）；补 1 条断言（收起态无该属性、展开后与展开行 id 相等），并按 [AI 协作规范 §3](../../standards/ai-collaboration.md) **刷新 V 阶段证据**（第二轮复验） |
| S3 | suggest | 展开行 `<tr>` 的 `role="row"` 与隐式角色重复 | **未采纳**：与上游 PrimeVue 及 M1-1 分组标题行保持一致（冗余但合法），改动会波及已交付条目 M1-1 的断言与记录、收益为零 |
| S4 | suggest | 提交切分参考 M1-2 先例 | 已采纳：按交付面拆三次提交（实现与 i18n / 文档与台账 / 治理载体） |
| S5 | suggest | `check-locale-keys.test.mjs` 基准键数双处硬编码 | **未采纳**：两处为「基准语」与「逐语种」两条独立断言，抽成单一常量会削弱其相互印证作用；维持现状 |

审计方对粒度的明确判断：**接受超阈值理由、不因此 Reject**（行数 < 800；13 个增量为 2 行级或双语成对载体，受 5 语种对等与中英 parity 门禁约束不可拆分）。

修复点已同批修正并复跑质量门（`pnpm test` 85 文件 / 1718 tests、`capture:styles` 239 项 0 差异、`docs:check` 9 段链全绿）与 V 阶段聚焦复验，按既有惯例记为「**已修复未复审**」（第 1 轮即为 `Pass`、无 blocker）。
