# M1-2 `DataTable` 可折叠分组（expandableRowGroups）交付与验证记录

> 阶段：Phase 13（组件能力补齐与 dependfix 迁移解阻）→ M1 `DataTable` 能力补齐（dependfix 迁移关键路径）→ M1-2 可折叠分组。
> 范围依据：[下一阶段范围评估 §6 / §11](./2026-09-23-next-stage-scope-evaluation.md)；条目登记：[待办归档](../../plan/todo-archive.md) Phase 13 M1-2；前置条目见 [M1-1 记录](./2026-09-23-m1-1-row-grouping.md)。

## 1. 范围与目标

在 M1-1 行分组之上补**可折叠分组**，**API 命名对齐 PrimeVue**（用户裁定 D2）：`expandableRowGroups` + `v-model:expandedRowGroups` + 内建 toggle 按钮与可访问语义；受控与自持都支持（用户裁定 D3：受控优先、缺省自持）。

非目标：行展开（M1-3）、多列排序（M1-4）、`#groupfooter` / `rowGroupMode="rowspan"`。

## 2. API 契约（对齐 PrimeVue 的命名映射）

| PrimeVue | 本库 | 说明 |
| :--- | :--- | :--- |
| `expandableRowGroups` | 同名 | 需与 `rowGroupMode="subheader"` + `groupRowsBy` 同用；单独提供不生效 |
| `v-model:expandedRowGroups` | 同名（`string[]`） | 分组键集合；提供即受控，移除退回自持 |
| `@rowgroup-expand` / `@rowgroup-collapse` | `@rowgroup-expand` / `@rowgroup-collapse` | 载荷 `{ originalEvent, data }`；`data` 为本库**归一化后的分组键字符串**（PrimeVue 传分组字段原值） |
| 内建 `rowToggleButton` | `.caomei-data-table__row-group-toggle` | 原生 `<button type="button">` + chevron |

行为口径（对齐 PrimeVue）：**缺省（未提供 `expandedRowGroups`）时分组全部收起**——只渲染分组标题行，收起分组的数据行不进入渲染条目；展开 / 收起只影响渲染，不影响分页器总条数；分组键取分组字段值的字符串形式，**非连续的同值分组共用同一键**（切换同步翻转）。

## 3. 有意差异（逐条）

1. **切换按钮补 `aria-expanded` 与 `aria-label`**：PrimeVue 的 `rowToggleButton` 仅 chevron，无 `aria-expanded`、无内建可访问名（一方源码 `BodyRow.vue` 核对）。本库补 `aria-expanded` + 随状态切换的 `aria-label`（可经 `expandRowGroupLabel` / `collapseRowGroupLabel` 覆盖），并在组件页无障碍段声明该取舍（若需恒定名称可在使用层覆盖为同一文案）。
2. 事件 `data` 为归一化字符串键（见 §2）。
3. 承 M1-1：分组标题行不参与冻结列吸边；分组字段同名列在数据行渲染空白占位（规避 primefaces/primevue#6496 的列错位）。
4. 承 M1-1：`#groupfooter` 与 `rowGroupMode="rowspan"` 不实现。

## 4. 实现落点

- `src/components/data-table/types.ts`：新增 props `expandableRowGroups` / `expandedRowGroups` / `expandRowGroupLabel` / `collapseRowGroupLabel` 与类型 `DataTableRowGroupEvent`（含中文 JSDoc + `@en`）。
- `src/components/data-table/index.ts`：导出 `DataTableRowGroupEvent`。
- `src/components/data-table/data-table.vue`：
  - `isExpandableRowGroups`（需行分组同时生效）/ `isRowGroupExpansionControlled` / `controlledExpandedRowGroups` / `internalExpandedRowGroups` / `currentExpandedRowGroups` / `isGroupExpanded`；
  - 受控同步 watch 采用 `{ deep: true }`（数组型 prop 常被父级原地增删；其余受控 prop 均为标量，故此处有意与既有模式不同，理由写在源码注释）；
  - `displayEntries` 按当前分组展开态决定是否推入数据行条目（收起分组只保留标题行；`index` 仍按分页切片的全量行序计算，不受收起影响）；
  - `toggleRowGroup(originalEvent, groupKey)`：受控只抛事件、自持同时更新内部值；两种模式都抛 `update:expandedRowGroups` 与 `rowgroupExpand` / `rowgroupCollapse`；
  - 模板在分组标题单元格内渲染内建 `<button v-if="isExpandableRowGroups" :aria-expanded :aria-label>`（chevron 均 `aria-hidden`）；
  - 新增 `.caomei-data-table__row-group-toggle` 样式（inline-flex、`focus-visible` 走 `--caomei-color-primary` 描边）。
