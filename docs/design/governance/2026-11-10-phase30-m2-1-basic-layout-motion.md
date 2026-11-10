# Phase 30 M2-1：基础与布局动效交付

> 创建时间：2026-11-10
> 触发：Phase 30 M2-1（[Phase 30 登记批次](./2026-11-10-phase30-registration.md) §2）。
> 依据：[动效体系评估](./2026-11-08-motion-system-evaluation.md) §5 / §6 / §8；基础层见 [Phase 29 M1-1 记录](./2026-11-08-phase29-m1-1-motion-foundation.md)。

## 1. 交付清单

| 组件 | 模式 | 动效 |
|:---|:---|:---|
| Avatar | `expressive` 新增 | 图片加载完成后淡入；只改透明度，不产生位移 / 缩放 |
| Tag | `expressive` 新增 | 底色 / 边框 / 文字颜色过渡；可选中标签悬浮时加深底色（选中项不覆盖）；关闭按钮颜色过渡 |
| Card | `expressive` 增强 | `hoverable` 悬浮抬升幅度改用位移 token（4px，`minimal` 保持既有 2px）；过渡继续消费 motion token |
| Image | `expressive` 新增 | 图片元素出现 / 更换 `src` 后淡入；加载态脉冲与预览指示器过渡保持既有 token 化 |
| Badge | 审计 | 既有背景 / 文字 / `min-width` 过渡已消费 motion token，本批不重复改动 |
| Divider | 审计（静态） | 分隔线无交互 / 状态面，不新增动画；作为 E2E 静态对照 |
| Row / Col | 审计（静态） | 布局原语无状态面；`gap` / `grid-column` 过渡属布局动画且会产生位移，按要求不做；作为 E2E 静态对照 |

- **缺省 `minimal` 零差异**：新增规则全部以 `:where([data-motion='expressive'])` 前缀隔离，`minimal` 无对应选择器。
- **reduce 压平**：Avatar / Image 入场动画、Tag 过渡显式关闭；Card 沿用既有 reduce 块（`transform: none`），Badge 由 token 归零。
- **不做常驻装饰**：Avatar / Image 只做一次性入场，不引入循环或常驻动画；Divider / Row / Col 保持静态。

## 2. 实现要点

1. **入场只做透明度**：Avatar 与 Image 的加载入场只改 `opacity`，不产生位移 / 缩放，避免列表 / 布局抖动。
2. **Tag 悬浮不覆盖选中态**：悬浮加深规则排除 `.caomei-tag--disabled` 与 `.caomei-tag--selected`，选中项保持既有 24% 底色；该悬浮规则包在 `prefers-reduced-motion: no-preference` 内，reduce 下不改变底色。
3. **Card 抬升消费 token**：`minimal` 仍是既有 `-2px`（逐值不变），`expressive` 改为 `-1 × --caomei-motion-distance-sm`（4px）；reduce 由既有块归零。
4. **静态组件不强行加动效**：Divider / Row / Col 无状态面，新增过渡属于装饰或布局动画，按「不做常驻装饰」非目标排除；E2E 以静态对照断言其无动画 / 无过渡。
5. **Badge 只审计**：过渡已覆盖 `background-color` / `color` / `min-width`，`min-width` 在布局属性白名单中登记；本批无需改动。

## 3. 验证证据

| 项 | 结果 |
|:---|:---|
| `pnpm lint` / `pnpm lint:css:check` | 通过 |
| `pnpm typecheck` | 通过 |
| `pnpm check:motion-contract` | 通过（受检面未收窄） |
| 定向 `vitest`（avatar / tag / card / image 等 10 文件） | 通过 |
| `pnpm exec playwright test test/e2e/basic-layout-motion.e2e.ts` | **24 passed**（8 用例 × 3 project：Avatar / Image / Tag / Card / Badge / 静态对照 / minimal / reduce） |
| 既有 `form` / `field-overflow` / `focus-and-motion` E2E | **60 passed** |
| 响应式矩阵 `responsive.e2e.ts` | **106 passed / 4 skipped**（新增夹具 section 未造成页面横向溢出） |
| `pnpm capture:styles` | **0 差异**（`minimal` 计算样式与冻结基线一致） |
| `pnpm test:visual` | **42 passed**（亮暗 / 视口 / 预设 / 区间面板基线不变） |
| `pnpm verify` | 通过（含 build / docs:build / governance:check） |

