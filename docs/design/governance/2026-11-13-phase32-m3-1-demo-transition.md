# Phase 32 M3-1：文档站 demo 过渡恢复（系统 reduce 下仍压平站点）

> 创建时间：2026-11-13
> 触发：Phase 32 M3-1（[Phase 32 登记批次](./2026-11-12-phase32-registration.md) §2）。

## 1. 问题与处置

- **现状**：VitePress 在 `prefers-reduced-motion: reduce` 下以 `* { transition-duration: 0s !important }` 压平过渡；组件库同时在 reduce 下把 `--caomei-motion-duration-*` 归零，并有部分组件显式写 `transition: none`。三层叠加使 demo 内的状态过渡完全不可见。
- **处置**：`docs/.vitepress/theme/motion.css` 新增「演示区过渡 opt-in」——只在 `.vitepress-demo-plugin__container` 作用域内，按组件重声明**完整 `transition` shorthand** 并逐属性 `!important`；时长改用文档站本地变量 `--caomei-demo-duration-*`（base 150ms / slow 200ms / slower 300ms，取值 = `minimal` 档 token 快照），缓动沿用 `--caomei-motion-ease-standard`（reduce 未归零）。字段外壳通过复写公开入口 `--caomei-field-transition` 保留下游覆盖语义。
- **有意不恢复**：`expressive` 专属过渡——Tag / Slider / Calendar / DataTable / InputGroup 成员位移 / Stepper 指示器等。它们在 `minimal` 下本就没有 transition 声明，恢复会创造出组件不存在的过渡。Portal 面板内的拖拽位移（Toast swipe）属指针手势而非状态过渡，也不恢复。

## 2. 恢复清单（选择器 / 属性 / 来源）

| 选择器 | 过渡属性 | 来源（基础层声明） |
|:---|:---|:---|
| `.caomei-field` | border-color, box-shadow（经 `--caomei-field-transition` 复写） | `src/styles/field-shell.css:27` |
| `.caomei-button` | opacity, color, background-color, border-color | `src/components/button/button.vue:130` |
| `.caomei-float-label > label` | top, font-size, color, transform（保留 `--caomei-float-label-transition-duration` 覆盖） | `src/components/float-label/float-label.vue:47` |
| `.caomei-accordion__trigger` | background-color | `src/components/accordion/accordion-item.vue:85` |
| `.caomei-accordion__chevron` | transform（slow） | 同上 |
| `.caomei-badge` | background-color, color, min-width | `src/components/badge/badge.vue:120` |
| `.caomei-card--hoverable` | box-shadow, transform | `src/components/card/card.vue:115` |
| `.caomei-checkbox__control` | background-color, border-color | `src/components/checkbox/checkbox.vue:168` |
| `.caomei-file-upload__dropzone` | border-color, background-color | `src/components/file-upload/file-upload.vue:415` |
| `.caomei-image__preview-icon` | opacity | `src/components/image/image.vue:295` |
| `.caomei-menu .caomei-menu__item` | background-color, color | `src/components/menu/menu.vue:203` |
| `.caomei-menu__submenu-indicator` | transform | `src/components/menu/sub-menu.vue:110` |
| `.caomei-paginator__control` | border-color, background-color, color | `src/components/paginator/paginator.vue:221` |
| `.caomei-password__meter-fill` | width, background-color | `src/components/password/password.vue:257` |
| `.caomei-progress-bar__indicator` | width（slower） | `src/components/progress-bar/progress-bar.vue:92` |
| `.caomei-radio-button__indicator`（含 `::after`） | background-color, border-color / transform | `src/components/radio-group/radio-button.vue:90` |
| `.caomei-select-button__item` | background-color, color | `src/components/select-button/select-button.vue:164` |
| `.caomei-switch`（轨道） | background-color, border-color | `src/components/switch/switch.vue:77` |
| `.caomei-switch__thumb` | transform | 同上 |
| `.caomei-tabs__trigger` | color, border-color | `src/components/tabs/tabs-trigger.vue:43` |
| `.caomei-stepper__trigger` | color, background-color | `src/components/stepper/stepper-trigger.vue:80` |
| `.caomei-toolbar__button` / `.caomei-toolbar__link` | background-color, color | `src/components/toolbar/toolbar.vue:149` / `toolbar-link.vue:40` |
| `.caomei-toggle-button` | background-color, color, border-color | `src/components/toggle-button/toggle-button.vue:65` |
| `.caomei-dropdown-menu__trigger` | background-color, border-color | `src/components/dropdown-menu/dropdown-menu-trigger.vue:52` |
| `.caomei-popover__trigger` | background-color, border-color | `src/components/popover/popover-trigger.vue:40` |

