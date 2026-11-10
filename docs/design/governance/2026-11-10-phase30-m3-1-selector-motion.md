# Phase 30 M3-1：选择器动效交付

> 创建时间：2026-11-10
> 触发：Phase 30 M3-1（[Phase 30 登记批次](./2026-11-10-phase30-registration.md) §2）。
> 依据：[动效体系评估](./2026-11-08-motion-system-evaluation.md) §5 / §6 / §8；基础层见 [Phase 29 M1-1 记录](./2026-11-08-phase29-m1-1-motion-foundation.md)，浮层批次见 [Phase 29 M2-1 记录](./2026-11-08-phase29-m2-1-overlay-motion.md)。

## 1. 交付清单

| 组件 | 模式 | 动效 |
|:---|:---|:---|
| Select | `expressive` 新增（面板状态） | 面板淡入 + 4px 位移 + 0.96 缩放入场；条目高亮背景 / 文字过渡；选中指示器缩放淡入；清空按钮颜色过渡 + 按下反馈 |
| MultiSelect | `expressive` 新增 | 同 Select 的面板 / 条目 / 指示器；选中标签入场；标签删除与清空按钮过渡 + 按下反馈；reduced-motion 兜底扩展到新元素 |
| AutoComplete | `expressive` 新增 | 同 MultiSelect 的面板 / 条目 / 指示器 / 标签 / 清空与下拉按钮反馈 |
| DatePicker | 审计 | 既有 `caomei-date-picker-in` 面板入场已消费 `--caomei-motion-duration-fast` / `--caomei-motion-ease-out`；`expressive` 下自动由 120ms 延到 160ms，reduce 关闭；本批不重复实现 |
| Calendar | `expressive` 新增 | 日期格背景 / 文字 / 边框与导航按钮颜色过渡；选中 / 区间 / 悬停预览状态平滑切换，不改变几何 |
| ColorPicker | `expressive` 新增 | 色域 / 色相手柄独立 `scale` 悬浮放大与按下缩放；色板选中态边框 / 阴影 / 轮廓颜色过渡；portal 面板入场沿用 Popover（A2） |
| SelectButton | `expressive` 新增 | 选中颜色过渡保留，按下轻微缩放（拼接边框不错位） |
| ToggleButton | `expressive` 新增 | 选中颜色过渡保留，按下轻微缩放 |

- **缺省 `minimal` 零差异**：新增规则全部以 `:where([data-motion='expressive'])` 前缀隔离，`minimal` 无对应选择器。
- **reduce 压平**：面板 / 指示器 / 标签入场动画关闭；日期格、条目、按钮过渡归零；手柄与按钮缩放在 reduce 下归 `none`。
- **Portal 边界**：Select / MultiSelect / AutoComplete / ColorPicker 的 portal 面板需把 `data-motion` 挂在 `<html>` 才随根节点生效（与 `data-density` 同一边界）。

## 2. 实现要点

1. **面板入场限定 `[data-state='open']`**：只给打开态挂动画，关闭态不再命中；Reka Presence 不会等待一个不会重放的退场动画，E2E 断言 Escape 后面板 DOM 归零。
2. **面板 / 条目样式走非 scoped 命名空间**：Portal 的 `data-v` 落在 popper 包裹层，沿用既有 `.caomei-*__content` 非 scoped 规则；动效规则同样放在该层，避免 `:deep()` 特异性攀升。
3. **ColorPicker 手柄用独立 `scale`**：Reka 在 `ColorAreaThumb` / `ColorHueThumb` 写入定位 `transform`，CSS `transform` 无法覆盖内联值；改用独立 `scale` 属性后与定位组合，且不触发布局。
4. **DatePicker 不重复实现**：既有面板入场已经 token 化并通过 `focus-and-motion` 常驻覆盖；本批只补选择器族缺失的面板 / 选中 / 清空状态，并用 E2E 断言轴切换后的时长。
5. **清空 / 选中反馈**：选中指示器与标签做一次性入场；清空 / 删除按钮做颜色过渡 + 按压缩放，避免为列表级退场引入 TransitionGroup 或改变 DOM 契约。
6. **helper 扩展**：`sampleTriggeredTimeline` 新增 `triggerEvent?: 'click' | 'pointerdown'`；Reka SelectTrigger 在 `pointerdown` 打开面板，默认 `click` 无法触发，扩展只影响显式传入的用例。

## 3. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm lint` / `pnpm lint:css:check` | 通过 |
| `pnpm typecheck` | 通过 |
| `pnpm check:motion-contract` | 通过（受检面未收窄） |
| 定向 `vitest`（select / multi-select / auto-complete / calendar / color-picker / select-button / toggle-button / date-picker，8 文件） | 通过 |
| `pnpm exec playwright test test/e2e/selector-motion.e2e.ts` | **27 passed**（9 用例 × 3 project：4 面板 / 指示器 / Calendar / ColorPicker / 按钮 / minimal / reduce） |
| 既有 `overlay-interaction` / `overlay-stacking` / `date-picker-range` / `focus-and-motion` | **51 passed** |
| 响应式矩阵 `responsive.e2e.ts` | **106 passed / 4 skipped**（新增夹具未造成页面横向溢出） |
| `pnpm capture:styles` | **0 差异**（`minimal` 计算样式与冻结基线一致） |
| `pnpm test:visual` | **42 passed**（亮暗 / 视口 / 预设 / 区间面板基线不变） |
| `pnpm verify` | 通过（含 build / docs:build / governance:check） |

