# M1-1 `DataTable` 行分组（subheader）交付与验证记录

> 阶段：Phase 13（组件能力补齐与 dependfix 迁移解阻）→ M1 `DataTable` 能力补齐（dependfix 迁移关键路径）→ M1-1 行分组。
> 范围依据：[下一阶段范围评估 §6 / §11](./2026-09-23-next-stage-scope-evaluation.md)；条目登记：[待办归档](../../plan/todo-archive.md) Phase 13 M1-1。

## 1. 范围与目标

为 `CaomeiDataTable` 补行分组（subheader）能力，**API 命名对齐 PrimeVue**（用户裁定 D2）：`rowGroupMode="subheader"` + `groupRowsBy` + `#groupheader` 槽。

非目标：`rowGroupMode="rowspan"`（行合并）、`#groupfooter`（分组页脚）、虚拟滚动、列拖拽 / 列固定增补。

## 2. API 契约（对齐 PrimeVue 的命名映射）

| PrimeVue | 本库 | 说明 |
| :--- | :--- | :--- |
| `rowGroupMode="subheader"` | 同名 | 仅 `subheader` 受支持（`DataTableRowGroupMode` 单值联合） |
| `groupRowsBy` | 同名 | 支持 `a.b` 点号嵌套路径；取值口径同列 `accessor` 的**点号路径形态**（函数 `accessor` 不参与分组取值） |
| `#groupheader="slotProps"` | `#groupheader="{ data, index, groupValue }"` | `data` / `index` 语义对齐；`groupValue` 为本库附加（免去消费方自行取值）。未提供插槽时回退渲染分组键取值（按 JS 默认字符串化） |
| `#groupfooter` | **不实现** | 未纳入本轮范围 |

行为口径：按**连续同值**切分（对齐 PrimeVue `shouldRenderRowGroupHeader`），只在当前渲染行序（排序 + 分页后的切片）上计算，跨页同值行各自出现分组标题行；分组标题行为 `<tr class="caomei-data-table__row-group" role="row">` + 单个跨列单元格，横跨全部数据列。

## 3. 有意差异（逐条）

