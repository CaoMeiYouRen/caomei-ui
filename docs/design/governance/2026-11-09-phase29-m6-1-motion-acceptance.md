# Phase 29 M6-1：动效验收与人工复核

> 创建时间：2026-11-09
> 触发：Phase 29 M6-1（[Phase 29 登记批次](./2026-11-08-phase29-registration.md) §2）。
> 依据：[动效体系评估](./2026-11-08-motion-system-evaluation.md) §6 / §7；用户裁定 D2 ①（正交 `data-motion="expressive"` + 克制强度）。

## 1. 交付清单

| 面 | 内容 |
|:---|:---|
| 验收矩阵 | L1 ~ L4 逐批对账（M1-1 / M2-1 / M3-1），见 §2 |
| 采样装置 | 新增 `test/e2e/helpers/motion.ts`：有界帧轮询 + `pause()` + `currentTime` 采样，采样后 `finish()` 到终态；**不使用 `sleep`** |
| 常驻回归 | 新增 `test/e2e/motion-acceptance.e2e.ts`（9 例 × 3 project = 27）：轴三态 token、局部容器作用域、Dialog 进出场时间轴、Accordion 高度、Button 过渡、长任务冒烟、reduce 无障碍 |
| 布局动画审计 | `check-motion-contract` 新增布局属性过渡 / 关键帧白名单（`layout-transition` / `layout-keyframe`），守卫单测 **21 → 35** |
| 性能 | 代表性动画窗口内长任务实测（§4.1）；CI 只做宽松冒烟（> 1.5s 阻断、> 50ms 记录） |
| 无障碍 | reduce 下无位移 / 缩放、无限循环不快于 3 次 / 秒、焦点环仍可见（§4.2） |
| 人工复核 | 清单与录屏素材（§5）；结论待用户签字 |
| 主题文档与示例 | `docs/design/theming.md` §5.3 补验收分层 / 性能与无障碍约定 + 轴切换示例 `docs/examples/theming/motion.vue` |
| A4 ~ A7 边界 | 写入 §6，不重复建条目 |

## 2. 验收矩阵（L1 ~ L4）

| 批次 | L1 静态守卫 | L2 组件单测 | L3 浏览器时间轴 | L4 人工 |
|:---|:---|:---|:---|:---|
| M1-1 基础层 | `check:motion-contract`：token 三组声明、裸时长、`transition: all`、布局属性白名单；35 例单测 | `test/contracts/motion-tokens.test.ts`（6 例） | `motion-acceptance`「轴与 token」2 例 × 3 project；`focus-and-motion` 9 例 × 3 project（轴切换 / reduce） | 轴切换观感（§5） |
| M2-1 反馈与浮层 | 同一守卫（Dialog / Toast 声明在扫描面内） | 退场状态类 / Toast 延迟移除单测 | `motion-acceptance`「Dialog 进出场」3 例 × 3；`overlay-motion`（含 reduce 压平） | 退场节奏、暗色观感（§5） |
| M3-1 导航与操作 | 同一守卫（Accordion / Menu 高度关键帧已登记） | 状态类单测 | `motion-acceptance`「Accordion 高度 / Button 过渡」2 例 × 3；`navigation-motion`（含连续切换） | 连续切换打断（§5） |

- **覆盖边界**：矩阵只对 M1-1 ~ M3-1 已交付批次承担验收；M4-1 ~ M4-3（图标）与 M5-1（Paginator）无新增动效，不重复纳入。
- **L4 状态**：素材已生成，主观结论由用户在 §5 清单上签字；本记录在签字前不宣称 L4 通过。

## 3. 确定性采样装置

`test/e2e/helpers/motion.ts` 导出：

| API | 作用 |
|:---|:---|
| `readMotionTokens(locator)` | 读取 13 个动效 token 的计算值（可传局部容器，验证继承范围） |
| `sampleTriggeredTimeline(page, { trigger, target, mode, ratios, props })` | 页面内 `click()` 后**同帧**起算：有界帧轮询等待动画出现 → 立即 `pause()` → 按比例设 `currentTime` 并读计算样式 → `finish()` 收尾 |
| `collectDocumentAnimations(page)` | 整页动画画像（时长 / `infinite` / 是否动画 `transform`），供 reduce 双向断言 |

约定：

