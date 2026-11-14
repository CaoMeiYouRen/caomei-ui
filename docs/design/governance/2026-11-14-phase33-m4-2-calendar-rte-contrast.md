# Phase 33 M4-2：Calendar / RTE 交互边界对比度

> 创建时间：2026-11-14
> 触发：用户「继续推进剩余条目」。范围与验收口径见 [Phase 33 登记批次](./2026-11-13-phase33-registration.md) §2 的 M4-2 行。

## 1. 变更

| 项 | 内容 |
|:---|:---|
| `src/components/calendar/calendar-view.vue` | 上 / 下月导航按钮描边 `--caomei-color-border` → **`--caomei-color-control-border`**（可交互边界，WCAG 1.4.11 ≥3:1） |
| `src/components/rich-text-editor/rich-text-editor.vue` | 编辑器容器描边改为经包装层桥接的控件边界 token（`--caomei-rte-control-border: var(--caomei-color-control-border)`）；说明见 §2 |
| 夹具 | `#preset-contrast` 增加 Calendar；RTE 仅在 `?rte=1` 时挂载（避免内核体积 / 控制台噪声污染共享夹具） |
| 矩阵 | `preset-contrast.e2e.ts` 的 `NON_TEXT_CELLS` +2：`calendar-nav` / `rte-border`（均按 `border` 测量）；RTE 就绪等待；solid 矩阵超时上调 |
| 文档 | `design-spec.md` Calendar 行、`rich-text-editor.md` 样式定制说明 |

## 2. RTE 描边与 `data-theme` 冲突

`md-editor-v3` 会在编辑器根元素写 `data-theme="dark"`。本库的暗色 token 选择器是 `:is(.dark, [data-theme='dark'])`，因此**编辑器根元素自身**会命中基础暗色 token，把 `--caomei-color-control-border` 从预设值（如 `caomei` 的 `#737378`）回退到基础值（`#67676a`），在 `bg-elevated` 上只有 2.64:1。

处置：在包装层声明桥接变量 `--caomei-rte-control-border: var(--caomei-color-control-border)`（包装层按预设求值），深规则消费桥接变量。根元素上的 `data-theme` 不会覆盖桥接变量，描边恢复预设值（`caomei` 暗色 `bg-elevated` 实测 3.158:1）。

## 3. 验证

| 项 | 命令 | 结果 |
|:---|:---|:---|
| 对比度矩阵（三视口） | `pnpm exec playwright test test/e2e/preset-contrast.e2e.ts` | **9 passed**（3 用例 × mobile / tablet / desktop；6 预设 × 明暗 × 2 背景） |
| 首次失败值（修复前） | 同上 | `calendar-nav: 1.238` / `rte-border: 1.238`（minimal/light）→ 改 token 后通过；RTE 在 `caomei/dark/elevated` 为 2.642 → 桥接后 3.158 |
| 相关组件单测 | `pnpm exec vitest run src/components/calendar src/components/rich-text-editor` | 6 files / 50 tests 全绿 |
| 类型检查 | `pnpm typecheck` | exit 0 |
| 计算样式等价 | `pnpm capture:styles` | 0 差异（399 项；采样面不含两处边界） |
| 静态检查 | `pnpm exec eslint`（改动源 / 夹具 / 用例） | 零 error |
| 样式门禁 | `pnpm exec stylelint`（两个改动组件） | 零 error |
| 设计治理 | `pnpm check:design` | 通过（含桥接变量 `:where()` 归一） |
| `/` 基座回归 | `responsive` / `component-alignment` / `container-motion` / `hit-target`（共 4 spec × 视口） | 148 passed / 4 skipped（夹具新增 Calendar 后无布局回归） |

阈值保持 **3:1 + 0.05 裕度**，未放宽；修复方向为换用控件边界 token。

## 4. 边界

1. RTE 只在 `?rte=1` 挂载：其余用例共用 `/` 时不会加载内核（避免体积与 console 噪声影响既有 `pageErrors` 守卫）；矩阵用例显式等待内核就绪。
2. `md-editor-v3` 根元素的 `data-theme` 会使其内部消费的其它 `--caomei-*` 回退到基础主题（本次只桥接描边所需的 token）；更深层的主题一致性属内核主题映射，未在本条扩展。
3. 只覆盖「边界 vs 父级实际背景」；RTE 元素自身不透明背景与边界的对比未单列（边界外侧对比是既有矩阵口径）。
4. 视觉基线未重跑（`capture:styles` 采样面不含两处边界，0 差异）；对比度矩阵即本条的浏览器证据。
5. Calendar 导航按钮的**悬停态**沿用同一描边 token，未单列状态矩阵。
6. **「今日」日期描边仍为 `--caomei-color-border`**（状态指示，非交互边界）：minimal/light 下对底色低于 3:1，本批未改；若后续按 1.4.11 认定其为必要视觉信息，需另立条目调整 token。
7. 矩阵只切 `.dark` / `data-theme`，未执行 `data-scheme="auto"` 路径；桥接变量与主题来源无关，属未实测边界。

## 5. Review Gate

- **审计声明**：R1 `standard` / R2 `standard`（修复含 CSS、夹具与用例）；单分区；R1 时间盒 ≤10 分钟。
- **R1：`Reject`**（2 blocker / 5 warning / 3 suggest）
  - blocker：① 桥接变量声明在基类且未走 `:where()`，`check:design` G2 失败 → 移入 `:where(.caomei-rich-text-editor)` 独立块；② 新增注释缺空行 / 自定义属性顺序触发 3 处 stylelint error → 已修复，`lint:css:check` 与 `check:design` 均通过。
  - warning：solid 矩阵无必要加载 RTE 且把超时抬到 180s → 恢复 `/` 与 120s；非文本受检面缺期望键集合 → 补 `EXPECTED_NON_TEXT_KEYS` / `MIN_NON_TEXT_CELLS`；注释仍写「4 条」→ 改为 6 条；共用夹具新增 Calendar 未跑 `/` 基座 → 已补 4 个 spec；记录缺 stylelint / `check:design` → 已补。
  - suggest：英文 RTE 文档同步、`rich-text-editor-app.vue` 注释补充 `?rte=1` 门控、「今日」描边与 RTE 内部 token 边界 → 已采纳并写入 §4。
- **R2：`Pass`**（0 blocker / 0 warning / 2 suggest）
  - B1 / B2 / W3 ~ W7 / S8 ~ S10 全部关闭：`:where()` 桥接通过 `check:design`；stylelint 零 error；solid 矩阵恢复 `/` 与 120s；新增期望键集合（删条目失败）；注释与记录同步；`/` 基座 148 passed。
  - 新增 suggest：注释悬挂位置与 §5 占位 → 已修正 / 回填。
- **复查基线**：本记录 §1 ~ §4；`calendar-view.vue` 导航按钮描边；`rich-text-editor.vue` 桥接变量与深规则；`preset-contrast.e2e.ts` 的非文本单元与期望键；夹具 Calendar / `?rte=1` 段；组件页中英。
