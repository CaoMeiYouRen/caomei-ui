# Phase 19 M3-1：Tab 激活指示条裁剪修复（分隔线改内边距盒内阴影）

> 创建时间：2026-10-06
> 关联条目：[待办事项](../../plan/todo.md) Phase 19 **M3-1**（组件观感缺陷处置，视觉变更）
> 依据：TabList 滚动条修复记录 §4「顺带发现」；[设计规范 §6](../design-spec.md) / [开发规范 §7](../../standards/development.md)
> 边界：**视觉变更**——横向激活指示条由「1px 主色 + 1px 分隔线」恢复为设计意图「2px 主色、分隔线被盖住」；同步承载的滚动守卫前置条件调整。

---

## 1. 结论

- 恢复设计意图：横向激活指示条为 **2px 主色、其下分隔线被整行盖住**（原为 1px 主色 + 1px 分隔线）。
- 手段：列表横向分隔线由 `border-bottom`（边框盒，比内容盒低 1px，与指示条错行）改为**内容盒之下的 1px 内边距 + 内阴影**（内边距盒底边），使触发器 `margin-bottom: -1px` 越出的 1px 指示条正好落在该 1px 上、把它盖住；**列表总高与分隔线像素位置逐值不变**。
- **结构性副作用（正向）**：触发器的 1px 越界由「越过内容盒、成为可滚动溢出」变为「落在内边距盒内、不再溢出」——M3（TabList 滚动条）修复所针对的「1px 纵向溢出」条件被**结构性消除**（原 `overflow-y: hidden` 保留为成对声明契约，见 §5）。

## 2. 改动

`src/components/tabs/tabs-list.vue`：

- 基类 `.caomei-tabs__list`：移除 `border-bottom`；新增 `padding-bottom: 1px` 与 `box-shadow: inset 0 -1px 0 0 var(--caomei-tabs-border, var(--caomei-color-border))`；承重注释更新。
- 纵向覆盖 `:where(.caomei-tabs--vertical) .caomei-tabs__list`：重置 `padding-bottom: 0` 与 `box-shadow: none`，保持原 `border-right` 与 `overflow: visible`（纵向指示条靠 `margin-right: -1px` 压右边框，不裁剪）。

## 3. V 阶段（真实 Chromium 逐行像素对照）

| 观测量 | 修复前（浏览器内注入） | 修复后 |
| --- | --- | --- |
| 列表 `padding-bottom` / `border-bottom-width` | `0px` / `1px` | **`1px`** / **`0px`** |
| 激活项 1px 越界相对**内边距盒**（`triggerClippedPx`） | **1**（被裁剪） | **0**（不裁剪） |
| 激活项下方逐行像素（自上而下 4 行） | 白 / 主色 / **`rgb(229,231,235)` 分隔线** / 白 | 白 / **主色** / **主色** / 白 |

- 主色 = `rgb(37, 99, 235)`；分隔线色 = `rgb(229, 231, 235)`。即：修复后连续 2px 主色、无分隔线行。
- 纵向列表不受影响（`padding-bottom: 0`、`box-shadow: none`、`overflow: visible`）。
- 探针 `test-results/m3-1/verify.mjs`（gitignored，本地态）。

## 4. 常驻守卫

- **声明层** `test/contracts/tabs-list-separator.test.ts`：基类须 `padding-bottom: 1px` + `inset` 内阴影、不得声明 `border-bottom`；纵向须重置 `padding-bottom: 0` / `box-shadow: none`。含 6 条正反用例。
- **真实几何 + 像素** `test/e2e/tabs-indicator.e2e.ts`（3 用例 × mobile / tablet / desktop = 9）：分隔线以内阴影表达、`border-bottom` 归零、指示条越界不被裁剪；**像素级**断言激活项下方连续 2px 主色（截图经 DPR 映射后 canvas 就地解码）；纵向重置断言。
- **判别力（负向对照）**：还原修复前源码 → 契约 **1 failed**、E2E **6 failed**（横向 2 用例 × 3 project；纵向不受影响）→ 恢复后全绿。

## 5. 滚动守卫前置条件同步

- `test/e2e/tabs-list-overflow.e2e.ts`：原前置条件「纵向 1px 可滚动溢出」在本修复后不再成立（越界落入内边距盒）→ 改为守卫「横向溢出存在 + **纵向无溢出**」；横向可滚动、`overflow-y` 不可滚动断言保留。
- `test/contracts/tabs-list-overflow.test.ts`（`overflow: auto hidden` 成对声明）不变、仍通过。
- [开发规范 §7](../../standards/development.md) 新增一条：TabList 横向分隔线须用「内边距 + 内阴影」表达并说明成因与两道守卫。

## 6. 质量门

| 门禁 | 结果 |
| --- | --- |
| `pnpm test` | **2192** 例 passed（含新契约） |
| `pnpm test:e2e --workers=2` | **195 passed**（既有 186 + 本批 9，零回归） |
| `pnpm lint:check` / `typecheck` / `lint:css:check` | exit 0 |
| `pnpm check:design` | 通过（800 规则 / 2690 声明） |
| `pnpm capture:styles` | 302 项 0 差异——**采样面不含 Tabs，不构成本组件证据**（显式声明） |
| `pnpm docs:check` | 11 段 exit 0 |

## 7. 载体

- Backlog §1.1「Tab 指示条裁剪」候选已随 Phase 19 登记迁入本条目，`backlog.md` 无残留行（复核 `rg '指示条|裁剪' docs/plan/backlog.md` 无命中）。
- TabList 滚动条修复记录（2026-10-02）已追加收口指针指向本记录。

## 8. Review Gate 结论

- **R1（`standard`）`Pass`**：0 blocker / 0 warning / 2 suggest。审计方独立复跑：契约 9 passed、指示条 E2E 9 passed、滚动 E2E 6 passed；**负向对照**（还原修复前源码）契约 1 failed / E2E 6 failed（纵向不受影响）；自建浏览器探针实测 `listHeight` 前后一致（`heightDelta 0`）、`triggerClippedPx` 1→0、逐行像素 修复后 `白/主色/主色` vs 修复前 `白/主色/分隔线`；`check:design` / `lint:css` / `lint:md` / `check:planning-numbers`（0）全绿。
- **判定为未构成问题（记录以免误判）**：① 滚动守卫未弱化——`overflow-y === 'hidden'` 与新增的「纵向无溢出」共同捕获回归，声明层成对契约不变；② 分隔线像素位置逐值不变。
- **同批收口**：suggest ① 回填本 §8；suggest ② 像素断言精确字符串相等在非整数 DPR 下的理论 flaky 风险——三档 DPR（2.75 / 1.75 / 1）实跑稳定，**保留现状**（非阻塞）。
- 留痕：`artifacts/review-gate/2026-10-06-phase19-m3-1-tabs-indicator-clipping.md`（本地态）。
