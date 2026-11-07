# Phase 27 M1-3 移动端常驻回归与视觉基线交付记录

> 创建时间：2026-11-03
> 依据：[Phase 27 登记批次记录](./2026-11-03-phase27-registration.md) §2 M1-3；[响应式设计](../responsive.md) §4；M1-2 交付记录（`artifacts/review-gate/2026-11-03-phase27-m1-2-hit-target.md`，本地态）的「未覆盖边界」。
> 定位：本条目（移动端常驻回归与视觉基线）的收口记录——把密度轴与 P0 命中区纳入三档常驻矩阵，并把三个多值字段的值片与 `#hit-target` 纳入计算样式 / 像素级视觉基线。

## 1. 交付范围

- **E2E 矩阵扩面（`test/e2e/responsive.e2e.ts`）**：§4 断言 1 的 section 清单纳入 `#density-axis` / `#density-outside` / `#hit-target`，下界 `MIN_SECTIONS` 17 → **20**；新增两条矩阵用例——密度轴档位不随验收视口漂移且 touch 切换后无横向溢出；P0 命中区在 390 / 768 / 1280 / 320 / 900 各档保持 ≥24×24 且相邻不重叠。
- **命中区探针抽取（`test/e2e/helpers/hit-target.ts`，新增）**：把 `hit-target.e2e.ts` 的 24px 内外采样、视觉盒上限、Chebyshev 中心距抽为公共助手；常驻用例与矩阵扩面共用同一探针，避免两份实现漂移。
- **计算样式受检面（`test/capture/`）**：夹具新增 `#hit-target`，含三个多值字段（11 标签 / 9 多选 / 10 自动完成，240px 容器强制折行）、密码清除、Tag 关闭、Message 关闭；运行器新增 `pseudo` 采样支持，冻结 **18** 条键——字段 `row-gap` / `column-gap` / `min-height`、值片高度与内边距、删除 / 关闭按钮视觉盒、`::after` 命中区（`position` / `width` / `height`）。
- **视觉基线（`test/visual/components.visual.ts`）**：形态轴新增 `hit-target-390`（390×844，亮 / 暗各一张）；前置守卫断言三个多值字段均**确实折行**；常驻负向对照样式补 `#hit-target` 一条。
- **文档**：[响应式设计](../responsive.md) §4 断言 7 的「视觉基线边界」改为已收口并回链本记录；承载方式段补矩阵扩面与下界 20。
- **范围外顺带修复**：`docs/i18n/en-US/guide/release.md` 的 Phase 27 登记记录相对链接在 `docs:build` 下被判死链（同页其余跨 locale 链接均用绝对路径），本批改为 `/design/governance/2026-11-03-phase27-registration.md`；提交信息单列该修复。

## 2. 差异处置与重冻结

| 装置 | 冻结前 | 差异 | 处置 | 冻结后 |
| :--- | :--- | :--- | :--- | :--- |
| `capture:styles` | 349 项 | **18 处，全部为新增键**（0 条既有键变化） | `pnpm capture:styles:freeze` | **367 项**；复跑 0 差异 |
| `test:visual` | 30 张 | 2 张缺失（新面），既有 30 张 **0 差异** | `pnpm test:visual:update` | **32 张**；复跑 35 passed（32 张 + 3 条守卫） |

计算样式新增键的实测值（冻结时点）：

| 键族 | 关键读数 |
| :--- | :--- |
| `hit-target.{tags,multi,auto}.field` | `row-gap: 6px` / `column-gap: 4px` / `min-height: 36px` |
| `hit-target.{tags,multi,auto}.item` | `height: 19.1875px` / `padding-left: 8px` / `padding-right: 4px` |
| `hit-target.{tags,multi,auto}.remove` | `13.3281 × 13.3281px`（视觉盒不变） |
| `hit-target.*.remove-hit` | `position: absolute` / `24 × 24px`（不可见命中区） |
| `hit-target.password.clear` / `tag.close` | `13.3281 × 13.3281px`；命中区 24×24 |
| `hit-target.message.close` | `17.3281 × 17.3281px`；命中区 24×24 |

## 3. 判别力（负向对照）

