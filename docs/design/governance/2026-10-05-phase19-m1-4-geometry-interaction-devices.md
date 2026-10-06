# Phase 19 M1-4：P3 几何 / 交互层装置（M1 收口）

> 创建时间：2026-10-05
> 关联条目：[待办归档](../../plan/todo-archive.md) Phase 19 **M1-4**（设计一致性口径裁定与守卫落地；本记录为 M1 的最后一条）
> 依据：[Phase 18 M3-1 评估 §5](./2026-10-01-phase18-m3-1-design-consistency-evaluation.md) P3 / [设计规范 §6](../design-spec.md)
> 边界：新增 3 条 E2E 几何 / 交互装置；**含 1 处真实缺陷修复**（Drawer reduced-motion 特异性），其余零 `src/**`。

---

## 1. 结论

- 落地 P3 四项（`@ui-validator` 几何 / 交互层）：**禁用态尺寸不变**、**Button 角标外扩不参与布局**、**Drawer 90vw·90vh 收敛 + Drawer reduced-motion**、**焦点可见扩面**。
- device 发现并修复 **1 处真实缺陷**：Drawer 的 `prefers-reduced-motion: reduce` 规则因**特异性不足**被状态规则压过，reduce 下动画**未关闭**。
- 新增常驻 E2E 覆盖：**27 + 12 + 15 = 54 例 × 三视口**；全量 E2E **186 passed**。

## 2. 交付细分

### 2a 禁用态尺寸不变 + Button 角标（`test/e2e/disabled-size.e2e.ts`）

- **契约**：同档位 / 同内容 / 同宿主的默认态与禁用态外盒几何逐值相等（9 用例：button / input / select / textarea / input-number / checkbox / switch 七对 + 角标两例）。
- **判别力前置守卫**：每对同时断言禁用态**确有**禁用标记、默认态**无**禁用标记；角标用例断言默认侧无角标元素——避免夹具漂移导致「两侧同态」假通过。
- **角标**：带角标与不带角标按钮外盒相等；角标盒外扩越出按钮且 `pointer-events: none`。
- **负向对照**：`.caomei-field--disabled` 回注 `min-height: 44px` + `.caomei-button__badge` 回注 `position: static` → **12 处失败**（字段族禁用对 + 角标对 ×3 视口）；还原后全绿。

### 2b Drawer 收敛 + reduced-motion（`test/e2e/drawer-convergence.e2e.ts`）

- **契约**：右侧抽屉宽度 = `min(560, 90vw)`；底部抽屉高度 = `min(560, 90vh)`（逐视口计算期望值）。
- **动效**：`reduce` 下 `animation-name` 为 `none`；`no-preference` 下非空且时长 `0.2s`（双向断言）。
- **缺陷修复（本批 `src/**` 唯一改动）**：`drawer.vue` 的 reduced-motion 规则原选择器 `.caomei-drawer__content`（0-1-0）被状态规则 `.caomei-drawer__content--right[data-state='open']`（0-2-0）压过 → reduce 下动画未关闭（实测 `animation-name = caomei-drawer-in-right-…`）。修复：补同特异性 `.caomei-drawer__content[data-state]` 并置于状态规则之后（tie 时后置胜出）。
- **负向对照**：修复前该断言 **3/3 失败**（即缺陷实锤）；修复后 12 passed。

### 2c 焦点可见扩面（`test/e2e/focus-visible-expansion.e2e.ts`）

- **契约**：非字段 / 非按钮组件经 CDP `CSS.forcePseudoState` 强制 `:focus-visible` 后呈现可见焦点环（`outline-style ≠ none`、`outline-width = 2px`、颜色可辨）。
- **受检面**：Checkbox / Switch / Tabs 触发器 / SelectButton 条目 / Accordion 触发器（5 × 3 视口）。
- **判别力前置守卫**：强制前 `outline-style === 'none'`（防常驻描边 / 选择器失效假通过）。
- **负向对照**：Switch 焦点环回注 `outline: none` → **3 处失败**；还原后全绿。

## 3. 质量门

| 门禁 | 结果 |
| --- | --- |
| `pnpm test:e2e --workers=2` | **186 passed**（既有 132 + 本批 54） |
| `pnpm test` | 107 文件 / **2185** 例 passed |
| `pnpm capture:styles` | **302 项 0 差异**（drawer 默认动效基线不受 reduced-motion 修复影响） |
| `pnpm lint:check` / `pnpm typecheck` | exit 0 |
| 负向对照 | 2a 12 处 / 2b 3 处（缺陷实锤）/ 2c 3 处；还原后全绿 |

## 4. Review Gate 结论

- **R1（`standard`）`Pass`**：0 blocker / 2 warning / 2 suggest。审计方独立复跑三条新规格（54 passed）、核实 `drawer.vue` 的 reduced-motion 特异性修复（0-2-0 后置胜出）与默认动效路径未被误伤、`check:design` / `planning-numbers` / `governance-records` 全绿、8 文件 / 约 516 行未超粒度。
- **同批收口**：warning ① 记录 §4 占位与本条回填 → 已回填；warning ② 缺默认侧反向守卫 → `disabled-size` 补「默认态不得有禁用标记」「plain 按钮不得有角标」；suggest ② 焦点环断言补**精确 `2px`**（5 目标一致）。suggest ①（其余组件补面登记）与 ③（夹具命名）保留为非阻塞。
- 留痕：`artifacts/review-gate/2026-10-05-phase19-m1-4-geometry-interaction-devices.md`（本地态）。

## 5. 未纳入面与边界

- 禁用态尺寸不变只覆盖 7 个代表组件（Button / 字段族 / Checkbox / Switch）；其余组件的禁用态尺寸未逐一对（容量枚举，按验收「视容量取舍」显式声明）。
- 焦点可见扩面覆盖 5 个非字段 / 非按钮组件；其余含 `:focus-visible` 的组件（约 30 个文件）未逐一纳入。
- Drawer 收敛在 mobile 触发 90vw 收敛（390 → 351）；tablet / desktop 档 `lg` 未触发收敛（值仍等于 `min` 期望），上下向在当前三档视口高度下均未触发 90vh 收敛（期望值等式仍断言）。
