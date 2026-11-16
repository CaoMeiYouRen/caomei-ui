# Phase 35 M2-1：DataTable 列可见性与列顺序（受控）

> 创建时间：2026-11-16
> 触发：Phase 35 登记批次 §2 的 M2-1 行（[登记记录](./2026-11-15-phase35-registration.md)）。

## 1. 交付面（6 文件）

| 面 | 文件 |
|:---|:---|
| 特性集 | `src/components/data-table/table-features.ts`：启用 `columnVisibilityFeature` / `columnOrderingFeature` |
| 类型 | `src/components/data-table/types.ts`：`columnVisibility?: Record<string, boolean>`、`columnOrder?: string[]`（中英注释） |
| 实现 | `src/components/data-table/data-table.vue`：读取受控状态、缺省中性值、未知 / 重复 key 开发期告警 |
| 单测 | `src/components/data-table/data-table.test.ts`：受控隐藏 / 摘除恢复、受控顺序、未知与重复 key 告警且不改渲染 |
| 文档 | `docs/components/data-table.md`、`docs/i18n/en-US/components/data-table.md`：「列可见性与列顺序」一节 |

记录与规划状态位属留痕，不计入上表。

## 2. 决策

1. **只做受控读取，不做自持与列开关 UI**：登记口径为「新增受控」，列开关属于使用方界面（工具栏 / 设置面板），库内自持会与受控值产生双写歧义。
2. **缺省用 tanstack 的中性值**（`{}` / `[]`），摘除 prop 立即回到默认渲染，不保留历史状态。
3. **非法值只告警不改渲染**：未知列 key 忽略、`columnOrder` 重复 key 仅首次生效；生产构建静默（复用 `warnDev`）。
4. **不引入新依赖**：两项特性来自既有 `@tanstack/vue-table`。
5. **隐藏列全链路同步**：表体用 `getVisibleCells()`、空态 `colspan` 与冻结偏移都按可见列计算；表头与表体若各走一套（`getHeaderGroups()` 已过滤 / `getAllCells()` 未过滤）会出现「表头少一列、表体多一列」的半隐藏。
6. **展开列禁止隐藏**：受控值里的 `expander` 列项被剔除，避免表头消失而行内展开按钮仍在。
7. **冻结与顺序的边界**：`frozen` 列按冻结侧分组，`columnOrder` 不跨越分组（文档已写明）。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 单测 | `npx vitest run src/components/data-table/data-table.test.ts` → 全绿（含新三例） |
| 质量门 | `pnpm lint:check`、`pnpm typecheck` 通过 |
| 文档 | 中英同位置同节名；示例只使用已实现 API |

## 4. Review Gate

- **R1（`standard`，约 9 分钟）**：**Reject**（1 blocker / 4 warning / 1 suggest）——① 隐藏列只作用于表头，表体仍用 `getAllCells()` 渲染、空态 `colspan` 与冻结偏移未过滤；② frozen 与 `columnOrder` 的优先级未写明；③ 告警 watch 只依赖 prop，列定义异步到达会误报 / 变化不重报；④ 登记口径的「自持切换」只有受控 + 摘除用例。
- **R1 处置**：表体改 `getVisibleCells()`、`colspan` 与冻结偏移按可见列计算、展开列禁止隐藏（受控值剔除）；告警 watch 依赖列定义并去重；补表体单元格数 / 空态 `colspan` / 展开列不可隐藏三例；文档补「隐藏列同步 / 冻结列 / 展开列」三条边界。
- **R2（`quick`，约 8 分钟）**：**Reject**（1 blocker / 1 warning / 2 suggest）——① 文档写「冻结组内顺序仍按 `columnOrder`」，与 table-core 的 pinning 排序实现相反；② 展开列同时 `frozen` 时，隐藏集合用原始受控值判定、与生效可见性不一致。
- **R2 处置**：文档改为「组内顺序固定为列定义顺序，`columnOrder` 只作用于中间区」；隐藏集合与冻结偏移统一改为消费「生效可见性」（`effectiveVisibility`，已剔除展开列）。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| M2-2 | 列宽调整与持久化契约 | 本阶段 |

## 6. 复查基线

本记录 §1 ~ §5；`table-features.ts` 的特性集；`data-table.vue` 的 `columnVisibilityState` / `columnOrderState` / 两个告警 watch；`data-table.test.ts` 的三个新用例；中英组件页「列可见性与列顺序」。
