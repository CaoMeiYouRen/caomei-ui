# Phase 19 M2-2：组件页迁移映射去重（批 2：Drawer / Message）

> 创建时间：2026-10-05
> 关联条目：[待办事项](../../plan/todo.md) Phase 19 **M2-2**（组件文档一致性整改 / 迁移映射去重）
> 依据：[专项评估](./2026-10-02-component-doc-migration-duplication-evaluation.md) §4 / [批 1 记录](./2026-10-05-phase19-m2-1-migration-dedup-batch1.md)
> 边界：仅删组件页中段 `> 迁移映射` 正文块并折入末尾迁移节；不改 `src/**`、不改设计规范 §7。

---

## 1. 结论

- 删除 **Drawer / Message 中英 4 页**的中段 `> 迁移映射` 正文块；独有语义折入末尾 `## 从 PrimeVue 迁移` 节。
- **独有内容核对**（删除前逐页 diff）：
  - **Drawer（中 / 英）**：正文块的字段映射与已知差异已由迁移节表格 + 未实现节覆盖；**独有**为 ① `#footer` → `#footer`（同名底部插槽，表格未列）与 ② 「`position="full"` / 生命周期事件 / 容器插槽**下游零用量**」判据 → 已分别补为表格行与未实现节补语。
  - **Message（中 / 英）**：正文块的 `severity → tone` 折叠与 `variant` 映射已由表格覆盖；**独有**为「`secondary` / `contrast` / `info` 为**有损近似**」→ 已折入表格 `severity` 行。
- **其余页面级差异的覆盖声明**：删除前正文块另含 `blockScroll`（PrimeVue prop 名）、`position="full"` 的全屏替用建议（`modal="false"` + `style` 铺满）与 Message `warn` / `warning` 双别名——三者不在本页迁移节重复，但**已在[设计规范 §7](../design-spec.md) 的 Drawer / Message 条目**（权威口径，页面迁移节即其受守卫镜像）中完整承接，故全仓信息集合未缩减（协证：§7 对应条目被本页迁移节就地链接）。
- 复算（N2 口径）：`rg -l '^> 迁移映射' docs/components/*.md` 批前 **4** / 本批消除 **2** / 当前 **2**；英文 `^> Migration map` 同口径 **4 / 2 / 2**。

## 2. 改动

| 文件 | 改动 |
| --- | --- |
| `docs/components/drawer.md` | 删除中段正文块；表格补 `#footer` 行；未实现节补「零下游用量」判据 |
| `docs/i18n/en-US/components/drawer.md` | 同上（英文） |
| `docs/components/message.md` | 删除中段正文块；`severity` 行补「有损近似」 |
| `docs/i18n/en-US/components/message.md` | 同上（英文） |

## 3. 质量门

| 门禁 | 结果 |
| --- | --- |
| `pnpm lint:md:check` | exit 0 |
| `pnpm check:migration-consistency` | 通过（§7 组件 40 / 有迁移节 39） |
| `pnpm docs:check` | 11 段 exit 0 |
| `pnpm check:governance-records` | OK |
| `pnpm check:planning-numbers` | 0 处命中 |

## 4. Review Gate 结论

- **R1（`standard`）`Pass`**：0 blocker / 0 warning / 1 suggest。审计方独立复跑 N2 复算（批前 4 / 消除 2 / 当前 2，zh=2 / en=2 自洽）、逐页核对独有信息无丢失、中英对称、5 项门禁 exit 0。
- **同批收口**：suggest（记录 §1 独有内容枚举不完整）——补「其余页面级差异（`blockScroll` 命名 / `full` 全屏替用建议 / Message 别名）以设计规范 §7 为完整口径」的覆盖声明，使留痕与删除前 diff 对齐。
- 留痕：`artifacts/review-gate/2026-10-05-phase19-m2-2-migration-dedup-batch2.md`（本地态）。

## 5. 边界

- 本批处理 2 页 × 2 语；余 2 页（SplitButton / Tag）由 M2-3 承接（并在 M2-3 同批修正 Backlog §1.6 行计数与 N2 结构断言）。
- 设计规范 §7 未改动，组件页迁移节仍是其受守卫镜像。
