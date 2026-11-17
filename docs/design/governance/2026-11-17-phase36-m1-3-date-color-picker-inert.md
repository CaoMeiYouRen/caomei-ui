# Phase 36 M1-3 交付记录：DatePicker / ColorPicker 打开态补 `inert`

> 创建时间：2026-11-17
> 范围与验收口径的唯一载体：[Phase 36 登记批次](./2026-11-17-phase36-registration.md) §2 M1-3。本记录只承载实现机制、边界与验证证据。

## 1. 实现

- **接入方式**：两个 Popover 浮层复用 [M1-1](./2026-11-17-phase36-m1-1-multi-overlay-isolation.md) 的 `suppressOutside`，与 Select / Combobox 同口径。
- **多根保留**：面板根（`PopoverContent`）与**触发器根**同时保留——触发器是字段的可见入口，只保留面板会把字段整棵标 `inert`，打开即无法聚焦 / 点击。
- **打开 / 关闭时序**：打开后 `post` 刷新隔离；关闭时 `sync` 立即回退（先于焦点归还）。Escape 关闭由组件把焦点交还触发器（非模态 Popover 不保证自动归还）。
- **背景点击**：`document` 捕获阶段 `pointerdown`，目标不在面板与触发器内时先解除隔离，面板由 Reka 外部点击关闭；`inert` 不参与命中测试，因此首次点击只关闭面板、不激活背景控件。
- **inline 形态**：ColorPicker 的 `inline` 面板是页面内静态 flex item（`v-if="!inline"` 的 PopoverRoot 不渲染），**不做任何隔离**，也不注册监听。

## 2. 边界

| 边界 | 处置 |
|:---|:---|
| `inline` 面板（ColorPicker） | 不隔离：面板在文档流内，隔离背景会把页面主体从 AT 树摘掉 |
| popper 面板（DatePicker / ColorPicker） | 隔离背景，保留面板与触发器两根 |
| 模态内打开（Dialog 内） | 触发器的祖先链保留，模态内容不被隔离；模态外的背景仍被隔离；模态自身的 `inert` / `aria-hidden` 不接管、不撤销 |
| 鼠标关闭 | 只回退隔离，不抢焦点；首次点击背景只关闭面板 |
| 键盘关闭（Escape） | 回退隔离后把焦点交还触发器 |
| 范围选择 / 时间输入等面板内部件 | 属面板子树，始终豁免 |

## 3. 验证

- `pnpm vitest run src/components/date-picker/date-picker.test.ts src/components/color-picker/color-picker.test.ts` → 86 passed（新增 3 例：DatePicker 展开隔离与卸载回退、ColorPicker popper 隔离、ColorPicker inline 不隔离）。
- `pnpm exec playwright test test/e2e/select-open-inert.e2e.ts` → 54 passed（三视口 × 五类浮层；新增 DatePicker 三条与「模态内 DatePicker / ColorPicker」两条）。
- `node scripts/docs/check-docs-axe.mjs --pages=date-picker-open-zh,date-picker-open-en,color-picker-open-zh,color-picker-open-en` → OK：受检元素 6 / 6 / 5 / 5，`aria-hidden-focus` 通过 45 / 45 / 30 / 30、违规 0。
- `pnpm vitest run scripts/docs/check-docs-axe.test.mjs` → 37 passed（§17 计数与矩阵实算一致）。
- 治理机检：`pnpm lint:check`、`pnpm typecheck`、`pnpm lint:md:check`、`pnpm governance:check`。

## 4. Review Gate

（待填：审计结论见本节回填。）
