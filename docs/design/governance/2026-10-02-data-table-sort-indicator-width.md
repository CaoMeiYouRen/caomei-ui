# DataTable 排序指示条不再改变列宽（占位保留）

> 触发：用户 2026-10-02 报告「DataTable 表格中点击排序后，排序的图标会明显的导致排序列的宽度发生变化」（附文档站「多列排序」示例前后两张截图：排序后「部门」列变宽、另两列被压缩）。
> 性质：**非阶段条目**（用户直接工作指令为授权锚点；当前无进行中阶段，见[待办事项](../../plan/todo.md)）。留痕：本记录 + [治理索引](./index.md) + `.session/current-task.yaml` + 提交历史。
> 范围载体：[DataTable 组件页](../../components/data-table.md)、`src/components/data-table/data-table.vue`、`data-table.sorting-multi.test.ts`、新增 E2E 与夹具。

---

## 1. 根因

表头排序指示条（`ChevronUp` / `ChevronDown` 图标 + 多列排序优先级序号）**只在排序态渲染**（`v-if="sortState(...) === 'asc'"` 等），而表格未声明 `table-layout`（默认 `auto`，源码注释亦承认「`table-layout: auto` 会压缩列宽」）：

| 状态 | 表头内容宽 |
|:---|:---|
| 未排序 | 标题 |
| 升 / 降序 | 标题 + 图标（14px）+ 两处 `gap` + 序号（多列模式） |

内容宽一变，`table-layout: auto` 便重新分配列宽 → 排序列变宽、其余列被压缩。**与图标本身无关**，是「指示条只在排序态存在」导致的盒模型变化。

---

## 2. 修复

指示条改为**常驻**，未排序时以 `visibility: hidden` 占位保留同一盒模型：

- `ChevronUp` / `ChevronDown`：`v-if` 由「等于当前态」改为「非降序 / 降序」，未排序时渲染向上箭头并加 `--reserved`（`visibility: hidden`）——箭头对首次点击的方向（升序）也有语义价值；
- 序号：`v-if="isMultipleSort"`（不再附带 `sortState`），文本由新增的 `sortIndexLabel()` 给出（未排序返回空串）；空占位不进入按钮的可访问名，故无需 `aria-hidden`；
- 样式：`--reserved { visibility: hidden }`；序号基类加 `min-width: 1ch` 与 `font-variant-numeric: tabular-nums`（等宽数字下 `1ch` 才等于一位序号的实宽）。

**已声明边界**：同时排序 **≥10 列**时序号为两位、宽于 `1ch` 占位，该极端下仍会微移（不进本批范围，见 §5）。

---

## 3. 取证

| 项 | 取值 |
|:---|:---|
| 页面 | 文档站 `/components/data-table` 的「多列排序」示例（初始为 `dept` 升序 + `score` 降序，可点回未排序再点升序） |
| 环境 | `vitepress@1.6.4` dev + Playwright 1.63.0 捆包 Chromium，1280×900 |
| 快照 revision | `f41a2e2` |
| 探针落盘 | `test-results/data-table-sort-width/`（gitignored：`probe.mjs` + `report.json`） |

「未排序 → 已排序」切换后的**列宽差**（负向对照 = 把 `--reserved` 占位 `display: none` 模拟修复前布局）：

| 列 | 修复后 | 负向对照（等价修复前） |
|:---|:---|:---|
| 部门（被排序） | **+0.03px** | **+62.11px** |
| 姓名 | −0.02px | **−31.05px** |
| 评分 | −0.02px | **−31.06px** |

负向对照的数值与用户截图一致（排序列变宽、其余列同步被压缩），即探针对该缺陷有判别力。

复算命令：

```sh
# 1) 指示条原先的渲染条件（快照 f41a2e2 已修复，此处看历史版本）
git show 135d632:src/components/data-table/data-table.vue | grep -n "sort-icon\|sort-index" | head
# 2) 表格未声明 table-layout（默认 auto）
git grep -n "caomei-data-table__table" f41a2e2 -- src/components/data-table/data-table.vue
```

---

## 4. 交付与判别力

| 项 | 内容 |
|:---|:---|
| 组件 | `data-table.vue`：常驻指示条 + `--reserved` 占位 + `sortIndexLabel()` + 序号基类 `min-width: 1ch` / `tabular-nums` |
| 单测 | `data-table.sorting-multi.test.ts`：3 处序号断言改用新助手 `renderedSortIndexes()`（过滤空占位文本），并补「未排序列仍渲染空序号占位」断言 → 该文件 **19 passed** |
| 新增 E2E | `test/e2e/data-table-sort-width.e2e.ts`：断言「未排序 / 升序 / 降序」三态下每个 `th` 列宽与表头按钮内容宽逐值一致（容差 1px），含 2 条前置断言（初始未排序、未排序态存在 `--reserved` 占位） |
| 夹具 | `fixtures/app.vue` 新增 `#data-table-sort-width`（3 列均可排序、`sort-mode="multiple"`、4 行数据，追加在末尾） |

**判别力（负向对照）**：撤销 `data-table.vue` 的修复（还原为只在排序态渲染指示条）→ 新增 E2E 在 mobile / tablet / desktop **全失败**；恢复后 3 passed。

