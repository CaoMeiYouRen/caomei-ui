# Phase 28 M3-1 交付记录：DataTable 密度与选择列宽度 token

> 创建时间：2026-11-07
> 条目：M3-1「DataTable 密度与选择列宽度 token」。
> 口径来源：[Phase 28 登记批次记录](./2026-11-07-phase28-registration.md) §2；issue [#28](https://github.com/CaoMeiYouRen/caomei-ui/issues/28) §4 / §5。

## 1. 公共钩子

| 钩子 | 默认（= 改动前现值） | 作用点 |
|:---|:---|:---|
| `--caomei-data-table-cell-padding-block` | `--caomei-space-2`（8px） | 表头 / 数据单元格的块级内边距；分组标题行、展开区、空态 / 加载态的块级内边距同源 |
| `--caomei-data-table-cell-padding-inline` | `--caomei-space-3`（12px） | 表头 / 数据单元格的行内内边距；分组标题行、展开区、空态 / 加载态同源 |
| `--caomei-data-table-selection-column-width` | `1%` | 选择列宽度（表头与数据行同源） |
| `--caomei-data-table-selection-cell-padding-inline` | `--caomei-space-2`（8px） | 选择列的行内内边距 |

- 不新增 `size` prop；密度只通过 token 调整（与既有多值字段 / 表格样式口径一致）。
- 默认值逐项等于改动前字面量，`capture:styles` 既有采样项 0 差异。
- 空态 / 加载态的块级内边距为 `calc(--caomei-space-4 + 块级 token)`，行内内边距直接取行内 token——密度调整会同步反映到空态。

## 2. 采样与断言

`capture:styles` 新增 8 个采样键（采样面 **378 → 386**）：

| 键 | 覆盖 |
|:---|:---|
| `data-table.tokens.th` / `.td` | 默认块级 8px / 行内 12px（表头与数据单元格） |
| `data-table.tokens.select` | 选择列默认行内 8px 与解析宽度 |
| `data-table.tokens.empty` | 空态默认 `24px / 12px`（`space-4 + space-2` / `space-3`） |
| `data-table.override.th` / `.td` | 就地覆盖 12px / 20px 后逐项命中 |
| `data-table.override.select` | 覆盖宽度 64px、行内 10px 后逐项命中 |
| `data-table.override.empty` | 覆盖后空态 `28px / 20px`（`space-4 + 12px`），证明空态跟随密度 |

冻结读数（摘）：`tokens.select.width = 18px`（`1%` 的实际解析值）、`override.select.width = 64px`；默认与覆盖两组数值互异，证明钩子接到真实声明而非固定值。

## 3. 验证证据

- `pnpm capture:styles` → 0 差异（386 项；既有 378 项无变化）。
- `pnpm vitest run test/capture/capture.test.mjs` → exit 0（预算同步 378 → 386）。
- `pnpm check:design` / `pnpm lint:check` / `pnpm lint:css:check` / `pnpm lint:md:check` / `pnpm typecheck` → exit 0。
- 无可见默认外观变化，`test:visual` 无 DataTable 基线（不受影响）。
- 分组标题行与展开区**共用同一声明**（`--caomei-data-table-cell-padding-*`）且本次逐字核对等价；两处不单独采样，风险由代码审查与共享声明覆盖。空态与加载态共用同一条 `padding` 规则，采样只取空态，加载态同源。

### 3.1 冻结面增量（写录时点快照 2026-11-07）

- 4 个钩子均**无默认声明**（仅以 `var(钩子, 原 token)` 消费），故默认声明集合保持 **160**、有效冻结面保持 **401** 不变；M3-2 文档披露后按 **405**（160 ∪ 311，交集 66）复算。
- 消费面 / 未披露按冻结面终审 §2.4 命令实测：**430 / 123**（含已声明 94 / 纯内部 **29**，较 M2 批次 +4 个 DataTable 内部消费名）。
- 权威台账的 M3-2 增量行（当前落在冻结面终审记录增量注记段、`### 2.4` 标题之前，与既有增量注记同位置）与 `version-policy` 的 401 → 405 在同批回填。

## 4. Review Gate

- **audit-depth**：`standard`（组件样式 + 采样装置；无发布 / 安全面）。时间盒 ≤ 10 分钟。
- **R1（`standard`）**：`Reject`（1 blocker / 1 warning / 3 suggest）。B1 交付记录缺冻结面增量登记 → 已补 §3.1（4 钩子无默认声明、默认声明 160 / 有效冻结面 401 不变、M3-2 披露后 405、消费面 430 / 未披露 123）；W1 分组 / 展开区无采样 → 记录显式声明两处共用同一声明、由代码审查覆盖；S1 ~ S3 已采纳。
- **R2（`standard` delta）**：`Pass`（0 blocker / 0 warning / 2 suggest）。B1 关闭；W1 以「显式披露 + 三处声明逐字等价」接受；剩余建议：增量注记位置措辞（已改为「§2.4 标题前」）与「三处 padding 引用同一钩子」的 grep 断言（转 follow-up）。
- **实测用时**：R1 起于 `2026-11-07T21:49:20+08:00`，返回约 `21:56`（≈7 分钟）；R2 起于 `22:06:51`，返回约 `22:28`（≈21 分钟，含子代理调度等待，超 ≤10 分钟时间盒）。