## 3. 验证证据

| 项 | 结果 |
|:---|:---|
| reduce 下 demo 计算值（6 页） | `.caomei-field` / `.caomei-checkbox__control` / `.caomei-paginator__control` / `.caomei-button` / `.caomei-switch`（含 thumb）/ `.caomei-float-label > label` 均为 `0.15s`（多属性时逐项 `0.15s`） |
| reduce 下 demo 实际过渡 | 输入聚焦：`CSSTransition`（`border-*-color` ×4 + `box-shadow`，150ms）；开关勾选：`transform` 150ms；`FloatLabel` 标签上浮：top / font-size / color / transform 均有声明 |
| 站点元素（demo 外） | `.VPNavBarTitle` / `.VPContent` / `.vp-doc` 均 `0s`（VitePress 压平保持） |
| 正常偏好（`no-preference`） | demo 过渡仍为 `0.15s`，与改动前一致 |
| `pnpm docs:build` | 通过 |
| `pnpm capture:styles` | 399 项 **0 差异**（未触碰库内样式） |
| `pnpm test:visual` | **36 passed + 6 项既有字体族失败**（与改动前一致；「0 差异」由 `capture:styles` 承担） |
| `pnpm lint:css:check` / `pnpm lint:check` | 通过 |

- 取证脚本与截图（git-ignored）：`test-results/ui-validate/phase32-m3-1-transition-probe.mjs`、`phase32-m3-1-timeline-probe.mjs`、`phase32-m3-1-reduce-light-switch.png`、`phase32-m3-1-reduce-dark-input.png`。

## 4. 边界

1. **作用域**：只命中 `.vitepress-demo-plugin__container` 内可达元素；Portal 面板（Toast 拖拽、Drawer / Popover 内过渡）不在本层。
2. **复制型漂移**：本层是组件 transition 的**手工副本**（keyframes 副本有 `check:demo-keyframes` 守卫，本层暂无）；§2 清单提供逐条来源，组件调整属性清单时需同批对齐。复评估触发 = 组件新增 / 删除基础层过渡，或 `minimal` 档 token 调整。
3. **`data-motion="expressive"` 演示**：本地时长固定为 minimal 快照，reduce 下 expressive 演示的过渡时长不会升到 220ms（库内语义未变，仅演示时长为 demo 档位）。
4. **站点 UI**：仍为 `0s`，符合「demo 展示组件真实行为、站点自身尊重系统偏好」的取舍。
5. **不改变库内语义**：零 `src/**` 改动，`data-motion` 轴与 `reduce` 压平逻辑不变。

## 5. Review Gate

- **audit-depth**：R1 `standard`（文档站主题 CSS + 设计文档，≤10 分钟），R2 `quick`（只复查修复点）。
- **R1**（`standard`）：`Reject`（1 blocker / 5 warning / 3 suggest）。
  - blocker：Button 被误列为「expressive 专属」而未恢复（`button.vue:130` 实为基础层过渡）→ 已补规则并修正归因。
  - warning：Stepper 指示器属 expressive 专属却恢复（过度恢复）→ 已删除；Switch 只恢复拇指、轨道颜色瞬变 → 补轨道；FloatLabel 基础层过渡遗漏 → 已补；设计文档「分两档」与三条 bullet 不符 → 改「分三档」；复制的过渡清单无约束载体 → 记录 §2 补 25 行逐项清单（选择器 / 属性 / 来源行号）。
  - suggest：未使用的 `--caomei-demo-duration-fast` → 删除；字段外壳绕过公开入口 `--caomei-field-transition` → 改为容器内复写该变量；时长快照与 expressive 演示交汇 → §1 / §4 补记。
- **R2**（`quick`）：`Pass`（0 blocker / 1 warning / 2 suggest）——R1 一项 blocker 与五项 warning 全部关闭；warning 为设计文档残留「120ms」四档口径 → 已改三档；suggest 为 Switch 双规则合并与来源行号口径 → 已拆分规则，行号口径保留（清单已能定位）。
- **复查基线**：本记录 §1 / §2 / §4 / §5；`docs/.vitepress/theme/motion.css` 过渡 opt-in 块；`docs/design/documentation-site.md` §9；`docs/plan/todo.md` M3-1 行；`docs/design/governance/index.md` 该条目摘要。
