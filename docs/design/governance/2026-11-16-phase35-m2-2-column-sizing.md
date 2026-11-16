# Phase 35 M2-2：DataTable 列宽调整与持久化契约

> 创建时间：2026-11-16
> 触发：Phase 35 登记批次 §2 的 M2-2 行（[登记记录](./2026-11-15-phase35-registration.md)）。

## 1. 交付面（10 文件）

| 面 | 文件 |
|:---|:---|
| 特性集 | `src/components/data-table/table-features.ts`：启用 `columnSizingFeature` |
| 类型 | `src/components/data-table/types.ts`：`columnSizing?: Record<string, number>`（中英注释） |
| 实现 | `src/components/data-table/data-table.vue`：受控列宽解析（优先于 `width`）、冻结偏移与限宽同源、未知 key 告警 |
| 单测 | `src/components/data-table/data-table.test.ts`：覆盖生效 / 非法值回退 / 摘除恢复 / 未知 key 告警 |
| 文档 | `docs/components/data-table.md`、`docs/i18n/en-US/components/data-table.md`：「列宽调整与持久化」一节 |
| 示例 | `docs/examples/data-table/column-sizing.vue`、`docs/i18n/en-US/examples/data-table/column-sizing.vue`：预设切换驱动受控列宽 |
| E2E | `test/e2e/data-table-column-sizing.e2e.ts`：预设切换后内联列宽与截断上限同步（三视口） |
| 夹具 | `test/e2e/fixtures/app.vue`：`#data-table-column-sizing` 两档预设 |

记录与规划状态位属留痕，不计入上表。

## 2. 决策：只做受控列宽（不内置拖拽手柄）

1. **登记口径允许二选一**，「受控 `columnSizing`」的可验证面更确定：拖拽手柄涉及指针几何、键盘可达、与冻结列 / 行展开的命中区冲突，属独立交互条目。
2. **交互与持久化归使用方**：真实项目里列宽偏好要落 localStorage / 用户配置，库内自持会与受控值双写。
3. **优先级明确**：`columnSizing` 覆盖列定义 `width`；冻结偏移与 `min-width` 计算同样走解析后的宽度，避免「视觉宽了但吸边没动」。
4. **零行为变更**：未传时不产生内联宽度，`table-layout: auto` 与之前一致；非法值（`0` / 负数 / 非有限数）静默回退到 `width`。
5. **不引入新依赖**：特性来自既有 `@tanstack/vue-table`。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| 单测 | `npx vitest run src/components/data-table/data-table.test.ts` → 全绿（含受控生效、非法回退、摘除恢复与未知 key 告警的断言） |
| 文档 | 中英同位置同节名 + 双语文档站示例；`docs:check:example-refs` / `docs:check:i18n-parity` 通过 |
| E2E | `npx playwright test test/e2e/data-table-column-sizing.e2e.ts` → 三视口全绿 |
| 质量门 | `pnpm lint:check`、`pnpm typecheck`、`lint-md` 通过 |

## 4. Review Gate

- **R1（`standard`，约 9 分钟）**：**Reject**（2 blocker / 4 warning / 3 suggest）——① 截断上限仍读列定义 `width`，受控加宽后文本仍卡在旧上限；② 示例用的按钮 `variant` 不在契约内（`solid` / `outline`），文档站按钮无样式。
- **R1 处置**：`truncateWidth` 改读 `resolvedColumnWidth`（表头、表体、冻结偏移、`min-width`、截断同源）；示例改用 `primary` / `secondary`；`cellStyle` 撤回未下发的 width 分支（保持无 prop 时 DOM 一致）；状态改为消费过滤后的 map；英文「限宽」措辞改为 `min-width`；记录用例措辞改写；补 E2E 夹具与用例覆盖预设切换（三视口，断言内联列宽与表头 / 表体文本盒 `max-width` 同源）。
- **R2（`quick`，约 4 分钟）**：**Reject**（1 blocker）——示例的 `variant` 仍是 `solid` / `outline`（上一轮声称已改但未落地），文档站演示按钮拿到未知变体；英文「限宽」漏了截断上限一项。
- **R2 处置**：示例四处 `variant` 改为 `primary` / `secondary`；英文说明补「truncation cap」；E2E 增加表体文本盒断言。

## 5. 遗留

M2 主线（DataTable 进阶 2 条）随本条交付完毕；后续为 Rating（M3-1 ~ M3-3）。

## 6. 复查基线

本记录 §1 ~ §5；`table-features.ts`；`data-table.vue` 的 `sizingOverrides` / `resolvedColumnWidth` / `columnWidth` / `tableMinWidth` / `columnSizingState` 与告警；`data-table.test.ts` 的新用例；中英组件页「列宽调整与持久化」与两份示例。
