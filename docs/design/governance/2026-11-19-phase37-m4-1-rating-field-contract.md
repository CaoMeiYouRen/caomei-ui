# Phase 37 M4-1 交付记录：Rating 字段契约接入

> 创建时间：2026-11-19
> 范围与验收口径的唯一载体：[Phase 37 登记批次](./2026-11-18-phase37-registration.md) §2 M4-1。本记录只承载实现机制与验证证据。

## 1. 实现

- **props 基类**：`RatingProps` 改为继承 `FieldStateProps` + `FieldIdentityProps`（非输入类控件，不引入 `placeholder`），删除自有的 `size` / `disabled` / `label` 重复声明；`RatingSize` 保留为 `ComponentSize` 的别名，避免使用方类型断裂。
- **根接线**：`CaomeiRating` 改为 `inheritAttrs: false`，根属性经 `useLabelAttrs` 透传并让显式可访问名优先于外部 `aria-label`；`id` 落到 `role="radiogroup"` 根，`name` 由 `RadioGroupRoot` 消费（仅在表单内渲染隐藏控件），`invalid` 映射 `aria-invalid` 且**优先于**透传的同名属性（`v-bind` 在前、控制态在后）。
- **可访问名三级**：显式 `label` > 透传 `aria-label` > 语言兜底（只读 / 可交互分别取不同兜底），由 `resolveLabelName` 统一。
- **表单值**：`name` 经 Reka 的 `RadioGroupRoot` 隐藏控件提交当前分值（`name=score` 时 `FormData` 得到 `score=3`）。
- **既有能力不变**：`readonly` / `disabled` / `max` / `step` / `clearable` 语义未改，`size` 档位类与样式不变。

## 2. 验证

- 定向单测：`pnpm vitest run src/components/rating src/components/form` → 全绿。新增四例覆盖 label / invalid / id 落根、`name` 提交分值、无 `label` 时透传 `aria-label` 生效、prop 的 `invalid` 优先于透传值；`form.test.ts` 的 `FIELD_STATE_CASES` 纳入 Rating（状态型控件 4 → 5），使「在 `CaomeiFormItem` 内」有持久测试而非一次性证据。
- `pnpm typecheck` → 通过；`pnpm exec eslint src/components/rating --max-warnings 0` → 通过。
- 未涉及渲染外观变化（仅属性接线），未改样式；浏览器验证由 M4-2 的组件页示例承载。

## 3. Review Gate

**结论：Pass**（R1，`standard`，2026-11-19，0 blocker / 2 warning / 3 suggest）。

- W1 根属性顺序：`v-bind="rootAttrs"` 前移，控制态（`aria-invalid` / `aria-readonly`）在后，并补「prop 优先于透传 `aria-invalid`」用例。
- W2 表单契约清单：`form.test.ts` 的 `FIELD_STATE_CASES` 纳入 Rating 并把计数改为 5，`form.test.ts` 的计数同步归属落在本条（与登记 §6 一致）。
- suggest 处置：记录 §1 修正 `name` 的落点表述；未评分提交 `0` 的口径与组件页「透视 `aria-label`」说明由 M4-2 承接。