1. **无 `sleep`**：等待动画只靠 `requestAnimationFrame` 轮询 + 截止时间，失败返回 `null` 由用例判定；
2. **逐动画比例**：多个动画（如 Accordion 高度 300ms + 淡入 220ms）各自按自身 `duration` 取比例，避免长动画中段覆盖短动画终态；
3. **收尾到终态**：`finish()` 失败（无限循环）退化为 `cancel()`，不把元素留在中间帧；
4. **判别力**：断言绑定 token 推导值（Dialog 入场 220ms / 退场 160ms、Button 过渡 0.22s），token 漂移即失败。

## 4. 性能与无障碍审计

### 4.1 长任务

| 项 | 结果 |
|:---|:---|
| 窗口 | `expressive` 下连续触发 Dialog 开 / 关、手风琴展开、Tabs 切换，约 30 帧 |
| 实测（desktop，Chromium 156.0.8078.4） | 长任务 **2 个，最大 66ms**（> 50ms 记录、不阻断） |
| 阻断阈值 | 单条 > **1.5s** 阻断（本地与 CI 均适用）；不承诺 FPS |

**布局属性动画白名单**（`check:motion-contract`）：

| 来源 | 属性 | 理由 |
|:---|:---|:---|
| `password.vue` | `width` | 密码强度条宽度（单条、非高频） |
| `progress-bar.vue` | `width` | 确定态进度宽度（单调变化、非高频） |
| `badge.vue` | `min-width` | 计数位宽变化（单项、短时长） |
| `float-label.vue` | `top` / `font-size` | 浮动标签收放（单标签、覆盖钩子已公开） |
| `accordion-slide-down` / `-up` | `height` | 展开 / 收起高度（单面板） |
| `menu-submenu-down` / `-up` | `height` | 子菜单展开高度（单层） |

新增布局属性过渡或关键帧须先登记理由，否则守卫失败（`layout-transition` / `layout-keyframe`）。

### 4.2 无障碍

- **reduce 双向**：`expressive` 下 Dialog 入场 220ms、退场 160ms；`reduce` 下无时间轴、终态 `opacity: 1`，页面内**无一次性位移 / 缩放动画**（加载类循环不在面内）。
- **无限循环频次**：加载类动画最快 0.6s（`caomei-button-spin` / `caomei-progress-spinner-spin`）≈ **1.67 次 / 秒 < 3 次 / 秒**；常驻用例断言 `infinite && duration < 333ms` 为空。
- **焦点可见**：`reduce` 下经 CDP 强制 `:focus-visible`，Tabs 触发器仍命中 `outline: 2px`——减弱动效不移除焦点反馈。
- **闪烁**：无自动播放类一次性动画；加载指示为连续旋转 / 脉冲，非闪烁。

## 5. 人工复核（待签字）

- **审查入口**：`pnpm review:motion` → `http://localhost:4401/motion.html`；或 `pnpm review:build` 产出单文件 `artifacts/motion-review/site/motion-review.html`（可直接双击，file:// 运行）。两页都不加载文档站样式，页头显示系统动效偏好、逐项 token 与「减少动效」警告，并在打开后自动演示一轮。文档站的 VitePress 全局 `prefers-reduced-motion` 压平属无障碍行为，目视复核请关闭系统 / DevTools 的 reduce 模拟。
- **环境**：Chromium 156.0.8078.4（Playwright 1.63.0）；桌面 1280×900 亮色、移动 390×844 暗色。
- **素材 v2**（本地 `artifacts/motion-review/v2/`，gitignored）：
  - `videos/desktop-light.webm`（对话框开关 → Toast → 手风琴 → Tabs → 子菜单 → 轴切换）
  - `videos/mobile-dark.webm`（同序列，暗色 / 移动）
  - `dialog-enter-sheet.png`（入场 0 / 25 / 50 / 75 / 100% 慢放接触表）
  - `still-desktop-light.png` / `still-mobile-dark.png`（终态）
- **首轮素材**（`motion-review/{videos,frames,*-sheet.png}`）保留作对比：当时取自夹具页，未覆盖审查页入口。

| # | 复核项 | 判定 |
|:--|:---|:---|
| 1 | 1x 与 0.25x 观感：动画表达「发生了什么」而非装饰 | 待签字 |
| 2 | 连续快速触发 / 反向切换 / 中途取消：无排队、无卡死、无终态错位 | 待签字 |
| 3 | 亮 / 暗 × 320 / 390 / 768 / 1280：无横向溢出、无 CLS、文字不模糊 | 待签字 |
| 4 | `reduce` 下无位移 / 缩放，加载仍可感知；焦点环不被延迟 | 待签字（自动侧已断言，观感待确认；对照审查页的「模拟 reduce」） |
| 5 | 暗色下浮层 / 手风琴对比与亮色一致，无发灰 | 待签字 |

