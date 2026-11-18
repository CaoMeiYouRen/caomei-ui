# Phase 37 M1-1 交付记录：列宽拖拽残余补齐

> 创建时间：2026-11-18
> 范围与验收口径的唯一载体：[Phase 37 登记批次](./2026-11-18-phase37-registration.md) §2 M1-1。本记录承载实现机制、边界与验证证据。

## 1. 实现

- **结束事件**：新增 `columnResizeEnd`，载荷 `DataTableColumnResizeEvent`（`{ key, width }`，并从组件 barrel 导出）。三处触发点，均以「宽度确有变化」为准：
  - 键盘 ← / → 调整后，生效宽度与调整前不同才触发；
  - 指针拖拽结束（`pointerup` / `pointercancel`）且宽度与起点不同才触发——只点手柄不移动不触发；
  - 复位（双击或 `Enter` / 空格）：存在该列的列宽覆盖值、且回退后宽度与复位前不同才触发。
- **可配置项**：`columnResizeMinWidth`（默认 `48`）与 `columnResizeStep`（默认 `8`，键盘方向键步进）；非正数 / 非有限值按默认值处理。默认值与原实现一致，未声明时行为不变。
- **复位宽度口径**：新增 `definitionColumnWidth` 作为「无覆盖值时的列宽」单点来源，`columnWidth` 与复用它的冻结偏移、复位事件载荷共用该函数；复位事件的 `width` 即回退后的像素宽度（列定义未声明 `px` 时取既有估算值 `150`）。
- **ARIA 区间**：`aria-valuemin` 与夹取同源（`resizeMinWidth`），`aria-valuenow` 按同一最小值夹取，保证 `valuemin ≤ valuenow` 的合法区间。
- **卸载路径**：拆出 `detachResizeListeners`（只移除监听与状态），`onBeforeUnmount` 复用它，卸载不再产生 `columnResizeEnd`。
- **像素级吸边证据**：新增夹具 `#panel-data-table-resize-frozen`（首列 `frozen` + 四列 px 宽度之和撑出横向滚动，容器收窄到 `20rem`）与两条 E2E：
  - 未滚动与横向滚动 `120px` 后，冻结列表头左缘都贴容器左缘（≤1px）；
  - 手柄中心与表头右缘对齐（≤1px，对应 `right: -4px` + `8px` 宽）；
  - 手柄纵向覆盖表头全高且滚动不改变纵向几何。

## 2. 边界与口径

| 边界 | 处置 |
|:---|:---|
| 默认行为 | `resizableColumns` 关闭时不渲染手柄；不声明两个新 prop 时最小宽度 / 步进与之前完全一致（48 / 8） |
| 非法配置值 | `columnResizeMinWidth` / `columnResizeStep` 取 `0` / 负数 / `NaN` 时回退默认值，不告警、不改变渲染 |
| 无净变化 | 键盘 / 拖拽后宽度未变不触发；复位在无覆盖值、或回退宽度与复位前相同时不触发（覆盖值等于列定义宽度的情形） |
| 夹具独立性 | 新夹具单独成节并固定步进 `20` / 最小宽度 `120`，避免与既有 `#panel-data-table-resize`（默认 8 / 48）的断言互相污染 |
| 事件载荷 | 只含 `key` / `width`，不带原生事件；使用方需要原生事件时自行在 `pointerdown` 上接线 |
| 复位载荷 | 复位的 `width` 是回退后的像素宽度，不代表「自适应列的真实渲染宽」；直接写回 `columnSizing` 会把自适应列固定为像素宽，组件页已写明该陷阱 |
| ARIA 上限 | `aria-valuemax` 维持既有 `2000`，库内不对拖拽做上限夹取；该上限与实参不同源属既有边界 |
| API 表面 | 只新增 prop / 事件与类型导出，无删除、重命名或 required 收紧，`check:api-surface` 口径下属新增不阻断 |

## 3. 验证