- **移除 `::after`（临时给 `src/styles/index.css` 的 `.caomei-hit-target::after` 加 `display: none`）**：**8 failed**（`hit-target.e2e.ts` 主用例 3 个全量档 + `responsive.e2e.ts` 命中区用例 5 个档）/ **8 passed**（`hit-target.e2e.ts` 负向对照 3 个全量档 + `responsive.e2e.ts` 密度轴用例 5 个档）；还原后定向重跑全绿。
- **视觉基线常驻负向对照**：`VISUAL_NEGATIVE_CONTROL=1 pnpm test:visual` → **32 failed / 3 passed**——新增的 `hit-target-390` 亮暗两面同样报差异，证明它确实被像素比对覆盖。
- **受检面下界（2026-11-03 时点，后续 M2-2 扩面已调整）**：E2E `MIN_SECTIONS = 20`（当时）、命中区 `MIN_HIT_TARGETS = 37`；capture `DECLARED_KEY_BUDGET = 367`（当时）与折行前置 `MIN_HIT_TARGET_WRAP_FIELDS = 3`；视觉 `MIN_FORM_AXIS = 5`（当时）。任一已列出的下界被静默删项都会失败。

## 4. 验证证据

- `pnpm exec playwright test test/e2e/responsive.e2e.ts test/e2e/density.e2e.ts test/e2e/hit-target.e2e.ts` → **115 passed / 4 skipped**（5 个 project；320 / 900 只承载 `responsive.e2e.ts`，density / hit-target 仍为 3 个全量档）。
- `pnpm test:e2e` → **454 passed / 4 skipped**（R2 修复后复跑同读数）。**首跑 flaky（按测试规范 §6.1 登记）**：`menu-navigation.e2e.ts` 的「ArrowLeft 收起子菜单并把焦点交回触发器」在 desktop 档 1 例失败；隔离复跑该文件 **8 passed**、随后全量复跑 **454 passed / 4 skipped**，判为并行负载下的偶发失败，与本批改动无因果。
- `pnpm test` → **145 文件 / 2854 passed**。
- `pnpm test:visual` → **35 passed（32 张基线，0 差异）**。
- `pnpm capture:styles` → **0 差异（367 项）**。
- `pnpm exec vitest run test/capture/capture.test.mjs` → **23 passed**。
- `pnpm lint:check` / `pnpm typecheck` / `pnpm lint:md:check` / `pnpm docs:check` / `pnpm governance:check` → 全 exit 0。
- `pnpm verify` → **exit 0**（含 `docs:build`；顺带修复 `docs/i18n/en-US/guide/release.md` 的跨 locale 死链）。

## 5. Review Gate

- **audit-depth**：`standard`（多装置扩面 + 基线重冻结 + 文档口径；时间盒 ≤ 10 分钟）。
- **R1（`standard`）：`Pass`**（0 blocker / 3 warning / 6 suggest）。
  - **W1 负向对照推导不可复算** → 改为「hit-target 主用例 3 档 + responsive 命中区 5 档 = 8 failed；hit-target 负向对照 3 档 + responsive 密度轴 5 档 = 8 passed」，并注明 320 / 900 只承载 `responsive.e2e.ts`。
  - **W2 `todo.md` M1-2 存量计数 38 与实测 37 冲突** → 改为 37。
  - **W3 capture 折行面缺采集侧守卫** → 新增 `HIT_TARGET_WRAP_FIELDS` 前置：三个多值字段值片不足 2 行即 `errors.push`，避免「单行时 `row-gap` 仍为 6px」的静默失效。
  - **suggest 已采纳**：命中区下界抽为 `MIN_HIT_TARGETS` 共用；视觉 describe 标题补第五轴；索引摘要去读数；记录定位改为「移动端与响应式二期收口」；`release.md` 死链修复单列。
- **R2（`quick` delta）：`Pass`**（0 blocker / 1 warning / 1 suggest）。
  - **R2-W1 折行前置清单缺下界** → 新增 `MIN_HIT_TARGET_WRAP_FIELDS = 3` 与 `capture.test.mjs` 清单断言。
  - **R2-S1 记录定位仍像 M1 整条主线收口** → 改为「本条目（移动端常驻回归与视觉基线）的收口记录」。
- **R2 修复后复跑**：capture 单测 **23 passed**、`lint:check` / `governance:check` / `pnpm verify` exit 0；两项修复只触及清单断言与文档措辞，未起 R3。
- **复查基线**：HEAD `88bf50b` + 当前工作区；修复后只复查受影响文件与断言。

## 6. 未覆盖边界

- 命中区只覆盖 P0（清除 / 关闭 icon 按钮）；P1 / P2 目标（表单控件盒、行高受限与内联行）维持候选，见 [Backlog §1.5](../../plan/backlog.md)。
- 未在非默认 `--caomei-hit-target-min`（如 28 / 32px）下实机抽样；E2E 与计算样式均按默认 24px。
- 视觉基线的新面只取 390 视口（折行路径）与默认预设 / 明暗两态；其余视口与品牌预设下的命中区外观未新增基线。
- 未验证 Firefox / WebKit 的 `getComputedStyle(el, '::after')` 序列化差异（与既有 capture / visual 装置同内核口径）。
