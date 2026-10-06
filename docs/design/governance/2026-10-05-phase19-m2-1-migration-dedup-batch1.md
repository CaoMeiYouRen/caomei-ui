# Phase 19 M2-1：组件页迁移映射去重（批 1：ColorPicker / DatePicker）

> 创建时间：2026-10-05
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 19 **M2-1**（组件文档一致性整改 / 迁移映射去重）
> 依据：[专项评估](./2026-10-02-component-doc-migration-duplication-evaluation.md) §4 / [第三轮范围评估](./2026-10-02-next-stage-scope-evaluation.md) §N2
> 边界：仅删组件页中段 `> 迁移映射` 正文块并折入末尾迁移节；不改 `src/**`、不改设计规范 §7（唯一权威）。

---

## 1. 结论

- 删除 **ColorPicker / DatePicker 中英 4 页**的中段 `> 迁移映射` 正文块；独有语义折入末尾 `## 从 PrimeVue 迁移` 节。
- **独有内容核对**（删除前逐页 diff）：
  - **ColorPicker（中 / 英）**：正文块内容（字段映射 / `format` 取值语义 / `appendTo`·`overlayClass`·`panelClass` 未实现）与迁移节表格 + 已知差异 + 未实现**逐项重复**，**无独有信息**，纯删除。
  - **DatePicker（中 / 英）**：正文块仅「`selectionMode` **零下游用量、经用户决策延后**」为迁移节未含的语义 → 已折入两语迁移节的「未实现」条目。
- 复算（N2 口径）：`rg -l '^> 迁移映射' docs/components/*.md` 整改前 **6** / 本批消除 **2** / 当前 **4**；`rg -l '^> Migration map' docs/i18n/en-US/components/*.md` 同口径 **6 / 2 / 4**（本批消除 `color-picker` / `date-picker` 两页两语）。
- 确认 **N2 属实**：整改前中英各 **6** 页命中（**两语均含 `date-picker`**；英文页用词为 `Migration map`，非评估记录早先所记「英文 5」）。

## 2. 改动

| 文件 | 改动 |
| --- | --- |
| `docs/components/color-picker.md` | 删除中段 `> 迁移映射…` 正文块（无独有内容） |
| `docs/i18n/en-US/components/color-picker.md` | 同上（英文） |
| `docs/components/date-picker.md` | 删除中段 `> 迁移映射…` 正文块；「`selectionMode` 零用量 / 用户决策延后」折入未实现节 |
| `docs/i18n/en-US/components/date-picker.md` | 同上（英文） |

## 3. 质量门

| 门禁 | 结果 |
| --- | --- |
| `pnpm lint:md:check` | exit 0 |
| `pnpm check:migration-consistency` | 通过（§7 组件 40 / 有迁移节 39 / 口径一致） |
| `pnpm docs:check` | 11 段 exit 0（links / structure / i18n-parity 等） |
| `pnpm check:governance-records` | OK（115 记录 / 305 md 指针） |
| `pnpm check:planning-numbers` | 0 处命中 |

## 4. Review Gate 结论

- **R1（`standard`）`Reject`**：1 blocker —— N2 复算数字误记为「6 → 5」（实测当前 **4**，与记录 §5「其余 4 页」矛盾）。内容层面「无信息丢失」核对与 5 项门禁均通过。
- **修复**：三处（记录 / 索引 / `todo.md`）改为显式口径「整改前 6 / 本批消除 2 / 当前 4」；§3 补 `check:governance-records` / `check:planning-numbers` 门禁行；§1 与 §5 不再矛盾。
- **R2（`standard`，delta）`Pass`**：0 blocker / 0 warning / 0 suggest；R1-B1 与 2 条 suggest 全部关闭，实测 `zh=4 / en=4` 与「当前 4」自洽。
- 留痕：`artifacts/review-gate/2026-10-05-phase19-m2-1-migration-dedup-batch1.md`（本地态）。

## 5. 边界

- 本批只处理 2 页 × 2 语；其余 4 页（Drawer / Message / SplitButton / Tag）由 M2-2 / M2-3 承接。
- 设计规范 §7 为唯一权威口径，未改动；组件页迁移节仍是其受守卫镜像。