- `pnpm vitest run src/components/data-table/data-table.test.ts` → 全绿（本批新增用例逐条为：可配置步进与最小列宽夹取及 ARIA 夹取、非法步进 / 最小列宽回退默认值、`columnResizeEnd` 的键盘 / 拖拽 / 复位三触发点与「点击手柄不触发」、未受控时已在下限的递减不触发、复位后宽度未变化不触发）。
- `pnpm exec playwright test test/e2e/data-table-resize.e2e.ts` → 全绿（三视口矩阵：既有手柄用例、冻结列吸边像素级几何、可配置步进与结束事件日志）。
- `pnpm lint:check` / `pnpm typecheck` / `pnpm lint:md:check` / `pnpm typecheck:docs` / `pnpm governance:check` / `pnpm check:planning-numbers` 全绿。
- `pnpm build` / `pnpm check:build` 全绿；`dist/components/data-table/index.d.ts` 已含 `DataTableColumnResizeEvent` 导出，`data-table.vue.d.ts` 已含 `onColumnResizeEnd` 与 `columnResizeEnd` 事件签名（产物与源码同源，非陈旧产物）。
- 中英组件页「列宽调整与持久化」节同批补 `columnResizeMinWidth` / `columnResizeStep` / `columnResizeEnd` 说明与复位持久化陷阱。
- 受检面边界：本记录在申报门禁前已 `git add`，故 `docs:check:integrity` 的受版本控制 md 口径覆盖本文件。
- 规模口径（`git add` 后复算）：交付面 9 个文件（`src/components/data-table/` 的 `data-table.vue` / `types.ts` / `index.ts` / `data-table.test.ts`，`test/e2e/` 的 `data-table-resize.e2e.ts` / `fixtures/app.vue`，中英组件页 2 个，本记录），另 2 个是状态载体（`docs/plan/todo.md` 验收状态列、`docs/design/governance/index.md` 索引行）；生成物（`dist/`）不计入。

## 4. 残余

- 拖拽过程中不做节流：`pointermove` 逐帧回写 `columnSizing`，与改动前一致；大表下的回写开销未单独取证。
- 指针拖拽的「结束」判定不含窗口失焦（`blur`）：失焦时监听仍在，下一次 `pointerup` 才结束，与既有行为一致。
- `aria-valuemax` 未做真实上限夹取（见 §2）。

## 5. Review Gate

**结论：Pass**（R2，`standard`，2026-11-18）。

- R1 分区 A（源码与测试，`standard`）：**Pass** —— 1 warning（`DataTableColumnResizeEvent` 未从 barrel 导出）+ 4 suggest（键盘无净变化仍触发、卸载路径带 emit 副作用、`aria-valuenow` 可能小于 `valuemin`、`columnResizeStep` 注释未限定作用面）。
- R1 分区 B（文档与治理载体，`standard`）：**Reject** —— 1 blocker（交付记录 §3 手写计数与实测不符，且复述门禁读数）+ 2 warning（记录 §1 与源码触发口径不一致、组件页对复位条件的表述强于实现）+ 4 suggest。
- 修复：计数段改为「命令 → 全绿」+ 逐条用例清单；触发口径四处（记录 §1 / §2、中英组件页、`types.ts`）统一为「宽度确有变化」；复位补「存在覆盖值且回退宽度不同」守卫（代码侧统一，并补单测）；barrel 导出补齐；快捷键无净变化不触发（新增 `resizeColumn`）；卸载拆 `detachResizeListeners`；`aria-valuenow` 按最小列宽夹取；注释与摘要措辞同步（含 `Enter` / 空格复位）。
- **R2（`standard`，复审）**：**Pass** —— 上轮 blocker 与全部 warning 逐条关闭；新增 1 warning（本记录 §3 缺构建证据、`dist/` 陈旧）已在提交前用 `pnpm build` / `pnpm check:build` 关闭并回填 §3；余 2 suggest（JSDoc 与函数声明同一行、摘要处复位措辞）同批收敛。
- 未覆盖边界：受控父级异步回写 / 拒绝回写的时序无专门单测；`aria-valuenow` 夹取后可能与真实渲染宽不同（列定义宽小于最小列宽时），未做屏幕阅读器实测。
