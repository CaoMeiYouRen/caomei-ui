# Phase 26 M5-1 DataTable 横向滚动容器键盘可达（交付记录）

> 创建时间：2026-10-27
> 依据：[2026-10-26 执行期追加与 1.0 发布门禁](./2026-10-26-phase26-ui-gate-planning.md) §2.2 / §2.3 / §2.4；[Refactoring UI 自检](./2026-10-26-refactoring-ui-self-check.md) §4.5。
> 定位：Phase 26 M5 插队批次第 1 条的交付记录；M5 收口自检（G0）由批次记录汇总，本记录只覆盖本条。

## 1. 交付范围

- **组件（`src/components/data-table/data-table.vue`）**
  - 根滚动容器 `.caomei-data-table` 常驻 `tabindex="0"`（本轮不做溢出条件化，见 §4）。
  - 有 `caption` 时容器带 `role="group"` 且以 `caption` 作为 `aria-label`；无 `caption` 时不输出 role / name（不伪造可访问名）。
  - 新增 `.caomei-data-table:focus-visible` 焦点环：`2px solid var(--caomei-color-primary)`、`outline-offset: 2px`，与既有 `.caomei-data-table__sort:focus-visible` 同款。
- **单元测试（`src/components/data-table/data-table.test.ts`）**：`caption` 用例扩展为断言容器的 `tabindex` / `role` / `aria-label` 与「容器内无嵌套 `tabindex`」；新增无 `caption` 分支用例。
- **E2E（`test/e2e/data-table-keyboard-scroll.e2e.ts`，新增）**：375×812 视口；前置断言 `scrollWidth > clientWidth` 与 `scrollLeft === 0`；从紧邻容器之前的焦点锚点按 `Tab` 进入容器；断言聚焦前无焦点环、聚焦后 `solid` / `2px` / 品牌主色；`ArrowRight` 后 `scrollLeft > 0`。
- **夹具（`test/e2e/fixtures/app.vue`）**：新增 `#data-table-keyboard-scroll`（8 列 + 焦点锚点 + 表格 `min-width: 720px`，溢出仅发生在组件滚动容器内）。
- **文档（中英组件页无障碍节）**：`docs/components/data-table.md` / `docs/i18n/en-US/components/data-table.md` 各补一条——容器可聚焦、方向键横向滚动、`caption` 作可访问名、无 `caption` 不伪造名称。

## 2. 范围扩张：文档站 API 表格可聚焦

`docs/.vitepress/theme/components/component-api.vue` 的 4 个手写 `<table>` 补 `tabindex="0"`。这是**超出登记范围的必要补丁**，理由与取证如下：

- `/components/data-table` 页的 axe `scrollable-region-focusable` 在只修组件后仍有残留：375px 3 处 / 768px 1 处 / 1280px 1 处，节点均位于 `section.component-api`（P、Events、Slots 等属性表），不修则本条「axe 为 0」不成立。
- 根因：VitePress 对 `.vp-doc table` 设 `display: block; overflow-x: auto`（`vitepress/.../vp-doc.css` Table 段）；VitePress 只对 **Markdown 表格**在其渲染器里硬编码 `tabindex="0"`，而 `component-api.vue` 是 SFC 内手写表格，绕过了该渲染器。
- 该补法与 VitePress 自身口径一致（裸 `tabindex="0"`，无 role / name）；`role` / `aria` 方案不会更小（仍需可聚焦）。文档站 theme 内手写 `<table>` 仅有这 4 处。
- **影响面**：该组件被全部组件页复用，每页最多多 4 个 tab 停靠点，属跨页 a11y 面变化。**守卫由 M5-2 的 `scripts/docs/check-docs-axe.mjs`（`scrollable-region-focusable`）接管**；新增第 5 个 API 表时须同步补该属性。

## 3. 验收核对

| 登记验收项 | 结果 | 证据 |
| --- | --- | --- |
| axe `scrollable-region-focusable` 为 0 | 达成 | 真实 Chromium + axe（VitePress dev，`/components/data-table`）：375 / 768 / 1280 三档 violations 0（passes 22 / 6 / 9）；同页 14 个 `.caomei-data-table` 容器全部 `tabindex="0"` |
| 375px 窄屏 Tab 可进入 | 达成 | E2E 三 project 通过；`document.activeElement === container`，`:focus-visible` 为 true |
| `ArrowRight` 后 `scrollLeft > 0` | 达成 | 冻结列示例实测 `scrollLeft 0 → 40`；E2E 轮询断言 |
| 无嵌套重复 `tabindex` | 达成 | 单测断言容器内无 `[tabindex]`；E2E `toHaveCount(0)` |
| 无视觉变化 | 达成 | 新增 CSS 仅 `:focus-visible`；新增属性不参与布局；`pnpm test:visual` 33 passed |

## 4. 已知取舍与残留