1. **分组列在数据行渲染空白占位单元格**，而非像 PrimeVue 那样直接不渲染该单元格。PrimeVue 的做法使数据行整体左移一列、与表头错位（[primefaces/primevue#6496](https://github.com/primefaces/primevue/issues/6496)，master 仍为 `colspan = columnsLength - 1`）；本库保留占位以维持列对齐（复验：表头与数据行逐列 x 区间完全一致）。
2. **分组标题行不参与冻结列吸边**：单一跨列单元格无法逐列 `position: sticky`。
3. `#groupfooter` 与 `rowGroupMode="rowspan"` 不实现。

## 4. 实现落点

- `src/components/data-table/types.ts`：新增 `DataTableRowGroupMode`、`DataTableRowGroupSlotProps<T>`、props `rowGroupMode` / `groupRowsBy`（含中文 JSDoc + `@en`）。
- `src/components/data-table/index.ts`：导出两个新类型。
- `src/components/data-table/data-table.vue`：
  - `isSubheaderGrouped` / `hiddenGroupColumnKey` / `displayEntries`（分组标题行与数据行交错的渲染条目）/ `isGroupColumn` / `formatGroupValue`；
  - 模板改为 `<template v-for="entry in displayEntries">` 单路径渲染：分组条目渲染标题行、数据条目渲染数据行（含单元格空白占位判断），未开启分组时 `displayEntries` 退化为逐行 `row` 条目，DOM 结构与既有行为一致；
  - 新增 `.caomei-data-table__row-group > .caomei-data-table__row-group-cell` 样式（消费 `--caomei-data-table-group-bg`，默认 `--caomei-color-bg-elevated`）。
- `src/components/data-table/data-table.grouping.test.ts`（新增，10 条）：连续同值切分 / 空白占位与列对齐 / 缺省零漂移（含未分组态逐行单元格文本快照） / 运行期切换分组键与移除 `groupRowsBy` / 空串与指向不存在字段的边界 / 点号嵌套路径 / `#groupheader` 作用域 / `null` 值缺省文本 / 分页与选择列协同 / 排序序切分 / 空态 colspan。
- 文档：中英组件页「行分组」节（含迁移映射与有意差异说明）+ 中英示例 `grouping.vue` + [设计规范 §7](../design-spec.md) DataTable 映射段。

## 5. 验证与证据

### 5.1 质量门（最终 revision，快照 2026-09-23）

- `pnpm lint:check` / `pnpm lint:css:check` / `pnpm lint:md:check`：通过。
- `pnpm typecheck` / `pnpm typecheck:docs`：通过。
- `pnpm test`：**84 文件 / 1691 tests passed**（基线 83 / 1681；新增 1 文件 / 10 tests。口径：`pnpm test` 汇总行）。
- `pnpm build` + `pnpm check:build`：通过（8 个 exports 产物齐全，入口可加载）。
- `pnpm docs:check`：9 段链全绿——`check-docs-integrity` **242 md**（`git ls-files` 枚举，含本记录）/ `check-links` **241 md** / `check-docs-structure` **203 页** / `check-config-links` 158 条 / `check-i18n-parity` 58 对 / `check-site-version` / `check-showcase-registry` 12 项 / `check-line-count` / `check-i18n`。
- `pnpm check:design` / `pnpm test:a11y`（54 tests）：通过。
- `pnpm capture:styles`：**239 项逐属性 0 差异** vs 冻结基线（新能力默认关闭的零漂移硬门禁）。

### 5.2 V 阶段（`@ui-validator`，真实 Chromium，本轮两遍）

第一遍（修复前）：9 项中 8 项通过，暴露 **O1**——分组列数据单元格被直接不渲染，数据行整体左移一列、与表头错位（「状态」数据落在「地区」表头下）。

修复后复验（最终 revision）：8 项全通过，实测值如下。

| 项 | 实测 |
| :--- | :--- |
| 列对齐（O1 修复判定） | 1440px 下逐列 x 区间**完全一致、0 偏差**：地区 `[405.50, 594.73]`、状态 `[594.73, 833.95]`、金额 `[833.95, 1050.50]`，表头与 5 行数据单元格同值（`allContained=true`，`mismatches=[]`）；英文页同构 |
| 空白占位 | 每行 `td` 数 `[3,3,3,3,3]` = 表头 `th` 数 3；分组列单元格文本 `""`，其余列逐行对应（如 `["","已完成","430"]`） |
| 分组标题行 | 3 组 `华北 / 华东 / 华南`（按示例预排序），`colspan="3"`，`role="row"` |
| 分组键切换 | `aria-pressed` 双向切换并还原；切「状态」后 3 组 `处理中 / 已取消 / 已完成` |
| 英文页等价 | th 3 / 每行 td 3 / colspan 3 / 列对齐一致 |
| 响应式 | 1440 / 1024 / 768 / 375 四档文档级与容器级横向溢出均 **0 / 0** |
| 主题 | 分组行背景亮 `#f7f7f8` / 暗 `#17171a`，与 `--caomei-color-bg-elevated` token 一致 |
| 控制台噪声 | 中英两页 console error / pageerror / HTTP ≥ 400 / requestfailed 均 **0** |
| 无回归 | 同页 demo 容器 10、`<table>` 19、无 error overlay；抽查 `/components/button` 噪声 0 |

未覆盖边界：行展开与分组同用、可折叠分组（未实现）、冻结列与分组同用、带选择列时的 `colspan=4` 实景、分组列自定义 px 宽度下的占位宽度保持、像素级美观度比对（验证通道无视觉能力，结论仅基于几何与计算样式断言）。

### 5.3 观察项（接受，不修订）

- 亮色下分组标题行背景（`#f7f7f8`）与数据行背景（`#f6f6f7`）每通道仅差 1/255，区分主要来自 `font-weight: 600` 与底部边框。判定为**可接受**：① 与表头（`--caomei-data-table-head-bg` = `--caomei-color-bg-elevated`）保持同一视觉层级；② 本阶段明确「不改任何 token 色值」，色值调整须另行裁定。

## 6. 规模

**12 文件 / +768 −42**（口径：`git diff --cached --numstat` 求和，范围 = 实现 3 + 测试 1 + 文档 6 + 治理载体 2，快照 2026-09-23；中英示例各 100 行）。按 [AI 协作规范 §3.2.1](../../standards/ai-collaboration.md) 的交付面切分拆**两次提交**：① 能力实现 + 测试 + 组件页 / 示例 / 设计规范（9 文件）；② 治理记录 + 索引 / 阶段进度（3 文件）。

## 7. 结论

M1-1 已交付：新能力默认关闭时既有行为与计算样式零漂移，分组键切换、空态、分页 / 排序 / 选择列协同与零控制台噪声均有实测证据；列对齐缺陷（O1）在 V 阶段发现并当轮修复、复验通过。Review Gate 结论见 §8。

## 8. Review Gate

**第 1 轮（`standard` 档 / 时间盒 ≤ 10 分钟）：`Pass`（0 blocker / 3 warning / 4 suggest）**。实测用时 **4 分 12 秒**（宿主时钟 `2026-09-23T02:33:12+08:00` → `02:37:24+08:00`），未超时间盒。

修复点（同批修正，记为「已修复未复审」）：

| 编号 | 级别 | 内容 | 处置 |
| :---: | :--- | :--- | :--- |
| W1 | warning | `types.ts` 的 `groupRowsBy` JSDoc 写「隐藏该列数据单元格（对齐 PrimeVue）」，与实现（空白占位）及其余载体的「有意差异」表述相反 | 已改为「渲染为空白占位（保留列宽）…… 有意不沿用 PrimeVue 的不渲染做法」，中英同步 |
| W2 | warning | 本记录计数不自洽且缺可复算口径：测试 10 vs 9、规模 +647（staged 为 O1 修复前快照）vs 工作区 +768、docs 页数 / md 数陈旧、未附命令与范围 | §4 / §5.1 / §6 已按最终 revision 重算并补齐命令 + 范围 + 快照日期（`pnpm test` 汇总行 / `git diff --cached --numstat` / `docs:check` 各段输出） |
| W3 | warning | 暂存区为 O1 修复前版本，直接提交会回归缺陷 | 提交前重新 `git add -A` 全量暂存（提交内容以工作区最终 revision 为准） |
| S1 | suggest | 零漂移用例判别力偏弱 | 已补未分组态逐行单元格文本快照断言 |
| S2 | suggest | 分组与 `striped` 的斑马纹相位交互未声明 | 已在中英组件页「行分组」节补说明（`nth-child` 会把分组标题行计入序号） |
| S3 | suggest | 「取值口径与 `accessor` 一致」在函数 `accessor` 下不成立 | 中英组件页与本记录 §2 已改为「`accessor` 的点号路径形态（函数不参与）」 |
| S4 | suggest | 指向不存在字段 / 空串 / 路径中间节点缺失缺断言 | 已补「空串不分组 + 指向不存在字段归为单一分组」用例（点号路径中间节点缺失与末级缺失同走 `getByPath` 的 `undefined` 分支） |

审计方未独立复跑的命令（`pnpm test` 全量 / `build` / `check:build` / `capture:styles` / `test:a11y` / V 阶段浏览器验证）采信调用方证据，未发现反证；上述命令在修复点落地后已由调用方复跑（`pnpm test` = 84 文件 / 1691 tests、`capture:styles` = 239 项 0 差异、`pnpm docs:check` 9 段全绿），本地变更均为文档措辞与测试补强，未触及运行期行为。