### 3.1 真实浏览器采样（Chromium，1280×800 / 390×844）

| 状态 | 实测值 |
|:---|:---|
| Select 面板 | `animation-name = caomei-select-content-in`；`animation-duration = 0.16s`；Escape 后面板 DOM = 0 |
| MultiSelect 面板 / 指示器 | `caomei-multi-select-content-in` / `caomei-multi-select-indicator-in`；`0.16s` |
| AutoComplete 面板 | `caomei-auto-complete-content-in`；`0.16s` |
| DatePicker 面板 | 既有 `caomei-date-picker-in`；expressive 下 `0.16s` |
| Calendar 日期格 | 过渡 `0.22s × 3`；选中后背景由透明变为主色 |
| ColorPicker 手柄 / 色板 | 手柄 `scale = 1.08`；色板过渡 `0.22s × 3` |
| SelectButton / ToggleButton | 按下 `matrix(0.960, …)` |
| reduce（expressive + reduce） | 面板 `animation-name = none`、`animation-duration = 0s`；手柄 `scale = none`；按钮 `transform = none` |
| 页面横向溢出 | 桌面 / 移动均 `scrollWidth == clientWidth` |

- 截图与可复跑脚本：`test-results/ui-validate/desktop-light-select-panel.png`、`desktop-light-multi-panel.png`、`desktop-light-auto-panel.png`、`desktop-light-date-panel.png`、`desktop-light-calendar.png`、`desktop-light-color-panel.png`、亮暗面板与移动端选择器截图；脚本 `test-results/ui-validate/phase30-m3-1-validate.mjs`（均为 gitignored，结论与关键实测值已回写本节）。
- 验证窗口内无源码改动；亮 / 暗、桌面 / 移动、reduce 三面均采样，console error 为 0。

## 4. 风险与边界

1. **只做入场**：面板、选中指示器与标签均只做一次性入场；未实现退场，避免 Presence 等待无重放动画或引入列表级 TransitionGroup。
2. **Portal 轴继承**：`data-motion` 只有挂在 `<html>` 才影响 portal 面板；局部容器只影响非 portal 子树（文档已声明）。
3. **`scale` 属性基线**：ColorPicker 手柄使用独立 `scale`，需 Chromium 104+ / Safari 14.1+ / Firefox 72+；低于基线时缩放不生效，定位与色值不受影响。
4. **DatePicker 无新增代码**：既有面板入场由 Phase 29 之前实现，本批只验证轴切换与 reduce；后续若调整其关键帧，需同步本记录与 E2E。
5. **SelectButton 按压缩放**：缩放作用于 transform，拼接边框不错位；若下游覆盖 `transform`，按压缩放随之失效。
6. **任务粒度**：本批 13 文件 / 825 新增行（7 组件 374 行 + 夹具 6 行 + 采样 helper 20 行 + E2E 338 行 + 治理记录与索引 / todo 87 行），超出 10 文件 / 800 行建议阈值。理由是 7 个组件属同一验收面（选择器族面板 / 选中 / 清空状态），拆分会产生跨组件半成品；新增行以 E2E（338）与治理记录为主，生产源码仅 374 行，故按单条交付并在 Review Gate 记录拆分依据。

## 5. Review Gate

- **audit-depth**：`standard`（7 个 `src/**` 组件 + 夹具 + helper + E2E；含 Portal 作用域、Presence 关闭行为与 `scale` 基线）；时间盒 ≤ 10 分钟。
- **R1（`standard`）**：`Pass`（0 blocker / 3 warning / 2 suggest；实测约 4 分钟，未超时间盒）——
  - W1 Select / MultiSelect / AutoComplete 面板只做入场、无退场：**已登记**——入场选择器限定 `[data-state='open']`，关闭态即时卸载，E2E 断言 Escape 后 DOM 为 0。
  - W2 DatePicker 本批未改代码：**已登记**——既有 `caomei-date-picker-in` 已消费 motion token，E2E 断言 expressive 下为 160ms、reduce 关闭。
  - W3 ColorPicker portal 面板动效归 Popover：**已登记**——本批只补手柄 / 色板，panel 入场由 A2 承担。
  - S1 helper 新增 `triggerEvent: 'pointerdown'`：**已采纳**——用于 Reka SelectTrigger，默认 click 无法打开。
  - S2 MultiSelect / AutoComplete 标签入场无退场：**已登记**——避免列表 DOM 契约变化。
- **R2（`quick` delta）**：`Pass`（0 blocker / 0 warning / 1 nit；实测约 2 分钟，未超 ≤ 6 分钟时间盒）——W1 ~ W3 与 S1 / S2 已写入记录；nit 为截图清单只列代表图。
- **复查基线**：本记录 §1 ~ §3；`src/components/{select,multi-select,auto-complete,calendar,color-picker,select-button,toggle-button}`；`test/e2e/selector-motion.e2e.ts`；`test/e2e/helpers/motion.ts`。

## 6. 未覆盖边界

- 未逐组件做人工录屏 / 0.25 倍速复核（属动效验收批次）。
- 未实现面板与标签退场动画。
- 未验证局部容器挂载下 portal 面板的 `data-motion` 穿透。
- 未覆盖 `scale` 基线以下旧浏览器的降级观感。