- `src/locale/*`：`table` 命名空间新增 `expandRowGroup` / `collapseRowGroup`（5 语种），并同步 `scripts/governance/check-locale-keys.test.mjs` 的基准键数快照（71 → 73）。
- `src/components/data-table/data-table.grouping.test.ts`（+12 条，累计 22 条）：缺省全部收起 / 自持展开收起与双向事件 / 多组独立 / 受控不采纳与回写生效 / 受控移除退回自持（沿用已同步内部值） / **受控数组原地变更后退回自持沿用最新值** / **非连续同值共用键同步翻转** / toggle 为原生 button 且可访问名可覆盖 / 未开启 expandable 时无按钮且全量渲染 / 未开启行分组时不生效 / `null` 分组键为空串 / 空态无按钮。
- 文档：中英组件页新增「可折叠分组」子节 + 中英示例 `grouping-expandable.vue`（自持模式，演示缺省全部收起）+ [设计规范 §7](../design-spec.md) 映射 + **内置文案台账** `docs/components/locale.md`（中英）补两键。

## 5. 验证与证据

### 5.1 质量门（最终 revision，快照 2026-09-23）

- `pnpm lint:check` / `pnpm lint:css:check` / `pnpm lint:md:check`：通过。
- `pnpm typecheck` / `pnpm typecheck:docs`：通过。
- `pnpm test`：**84 文件 / 1703 tests passed**（M1-1 基线 1691；本条目新增 12 条，另 `check-locale-keys.test.mjs` 基准键数 71 → 73）。
- `pnpm check:locale-keys`：基准 zh-CN 25 命名空间 / 73 条；5 语种各 73 条。
- `pnpm docs:check`：9 段链全绿（`check-docs-integrity` **243 md**（`git ls-files` 枚举，含本记录）/ `check-links` **242 md** / `check-docs-structure` **204 页** / `check-config-links` 158 条 / `check-i18n-parity` 58 对 / `check-site-version` / `check-showcase-registry` 12 项 / `check-line-count` / `check-i18n`）。
- `pnpm check:design` / `pnpm test:a11y`（54 tests）：通过。
- `pnpm build` + `pnpm check:build`：通过（8 个 exports 产物齐全）。
- `pnpm capture:styles`：**239 项逐属性 0 差异** vs 冻结基线（未开启可折叠分组时的零漂移硬门禁）。

### 5.2 V 阶段（`@ui-validator`，真实 Chromium，9 项全通过）

| 项 | 实测 |
| :--- | :--- |
| 缺省全部收起 | 分组标题行 2 / 数据行 0 / toggle 2；两 toggle `aria-expanded="false"`、`aria-label="展开分组"`、chevron = `lucide-chevron-right` |
| 展开往返 | 展开后数据行 2（`组件库文档` / `样式治理`）、`aria-expanded="true"`、`aria-label="收起分组"`、chevron = `chevron-down`、提示「展开：前端」；再点回数据行 0 与「收起：前端」 |
| 多组独立 | 仅展开第 2 组时数据行 2（`接口联调` / `数据迁移`），第 1 组仍收起 |
| 键盘可达 + 焦点不丢失 | Tab 第 4 次命中 `BUTTON.caomei-data-table__row-group-toggle`；Enter / Space 各两次切换均生效，**四步 `focusRetained=true`** |
| 列对齐 | `th=2` 与数据行 `td=2`；列 1 `[405.5, 636.47]` vs `[405.5, 636.47]`、列 2 `[636.47, 1050.5]` vs 同值（delta 全 0）；分组标题单元格 `colspan="2"` |
| 主题与响应式 | 亮：toggle / 文字 `rgb(26,26,26)`、分组单元格 bg `rgb(247,247,248)`；暗：`rgb(245,245,245)` / bg `rgb(23,23,26)`；文档级 / 容器级溢出 1440 `0/0`、1024 `0/0`、768 `0/0`、375 `0/0` |
| 英文页等价 | 分组 `Frontend` / `Backend`；`aria-label` = `Expand row group` / `Collapse row group`；1~5 数值一致 |
| 控制台噪声 | 中英两页 console error / pageerror / HTTP≥400 / requestfailed 全 0 |
| 无回归 | 中英两页 `.caomei-data-table=12`、`<table>=20`、无 error overlay；不可折叠「行分组」示例仍 3 组全展开 5 行、toggle 0 个；`/components/button` 噪声 0 |

未覆盖边界：受控模式（单测覆盖）、非连续同值共用键的浏览器实景（单测覆盖）、冻结列 / 选择列与可折叠分组同用、行展开（M1-3 未实现）、像素级美观度比对（验证通道无视觉能力，结论仅基于几何 + 计算样式 + DOM/ARIA + 像素灰度统计）。

## 6. 规模

**22 文件 / +664 −16**（口径：`git diff 4258301 --numstat` 求和，base = M1-1 末提交 `4258301`（持久 ref），范围 = 实现 4 + locale 6 + 守卫不变量测试 1 + 文档 8 + 治理载体 3，快照 2026-09-23）。