### 4.1 跨批附带修复：Tabs E2E 的滚轮断言

本批新增夹具 section 使夹具页面变高，原 Tabs 用例（`tabs-list-overflow.e2e.ts`）失败——根因是**滚轮层不稳定**：列表不可纵向滚动时纵向滚轮会链式交给祖先滚动容器（页面滚动），而 Chromium 的滚动**锁存**会让紧随其后的横向滚轮继续命中祖先，横向正对照随之假失败。

处置：该用例改为**确定性断言**（计算值 `overflow-y` 非可滚动值 + 几何前置 `scrollHeight > clientHeight` + 横向 `scrollLeft` 赋值回读），滚轮层证据下沉到一次性探针 `test-results/tabs-list-scrollbar/`（修复前注入 `overflow-y: auto` 时三档视口 `scrollTop` 由 0 变 1，修复后恒为 0）。用例名同步改为「无纵向滚动条（纵向不可滚动，横向滚动保留）」以免名实不符。**判别力复验**：把 `overflow: auto hidden` 改回 `overflow-x: auto` → 三档视口全失败；恢复后 6 passed。

---

## 5. 边界与未覆盖

- **≥10 列同时排序**：序号为两位、宽于 `1ch` 占位，仍会微移（§2 已声明）；如需闭合可把序号占位提升到 `2ch`（代价是所有多列表头恒定多留一位数字宽）。
- **`capture:styles` 采样面不含 DataTable**：本批 `capture:styles` 262 项 0 差异**不构成**本组件的证据；本批以「单测 + 真实几何 E2E」承载回归。
- **可见序号进入按钮可访问名**（既有行为：排序态按钮名形如「部门 1」）：本批未改；是否 `aria-hidden` 掉序号属独立裁定（`aria-sort` 只表达升降、不表达优先级，序号对读屏可能仍有信息价值）。
- **未做下游实测**：结论基于本仓源码与文档站真实 Chromium 实测。

---

## 6. 质量门

> 计数口径：易变计数（受版本控制 md 数 / 代码区行数 / 记录数）不复写，只保留稳定项与复算命令（同口径见 [画廊批次记录](./2026-09-30-showcase-nav-and-alignment.md) §3）。

| 项 | 实测 |
|:---|:---|
| `pnpm verify` | **exit 0**（lint / lint:css / lint:md / typecheck / typecheck:docs / test **104 文件 2157 例** / build / check:build / check:resolver / check:nuxt / docs:build / docs:check:i18n-routing / governance:check 全绿） |
| `pnpm test:e2e --workers=2` | **132 passed**（既有 129 + 本批 3，零回归） |
| `pnpm test:a11y` | 59 passed |
| `pnpm capture:styles` | 262 项 0 差异（**限制见 §5**：采样面不含 DataTable） |
| `check:design` | 通过（组件样式规则 799 → **800** 条、声明 2685 → **2688** 条，均在预算内） |

---

## 7. Review Gate

单分区审计（模块内组件修复 + 测试装置），`audit-depth` = **`standard`**（未触及发布、安全、鉴权、数据写入、运行时 / 发布配置、依赖版本或审计协议本体），时间盒 **≤ 10 分钟**，第 1 轮。

- **结论：`Pass`**（0 blocker / 2 warning / 4 suggest）。
- **审计方独立复核**：定向单测 19 passed、定向 E2E 9 passed（两文件）；只读核验 `guard-ref-attrs` 触发面（本批无引用型 ARIA 属性增删 → 不触发 `capture:styles`）与本地探针报告（负向对照部门 +62.11px，与用户截图一致）。
- **修复点（同批收口）**：warning ①「`1ch` 仅等于等宽数字下一位序号的实宽，且基类无 `min-width`」→ **采纳**：序号基类补 `font-variant-numeric: tabular-nums` 与 `min-width: 1ch`，并在源码注释声明「≥10 列同时排序」的边界；warning ②「Tabs 用例名与断言脱节」→ **采纳**：改名并去掉与 `overflowY` 断言重复的 `isVerticalScrollable` 块；suggest「`--reserved` 计数断言耦合实现」→ **不采纳（显式记录）**：该断言是「修复在位」的直接信号，与断言消息中的成因说明对应；suggest「缺治理记录」→ **采纳**：即本记录；suggest「可见序号 `aria-hidden`」→ 属独立裁定，记入 §5 边界。
- 工件：`artifacts/review-gate/2026-10-02-data-table-sort-width.md`（本地态）。

---

## 8. 留痕面与规模

- 留痕面：本记录 + [治理索引](./index.md) + `.session/current-task.yaml` + 提交历史。
- 规模：**7 文件 / +334 −34**（口径：`git diff --cached --numstat` 逐文件实测，含本记录自身与治理索引行）。逐文件：`data-table.vue` +34 −5 / `data-table.sorting-multi.test.ts` +22 −9 / `data-table-sort-width.e2e.ts` +104 / `fixtures/app.vue` +40 / `tabs-list-overflow.e2e.ts` +11 −20 / `index.md` +2 / 本记录 +121。
- 提交：`449068e`（本批 7 文件 / +334 −34；未推送）。本记录随该批提交，故哈希由本次回填提交补入。
