# Phase 37 M4-2 交付记录：Rating 表单集成文档与示例

> 创建时间：2026-11-19
> 范围与验收口径的唯一载体：[Phase 37 登记批次](./2026-11-18-phase37-registration.md) §2 M4-2。本记录只承载文档改动与复算证据。

## 1. 改动

- **Rating 组件页（中英）**：新增「表单集成 / Form integration」节与页面内代码块示例（不新增 `.vue`），说明字段契约（`id` / `name` / `label` / `invalid`）、插槽作用域绑定方式、`name` 提交分值；补「未评分提交 `0`、组件无空值态，需要不提交时在提交前剔除」的口径。
- **无障碍段（中英）**：名称来源改为「显式 `label` > 透传 `aria-label` > 内建文案」，与 M4-1 的 `resolveLabelName` 实现一致；「基础用法」段的同名表述同步。
- **Form 组件页（中英）「字段绑定」表**：字段总数 12 → 13，`FieldStateProps` 行纳入 Rating；与 `form.test.ts` 的 `FIELD_STATE_CASES`（5 个状态型控件）同步复算。

## 2. 复算

- 表格计数：7（`FieldProps`）+ 5（`FieldStateProps`）+ 1（仅身份）= 13，与文档首句一致。
- 测试侧：`form.test.ts` 的 `FIELD_STATE_CASES` 为 Checkbox / CheckboxGroup / RadioGroup / Rating / SelectButton 共 5 个；`FIELD_PROPS_CASES` 7 个；`IDENTITY_ONLY_CASE` 1 个。
- 未新增 rules 能力、未改组件代码。

## 3. 验证

- `pnpm lint:md:check` → 全绿。
- `pnpm docs:check:i18n-parity` / `pnpm docs:check:interpolation` / `pnpm docs:check:example-refs` → 全绿。
- `pnpm docs:build` → 构建成功（页面渲染通过，内联代码块示例不参与 `<demo>` 受检面，故未做页面级浏览器复核）。
- 定向单测沿用 M4-1：`pnpm vitest run src/components/form src/components/rating` → 全绿。

## 4. Review Gate

**轮次记录**：
- R1 `quick` Reject：2 blocker（两页表单集成示例未给 `CaomeiFormItem` 传 `name`，示例自身无法提交；英文无障碍段未同步三级可访问名）+ 3 warning（基础用法表述、`readonly` / `disabled` 不提交未限定、记录未登记页面复核口径）+ 1 suggest。
- 修复：示例补 `name="score"`；英文无障碍段与基础用法改为三级口径；加「可交互态」限定；记录补 `docs:build` 结果与「无 `<demo>` 故不做页面复核」的口径；§1 标注语种。
- R2 `quick` **Pass**（2026-11-19）。

**结论：Pass**（R2，`quick`，2026-11-19，0 blocker）。