### 3.1 真实浏览器采样（Chromium，1280×800 / 390×844）

| 状态 | 实测值 |
|:---|:---|
| `data-motion="expressive"` token | `--caomei-motion-duration-base = 220ms` |
| Avatar 加载 | `animation-name = caomei-avatar-image-in-*` |
| Image 加载 | `animation-name = caomei-image-in-*` |
| Tag 悬浮 | 底色过渡到 `color(srgb … / 0.12)`；`transition-duration = 0.22s × 3` |
| Card 悬浮 | `transform = matrix(1, 0, 0, 1, 0, -4)` |
| Badge | `transition-duration = 0.22s × 3`（沿用 token） |
| reduce（expressive + reduce） | Avatar / Image 无动画；Card 不抬升；Tag 悬浮不改底色；Badge 过渡 `0s` |
| 页面横向溢出 | 桌面 / 移动均 `scrollWidth == clientWidth` |

- 截图与可复跑脚本：`test-results/ui-validate/desktop-light-layout.png`、`desktop-dark-layout.png`、`mobile-light-layout.png`、`desktop-reduce-form.png`；脚本 `test-results/ui-validate/phase30-motion-validate.mjs`（均为 gitignored，结论与关键实测值已回写本节）。
- 验证窗口内无源码改动；亮 / 暗、桌面 / 移动、reduce 三面均采样，console error 为 0。

## 4. 风险与边界

1. **Divider / Row / Col 无动效**：三者没有可交互状态，新增过渡只能是装饰或布局动画；B 档验收的「增删 / hover / 加载」只覆盖存在这些状态的组件，静态组件以「无动画 / 无过渡」作为对照断言。
2. **Tag 只做状态过渡，不做列表增删动画**：Tag 的增删由使用方列表控制，组件内没有 TransitionGroup；未引入会改变 DOM 契约的列表级入场 / 退场。
3. **Image 入场作用域**：图片元素在首次挂载与 `src` 更换时淡入；若使用方以 `v-show` 反复显隐，不会重新播放。
4. **Avatar 回退内容**：回退内容出现不做动画，避免无 `src` 的头像在首屏统一淡入的装饰感。
5. **Card 抬升幅度**：`expressive` 使用 4px，`minimal` 保持 2px；若下游覆盖 `transform`，动效随之失效。
6. **任务粒度**：本批 6 文件（4 组件 + 夹具 + E2E），新增约 340 行，未超 10 文件阈值。

## 5. Review Gate

- **audit-depth**：`standard`（4 个 `src/**` 组件 + 夹具 + E2E；含静态组件取舍与 reduce 压制）；时间盒 ≤ 10 分钟。
- **R1（`standard`）**：`Pass`（0 blocker / 2 warning / 2 suggest；实测约 3 分钟，未超时间盒）——
  - W1 Divider / Row / Col 未新增动效与范围表述存在张力：**已登记**——三者无状态面，新增过渡属装饰或布局动画；E2E 以静态对照断言无动画 / 无过渡，并在 §4 说明取舍。
  - W2 Tag 悬浮在 reduce 下不改变底色：**已登记**——悬浮加深规则包在 `no-preference` 内，避免 reduce 下出现瞬时状态变化；交付清单与 §4 写明。
  - S1 Image 仅在挂载 / `src` 更换时淡入：**已登记**——避免侵入使用方显隐控制。
  - S2 Avatar 回退内容不做动画：**已登记**——避免首屏无图头像统一淡入的装饰感。
- **R2（`quick` delta）**：`Pass`（0 blocker / 0 warning / 1 nit；实测约 2 分钟，未超 ≤ 6 分钟时间盒）——W1 / W2 的文字表述已与实现对齐；nit 为记录截图清单仅列代表图。
- **复查基线**：本记录 §1 ~ §3；`src/components/{avatar,tag,card,image}`；`test/e2e/basic-layout-motion.e2e.ts`；`test/e2e/fixtures/app.vue` 的 `#basic-layout-motion`。

## 6. 未覆盖边界

- 未逐组件做人工录屏 / 0.25 倍速复核（属动效验收批次）。
- 未覆盖 Tag 在列表中的增删动画（组件内无列表容器）。
- 未覆盖 Image 以 `v-show` 反复显隐的重播。
- 未覆盖 Row / Col 的布局变更动画（按非目标排除）。
