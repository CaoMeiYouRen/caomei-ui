# Phase 28 M3-2 交付记录：DataTable / Paginator 迁移文档与确认项

> 创建时间：2026-11-07
> 条目：M3-2「DataTable / Paginator 迁移文档与确认项」。
> 口径来源：[Phase 28 登记批次记录](./2026-11-07-phase28-registration.md) §2；实现见 [M3-1 记录](./2026-11-07-phase28-m3-1-data-table-density-tokens.md)。

## 1. 交付面

| 面 | 交付 |
|:---|:---|
| DataTable 组件页（中英） | 新增「密度与选择列」节：4 个 token 的作用点、默认值、覆盖示例与可运行紧凑表格示例；「样式定制」表补 4 个 token；迁移表更新选择列宽度与密度两行 |
| DataTable 全选口径 | 「行选择」节补「有意差异，已由下游迁移评估确认（issue #28 §6），契约不变」 |
| Paginator 组件页（中英） | 新增「自渲染报表」节与 `report.vue` 示例（`first` / `last` / `total` 计算），迁移表 `template` 行指向该示例 |
| 迁移指南（中英） | 表格密度行改为 token 覆盖；新增「表格选择列宽度」行；分页报表行指向 Paginator「自渲染报表」 |
| 冻结面 | 4 个 DataTable 钩子进入披露面：`version-policy` 中英 **401 → 405**（160 默认声明 + 311 披露，去重 405）；冻结面终审追加「DataTable 文档披露」增量注记 |

- 不实现 `CurrentPageReport` / `template`；不改变全选页口径；不新增 `size` prop。

## 2. 验证证据

- `pnpm lint:md:check` / `pnpm docs:check` / `pnpm typecheck:docs` / `pnpm docs:build` → exit 0。
- 新增示例经 `typecheck:docs` 与 `docs:check:example-refs` 校验。
- 冻结面复算（实测）：默认声明 **160** / 披露 **311** / 有效冻结面 **405** / 交集 **66**；消费面 **430** / 未披露 **119**（已声明 94 / 纯内部 25）。

## 3. Review Gate

- **audit-depth**：`standard`（文档 + 示例 + 定量计数；量化证据已由调用方预核验）。时间盒 ≤ 10 分钟。
- **R1（`standard`）**：`Reject`（1 blocker / 1 warning / 3 suggest）。B1 en-US DataTable 未补 4 行 token 表与全选确认句 → 已补；W1 冻结面相邻注记「保持 430 / 119」与 M3-1 的 430 / 123 矛盾 → 改为「未披露由 123 回落至 119」；S1 空态内边距、S2 报表边界、S3 内部编号均修正。
- **R2（`quick` delta）**：`Pass`（0 blocker / 0 warning / 0 suggest）。5 项修复点全部关闭。
- **实测用时**：R1 起于 `2026-11-07T22:43:46+08:00`，返回约 `23:03`（≈19 分钟，含调度等待）；R2 起于 `23:09:10`，返回约 `23:14`（≈5 分钟）。
