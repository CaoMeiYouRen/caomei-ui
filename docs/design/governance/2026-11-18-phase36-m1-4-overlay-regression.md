# Phase 36 M1-4 交付记录：全库浮层回归与边界记录

> 创建时间：2026-11-18
> 范围与验收口径的唯一载体：[Phase 36 登记批次](./2026-11-17-phase36-registration.md) §2 M1-4。本记录承载逐组件判定与回归证据。

## 1. 逐组件判定

| 组件 / 形态 | 打开浮层经 Reka | 判定 | 依据 |
|:---|:---|:---|:---|
| Select | `SelectContent`（portal） | **已隔离**（Phase 35 M1-1） | `suppressOutside` + Reka 自身 `aria-hidden` |
| MultiSelect / AutoComplete | `ComboboxContent`（portal） | **本批补**（M1-2） | 面板 + 字段双根；背景 `inert` + `aria-hidden` |
| DatePicker | `PopoverContent`（portal） | **本批补**（M1-3） | 面板 + 触发器双根 |
| ColorPicker（popper） | `PopoverContent`（portal） | **本批补**（M1-3） | 同上 |
| ColorPicker（`inline`） | 无浮层（页面内静态面板） | **不采用** | 面板在文档流内，隔离背景会把页面主体从 AT 树摘掉 |
| DropdownMenu | `DropdownMenuContent`（portal） | **本批补**（M1-5） | 内容根 + 触发器根 |
| Popover | `PopoverContent`（portal） | **本批补**（M1-5） | 同上 |
| Dialog / Drawer | 模态浮层（`DialogContent` / `DrawerContent`） | **不采用** | Reka 模态已提供 `aria-hidden` 背景与焦点陷阱；再叠 `inert` 会与滚动锁、焦点归还顺序冲突，且无额外收益 |
| ConfirmDialog | 模态浮层（`AlertDialogContent`，`.caomei-confirm-dialog__content`） | **不采用** | 同 Dialog 族：Reka AlertDialog 自带模态隔离与焦点陷阱 |
| Image（预览灯箱） | 模态浮层（`DialogContent`，见 `check-overlay-z-index` 的 `NON_PANEL_FLOATING_COMPONENTS`） | **不采用** | 同 Dialog 族：灯箱为模态预览，隔离由 Reka 承担 |
| Tooltip | `TooltipContent`（portal，非模态） | **不采用** | 提示不接收焦点、不遮挡交互，打开态不隐藏背景是预期；隔离会让页面在悬停时失去可访问性 |
| Toast | Reka `ToastProvider` / `ToastViewport`（Teleport，非模态视口） | **不采用** | 视口不接收焦点且是 `aria-live` 区域：`inert` / `aria-hidden` 会静默掉播报（M1-1 已把 live region 整棵子树列为豁免） |
| Message | 内联 live region（无浮层） | **不采用** | 同上，`aria-live` 必须保持可访问 |
| Calendar（独立组件） | 无浮层（内联） | **不采用** | 内联渲染，无背景隔离语义 |
| RichTextEditor 的下拉浮层 | 第三方自带（`md-editor-v3`，无 Reka 依赖） | **不采用** | 库内不接管第三方编辑器内部浮层 |
| Chart | 无浮层 | **不采用** | 无浮层语义 |

## 2. 回归证据（抽检）

- `pnpm exec playwright test test/e2e/select-open-inert.e2e.ts` → **57 passed**（三视口 × 六类浮层，含 Dialog 内组合）。
- `pnpm exec playwright test test/e2e/overlay-motion.e2e.ts` → **39 passed**（Popover / DropdownMenu / Tooltip / Toast / Drawer 进出场）。
- `pnpm exec playwright test test/e2e/overlay-interaction.e2e.ts test/e2e/overlay-collaboration.e2e.ts` → **50 passed / 1 failed**；失败项 `C3 栈：Dialog + Select（bodyLock）逐层释放滚动锁` 单独复跑 **通过**，属并行负载下的**待观察 flaky**（同族 Vitest 并发类的根因与兜底见 [Phase 18 M2-1](./2026-10-01-phase18-m2-1-flaky-class.md)，Playwright 侧无重试兜底）；复查触发 = 下一次全量 E2E 再命中同一用例。
- 单测：浮层相关八份测试文件（open-state-inert / select / multi-select / auto-complete / date-picker / color-picker / popover / dropdown-menu）全绿。

## 3. 遗留（「不采用」清单）

- Dialog / Drawer、Tooltip、Toast / Message、Calendar（内联）、ColorPicker（`inline`）、Chart / RichTextEditor 浮层：理由见 §1，均属**有意不采用**，不是遗漏。
- 缩减 D1 全集的情况：**无**（登记 §2 的全部浮层组件已覆盖或给出理由）；枚举锚点为 `check-overlay-z-index` 的受检集合（`overlay-panels.json` 与模态选择器清单）与组件目录，后续新增浮层组件须同批补本表。

## 4. Review Gate

- **R1（`quick`）**：Reject —— 1 blocker（D1 全集漏 `ConfirmDialog` 与 `Image` 预览，§3「无缩减」不成立）/ 3 warning（flaky 判定证据不足、Toast「无浮层」表述不实、状态早于 Gate）/ 3 suggest。
- 修复：补两行判定并同步 §3 锚点；Toast / Message 拆行并改依据；Chart / RTE 拆行并纠正依赖表述；flaky 改「待观察 + 复查触发」；文件计数更正。
- **R2（`quick`）**：Pass —— 枚举与 `check-overlay-z-index` 受检集合对齐，不采用理由逐项成立。