> 签字后把「待签字」改为「通过（日期）」，并同步 `todo.md` 的 M6-1 状态。

## 6. A4 ~ A7 边界

- **A4 表单输入 / A5 基础与布局 / A6 选择器 / A7 数据展示**：本阶段不实现（登记 §3 非目标）。其验收随各自批次扩展，沿用本记录的 L1 ~ L4 分层与采样装置，不重复建条目。
- 既有表单 / 选择器 / 数据展示组件的**现有**动效仍受 L1 守卫（token / 裸时长 / 布局白名单）与 reduce 全局兜底约束，不因未纳入 expressive 而豁免静态契约。

## 7. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm exec playwright test test/e2e/motion-acceptance.e2e.ts` | **27 passed**（9 例 × mobile / tablet / desktop） |
| `pnpm vitest run scripts/governance/check-motion-contract.test.mjs` | **35 passed**（布局属性审计 + 装置 token 同步） |
| `pnpm check:motion-contract` | OK（文件 42 / 声明 131） |
| `pnpm test` / `pnpm typecheck` / `pnpm lint:check` | 通过 |
| 长任务实测 | 2 条，最大 **66ms**（不阻断） |
| `pnpm docs:check` / `docs:build` | 通过（新示例与 §5.3 链接有效） |
| `pnpm verify` / `capture:styles` / `test:visual` | 见交付结论（不改变默认渲染） |

## 8. Review Gate

- **audit-depth**：R1 `standard`（新增 E2E 装置 + 常驻规格 + 守卫扩面 + 文档 / 示例 + 验收记录，≤ 12 分钟）；R2 `quick`（修复面，≤ 5 分钟）。
- **R1（`standard`）**：`Pass`（0 blocker / 5 warning / 7 suggest；实测约 18 分钟，超 ≤ 12 分钟时间盒约 6 分钟）——
  - W1 reduce 用例把加载类 `infinite` 动画误判：**已修**——过滤加 `!infinite`，记录改为「一次性位移 / 缩放」。
  - W2 rAF 轮询在没有帧时无法返回：**已修**——`Promise.race` 加预算兜底定时器（仅兜底，不作为等待动画手段）。
  - W3 布局守卫可被「时长前置 / `transition-property` 长写 / 属性清单不全」绕过：**已修**——新增 `transitionPropertyOf()`、支持长写、补 `line-height` / 逻辑属性 / `gap*` 等，并补 6 例单测。
  - W4 `theming.md` L3 表述与旧规格事实不符：**已修**——改为「按需采样 + 装置统一口径」。
  - W5 批次 8 文件 / 959 行超粒度阈值：**已处理**——拆 3 个提交（装置 → 守卫 → 文档与记录）。
  - S1 计数口径 → 9 例 × 3 project；S2 装置 token 清单与守卫同步断言；S3 删除未使用导出；S4 示例 minimal 改为移除属性；S5 关键帧 `name → file` 校验 + `Object.hasOwn`；S6 退场终帧与 `durations` 长度断言；S7 长任务标注为冒烟不阻断。均已采纳。
- **R2（`quick` delta）**：`Pass`（0 blocker / 2 warning / 1 suggest；实测约 6 分钟，超 ≤ 5 分钟时间盒约 1 分钟）——
  - W1 `transition-property: all` 绕过「禁 all」：**已修**——长写分支复用判定 + 1 例单测。
  - W2 `theming.md` 对旧规格的描述仍不准确：**已修**——明确 `navigation-motion` / `overlay-motion` 亦有同类采样用法。
  - S1 逻辑属性覆盖不全：**已采纳**——补 `margin/padding/inset` 逻辑属性与 `border-inline/block-width`，并注释声明复合简写不在面内。
- **复查基线**：本记录 §2 ~ §5；`test/e2e/helpers/motion.ts`；`test/e2e/motion-acceptance.e2e.ts`；`scripts/governance/check-motion-contract.{mjs,test.mjs}`；`docs/design/theming.md` §5.3；`docs/examples/theming/motion.vue`。

## 9. 未覆盖边界

- 采样装置只覆盖 CSS 动画 / 过渡，不覆盖 Web Animations API 直接创建的动画（本库无此用法）。
- 长任务阈值仅为冒烟，不替代真实设备性能评估；低端机主观流畅度交 L4。
- recordVideo 为固定视口，未覆盖 320 / 768 档录屏（截图与自动矩阵覆盖几何）。
- 未在 Firefox / WebKit 复跑（项目 E2E 仅 Chromium）。
