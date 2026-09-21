# M4-2 a11y 断言接入门禁

- 类型：阶段内原子条目交付记录（例外清单机检化与门禁接线）
- 触发：Phase 12 M4-2（在 [M4-1 清单](./2026-09-22-m4-1-a11y-baseline-inventory.md) 建立之后把清单变成约束）
- 关联：[待办事项](../../plan/todo.md) Phase 12 ｜ [M4-1 记录](./2026-09-22-m4-1-a11y-baseline-inventory.md) ｜ [测试规范 §1 / §5 / §6](../../standards/testing.md)

## 1. 结论

- **断言形态**（`test/a11y/exceptions.ts` + `a11y.test.ts`）：
  1. **正向（例外外零违规）**：每个受检组件的 `violations` / `incomplete` 必须 ⊆ 已登记例外；
  2. **反向（防清单腐烂）**：已登记的例外**必须仍然命中且命中节点数不变**（`count` 指纹）——修复落地 / 命中面变化后须重新裁定并更新该条，否则门禁失败（改动在 diff 中显式可见）；不校验 `target` 选择器（随 class / DOM 结构正常演进变化，断言它只会引入假失败）；
  3. **清单自身守卫**：例外指向的组件必须 ∈ 受检夹具、键（组件 × 类型 × 规则）唯一、逐条带判定依据。
- **例外清单数据化**：3 条已裁定例外从记录搬进 `exceptions.ts`（含判定依据指针 + 命中节点数指纹，与 [M4-1 记录 §3](./2026-09-22-m4-1-a11y-baseline-inventory.md) 一一对应）；**清单是机检的唯一事实源**，本文 §2 表格只是交付快照。
- **门禁路径**：断言位于 `pnpm test` 内 → 随 `pnpm verify` 与 CI 合并门禁（`test.yml` 的 `test-build` job 跑 `pnpm test:coverage`）生效；定向入口 `pnpm test:a11y`。**门禁强度相对现状只增不减**——新增的是会失败的断言，未放宽任何既有检查，也未把浏览器依赖引入 `verify`。
- **负向对照（两向均实测灵敏）**：
  - 删掉 Toast 例外 → `CaomeiToastProvider 出现未登记的 violation（须先裁定并登记例外清单）`（exit 1）；
  - 加一条不会命中的例外 → `CaomeiButton 的已登记例外 aria-hidden-focus 未再命中：请重新裁定并更新例外清单`（exit 1）；
  - 把 Toast 例外的节点数指纹由 2 改为 1 → `命中节点数由 1 变为 2：请重新裁定`（exit 1）。
- **连续零失败**：`pnpm test:a11y` **连续 5 次 54 passed**（6 秒级/次）；全量 `pnpm test` 连续 2 次 **1506 passed**（并行负载下无新增 flaky）。
- **未改 `src/**`**；未新增依赖。
- 审计与提交状态以 [待办事项](../../plan/todo.md) 与 `.session/` 任务态为准。

## 2. 例外清单（机检数据）

> 下表是交付时快照；机检事实源是 `test/a11y/exceptions.ts`（含 `count` 指纹），改例外须改代码。

| 组件 | 规则 | 类型 | 判定依据（指针） |
| --- | --- | --- | --- |
| `CaomeiToastProvider` | `aria-hidden-focus` | violation | Reka `Toast/FocusProxy` 的 `VisuallyHidden` + `tabindex="0"` 焦点哨兵（上游有意模式）→ M4-1 记录 §3 |
| `CaomeiMultiSelect` | `aria-valid-attr-value` | incomplete | 关闭态 `aria-controls=""`（开启态指向正确面板 id，真实 Chromium 实测）→ M4-1 记录 §3 |
| `CaomeiCalendar` | `aria-prohibited-attr` | incomplete | `aria-label` 落在 `role=generic` 容器（Chromium AX 树名称可解析，ARIA 规范上仍属偏差）→ M4-1 记录 §3 |

**判定依据不重复登记**：每条例外的根因与实测值只在 M4-1 记录 §3 定义，本清单只保留结论与指针，避免双权威漂移。

## 3. 门禁路径

| 环节 | 命令 / 位置 | 说明 |
| --- | --- | --- |
| 定向 | `pnpm test:a11y` | 54 tests：7 条受检面守卫（穷尽性 / 渲染完备性 / 规则面 / 例外清单自身）+ 47 条组件审计（含门禁断言） |
| 全量单测 | `pnpm test` | a11y 断言随全量单测执行 |
| 全链路 | `pnpm verify` | 含 `pnpm test`，本地 / 周级回归使用 |
| CI 合并门禁 | `.github/workflows/test.yml` 的 `test-build` job | 该 job 跑 `pnpm test:coverage`（= 全量单测），a11y 断言随之为阻断项 |

## 4. 复现

```text
pnpm test:a11y        # 定向：受检面守卫 + 逐组件审计 + 门禁断言
pnpm test             # 全量：断言随全量单测执行
```

负向对照复现（验证断言灵敏，须在还原后重跑确认 0 失败）：临时删除 `exceptions.ts` 中任一条 → 期望「未登记的 violation」；临时新增一条不会命中的例外 → 期望「未再命中」。

## 5. 边界与未覆盖

- **例外判定的证据仍以 M4-1 记录为准**：本条目只把清单变成约束，不重新裁定例外；新增例外必须先有判定依据（根因 + 可复算证据）再登记。
- **`incomplete` 与 `violation` 分开断言**：`incomplete` 是 axe「无法判定」，不等于违规；两者不得互相顶替（登记时按 `kind` 区分）。
- **工具链版本敏感**：规则面与判定结果随 axe-core（版本以 `pnpm-lock.yaml` 为准）、happy-dom / Vitest 版本变化；任一升级后须重跑并重新裁定例外（`incomplete` 判定尤其受 DOM 实现影响）。
- **受检面本身仍受 M4-1 的边界约束**：默认（关闭）态；12 个面板内导出与依赖布局的规则不在受检面（触发点见 M4-1 记录 §5 与 [Backlog](../../plan/backlog.md)）。

## 6. 质量门与规模

- `pnpm test:a11y`（54 tests，连续 5 次零失败）/ `pnpm test`（1506 tests，连续 2 次零失败）/ `pnpm verify` / `pnpm lint:check` / `pnpm typecheck` / `pnpm lint:md:check` / `pnpm governance:check` / `pnpm docs:check` 见提交前实测记录。
- 规模：`git diff --cached --numstat` = 6 文件 / **+153 −4**——装置 82 行（例外清单 50 / 断言 32）+ 本记录 67 行 + 载体同步 4 行（索引 1 / todo 1 / `testing.md` 2）；无 `src/**` 改动、无依赖变化。

## 7. 状态

2026-09-22：M4-2 断言与门禁接线完成（两向断言 + 两向负向对照 + 连续 5 次零失败）。审计与提交状态以 [待办事项](../../plan/todo.md) 与 `.session/` 任务态为准。
