# Phase 29 M2-1：反馈与浮层动效交付

> 创建时间：2026-11-08
> 触发：Phase 29 M2-1（[Phase 29 登记批次](./2026-11-08-phase29-registration.md) §2）。
> 依据：[动效体系评估](./2026-11-08-motion-system-evaluation.md) §5 / §6 / §8；基础层见 [M1-1 记录](./2026-11-08-phase29-m1-1-motion-foundation.md)。

## 1. 交付清单

| 组件 | 模式 | 动效 |
|:---|:---|:---|
| Dialog | `expressive` 新增 | 遮罩淡入 / 淡出；面板淡入 + 从下方 8px 位移 + 0.96 缩放入场，退场反向；退场由 Reka Presence 保留 DOM 至 `animationend` |
| ConfirmDialog | `expressive` 新增 | 同上（独立 keyframes，避免与 Dialog 类名耦合） |
| Drawer | 既有 + token | 保留既有进出场；`expressive` 下时长自动升到 300ms（`--caomei-motion-duration-slow`） |
| Popover | `expressive` 增强 | 既有入场追加 4px 位移；新增退场淡出 + 位移 + 缩放（Presence 保留 DOM） |
| DropdownMenu | `expressive` 增强 | 同上（浮层唯一归本批） |
| Tooltip | `expressive` 增强 | 既有入场追加 4px 位移；新增退场（瞬时档 `--caomei-motion-duration-instant`） |
| Toast | `expressive` 增强 | 入场追加 0.96 缩放；新增关闭退场；`ToastRoot` 在 expressive 下延后移除至 `animationend`，minimal / reduce 仍即时移除 |
| Message / Alert | `expressive` 新增 | 出现时淡入 + 4px 上移；Alert 经 Message 复用，无独立实现 |

- **缺省 `minimal` 逐值不变**：Dialog / ConfirmDialog / Message / Alert 仍无动画；Popover / DropdownMenu / Tooltip / Toast / Drawer 保留既有动画（新位移值为 0、缩放仍为 0.96，计算 transform 等价）。
- **reduce**：全部新动画消费 motion token，全局 reduce 把时长压平为 `0s`；Toast 增加显式 `[data-state='closed']` 兜底，避免 Presence 等待不存在的退场。
- **Portal 边界**：`data-motion` 需挂在 `<html>` 才能让 Portal 面板（含 Toast viewport）继承；局部容器只影响非 Portal 子树（与 `data-density` 同一边界，已在 `theming.md` §5.3 声明）。

## 2. 实现要点

1. **expressive 选择器隔离**：新增动画均以 `[data-motion='expressive']` 前缀挂载，minimal 无对应规则；组件级变量（enter-y / enter-scale）用 `:where([data-motion='expressive'])` 声明，满足 `check:design` 的「基类不预声明默认值」约束。
2. **退场与 Presence**：Dialog / ConfirmDialog / Popover / DropdownMenu / Tooltip / Toast 的退场动画均带 `forwards`；Reka Presence 在 `open=false` 后比较 `animation-name` 并等待 `animationend`，因此未额外引入 `forceMount` / 定时器。
3. **Toast 延迟移除**：`onOpenChange(false)` 在 `expressive` 且非 reduce 时不再立即 `store.dismiss`，改由 `@animationend` 捕获 `caomei-toast-out` / `caomei-toast-swipe-out` 后移除；reduce / minimal 走原即时移除路径，避免无动画时滞留。
4. **Message / Alert 只做入场**：静态挂载组件，移除由使用方控制；未引入 TransitionGroup（会改变列表 DOM 契约），退场留给使用方。

## 3. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm exec playwright test test/e2e/overlay-motion.e2e.ts` | **39 passed**（13 用例 × 3 project：Dialog / Confirm / Popover / Dropdown / Tooltip / Toast / Message / Alert / Drawer / minimal 无动画 / reduce 压平） |
| `pnpm exec playwright test test/e2e/focus-and-motion.e2e.ts test/e2e/drawer-convergence.e2e.ts test/e2e/overlay-interaction.e2e.ts` | **45 passed**（基础层轴 / reduce、Drawer 收敛、焦点与滚动锁回归） |
| `pnpm capture:styles` | **0 差异**（386 项）——minimal 计算样式不变 |
| `pnpm test:visual` | **40 passed**（亮暗 / 视口 / 预设 / 区间面板基线不变） |
| `pnpm test` | **154 文件 / 3010 例通过** |
| `pnpm typecheck` / `lint:check` / `lint:css:check` / `lint:md:check` | 通过 |
| `pnpm governance:check` / `pnpm verify` | 通过（含 `check:motion-contract`：38 文件 / 115 声明） |

