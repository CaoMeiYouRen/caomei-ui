# M2 样式与 token 一致性收口交付与验证记录

> 阶段：Phase 14（质量与一致性收口）→ M2 样式与 token 一致性收口。
> 范围依据：[下一阶段范围评估 §10](./2026-09-25-next-stage-scope-evaluation.md)（用户裁定 D5 / D6）；条目登记：[待办事项](../../plan/todo.md) Phase 14 M2。
> 快照日期：2026-09-26。**本阶段不改任何 token 色值与既有视觉**（D5 / D6：仅盘点、清单与机检）。

## 1. 范围与目标

① 实底前景 token 配对复核（**仅出可复算清单**，D6②）；② 对比度遗留项盘点（**仅盘点并登记、不改色**，D5①）；③ 触发器 `disabled` 透传与包装层归一化；④ 一致性机检（样式侧旧命名裸类 + `check-design` 解析健壮性）。非目标：不做与一致性无关的样式重构；不纳入字段 shell 批次（[长期任务台账](../../plan/recurring.md)）。

## 2. M2-1 实底前景 token 配对复核（仅出清单）

**契约**（[设计规范 §2.2 / §3.2](../design-spec.md)，值事实源 `src/styles/theme.css`）：`-solid` 实底固定配 `--caomei-color-on-solid`（跨主题稳定）；自适应 tone 底（如 `--caomei-color-primary`）配 `--caomei-color-primary-foreground`（随主题自适应）；**禁令**：`-solid` 实底不得与 `primary-foreground` 交叉配对。

### 2.1 `-solid` 实底 → `on-solid` 前景

| 消费点 | 底 | 前景 | 判定 |
| :--- | :--- | :--- | :--- |
| `src/components/badge/badge.vue:160-162`（`.caomei-badge--solid`） | `--caomei-badge-solid` → `--caomei-color-<tone>-solid`（132~152 的五档映射） | `--caomei-color-on-solid` | 一致 |
| `src/components/message/message.vue:156-158`（`.caomei-message--solid`） | `--caomei-message-solid` → 五档 | `--caomei-color-on-solid` | 一致 |
| `src/components/tag/tag.vue:138-140`（`.caomei-tag--solid`） | `--caomei-tag-solid` → 五档 | `--caomei-color-on-solid` | 一致 |
| `src/components/button/button.vue:153-186`（`:where(.caomei-button--tone-*)` 五档） | `--caomei-button-bg` → `--caomei-color-<tone>-solid` | `--caomei-button-fg` → `--caomei-color-on-solid` | 一致 |
| `src/components/confirm-dialog/confirm-dialog.vue:238-239`（danger 确认按钮局部重映射） | `--caomei-color-primary` → `--caomei-color-danger-solid` | `--caomei-color-primary-foreground` → `--caomei-color-on-solid`（显式改写以规避交叉配对） | 一致（历史交叉配对已在此修复） |

### 2.2 自适应底 → `primary-foreground` 前景

> 枚举范围：**以 `--caomei-color-primary` 作实底（直接或作回退）且承载前景内容**的消费点；纯图形填充（无前景内容）单独列出并判「无配对面」。`color-mix` 软底（如 `data-table.vue:1109` 选中行 8% 底）与非 primary tone 的纯图形填充（如 `password.vue:261/266/271` 强度条、`stepper-separator.vue:41` 连接线）不构成底 / 前景配对面，不在本表。

| 消费点 | 底 | 前景 | 判定 |
| :--- | :--- | :--- | :--- |
| `src/components/button/button.vue:137-138`（`.caomei-button--primary`） | `--caomei-button-bg` 回退 `--caomei-color-primary` | `--caomei-button-fg` 回退 `--caomei-color-primary-foreground` | 一致 |
| `src/components/calendar/calendar-view.vue:177-178`（选中日） | `--caomei-color-primary` | `--caomei-color-primary-foreground` | 一致 |
| `src/components/toggle-button/toggle-button.vue:78-80`（`data-state=on`） | `--caomei-toggle-button-active-bg` 回退 `primary` | `--caomei-toggle-button-active-color` 回退 `primary-foreground` | 一致 |
| `src/components/select-button/select-button.vue:202-204`（选中项） | `--caomei-select-button-active-bg` 回退 `primary` | `--caomei-select-button-active-color` 回退 `primary-foreground` | 一致 |
| `src/components/stepper/stepper-indicator.vue:51-53`（active 指示器） | `--caomei-stepper-active-bg` 回退 `primary` | `--caomei-stepper-active-indicator-color` 回退 `primary-foreground` | 一致 |
| `src/components/toolbar/toolbar.vue:167-169`（按下态按钮） | `--caomei-toolbar-button-active-bg` 回退 `primary` | `--caomei-toolbar-button-active-color` 回退 `primary-foreground` | 一致 |
| `src/components/paginator/paginator.vue:223-226`（选中页） | `--caomei-paginator-active-bg` 回退 `primary` | `--caomei-paginator-active-color` 回退 `primary-foreground` | 一致 |
| `src/components/checkbox/checkbox.vue:170-173`（checked）+ `:165`（对勾前景） | `--caomei-checkbox-active-bg` 回退 `primary` | `--caomei-checkbox-foreground` 回退 `primary-foreground` | 一致 |
| `src/components/radio-group/radio-button.vue:106-108`（checked）+ `:101`（圆点前景） | `--caomei-radio-active-bg` 回退 `primary` | `--caomei-radio-dot` 回退 `primary-foreground` | 一致 |
| `src/components/switch/switch.vue:80-82`（checked 轨道）+ `:100`（滑块） | `--caomei-switch-active-bg` 回退 `primary` | `--caomei-switch-thumb-bg` 回退 **`--caomei-color-bg`** | **待裁定**：前景取 `bg` 而非 `primary-foreground`（默认主题两值相等——亮均 `#fff`、暗均 `#0b0b0d`——预设 / 自定义下可能失配），已登记 [Backlog](../../plan/backlog.md)；D6② 本批不修复 |
| `src/components/slider/slider.vue:170`（range 填充） | `--caomei-slider-range-bg` 回退 `primary` | （无前景内容，纯图形） | 无配对面 |
| `src/components/progress-bar/progress-bar.vue:91`（进度填充） | `--caomei-progress-bar-color` 回退 `primary` | （无前景内容，纯图形） | 无配对面 |

