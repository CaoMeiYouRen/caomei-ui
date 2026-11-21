# Phase 39 M7-2 E2E 周回归稳定性与记录

> 创建时间：2026-11-21
> 触发：Phase 39 M7-2（E2E 质量收口）。记录本轮 5 例修复后的定向与全量复跑结论、失败根因与剩余观察项。

## 1. 定向复跑

命令：`pnpm exec playwright test test/e2e/back-top.e2e.ts test/e2e/overlay-stacking.e2e.ts test/e2e/navigation-motion.e2e.ts test/e2e/selector-motion.e2e.ts test/e2e/data-table-scroll.e2e.ts --workers=1` → **81 passed / 0 failed**（5 spec × 3 project；mobile / tablet / desktop）。

- 口径：`--workers=1` 与 CI 一致；并行 worker 下动效用例会因动画采样竞争出现假失败，不作为结论。

## 2. 全量周回归

命令：`pnpm test:e2e --workers=1`

- 结果：**1119 passed / 12 skipped / 1 failed**（首次）；失败为 `safe-area-fixed.e2e.ts` 的 `BackTop 右下偏移叠加安全区` × 3 project。
- 根因：M7-1 为消除 BackTop 夹具遮挡，把视觉基线按钮改用 `--caomei-back-top-right/bottom` 偏移；该用例直接读取 `#ds-back-top-button` 的 `right` / `bottom` 计算值，读到偏移后的 114px，而非默认 `space-4 + safe-area`。
- 修复：视觉基线按钮改用 `transform: translate(-5rem, -5rem)` 避开同坐标，`right` / `bottom` 保持默认值；元素级截图不受位移影响。
- 复跑：`pnpm exec playwright test test/e2e/back-top.e2e.ts test/e2e/safe-area-fixed.e2e.ts --workers=1` → **30 passed**。

## 3. 失败根因与修复点（汇总）

| 用例 | 根因 | 修复点 |
|:---|:---|:---|
| `back-top` | 两个 BackTop 夹具同坐标（fixed 右下），后渲染者拦截点击 | 视觉基线按钮 `transform` 偏移，保留默认 `right/bottom` |
| `overlay-stacking` | 既有用例已含「模态内容根 + 后代可命中」自证；本轮无代码改动 | 全矩阵复跑证明稳定 |
| `navigation-motion` SplitButton | scoped `[data-v]` 落在 `:where([data-motion])` 上，且目标按钮是 ButtonGroup 后代 | 改 `.caomei-split-button :deep(...)` |
| `selector-motion` DatePicker / reduce | 程序化触发遗留图标提示层；ColorPicker / AutoComplete 浮层未关闭即操作后续元素 | 清理浮层并断言归零 |
| `data-table-scroll` 展开列 | 展开列未冻结，移动端被 400px 冻结姓名列覆盖 | 夹具展开列 `frozen: 'left'`，与选择列同侧 |

## 4. 剩余观察项

- 全量并行 worker 下动效用例仍存在采样竞争（`navigation-motion` / `selector-motion`），CI 固定 `workers=1`，本地复跑建议同口径；不将并行结果作为门禁结论。
- `overlay-stacking` 未改动源码；其「后代自证」能力依赖 Reka 的 `pointer-events` 记账位置，若上游改为包裹层维护，用例会以 `判别力自证失败` 显式报错，而非静默通过。
- DatePicker 清理需要连续 Esc（提示层 + 面板层）是测试装置行为，不是产品缺陷；真实指针点击不会留下提示层。已用注释标注，未降低面板关闭断言。

## 5. 结论

- 5 例全部从失败转通过；负向对照已在修复前实测（BackTop 点击超时、SplitButton `transform: none`、DatePicker 面板计数 1、移动端展开按钮被 pinned 单元格拦截）。
- 断言未放宽：仅增加浮层关闭断言、把展开列固定为可点，并保持 `overlay-stacking` 的判别力自证。
- `pnpm capture:styles` → 0 差异（399 项），未引入样式回归。
