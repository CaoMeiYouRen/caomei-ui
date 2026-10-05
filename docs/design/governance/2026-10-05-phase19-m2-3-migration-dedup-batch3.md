# Phase 19 M2-3：组件页迁移映射去重（批 3：SplitButton / Tag；M2 收口）

> 创建时间：2026-10-05
> 关联条目：[待办事项](../../plan/todo.md) Phase 19 **M2-3**（组件文档一致性整改 / 迁移映射去重；本记录为 M2 收口）
> 依据：[专项评估](./2026-10-02-component-doc-migration-duplication-evaluation.md) §4 / [第三轮范围评估 N2](./2026-10-02-next-stage-scope-evaluation.md)
> 边界：仅删组件页中段 `> 迁移映射` 正文块并折入末尾迁移节；不改 `src/**`、不改设计规范 §7。

---

## 1. 结论

- 删除 **SplitButton / Tag 中英 4 页**的中段 `> 迁移映射` 正文块；独有语义折入末尾 `## 从 PrimeVue 迁移` 节。
- **独有内容核对**（删除前逐页 diff）：
  - **SplitButton（中 / 英）**：字段映射（`label` / `icon` / `model` / `severity` / `text` / `outlined` / `size` / `rounded`）已由迁移节表格覆盖；**独有**为未实现项的括注（`dropdownIcon`「图标固定」、`menuButtonProps` / `buttonProps`「改用根元素属性与 `#icon` 插槽」、`appendTo` 等「Portal 挂载 / 层级固定」、`fluid`「按内容宽度」）→ 已折入未实现行。另 4 处细节（「下游零用量」判据 / 「传 `@lucide/vue` 组件、非字符串类名」/ 开发规范 §组件设计指针 / 主按钮图标语义）**由设计规范 §7 承接**（§7 未改动），本页不再复制。
  - **Tag（中 / 英）**：`severity → tone` 折叠与 `variant` 说明已由表格 + 已知差异覆盖；**独有**为 ① `info → primary`（原表格未列）、② 「Tag 无 `error` 用量，通用语义色映射见[复核台账 §4.3](./2026-09-14-momei-usage-audit.md)」、③ 「PrimeVue Tag 无 `outlined` prop（功能 props 仅 `value` / `severity` / `rounded` / `icon`）」、④ 「`info` tone 见设计规范 §9 未决项」→ 已分别折入表格行与已知差异。
- **复算**：`rg -l '^> 迁移映射' docs/components/*.md` 批前 **2** / 本批消除 **2** / 当前 **0**；英文 `^> Migration map` 同口径 **2 / 2 / 0**。**M2 全局终态：中英各 0 页**（313 行 → 0）。

## 2. N2 修正（Backlog §1.6 该行）

- **据实处理**：Backlog §1.6 的「组件页迁移映射去重」候选行**已于 Phase 19 登记批次随范围上收迁移出候选池**（登记批次「`backlog.md` 迁出 7 行」），当前 `backlog.md` 全库 `rg '迁移映射|正文块|去重'` **无命中**——**无残留行可修正**。
- **N2 关闭**：其记录的「英文 5 / `date-picker` 英文页缺正文块」为**错误口径**，真实基线与终态以 M2 三批记录为准——**整改前中英各 6（两语均含 `date-picker`；英文页用词 `Migration map`）/ M2 后各 0**。本记录即 N2 的终态载体。

## 3. 改动

| 文件 | 改动 |
| --- | --- |
| `docs/components/split-button.md` | 删除中段正文块；未实现行折入括注 |
| `docs/i18n/en-US/components/split-button.md` | 同上（英文） |
| `docs/components/tag.md` | 删除中段正文块；表格补 `info → primary`；已知差异补 `error` 零用量 / 台账链接 / `outlined` prop 说明 |
| `docs/i18n/en-US/components/tag.md` | 同上（英文） |

## 4. 质量门

| 门禁 | 结果 |
| --- | --- |
| `pnpm lint:md:check` | exit 0 |
| `pnpm check:migration-consistency` | 通过（§7 组件 40 / 有迁移节 39） |
| `pnpm docs:check` | 11 段 exit 0 |
| `pnpm check:governance-records` | OK |
| `pnpm check:planning-numbers` | 0 处命中 |

## 5. Review Gate 结论

- **R1（`standard`）`Reject`**：1 blocker / 1 warning / 1 suggest —— blocker：Tag 中英正文块独有交叉引用「`info` tone 见设计规范 §9 未决项」未被 §7 承接，删除即丢失；warning：记录 §1 对 SplitButton 独有细节的「已由迁移节表格覆盖」表述过度（4 处细节实由 §7 承接）；suggest：`todo.md` M2-3 说明列仍写「同批修正 Backlog §1.6 该行」，与该行已迁出不符。
- **修复**：Tag 中英「已知差异」补回 §9 未决项指针；记录 §1 SplitButton 条目补「4 处细节由 §7 承接」；`todo.md` 说明 / 验收列改为「行已迁出、子项不再适用」。复算与 N2 论断经审计方独立复核属实，门禁全绿。
- **R2（`standard`，delta）`Pass`**：0 blocker / 0 warning / 0 suggest；R1 三条修复点（Tag §9 指针、记录 §1 承接声明、`todo.md` 两列口径）全部关闭，链接有效、口径自洽。
- 留痕：`artifacts/review-gate/2026-10-05-phase19-m2-3-migration-dedup-batch3.md`（本地态）。

## 6. 边界

- 设计规范 §7 未改动，组件页迁移节仍是其受守卫镜像。
- M2 三批合计 12 页 → 6 页 × 中英，全部去重完成；后续新增组件页不得再写中段正文块（迁移节为唯一页面副本，§7 为唯一权威）。
