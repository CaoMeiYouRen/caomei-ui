# Phase 29 M3-1：导航与操作动效交付

> 创建时间：2026-11-08
> 触发：Phase 29 M3-1（[Phase 29 登记批次](./2026-11-08-phase29-registration.md) §2）。
> 依据：[动效体系评估](./2026-11-08-motion-system-evaluation.md) §5 / §6 / §8；基础层见 [M1-1 记录](./2026-11-08-phase29-m1-1-motion-foundation.md)，浮层批次见 [M2-1 记录](./2026-11-08-phase29-m2-1-overlay-motion.md)。

## 1. 交付清单

| 组件 | 模式 | 动效 |
|:---|:---|:---|
| Tabs | `expressive` 新增 | 内容切换淡入 + 4px 上移；激活指示条（触发器下边框）沿用既有 color / border-color 过渡，`expressive` 下时长升到 220ms |
| Accordion | `expressive` 增强 | 既有高度动画叠加淡入 / 淡出（展开 220ms 淡入、收起 300ms 淡出，与高度动画同时结束）；minimal 保留高度动画、不加透明度 |
| Menu / SubMenu | `expressive` 新增 | 子菜单展开 / 收起使用 Reka `--reka-collapsible-content-height` 高度动画；minimal 保持即时开合 |
| Breadcrumb | `expressive` 新增 | 链接颜色过渡（220ms / standard）；minimal 即时换色 |
| Stepper | `expressive` 新增 | 指示器背景 / 边框 / 文字颜色过渡；minimal 即时切换 |
| Toolbar | `expressive` 新增 | 按钮悬浮上移 4px、按下缩放到 0.98；minimal 仅颜色过渡 |
| Button | `expressive` 新增 | 悬浮上移 4px、按下缩放到 0.98；minimal 仅颜色 / 边框过渡 |
| ButtonGroup | `expressive` 约束 | 拼接成员重置 Button 的悬浮 / 按下 transform，避免拼接边框错位；SplitButton 继承该约束 |
| SplitButton | `expressive` 新增 | 菜单按钮 chevron 随开合旋转 180° |

- **缺省 `minimal` 逐值不变**：新增规则全部以 `:where([data-motion='expressive'])` 前缀隔离；Tabs / Menu / Breadcrumb / Stepper / Toolbar / Button / SplitButton 在 minimal 下无新增动画或位移。
- **reduce**：Button / Toolbar / Menu 子菜单有显式 `transform: none` / `animation: none` 兜底；SplitButton 的 chevron 过渡归零、打开态旋转作为状态瞬时到位；其余过渡消费 motion token，全局 reduce 压平为 `0s`。
- **Tabs 指示条口径**：本库没有独立滑块元素，激活指示条即触发器下边框；`expressive` 通过既有 `border-color` 过渡承载，不新增 DOM / 伪元素，避免与 `tabs-indicator.e2e.ts` 的几何契约冲突。

## 2. 实现要点

1. **Button 位移只作用于独立按钮**：Button 的悬浮抬升在 ButtonGroup 内被 `:deep(> .caomei-button:hover/:active)` 重置，保证拼接边框、圆角与 `z-raise` 契约不变；SplitButton 的两个拼接按钮因此保持稳定。
2. **Menu 高度动画**：复用 Reka Collapsible 在内容节点写入的 `--reka-collapsible-content-height`；`overflow: hidden` 仅在 expressive 规则内声明（minimal 无此声明）。
3. **Accordion 双动画**：在同一元素上并列 `slide-down` + `fade-in`（关闭时 `slide-up` + `fade-out`），既保持既有高度动画，又强化展开意图；reduce 由既有媒体查询关闭。
4. **reduce 优先**：新规则均为 `:where([data-motion='expressive'])`（0,1,0 / 0,2,0），媒体查询规则置于其后，同特异性时 reduce 胜出；位移类另有显式 `transform: none`。