### 2.3 非配对面的 `-solid` / `on-solid` 消费

| 消费点 | 用法 | 判定 |
| :--- | :--- | :--- |
| `src/components/toast/toast.vue:212`（`border-left` 强调描边） | `--caomei-toast-accent` 回退 `--caomei-color-neutral-solid`（描边，非底色） | 非底 / 前景配对面；暗色下该描边 2.54:1 低于图形阈值 3:1（见 §3） |
| `src/components/toast/toast.vue:257`（图标色） | `color: var(--caomei-toast-accent)` **无回退**（tone 未命中时继承正文色，与描边的 `neutral-solid` 回退口径不一致） | **待裁定**（回退口径不一致；补回退会改变渲染色值，属 D5 禁改面），登记 [Backlog](../../plan/backlog.md) |
| `src/components/image/image.vue:262,341,347`（预览图标 / 关闭钮前景） | `--caomei-image-preview-color` 回退 `--caomei-color-on-solid`（亮色图标覆盖媒体与遮罩） | 语义偏移（`on-solid` 定义为实底前景，此处作媒体上的稳定亮色）；视觉取舍保留，不改 |

### 2.4 结论

- 五档 tone 实底与 `on-solid` 的配对**全部一致**，交叉配对禁令零违反（历史违例已在 confirm-dialog 局部重映射修复）。
- 自适应底配对面 **1 处待裁定**（switch 滑块取 `bg`）；`-solid` / `on-solid` 的非配对面用法 3 处（2 处待裁定 / 1 处保留取舍）。
- 清单可复算：逐条给出 `src/**` 行号（快照 2026-09-26）；token 值事实源为 `src/styles/theme.css` 与 `src/styles/presets/*.css`。

## 3. M2-2 对比度遗留项盘点（仅登记，不改色）

复算方法：相对亮度按 WCAG 公式（sRGB 通道线性化）计算对比度；soft 底按 `color-mix(in srgb, <tone> 12%, transparent)` 于页面底（`--caomei-color-bg`）合成。阈值：正文 ≥ 4.5:1、图形 ≥ 3:1（[设计规范 §3.2](../design-spec.md)）。

| # | 项 | 消费点 | 复算值（2026-09-26） | 阈值 | 判定 |
| :-: | :--- | :--- | :--- | :-: | :--- |
| 1 | 亮色 soft 变体 primary 文本 | `badge` / `message` / `tag` 的 `--soft`（`color-mix(tone 12%, transparent)` 底 + tone 文本） | **4.37:1**（`#2563eb` on `#e5ecfd`） | 4.5 | **缺口（维持登记）** |
| 2 | `.caomei-calendar__weekday` 亮色 | `calendar-view.vue:137-140`（`text-muted` 文本） | **4.83:1**（on `bg` `#fff`）/ **4.52:1**（on `bg-elevated` `#f7f7f8`） | 4.5 | **库内达标**；历史值 4.48:1 系站点侧 soft 底口径（与 #6 同根因），非库内缺口 |
| 3 | toast 中性强调面（历史条目名 `.caomei-toast__icon`，实测面为 `border-left` 描边） | `toast.vue:253-257`（图标色 `var(--caomei-toast-accent)` 无回退 → tone 未命中时按继承收口到 `--caomei-color-text`）+ `toast.vue:212`（`neutral-solid` 描边回退） | 描边面：`neutral-solid #52525b` on 暗底 `#0b0b0d` = **2.54:1**；图标面：继承 `--caomei-color-text`（暗 `#f5f5f5` on `#0b0b0d` = **18.04:1**）非缺口 | 3（图形） | **缺口（描边面，维持登记）**；图标面达标但与描边回退口径不一致，见 §2.3 |
| 4 | `caomei` 预设 `danger` 作前景 | 预设 `src/styles/presets/caomei.css` 的 `--caomei-color-danger: #ef4444`（soft / outline 文本消费点） | 纯白底 **3.76:1**；soft 12% 底 **3.23:1**（`#fde9e9`） | 4.5 | **缺口（维持登记）**；invalid 描边属图形（3:1 下达标），实底走 `danger-solid`（6.47:1 达标） |
| 5 | `caomei` 预设 `primary-solid` 配 `on-solid` | `presets/caomei.css:10`（`#e63946`） | **4.17:1**（配白字） | 4.5 | **例外（已裁定维持）**：预设品牌色不变（用户决策），跟踪见 [Backlog](../../plan/backlog.md) |
| 6 | 站点侧 `text-muted` on soft 底 | 文档站 `--vp-c-bg-soft`（`#f6f6f7`）上的 `--caomei-color-text-muted`（`#6b7280`） | **4.48:1** | 4.5 | **缺口（维持登记）**：库 token × 站点底，归因站点主题，非库内可修面 |

**结论**：6 项逐条复算完成，**无新增缺口、无修复消除**（#2 经归因更正移出库内在册、转站点侧口径）；按 D5① **不改任何色值**，在册缺口维持 [Backlog](../../plan/backlog.md)「对比度遗留项盘点」跟踪。
