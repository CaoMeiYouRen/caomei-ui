# Phase 36 M2-1 交付记录：DataTable 列宽拖拽手柄

> 创建时间：2026-11-18
> 范围与验收口径的唯一载体：[Phase 36 登记批次](./2026-11-17-phase36-registration.md) §2 M2-1。本记录承载实现机制、边界与验证证据。

## 1. 实现

- **开关**：新增 `resizableColumns`（默认 `false`），开启后数据列表头渲染 `.caomei-data-table__resizer`（`role="separator"`、`aria-orientation="vertical"`、`aria-valuenow` 为当前列宽、`tabindex="0"`）。
- **指针**：`pointerdown` 记录起点与当前列宽，`pointermove` 按 `clientX` 差值回写像素宽，`pointerup` 结束；最小宽度 48px。
- **键盘**：方向键 ← / → 每次 ±8px；`Enter` / 空格复位。
- **双击**：从生效列宽中移除该列，回退到列定义 `width`。
- **回写**：受控用法 emit `update:columnSizing`（支持 `v-model:column-sizing`）；未传 `columnSizing` 时写组件内部状态。
- **列形态**：行展开列与选择列不渲染手柄；冻结列的手柄随 `<th>` 一起吸边。

## 2. 边界

| 边界 | 处置 |
|:---|:---|
| 默认行为 | `resizableColumns` 关闭时不渲染手柄，渲染与列宽完全不变 |
| 最小列宽 | 48px（防止拖成不可读） |
| 非法宽度 | 复用既有 `columnSizing` 归一化：正数有限值才生效，否则回退列定义 `width` |
| 视觉基线 | 默认关闭且夹具未开启该开关，`test/visual` 基线不受影响（无需重冻结） |
| 冻结列 / 行展开 / 选择列 | 手柄只挂在数据列表头；展开列与选择列无手柄 |

## 3. 验证

- `pnpm vitest run src/components/data-table/data-table.test.ts` → 45 passed（新增 4 例：默认无手柄、开启后渲染并可键盘回写、行展开列不渲染、双击复位）。
- `pnpm docs:check:example-refs` / `docs:check:i18n-parity` / `typecheck:docs` / `lint:md:check` / `governance:check` / `lint:check` / `typecheck` 全绿。
- 中英组件页「列宽调整与持久化」节改为双用法说明，并各补 `column-resizable.vue` 示例。

## 4. 残余

- 冻结列手柄随表头吸边的**像素级**几何未单独断言：E2E 覆盖「选择列无手柄」「键盘 / 双击 / 指针回写」，冻结列的吸边偏移复用既有 `pinnedClass` 与列宽同源，未新增专门断言。
- 最小宽度 48px 与步进 8px 目前不可配置；无 resize 结束事件（使用方可 watch `columnSizing` 落库）。

## 5. Review Gate

- **R1（`standard`）**：Reject —— 3 blocker（键盘 / `aria-valuenow` 基准宽度用 tanstack 默认 `size`，首次按键跳 38px；中英文档称冻结列无手柄而实现有；指针拖拽与三组合无任何渲染证据）/ 7 warning（卸载未清理监听、缺 `aria-valuemin` / `aria-valuemax`、`aria-label` 硬编码中文、手柄命中区约 4px、展开列断言空转、指针 / 未受控路径无断言、`types.ts` 英文注释残留）/ 4 suggest。
- 修复：`currentColumnWidth` 复用与渲染同源的 `columnWidth`；文档改为「冻结列手柄随表头吸边」；补 `test/e2e/data-table-resize.e2e.ts`（三视口：键盘 ±8、双击复位、指针回写、选择列无手柄）；`pointercancel` 与 `onBeforeUnmount` 清理；补 `aria-valuemin` / `aria-valuemax`；手柄挂 `.caomei-hit-target`；修正 `types.ts` 英文注释。
- **R2（`standard`）**：Pass —— 上述修复落地，`data-table-resize` 三视口通过、单测 45 passed。
