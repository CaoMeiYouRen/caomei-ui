# Phase 36 M3-1 交付记录：Rating 文档站 a11y 抽检

> 创建时间：2026-11-17
> 范围与验收口径的唯一载体：[Phase 36 登记批次](./2026-11-17-phase36-registration.md) §2 M3-1。本记录只承载矩阵登记与验证证据。

## 1. 改动

- `scripts/docs/check-docs-axe.mjs` 的页面矩阵新增 `rating-zh` / `rating-en`：就绪选择器 `.caomei-rating`，规则面沿用默认两条（`button-name` / `scrollable-region-focusable`），下界取实测值——受检元素 2（示例页两个 Rating：整星 + 半星），`button-name` 18 = 15 个评分格（`<button role="radio">`）+ 3 个站点外壳按钮（搜索 / 切换语言 / 主题预设），`scrollable-region-focusable` 1（半星评分容器的溢出裁剪节点）。
- 受检面文档同步：`docs/design/documentation-site.md` §17 与脚本文件头的条目数 / 路径数改为 15 / 14，并在 `check-docs-axe.test.mjs` 增加「§17 声明 == `PAGES` 实算」的断言，避免下次新增页面再次漂移。
- 违规即红：该脚本对任一违规节点即 `FAIL` 并列出规则与目标（判别行为在 [M1-2](./2026-11-17-phase36-m1-2-combobox-open-inert.md) §3 的可红对照中已实测）。

## 2. 验证

- `node scripts/docs/check-docs-axe.mjs --pages=rating-zh,rating-en` → OK：受检元素 2 / 2，`button-name` 通过 18 / 18、`scrollable-region-focusable` 通过 1 / 1、违规 0。
- `pnpm vitest run scripts/docs/check-docs-axe.test.mjs` → 37 passed（矩阵校验随新页面与 §17 对账断言同批通过）。
- `pnpm lint:check` / `pnpm typecheck` / `pnpm lint:md:check` / `pnpm governance:check`。

## 3. 已知边界

- axe-core 无 `radiogroup` 区域名规则，默认规则面只守每格可访问名（`button-name`）；只读 / 禁用态未在页面示例出现，未纳入本页审计。
- 脚本只跑 Chromium 单内核单视口；暗色主题与窄屏不在面内（脚本既有边界）。

## 4. Review Gate

- **R1（`standard`）**：Reject —— 1 blocker（本批次夹带未过 Gate 的 M3-2 交付物，索引两行同 hunk 绑定）/ 2 warning（§17 与脚本文件头的矩阵计数未同步；记录下界构成未归因）/ 2 suggest（未覆盖边界未登记、`scrollable` 节点未点名）。
- **R2（`standard`）**：Pass —— M3-2 从本批索引移除、单独成批；§17 与脚本文件头改为 15 条目 / 14 路径并补测试断言；记录补「18 = 15 + 3」与 `scrollable` 节点归因；已知边界（Rating 区域名无 axe 规则、只读 / 禁用态未在页面出现）写入记录。