## 3. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm exec playwright test test/e2e/navigation-motion.e2e.ts` | **30 passed**（10 用例 × 3 project：Tabs / Accordion / Menu / Accordion 关闭轨迹 / Breadcrumb + Stepper / Toolbar / Button + ButtonGroup / SplitButton / minimal / reduce；写录时点快照） |
| 既有导航 E2E（accordion / button-states / menu / tabs-indicator / tabs-list-overflow） | **63 passed** |
| `pnpm capture:styles` | **0 差异**（386 项）——minimal 计算样式不变 |
| `pnpm test:visual` | **40 passed**（亮暗 / 视口 / 预设 / 区间面板基线不变） |
| `pnpm test` | **154 文件 / 3010 例通过** |
| `pnpm typecheck` / `lint:check` / `lint:css:check` / `lint:md:check` | 通过 |
| `check:motion-contract` | OK（42 文件 / 131 声明） |
| `pnpm verify` | 通过（含 build / docs:build / governance:check） |
| `check:design` | 通过（948 规则 / 3033 声明） |

## 4. 风险与边界

1. **Button 位移与拼接**：ButtonGroup 内已重置；若下游把 Button 放进自定义 flex 拼接容器，可能仍出现 4px 悬浮位移，需要自行覆写。
2. **Menu 高度动画**：依赖 Reka Collapsible 的 `--reka-collapsible-content-height`；上游改该变量名时动画会退化为无高度变化（仍可开合）。
3. **Tabs 指示条**：没有独立滑块，只有边框颜色过渡；若未来改为独立指示条，需重做本批选择器与 `tabs-indicator.e2e.ts`。
4. **Button 按下缩放**：0.98 为 expressive 固定值，不进入 motion token 冻结面；若需要下游覆盖，可后续补组件级钩子。
5. **Menu 裁剪边界**：`overflow: hidden` 在 expressive 下常驻，若菜单项带外溢装饰或较大焦点环，可能被裁切；当前菜单项无外溢装饰，登记为已知边界。
6. **SplitButton reduce**：chevron 的 `transition` 归零，但打开态 `rotate(180deg)` 作为状态指示瞬时到位（不是运动）；记录不再声称 `transform: none`。
7. **任务粒度**：本批 12 文件 / +420 行（写录时点快照）（9 组件 + E2E + 治理记录 + 索引），文件数超 10 建议阈值；9 个组件属同一验收面，拆分会产生跨组件半成品，故同批提交。
8. **范围**：未实现 A4 ~ A7；M6-1 统一做人工复核与录屏。

## 5. Review Gate

- **audit-depth**：`standard`（9 个组件文件 + 1 个 E2E；含 ButtonGroup 拼接约束与 reduce 优先级）；时间盒 ≤ 10 分钟。
- **R1（`standard`）**：`Reject`（1 blocker / 6 warning / 3 suggest；实测约 10 分 50 秒，超 ≤ 10 分钟时间盒约 1 分钟）——
  - B1 Accordion 关闭时 fade-out（120ms）先于 slide-up（300ms）结束，Presence 提前卸载、高度动画被截断：**已修**——淡出时长改为 `--caomei-motion-duration-slow`，并补关闭中段高度 / 透明度采样断言。
  - W1 只读 `animationName`：**已修**——新增 Accordion 关闭中间帧断言（`getAnimations()` + `currentTime`）。
  - W2 minimal / reduce 覆盖不全：**已修**——minimal 补 Accordion 无 fade-in、reduce 补 Accordion `animation: none`。
  - W3 SplitButton reduce 声明与实现不一致：**已修**——记录改为「过渡归零、旋转作为状态瞬时到位」。
  - W4 索引摘要复述读数：**已修**——索引只留行为概述与记录链接。
  - W5 缺 `verify` 证据：**已修**——`pnpm verify` 通过并回填。
  - W6 任务粒度计数：**已修**——§4 补 12 文件 / +352 行与拆分理由。
  - S1 ~ S3 已采纳：Menu 裁剪边界、用例计数口径、读数快照标注。
- **R2（`quick` delta）**：`Pass`（0 blocker / 1 warning / 1 suggest；实测约 2 分 30 秒，未超 ≤ 6 分钟时间盒）——B1 与 W1 / W2 / W4 / W5 全部关闭；W3 的 §1 SplitButton 残留与 W6 行数快照已同批订正；S1 ~ S3 关闭。
- **复查基线**：本记录 §1 ~ §3；`src/components/{tabs,accordion,menu,breadcrumb,stepper,toolbar,button,button-group,split-button}`；`test/e2e/navigation-motion.e2e.ts`。

## 6. 未覆盖边界

- 未逐组件人工录屏复核（M6-1）。
- 未验证 Tabs 独立滑块形态（当前不存在）。
- 未覆盖 A4 ~ A7 的表单 / 布局 / 选择器 / 数据展示动效。
