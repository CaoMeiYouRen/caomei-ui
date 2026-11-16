# Phase 35 M1-4：DataTable 逐格提示接线开销实测与退出开关（F17）

> 创建时间：2026-11-16
> 触发：Phase 35 登记批次 §2 的 M1-4 行（[登记记录](./2026-11-15-phase35-registration.md)）。

## 1. 交付面（7 文件）

| 面 | 文件 |
|:---|:---|
| 类型 | `src/components/data-table/types.ts`：新增 `cellTooltips?: boolean`（默认开启，含中英注释） |
| 实现 | `src/components/data-table/data-table.vue`：默认单元格按开关决定是否包提示接线，`cell` 渲染与表头提示不变 |
| 单测 | `src/components/data-table/data-table.test.ts`：默认有接线、关闭后纯文本、表头与自定义 `cell` 不受影响 |
| E2E | `test/e2e/data-table-cell-tooltip.e2e.ts`：默认挂载逐格接线、关闭后纯文本（三视口） |
| 夹具 | `test/e2e/fixtures/app.vue`：`#cell-tooltip-perf` 成对挂载（60 × 8，默认单元格 / `cell` 渲染） |
| 文档 | `docs/components/data-table.md`、`docs/i18n/en-US/components/data-table.md`：「逐格提示与批量表」一节（中英同位置同节名） |

记录、索引与规划状态位属留痕，不计入上表。

## 2. 规模实测

夹具：`#cell-tooltip-perf`，同一份 **60 行 × 8 列 = 480 格**数据，成对挂载——默认单元格（逐格提示）与全部列改用 `cell` 渲染函数（无提示）。真实 Chromium、desktop 1280 视口、冷挂载，三轮取中位数（点击到两帧后的 `performance.now()` 差值）。

| 形态 | 挂载耗时（中位数） | 提示实例增量 | 元素节点增量 |
|:---|:---|:---|:---|
| 无提示（`cell` 渲染） | 约 0.04–0.06 s | 0 | 0 |
| 默认单元格（逐格提示） | 约 0.6–0.7 s | +480 | +480（每格一个包装元素；`CaomeiTooltip` 根与观察器不新增元素节点） |

单格折算约 1.1～1.3 ms，与「每格一个 `CaomeiTooltip` 根 + 一个 `CaomeiTooltipText` 包装 + 一个 ResizeObserver」的结构一致；开销随格数线性增长。

## 3. 决策：显式退出开关（不取默认阈值）

1. **阈值会静默改变内容可达性**：超过阈值即不再提供全文提示，用户无法感知「为什么这个表格没有提示」，且阈值取值本身没有客观依据。
2. **开关语义可预测**：大型 / 虚拟化表格由使用方自己知道规模，`:cell-tooltips="false"` 是显式契约；默认仍开启，既有渲染与提示行为不变。
3. **不必新增运行时依赖，也不改默认分支的渲染路径**（仅多一个布尔判断）。
4. 关闭后仍可用 `cell` 渲染函数保留关键列的提示——比阈值更细粒度。

## 4. 验证

| 面 | 结果 |
|:---|:---|
| 单测 | `npx vitest run src/components/data-table/data-table.test.ts` → 全绿（含新增三例，关闭态断言截断配方保留） |
| E2E | `npx playwright test test/e2e/data-table-cell-tooltip.e2e.ts` → 三视口全绿；负向对照（去掉夹具的 `:cell-tooltips="false"`）→ 提示数 480、用例红，恢复后全绿 |
| 实测 | 见 §2（脚本为一次性探针，不落仓） |
| 文档 | 中英组件页新增同位置同节名章节；API 表由 `<ComponentApi>` 从类型自动生成 |
| 质量门 | `pnpm lint:check`、`pnpm typecheck`、`lint-md` 通过 |

## 5. Review Gate

- **R1（`standard`，约 9 分钟）**：**Reject**（2 blocker / 5 warning）。
- **R1 处置**：
  - B1 §1 声明 6 文件但表内 7 条路径（中英文档各计一）→ 改为 7。
  - B2 E2E 对照侧用 `cell` 渲染函数，绕过默认分支，开关失效也不会红 → 夹具新增「默认列 + `cellTooltips=false`」第三态，E2E 改用该态；负向对照（去掉该属性）实测 480 个提示 → 红。
  - W1 关闭开关连带丢失截断配方 → 关闭态改为渲染带 `textClass` / `textStyle` 的 `span`，单测断言截断类仍在。
  - W2 文档读数口径 → 改为「相对 `cell` 渲染多约 0.5–0.6 s」。
  - W3 夹具注释指向错文件名 → 更正。
  - W4 「+480 节点」口径 → 标明为元素节点并说明其余结构不新增元素。
  - W5 §5 占位 → 本节补齐。
- **R2（`quick`，约 7 分钟）**：**Reject**（1 blocker）——关闭态 `span` 缺可测量盒样式（`inline` 上 `max-width` / `overflow` / `text-overflow` 失效），实测 40px 列宽下文本 279px 未被裁切，与「截断配方保持不变」的声明相反。
- **R2 处置**：新增非 scoped 类 `.caomei-data-table__cell-box`（`inline-block` + 可压缩，与提示盒默认一致）用于关闭态；夹具首列改为 80px 定宽 + 长文本，E2E 在两种形态下都断言「非 inline 且 `scrollWidth > clientWidth`」，单测同时断言截断类与盒类。
- **R2 复查**：B1 / B2 关闭；W1 由本轮修复，W2 ~ W5 关闭。

## 6. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F16 | Menu 项槽包裹约束 | 本阶段 M1-5 |

## 7. 复查基线

本记录 §1 ~ §6；`data-table/types.ts` 的 `cellTooltips`；`data-table.vue` 的 `cell` 默认分支；`data-table.test.ts` 的三个新用例；中英组件页「逐格提示与批量表」一节。
