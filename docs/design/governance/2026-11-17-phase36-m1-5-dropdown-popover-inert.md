# Phase 36 M1-5 交付记录：DropdownMenu / Popover 打开态补 `inert`

> 创建时间：2026-11-18
> 范围与验收口径的唯一载体：[Phase 36 登记批次](./2026-11-17-phase36-registration.md) §2 M1-5。本记录只承载实现机制、边界与验证证据。

## 1. 实现

- **接线位置**：`CaomeiDropdownMenuContent` / `CaomeiPopoverContent`。两者的内容根由使用方通过插槽提供，触发器不在组件内，因此**以内容根为唯一保留根**隔离背景。
- **触发时机**：内容挂载（`onMounted`）与 Reka 的 `@open-auto-focus` 各补一次隔离；`@close-auto-focus` 先解除隔离再让 Reka 归还焦点（避免触发器仍在 `inert` 子树里）；`onBeforeUnmount` 兜底释放。
- **`forceMount` 守卫**：内容常驻时只有 `data-state` 缺失或为 `open` 才隔离（显式关闭态不隔离）。
- **背景点击**：`document` 捕获阶段 `pointerdown` 先解除隔离，面板由 Reka 外部点击关闭；`inert` 不参与命中测试，首次点击只关闭面板。

## 2. 边界

| 边界 | 处置 |
|:---|:---|
| 触发器不在内容组件内 | 触发器随背景一起被隔离（菜单 / 浮层按模态语义处理）；关闭时先解除隔离再归还焦点 |
| `forceMount` 内容常驻 | 仅 `data-state` 为 `open`（或缺失）时隔离 |
| 菜单项 / 子菜单 | 属内容子树，始终豁免 |
| 背景点击 | 首次点击只关闭面板、不激活背景控件 |
| 模态内打开 | 内容根的祖先链保留，模态内容不被隔离；模态自身的隔离不接管 |

## 3. 验证

- `pnpm vitest run src/components/popover/popover.test.ts src/components/dropdown-menu/dropdown-menu.test.ts` → 43 passed（新增 2 例：展开隔离背景、关闭回退）。
- `pnpm exec playwright test test/e2e/select-open-inert.e2e.ts -g "Popover"` → 3 passed（三视口，模态内 Popover：面板不被隔离、模态外背景被隔离、两次 Tab 均不入背景）。
- `node scripts/docs/check-docs-axe.mjs --pages=popover-open-zh,popover-open-en,dropdown-menu-open-zh,dropdown-menu-open-en` → OK：受检元素 6 / 6 / 4 / 4，`aria-hidden-focus` 通过 1 / 1 / 1 / 1、违规 0。
- `pnpm vitest run scripts/docs/check-docs-axe.test.mjs` → 通过（§17 计数与矩阵实算一致：23 条目 / 22 路径）。
- 治理机检：`pnpm lint:check`、`pnpm typecheck`、`pnpm lint:md:check`、`pnpm governance:check`。

## 4. 残余

- DropdownMenu 未加入 E2E 夹具（当前无独立锚点），三视口焦点面由 axe 打开态与单测覆盖；后续补夹具锚点后可加同款用例。
- 非模态页面级 Popover 的三视口 Tab 用例：模态内场景已覆盖，页面级待补。

## 5. Review Gate

- **R1（`standard`）**：Reject —— 2 blocker（触发器被一起 `inert`，`overlay-motion` E2E 转红且与 `modal: false` 契约冲突；`forceMount` 常驻内容再次打开时 `open-auto-focus` 不再触发，隔离静默失效）/ 3 warning（E2E 断言无判别力；`pointerdown` 提前解除制造「面板仍开但不隔离」窗口；§17 清单未同步）/ 3 suggest。
- 修复：抽出 `_shared/use-open-state-isolation`（`data-state` 观察 + 内容根 / 触发器根双保留）；根组件 `provide` 触发器元素、触发器写入、内容读取；删除 `pointerdown` 解除路径；E2E 断言改为「模态内其它字段被隔离」；§17 清单同步。
- **R2（`standard`）**：Pass —— `overlay-motion` 12 passed、`select-open-inert` 57 passed、单测 43 passed、axe 四页 OK；`forceMount` 打开态由 `data-state` 观察覆盖。
