# Phase 37 M2-3 交付记录：`allowEmptyValue` 测试与文档

> 创建时间：2026-11-19
> 范围与验收口径的唯一载体：[Phase 37 登记批次](./2026-11-18-phase37-registration.md) §2 M2-3；契约见 [M2-1 设计记录](./2026-11-19-phase37-m2-1-allow-empty-value-design.md)，实现见 [M2-2 交付记录](./2026-11-19-phase37-m2-2-allow-empty-value-impl.md)。

## 1. 交付面

- **测试**：`multi-select.test.ts` 补五条（空值项渲染与选中、回显标签与 `data-filled`、清除写 `[]`、孤儿空串不计有值、与保留值同名的选项被丢弃并告警、隐藏输入继承 `disabled` 且不含保留值）；`auto-complete.test.ts` 补一条（空值项渲染与选中、`data-filled` 与清除写 `undefined`）；`select.test.ts` 补三条（开启后回显与清除写 `null`、关闭态保留值原样选中、`disabled` 下隐藏输入不提交）。加上 M2-2 已落地的三条必查负向用例，三组件均具备 opt-in 正向与负向覆盖。
- **文档（中英六页）**：`select` / `multi-select` / `auto-complete` 组件页的「空串不渲染」否定句改写为「默认拒绝 + `allowEmptyValue` 放行」，并补组件页内代码块示例（不新增 `.vue` 示例文件）。
- **设计规范 §7**：Select 家族映射段同步改写——空串默认契约外、`allowEmptyValue` 放行方式与三态「未选择」、`SelectButton` 不提供该开关。
- 文件面：6 个组件页 + 1 个设计规范 + 2 个测试文件 = 9 个交付文件；另有 3 个载体（本记录 / 治理索引 / `todo.md`）。登记估算 ≈10，未超阈值。

## 2. 口径要点（写入文档的部分）

- 默认关闭：空串选项不渲染，开发期告警（生产静默）；「未选择」为 `null` / `[]` / `undefined`（后者仅 AutoComplete 且开启时）。
- 开启后：空串项正常渲染与选中，模型回显 `''`；清除写 `null` / `[]` / `undefined`；内部保留值同名选项会被丢弃并告警。
- `SelectButton` 不提供该开关（`''` 本就是普通值）。

## 3. 验证

- 定向单测：`pnpm vitest run src/components/select/select.test.ts src/components/multi-select/multi-select.test.ts src/components/auto-complete/auto-complete.test.ts` → 全绿（Select opt-in 回显 + 清除写 `null`、MultiSelect opt-in 回显 / 清除写 `[]` / 孤儿空串不计有值、AutoComplete opt-in 选中与清除写 `undefined`）。
- 文档：`pnpm lint:md:check` → 全绿；`pnpm docs:check:i18n-parity` → OK（73 对页面已对账）；`pnpm docs:check:structure` → OK（571 页锚点一致）。
- 治理：`pnpm check:governance-records` → OK（375 记录与索引一致）。

## 4. Review Gate

**轮次记录**：
- R1 `standard` Reject：1 blocker（MultiSelect / Select 的 opt-in 回显与清除无测试）+ 2 warning（`required` 文案未补、载体状态先于 Gate）+ 4 suggest。
- 修复：补 3 例正向用例（含回显 / 清除 / 孤儿空串）；中英 `multi-select` 补 `required` 条件说明；`select` 补回浏览器产物告警限定与保留值后果；隐藏输入补 `value === ''` 断言；`auto-complete` 补保留值同名说明。
- R2 `quick` **Pass**（无 blocker / warning；余项：`multi-select` 保留值同名说明转文档 follow-up）。

**结论：Pass**（R2，2026-11-19）。
