# Phase 29 M5-1：Paginator 每页条数选择器尺寸对齐

> 创建时间：2026-11-08
> 触发：Phase 29 M5-1（[Phase 29 登记批次](./2026-11-08-phase29-registration.md) §2）。
> 依据：[Paginator 尺寸评估](./2026-11-08-paginator-rows-per-page-sizing-evaluation.md) §1 / §4 / §5；用户裁定 D4 ①（高度 + 宽度，不含圆角）。

## 1. 交付清单

| 面 | 内容 |
|:---|:---|
| 高度 | 每页条数选择器内部字段覆盖 `--caomei-field-height: var(--caomei-paginator-control-size, 32px)`；默认与 `data-density="touch"` 下均为 32px，与页码控件等高 |
| 宽度 | `--caomei-paginator-rows-width` 默认值 **6rem → 5rem**；3 位数（100）不裁切 |
| 圆角 | **不调整**（维持 Select 的 `radius-md`，D4 ①） |
| 字号 / 图标 | 继续走 `size="sm"`，与页码控件字号一致 |
| 文档 | Paginator 中英组件页 token 表 6rem → 5rem，并补高度对齐说明 |
| 视觉基线 | 新增 `#fv-paginator` 亮 / 暗两张基线（视觉采样面 12 → 13） |
| 测试夹具 | `#fv-paginator` 补 `rows-per-page-options=[10,20,50,100]`，改为 `v-model:items-per-page` 以验证选择后的值区 |
| E2E | 新增 `test/e2e/paginator-sizing.e2e.ts`：默认 / touch 等高、5rem 宽、3 位数不裁切（9 例 / 3 project） |

## 2. 实现要点

1. **覆盖点在触发器本身**：Select 的 `size="sm"` 在触发器上以 `:where(.caomei-field--sm)` 直接声明 `--caomei-field-height`（零特异性）。在祖先上设置变量会被该直接声明覆盖，故用 `.caomei-paginator__rows-per-page :deep(.caomei-select)` 在触发器上覆盖；字号 / 内边距 / 图标尺寸仍由 `size="sm"` 决定。
2. **触摸密度**：高度始终取 `--caomei-paginator-control-size`（32px），不随 `data-density="touch"` 的 36px 翻转；这与同一分页器内页码控件一致，属既定取舍（评估 §6）。
3. **宽度**：默认 5rem（80px）；4 位数或长字号场景仍可经 `--caomei-paginator-rows-width` 覆盖。

## 3. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm exec playwright test test/e2e/paginator-sizing.e2e.ts` | **9 passed**（3 用例 × 3 project：默认等高 / 3 位数不裁切 / touch 等高） |
| `pnpm vitest run src/components/paginator` | **29 passed**（选择器渲染、切换、禁用、可访问名等既有契约） |
| `pnpm capture:styles` | 0 差异（386 项；Paginator 不在采样面，未受影响） |
| `pnpm test:visual` | **42 passed**（新增 Paginator 亮 / 暗基线；采样面 12 → 13） |
| `pnpm test` | 通过（写录时点快照） |
| `pnpm docs:check` / `lint:md:check` / `check:design` | 通过 |
| `pnpm verify` | 通过（含 build / docs:build / governance:check） |

## 4. 风险与边界

1. **视觉基线**：已把 `#fv-paginator` 纳入视觉采样面并新增亮 / 暗两张基线，用于锁定整体几何；「等高 / 宽度 / 不裁切」仍由 E2E 逐项断言。
2. **`:deep(.caomei-select)` 依赖内部类名**：Select 触发器类名变更时需同步本规则；已由 E2E 的等高断言兜底。
3. **touch 高度**：统一到 32px 会使选择器低于 touch 档 36px，但与同一分页器页码一致；若未来需要触控优先，另立候选。
4. **宽度下限**：5rem 对 3 位数有余量；4 位数或更高字号需覆盖 `--caomei-paginator-rows-width`。
5. **选择面板**：3 位数选项文本已在面板内断言不裁切；未单独断言面板宽度（面板随触发器宽度收敛）。

## 5. Review Gate

- **audit-depth**：`standard`（1 个组件样式 + 夹具 + 2 份文档 + 1 个 E2E；含 Select 内部覆盖点与 touch 取舍）；时间盒 ≤ 8 分钟。
- **R1（`standard`）**：`Pass`（0 blocker / 2 warning / 3 suggest；实测约 5 分钟，未超 ≤ 8 分钟时间盒）——
  - W1 视觉基线验收未交付：**已修**——新增 `#fv-paginator` 视觉采样面与亮 / 暗基线，`test:visual` 42 passed。
  - W2 载体未回填：**已修**——`todo.md` M5-1 置「已完成」、本记录 §5 回填、`.session` 同步。
  - S1 / S2 已采纳：E2E 补字号 / 内边距 / 触发器宽度 / 选项文本不裁切断言。
  - S3 已采纳：§3 证据表已注明视觉面覆盖变化。
- **R2（`quick` delta）**：`Reject`（1 blocker / 1 warning）——B1 `.session` 状态口径未同步（写成 R2 Pass 而实际 Reject）；W2 `MIN_SECTIONS` 仍为 12、未覆盖新增视觉面。**已修**：`.session` 统一为 R1 Pass → R2 Reject → R3 Pass；`MIN_SECTIONS` 12 → 13、注释同步。
- **R3（`quick` delta）**：`Pass`（0 blocker / 0 warning；状态口径统一后，实测约 2 分钟，≤ 3 分钟）。
- **复查基线**：本记录 §1 ~ §3；`src/components/paginator/paginator.vue`；`test/e2e/paginator-sizing.e2e.ts`；`test/e2e/fixtures/app.vue`；Paginator 中英组件页。

## 6. 未覆盖边界

- 未验证 4 位数 / 自定义长标签（当前 API 只显示数值）；需要时覆盖宽度 token。
- 未验证真实下游应用的 `data-density` 组合（夹具已覆盖默认与 touch）。