- **`focus-order-semantics`（best-practice / experimental，minor）**：可聚焦的非交互容器必然命中「Element does not have a widget role」，`role="group"` 与无 role 均如此。本仓组件级 a11y 审计已禁用该规则（`test/a11y/rules.ts`）；文档站取证按 **WCAG 规则面**（`scrollable-region-focusable` / `button-name`）判定，M5-2 的脚本须沿用该口径，不得用全量 best-practice 规则面。
- **`role="group"` 而非 `role="region"`**：登记口径为 group；`region` 会为每个表格新增地标（实测同页 14 个容器），地标膨胀更差，维持 group。
- **未做条件化**：无横向溢出时仍多一个 tab 停靠点，属登记明确的本轮非目标。
- **`caption` 与容器名的重复播报**：聚焦时会先读「表标题 + 分组」再读表格 caption；如后续要消除，可改 `aria-labelledby` 指向 `<caption>` 的 id，属打磨项。
- **follow-up**：① 可把 `.caomei-data-table` 纳入 `test/e2e/focus-visible-expansion.e2e.ts` 的受检目标（当前焦点环由本条 E2E 的 `solid` / `2px` / 主色断言覆盖）；② 暗色主题下的焦点环颜色未单独断言。

## 5. 验证证据

- `pnpm exec vitest run src/components/data-table`：5 文件 / 130 tests 通过。
- `pnpm test:a11y`：1 文件 / 67 tests 通过。
- 定向 E2E `pnpm exec playwright test test/e2e/data-table-keyboard-scroll.e2e.ts`：3 passed（mobile / tablet / desktop，视口 375×812）。
- 全量 `pnpm test:e2e`：exit 0，411 passed / 4 skipped。
- `pnpm test:visual`：33 passed。
- `pnpm typecheck` / `pnpm typecheck:docs` / `pnpm docs:check` / `pnpm governance:check` / `pnpm exec eslint` / `stylelint` / `lint-md`：全部 exit 0。
- 本地产物（gitignored，不作为唯一证据）：`test-results/m5-1/axe-scrollable-region-focusable-375.json`、`test-results/m5-1/keyboard-scroll-375.json`、`test-results/m5-1/data-table-keyboard-scroll-375.png`。

## 6. Review Gate

- **R1（`standard`）：`Reject`**（1 blocker）。blocker = 新 E2E 头部注释写入规划编号（`Phase 26 M5-1`），`node scripts/governance/check-planning-numbers.mjs` exit 1，会使 `pnpm verify` 失败；已改为「WCAG 2.1.1 + 文档路径 §2.2」的导航指针。warning = 文档站 API 表格补丁的范围扩张登记与守卫缺口；suggest = group 裁定与焦点环回归面。
- **R2（`quick` delta）：`Pass`**（0 blocker）。B1 关闭；新增的焦点环存在性断言被指出缺「聚焦前」判别前置与取值锁定，作为 suggest 记录。
- **R3（最终 `quick` delta）：`Pass`**（0 blocker）。按 R2 suggest 补齐：聚焦前 `outlineStyle === 'none'` 前置、聚焦后 `solid` / `2px` / 品牌主色三锁（含 token probe）。未发现修复引入的新 blocker。
- **审计深度 / 时间盒实测**：R1 `standard` 实测约 5 分 38 秒（≤ 10 分钟）；R2 `quick` 约 2 分 05 秒、R3 `quick` 约 1 分 43 秒（均 ≤ 5 分钟）。单分区（7 文件 < 8），未并发。
- **复查基线**：`16f243f` + 当前工作区（7 文件：6 改 + 1 新增）。

## 7. 未覆盖边界

- 英文页 `/en-US/components/data-table` 的 axe 未单独实测（组件与主题组件中英共用；en 矩阵由 M5-2 / G0 覆盖）。
- 未量化全站 best-practice 规则面的违规增量（`focus-order-semantics` 属登记外的实验规则）。
- 未验证非 Chromium 内核（Firefox / Safari）的方向键滚动步长与焦点环渲染差异。
- 未做「删除 `:focus-visible` 规则后断言必须转红」的变异自检（R3 审计方因浏览器探针崩溃未取得 UA 默认值；`solid` / `2px` / 颜色三锁已在规则缺失时转红）。

## 8. 后续补记（2026-10-27）

- §4 曾把 `<caption>` 裸写在正文里，VitePress 会把 `.md` 当 Vue 模板编译并报 `Element is missing end tag`，导致 `pnpm docs:build` exit 1；该提交（`d59800a`）因此让 HEAD 处于**构建失败**状态。同批已改为不含标签的表述（「表标题 + 分组」），`pnpm docs:build` 恢复 exit 0。
- §5 的证据清单缺 `pnpm docs:build`——它恰是唯一能拦住该问题的门禁。教训：治理记录 / 文档正文提到 HTML 标签时一律写行内代码；同类交付记录的证据清单须包含 `docs:build`。
