# Phase 32 M2-1：InputGroup + Select 示例的显式可访问名

> 创建时间：2026-11-13
> 触发：Phase 32 M2-1（[Phase 32 登记批次](./2026-11-12-phase32-registration.md) §2）。

## 1. 问题与处置

- 问题：`docs/examples/input-group/with-select.vue` 的 `CaomeiSelect` 仅以 `placeholder` 作可见占位，真实浏览器中触发器（`role=combobox` 的按钮）**没有可访问名**——`test/a11y` 的组件夹具不覆盖文档站示例，故长期未进机检。
- 处置：中英两份示例各补一条 `aria-label`（`筛选状态` / `Filter by status`），与既有 `placeholder` 文案一致；`CaomeiSelect` 的 `aria-label` 经 `$attrs` 透传到 `SelectTrigger`（组件单测已覆盖该透传路径）。
- 常驻断言：新增 `test/contracts/input-group-select-example.test.ts`——逐份示例要求每个 `CaomeiSelect` 带非空 `label` / `aria-label`，并设「至少 1 个选择器」下界防守卫空转；另含一条「仅 placeholder 判违约」负向用例。

## 2. 文件

| 文件 | 改动 |
|:---|:---|
| `docs/examples/input-group/with-select.vue` | 补 `aria-label="筛选状态"` |
| `docs/i18n/en-US/examples/input-group/with-select.vue` | 补 `aria-label="Filter by status"` |
| `test/contracts/input-group-select-example.test.ts` | 新增契约守卫（含负向用例） |

## 3. 验证

| 项 | 结果 |
|:---|:---|
| `pnpm exec vitest run test/contracts/input-group-select-example.test.ts` | 5 passed（含「仅 placeholder」「纯空白值」两条负向用例与 `label` 形态正例） |
| `pnpm test` | 全量通过（新增 1 文件，161 文件 / 3143 passed） |
| `pnpm lint:check` / `pnpm lint:md:check` | 通过 |
| 视觉面 | 仅新增属性，无外观 / 布局变化，跳过浏览器外观验证 |

## 4. 边界

- 该示例的审计粒度是**源码契约**，不替代真实浏览器 a11y 审计；文档站 axe 抽检矩阵（`scripts/docs/check-docs-axe.mjs`）未收录 `/components/input-group` 页，本阶段按登记口径**有意降级为源码契约**。页面级审计的再评估触发 = 新增 InputGroup 示例、`CaomeiSelect` 的可访问名透传路径变更，或文档站 axe 矩阵扩容。
- 可访问名与可见占位文案同义（满足「名称包含可见文本」）；若后续把示例改为 `label` 属性或可见标签，契约仍接受，但示例断言（`aria-label` 逐语言对齐）需同批调整。
- 契约不覆盖真实渲染后的 AX 树名称；跨版本 Reka 若改变 `SelectTrigger` 的属性消费方式，由 `src/components/select/select.test.ts` 的透传用例兜底。

## 5. Review Gate

- **audit-depth**：`quick`（纯文档示例 + 一条源码契约测试；实际 6 文件 / 约 100 行）。
- **R1**（`quick`）：`Pass`（0 blocker / 1 warning / 3 suggest）。
  - warning：记录 §5 为空、`todo.md` 仍停在「待 Review Gate」→ 本段与状态已回填。
  - suggest：契约正则接受纯空白可访问名 → 改为按属性值 `trim()` 判空并补两条负向用例；记录 §4 的 `label` 表述与示例断言口径不一致 → 已限定；页面级 axe 覆盖残差无持久载体 → §4 补再评估触发。
- **复查基线**：本记录 §1 / §4 / §5；`test/contracts/input-group-select-example.test.ts`；`docs/design/governance/index.md` 新增条目摘要；`docs/plan/todo.md` M2-1 行。