## 4. 风险与边界

1. **Toast 行为分支**：延迟移除的轴判定与 CSS 同源——读取 toast 元素最近的 `[data-motion='expressive']` 祖先，因此局部容器挂载也能生效；Dialog / Popover 等 Portal 面板仍只随根节点轴生效（与 `data-density` 同一边界）。reduce / minimal 走即时移除。
2. **退场时序**：新增退场依赖 Reka Presence 的 `animationend`；若下游以 `forceMount` 或自定义 CSS 覆盖动画，需自行管理移除时机。
3. **Message / Alert 无退场**：静态组件不做列表级退场动画，避免侵入使用方 DOM / TransitionGroup 契约。
4. **视觉基线**：本轮未重冻结（minimal 终态不变）；expressive 动画中间帧不进入视觉基线（`test:visual` 以 reduce 运行）。
5. **Toast max 槽位**：退场期间关闭项仍留在 `toasts` 中并短暂占用 `max` 名额；期间新增条目可能短暂少一条（仍 ≤ max），属可接受瞬态，后续若需要可让 `trim` 忽略 `closed` 项。
6. **多 Provider 取样**：`shouldDeferDismiss` 读取文档中首条 `.caomei-toast` 的最近 `data-motion` 祖先；同一页面多个 ToastProvider 且轴配置不一致时可能错位。当前单 Provider 场景无影响，登记为已知边界。
7. **范围**：未实现 A4 ~ A7（表单 / 布局 / 选择器 / 数据展示）；M6-1 统一做人工复核与录屏。

## 5. Review Gate

- **audit-depth**：`standard`（7 个组件文件 + 1 个 E2E；含 Toast 行为分支与 Presence 退场）；时间盒 ≤ 10 分钟。
- **R1（`standard`）**：`Pass`（0 blocker / 5 warning / 3 suggest；实测约 6 分 28 秒，未超时间盒）——
  - W1 Toast 延迟移除缺移除结果断言：**已修**——expressive 用例补 5 → 4 计数，并新增「关闭中间一条只移除该条」用例。
  - W2 退场规则特异性压过 reduce：**已修**——四处退场选择器改 `:where([data-motion='expressive'])`，reduce 块补 `[data-state='closed']`；Dialog / Confirm / Message 同步补显式 `animation: none`。
  - W3 Toast JS 轴判定窄于 CSS：**已修**——改为读取 toast 元素最近的 `[data-motion='expressive']` 祖先，与 CSS 同源。
  - W4 swipe-end 被纵向退场覆盖：**已修**——退场规则加 `:where(:not([data-swipe='end']))`，滑动方向动画保留。
  - W5 `theming.md` 与实现冲突：**已修**——§5.3 改为反馈与浮层已消费 distance / scale，后续批次继续扩展。
  - S1 ~ S3 已采纳：minimal Popover 断言、Toast `max` 瞬态边界说明、`:where()` 降特异性。
- **R2（`quick` delta）**：`Pass`（0 blocker / 0 warning / 1 nit；实测约 3~4 分钟，未超 ≤ 6 分钟时间盒）——W1 / W3 / W4 / W5 与 S1 ~ S3 全部关闭；W2 的 Dialog / Confirm 残余特异性已修（expressive 前缀改 `:where()`，reduce 同特异性后置胜出）。nit 为多 Provider 场景下 `shouldDeferDismiss` 以首条 `.caomei-toast` 取样，当前单 Provider 不受影响，登记为已知边界。
- **复查基线**：本记录 §1 ~ §3；`src/components/{dialog,confirm-dialog,popover,dropdown-menu,tooltip,toast,message}`；`test/e2e/overlay-motion.e2e.ts`。

## 6. 未覆盖边界

- 未逐组件做人工录屏复核（M6-1）。
- 未验证局部容器挂载下的 Portal 退场（文档声明仅根节点生效）。
- 未为 Message / Alert 增加退场动画（静态组件）。
- 未覆盖 A4 ~ A7 的表单 / 布局 / 选择器 / 数据展示动效。
