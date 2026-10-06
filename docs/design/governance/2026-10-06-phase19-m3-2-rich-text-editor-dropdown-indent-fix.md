# Phase 19 M3-2：RichTextEditor 下拉留白修复（文档站作用域隔离）

> 创建时间：2026-10-06
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 19 **M3-2**（组件观感缺陷处置）
> 依据：[下拉留白归因记录](./2026-10-02-rich-text-editor-dropdown-indent.md)；用户裁定 D4 = **文档站作用域隔离**
> 边界：仅改文档站主题 `docs/.vitepress/theme/caomei-demo.css`；**组件库零 `src/**` 改动**。

---

## 1. 结论

- 按 D4 取**文档站作用域隔离**：在 `caomei-demo.css` 把 `md-editor-v3`（RichTextEditor 内核）下拉菜单子树从 VitePress 正文列表排版中排除，恢复内核自身对齐形态。
- 留白消除：菜单左侧额外内边距 **20px → 0**、菜单项额外间距 **8px → 0**；下拉外框左缘 → 首项文字左缘 **31px → 11px**（= 内核自带 1px 边框 + 10px 菜单项内边距）。
- **组件库 `src/**` 零改动**；文档站正文列表渲染无回归。

## 2. 改动

`docs/.vitepress/theme/caomei-demo.css` 新增两条隔离规则（含承重注释，钉成因 / 特异性 / 归因记录与守卫路径）：

```css
.vp-doc .md-editor-menu { padding-inline: 0; margin-block: 0; list-style: none; }
.vp-doc .md-editor-menu-item { margin-top: 0; }
```

- 机理：下拉未 teleport，是正文后代节点；VitePress `.vp-doc ul`（0-1-1）压过内核 `.md-editor-menu { padding-inline: 0 }`（0-1-0）。隔离规则选择性 **0-2-0**，高于正文规则，只作用于内核菜单子树，**不改动正文列表本身**。

## 3. V 阶段（文档站真实 Chromium）

| 观测量 | 修复前（浏览器注入泄漏样式） | 修复后 |
| --- | --- | --- |
| `.md-editor-menu` `padding-left` | **`20px`** | **`0px`** |
| `.md-editor-menu` `list-style-type` | `none` | `none` |
| 第 2 个 `.md-editor-menu-item` `margin-top` | **`8px`** | **`0px`** |
| `.md-editor-menu-item` `padding-left`（内核自带） | `10px` | `10px` |

- **无回归**：`.vp-doc ul:not(.md-editor-menu)` 的 `padding-left` 在 `/components/rich-text-editor` 与 `/guide/getting-started` 两页均为 **`20px`**（不变）；其余代码块 / 列表排版未触及。
- 探针 `test-results/m3-2/verify.mjs`（gitignored，本地态）。

## 4. 常驻守卫

- `test/contracts/docs-theme-prose-isolation.test.ts`：断言 `caomei-demo.css` 含内核浮层隔离规则（菜单复位内边距 / 纵向外边距 / 列表样式；菜单项复位 `margin-top`），含 5 条正反用例。
- **判别力（负向对照）**：还原 `caomei-demo.css`（移除隔离规则）→ 仓库现状断言 **1 failed**；恢复后 6 passed。
- **守卫边界（已登记）**：声明层契约只校验 `caomei-demo.css` 文本形态，**无法感知 VitePress 正文选择器 / 特异性漂移**（升级后泄漏可静默复发）；长期常驻浏览器断言已登记 [Backlog §1.6](../../plan/backlog.md)「文档站浮层泄漏的常驻浏览器断言」。

## 5. 质量门

| 门禁 | 结果 |
| --- | --- |
| `pnpm docs:build` | exit 0（51.46s） |
| `pnpm verify` | **exit 0**（lint / typecheck / test / build / docs:build / docs:check / governance:check 全绿） |
| 新契约单测 | 6 passed |
| 组件库 `src/**` | **零改动**（`git diff -- src/` 为空） |

## 6. 载体与边界

- Backlog §1.6「文档站正文列表样式泄漏进第三方内核浮层」候选已随 Phase 19 登记迁入本条目，`backlog.md` 无残留行（`rg 'vp-doc|内核浮层|泄漏|留白' docs/plan/backlog.md` 无命中）。
- **边界**：文档站主题 CSS 不在 stylelint 受检面（[Backlog §1.6](../../plan/backlog.md) 在册），本批以真实 Chromium 实测 + 声明层契约承载；下游应用 / 其他宿主排版体系未实测（归因记录 §4 已声明同类泄漏判据）。

## 7. Review Gate 结论

- **R1（`standard`）`Pass`**：0 blocker / 0 warning / 3 suggest。审计方独立复跑契约（6 passed；负向对照 1 failed）、独立复算 V 证据（真实 Chromium + vitepress dev:5199：修复后 0px / 0px / 10px；注入修复前 20px / 8px；正文列表两页 20px 无回归），读依赖源码确认选择性与成因；`git diff -- src/` 为空。
- **同批收口**：suggest ① 声明层契约无法感知 VitePress 漂移 → 记录 §4 登记边界 + [Backlog §1.6](../../plan/backlog.md) 追加「常驻浏览器断言」候选；suggest ② 归因记录 §5「待决策项」口径 → 标注「已裁定 D4=①」；suggest ③ 本地探针遗留 dev server → 探针改为进程组终止（gitignored，不入提交）。
- 留痕：`artifacts/review-gate/2026-10-06-phase19-m3-2-rich-text-editor-dropdown-indent-fix.md`（本地态）。
