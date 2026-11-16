# Phase 35 M1-2：截断配方 × 提示的布局级持久守卫（F1）

> 创建时间：2026-11-16
> 触发：Phase 35 登记批次 §2 的 M1-2 行（[登记记录](./2026-11-15-phase35-registration.md)）；验收口径以该记录为唯一载体。

## 1. 交付面

| 面 | 文件 |
|:---|:---|
| 夹具 | `test/e2e/fixtures/app.vue`：新增 `#tooltip-truncation` 成对用例（长文本 / 短文本同配方），截断配方放在**非 scoped** 样式块 |
| E2E 守卫 | `test/e2e/overflow-tooltip-layout.e2e.ts`：布局前提（真截断 / 真装得下）→ 悬停出提示 / 保持静默 → 移开收起 |
| 记录 / 索引 / 规划位 | 本记录、治理索引摘要、`docs/plan/todo.md` 状态（留痕，不计入交付面） |

未改组件源码：本条目只补「真实布局级」守卫。

## 2. 采样差异实测与二选一

**实测（真实 Chromium，desktop 1280 视口，同一 `.fixture__truncate-box` 定宽 8rem）**：

| 用例 | clientWidth | scrollWidth | white-space | text-overflow | display |
|:---|:---|:---|:---|:---|:---|
| 长文本 | 128 | **352** | `nowrap` | `ellipsis` | `inline-block` |
| 短文本 | 48 | **48** | `nowrap` | `ellipsis` | `inline-block` |

结论：本期采样的 `white-space` / `text-overflow` / `display` 三项在两侧**无差异**，差异只体现在内容宽（`scrollWidth`）与「悬停是否产生面板」。

**选择：等价 E2E 守卫（不扩展 `capture:styles` 采样）**。判据：

1. `capture:styles` 采样的是**已渲染元素的计算样式**；上表三项在截断 / 未截断两侧无差异，扩展采样在这三项上只能得到两份相同快照，判别力为 0。
2. 本条目要守的因变量是「悬停是否出提示」，属交互结果，`capture:styles` 无法表达。
3. 扩展采样需要重冻结基线并扩大受检面，成本高于收益；E2E 守卫以 `scrollWidth > clientWidth` + 面板出现 / 不出现双向断言，直接覆盖承诺本身。

## 3. 验证

| 面 | 结果 |
|:---|:---|
| E2E | `npx playwright test test/e2e/overflow-tooltip-layout.e2e.ts` → three viewport（mobile / tablet / desktop）3 passed |
| 判别力（负向对照） | 删掉夹具配方中的 `white-space` / `text-overflow` → desktop 立即红（`截断配方需生效（nowrap）`）；恢复后三视口全绿。盒形态由组件默认 `inline-block` 提供，改回 `inline` 时宽高读数恒为 0（审查轮独立探针取证） |
| 样式落点 | 配方初版写在 `<style scoped>` 内实测不命中，改为**非 scoped** 命名空间块后生效——与文档站对消费方配方的写法一致 |
| 质量门 | `pnpm lint:check`、`pnpm typecheck`、`check-governance-records`、`check-governance-counts`、`check-planning-numbers`、`check-stage-counts`、`lint-md` 通过 |

**跳过项**：视觉基线（无样式变更）、`pnpm verify` 全量。

## 4. Review Gate

- **R1（`standard`，≤10 分钟；实际约 9 分钟）**：**Pass**（0 blocker / 5 warning / 4 suggest）。
- **R1 处置**：
  - W1 夹具自带 `display: block` 让「可测量盒不得是 `inline`」断言恒真 → 删掉夹具该行，盒形态由组件默认值提供，断言恢复判别力。
  - W2 「计算样式完全相同」超出取证 → 收窄为「本期采样的 `white-space` / `text-overflow` / `display` 三项无差异」。
  - W3 `waitForTimeout(300)` 魔法常量 → 提为具名常量并注明依赖夹具 `delay-duration=0`；打开 / 关闭主判据改为 `data-state`。
  - W4 新 section 未追加在末尾 → 移到 `</main>` 之前，守同文件既有约定。
  - W5 §3 质量门证据不全 → 补治理检查与 `lint-md`。
  - S1 / S2 / S3：主判据改 `data-state`、注释写明 `toHaveCount(0)` 的语义边界。
  - S4 记录第 2 节的机制表述（「根元素在组件链内部收不到 scoped 属性」）改为实测结论（「scoped 块实测不命中」），§3 同步。
- **R2（`quick`，≤5 分钟；实际约 5 分钟）**：**Pass**（0 blocker）。W1 ~ W5 全部关闭；S4 已按上条收窄；仅余 1 条 suggest（`display` 断言未钉 `inline-block`，当前契约是「非 inline 即可」，不收紧）。

## 5. 遗留

| 编号 | 内容 | 落点 |
|:---|:---|:---|
| F14 | 治理计数一致性机检 | 本阶段 M1-3 |
| F17 | DataTable 逐格提示接线开销 | 本阶段 M1-4 |
| F16 | Menu 项槽包裹约束 | 本阶段 M1-5 |

## 6. 复查基线

本记录 §1 ~ §5；`test/e2e/overflow-tooltip-layout.e2e.ts`；`test/e2e/fixtures/app.vue` 的 `#tooltip-truncation` 与非 scoped 截断配方块。