**超阈值说明**：文件数 22 超「建议 10 文件」阈值，但行数远低于 800；超出部分为机械性载体——5 个语种的 locale 键追加（各 +2 行）、1 个守卫不变量测试快照（+2/−2）、2 个内置文案台账（各 +1/−1）、Backlog 1 行、治理载体 3 个。**且不可拆分**：`check-locale-keys` 强制 5 语种结构对等、`docs:check:i18n-parity` 要求中英页同步，拆开提交会使中间提交的门禁红灯。实质改动面为 `data-table` 4 文件 + 文档 8 文件，无顺带重构、无无关改动。按交付面拆**三次提交**（实现与 i18n / 文档 / 治理载体）。

## 7. 结论

M1-2 已交付：可折叠分组在受控与自持两种模式下均有断言，toggle 为原生按钮、带 `aria-expanded` 与可访问名、键盘可达且切换后焦点不丢失；未开启可折叠分组时既有行为与计算样式零漂移。Review Gate 结论见 §8。

## 8. Review Gate

**第 1 轮（`standard` 档 / 时间盒 ≤ 10 分钟）：`Reject`（1 blocker）**。实测用时 **6 分 46 秒**（宿主时钟 `2026-09-23T09:04:33+08:00` → `09:11:19+08:00`），未超时间盒。

| 编号 | 级别 | 内容 | 处置 |
| :---: | :--- | :--- | :--- |
| B1 | **blocker** | 内置文案台账 `docs/components/locale.md` 与其英文页的「命名空间 → 文案键」索引表未同步新增的 `table.expandRowGroup` / `table.collapseRowGroup`；该表为穷尽式索引且无任何机检覆盖，会静默随 0.3.0 出站 | 已在中英两页补两键；另将「台账 ↔ `src/locale` 键集合对账守卫」登记 [Backlog §1.6](../../plan/backlog.md) |
| S1 | suggest | 文档宣称的「非连续同值共用键」无测试覆盖（既有语料为连续同值） | 已补 `A,B,A` 语料断言两段 `A` 同步翻转 |
| S2 | suggest | `aria-label` 随状态切换与 `aria-expanded` 语义冗余（非缺陷） | 保留实现（名称描述动作、状态由 `aria-expanded` 承载），已在组件页无障碍段声明该取舍与覆盖方式 |
| S3 | suggest | 模板 `v-if="expandableRowGroups"` 与数据层 `isExpandableRowGroups` 表达式不一致 | 模板改用 `isExpandableRowGroups`（单一事实源） |
| S4 | suggest | 字符串化后相同的不同取值（如 `1` 与 `'1'`）共用同一键未登记 | 已在中英组件页「分组键」条目补该边界 |
| S5 | suggest | 受控数组原地变更时内部值可能滞后（影响「退回自持」取值） | watch 改为 `{ deep: true }` 并在源码注释说明与既有标量受控 prop 的差异理由 |
| S6 | suggest | 斑马纹 `nth-child` 落点会被展开 / 收起平移 | 已扩展中英组件页的 `striped` 说明 |

审计方对粒度的明确判断：**接受超阈值理由、不因此 Reject**（行数未超、6 个增量为 2 行级载体、且受 5 语种对等与中英 parity 门禁约束不可拆分）。

**第 2 轮（只审修复点 / `standard` 档 / 时间盒 ≤ 10 分钟）：`Pass`（0 blocker）**。实测用时 **5 分 43 秒**（宿主时钟 `2026-09-23T09:20:10+08:00` → `09:25:53+08:00`），未超时间盒。

- 修复点逐条核验：B1 已闭合（中英台账 `table` 行 5 键与 `src/locale/types.ts` 逐键一致；台账全表 25 命名空间 drift = 0；守卫基准 71 → 73 实跑 exit 0）；S1 新用例判别力成立（若改为「每段独立键」断言必失败）；S3 模板条件替换后与替换前行为等价（按钮仅存在于 group 条目内）；S5 `deep` 无误写与性能副作用；S2 / S4 / S6 均已落地；§8 未预写本轮结论成立。
- 转 follow-up（不阻断）：F1 `index.md` 同句内「20 文件」与「22 文件」自相矛盾（**复发**：同 M1-1 W2 的计数一致性类）→ 已改为 22；F2 §6 口径 `git diff --cached --numstat` 在提交后不可复算 → 已改为钉持久 ref 的 `git diff 4258301 --numstat`（base = M1-1 末提交）；F3 `deep` 修复缺直接断言 → 已补「受控数组原地变更后退回自持沿用最新值」用例（`reactive` 数组 `push`，断言退回自持后仍为 2 行）；F4 台账对账守卫已登记 Backlog、未实现（按排期落地）；F5 复审期间全量 `pnpm test` 首跑偶发 1 例 auto-complete select 断言（复跑两次均通过）→ 已按「多次出现再处理」追加到 [Backlog](../../plan/backlog.md) 的偶发失败出现记录。
