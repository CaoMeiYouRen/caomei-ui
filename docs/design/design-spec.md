# 设计规范

本文档定义 caomei-ui 的 token 体系、尺寸 / 颜色 / 主题 / 风格规范，以及下游迁移（PrimeVue → caomei-ui）的映射约定。主题实现细节见 [主题与样式设计](./theming.md)；组件实现准则见 [开发规范](../standards/development.md)。

> 标注约定：**已实现**指 `src/styles/theme.css` 当前已定义并可被组件消费；**规划（待实现）**指本规范确定但尚未落地，不得在文档或 API 中描述为已完成。

## 1. 目标与原则

- **组件与样式解耦**：组件只消费 `--caomei-*` 语义 token，不硬编码品牌色 / 尺寸。现状：组件样式块内无 `#hex` / `rgb()` / `rgba()` 字面量（`check:design` 预算 0）；elevation 阴影与遮罩由 §2.6 token 承载。尚未收敛的一类：AutoComplete / DatePicker 面板的自适应阴影，以及各输入类控件的焦点环（`color-mix()` 就地组合，后者随 §2.5 规划的 `--caomei-color-focus-ring` 落地）。
- **100% 可覆盖**：所有视觉由 token 决定，消费者可整体覆盖。
- **两套默认预设**：`caomei`（源 caomei-auth）与 `momei`（源 momei），均含亮 / 暗两态。
- **不引入 Tailwind / UnoCSS**。

## 2. Token 体系

### 2.1 分层与命名

统一前缀 `--caomei-*`，按「语义层 → 组件层」组织；组件层 token 以组件名派生（如 `--caomei-select-max-width`）。禁止在组件内使用原始色值或魔法尺寸。

### 2.2 颜色 token（已实现）

> 值事实源为 `src/styles/theme.css`；本节为规范摘录，若与实现不一致以 `theme.css` 为准。

| token | 语义 | 亮色默认 | 暗色默认 |
| --- | --- | --- | --- |
| `--caomei-color-primary` | 品牌强调色（文字 / 边框 / soft 底） | `#2563eb` | `#60a5fa` |
| `--caomei-color-primary-foreground` | `primary` 作底时的前景色（随主题自适应） | `#fff` | `#0b0b0d` |
| `--caomei-color-primary-solid` | primary 实底（跨主题稳定，固定配 `--caomei-color-on-solid`） | `#2563eb` | `#2563eb` |
| `--caomei-color-success` | 成功强调色 | `#15803d` | `#4ade80` |
| `--caomei-color-success-solid` | 成功实底 | `#15803d` | `#15803d` |
| `--caomei-color-warning` | 警告强调色 | `#b45309` | `#fbbf24` |
| `--caomei-color-warning-solid` | 警告实底 | `#b45309` | `#b45309` |
| `--caomei-color-danger` | 危险强调色 | `#dc2626` | `#f87171` |
| `--caomei-color-danger-solid` | 危险实底 | `#dc2626` | `#dc2626` |
| `--caomei-color-neutral-solid` | 中性实底（无强调色） | `#52525b` | `#52525b` |
| `--caomei-color-on-solid` | 实底上的稳定前景色 | `#fff` | `#fff` |
| `--caomei-color-bg` | 页面背景 | `#fff` | `#0b0b0d` |
| `--caomei-color-bg-elevated` | 抬升面（卡片 / 浮层） | `#f7f7f8` | `#17171a` |
| `--caomei-color-text` | 主文字 | `#1a1a1a` | `#f5f5f5` |
| `--caomei-color-text-muted` | 次要文字 | `#6b7280` | `#a1a1aa` |
| `--caomei-color-border` | 边框 / 分隔线 | `#e5e7eb` | `#2a2a2e` |

> `--caomei-color-<tone>` 随主题自适应；`--caomei-color-<tone>-solid` 跨主题稳定，保证实底与 `--caomei-color-on-solid` 的对比度；**替换品牌色时需同时覆盖对应的 `-solid`**。若自定义强调色会被当作底色承载文字 / 图标（`primary` 作底的按钮、选中态等），还需同时覆盖 `--caomei-color-primary-foreground`——它随主题变化（暗色为深色 `#0b0b0d`），只改 `primary` 不改它会与自定义色失配；Nuxt 模块可用 `primary-foreground` 别名覆盖——注意别名写入的是**单条 `:root` 声明**（同一值跨明暗），需要按明暗分别取值时仍以 CSS 覆盖为准。

### 2.3 尺寸 token（已实现）

> 值事实源为 `src/styles/theme.css`；本节为规范摘录。

| 类别 | token | 值 | 消费位置 |
| --- | --- | --- | --- |
| 控件高度 | `--caomei-control-height-sm` / `-md` / `-lg` | 28 / 36 / 44 px | 按钮、输入类、Select 等 |
| 间距 | `--caomei-space-1` ~ `-4` | 4 / 8 / 12 / 16 px | 组件内边距与间隙 |
| 字号 | `--caomei-font-size-sm` / `-md` / `-lg` | 12 / 14 / 16 px | 控件文本与标题 |
| 圆角 | `--caomei-radius-sm` / `-md` / `-lg` / `-full` | 4 / 8 / 12 / 999 px | 控件 / 容器 / 浮层 / 胶囊 |
| 组件宽度 | `--caomei-input-number-max-width` / `--caomei-select-max-width` | 12rem / 20rem | 数值输入框 / 选择器默认上限；`MultiSelect` / `AutoComplete` / `DatePicker` 未声明默认值，按回退链取 `--caomei-select-max-width`（见[主题与样式设计 §4.1](./theming.md)） |

消费统计（`src/` 内引用次数）：radius sm 22 / md 20 / lg 3 / full 1；control-height sm 11 / md 14 / lg 9；font-size sm 18 / md 39 / lg 15；space-1 ~ 4 分别 41 / 46 / 24 / 23。

> 断点约定为 sm 640px / md 768px / lg 1024px；`@media` 不支持 CSS 自定义属性，故断点以文档约定 + 组件内媒体查询字面量维护，未定义 `--caomei-breakpoint-*` 变量。断点语义与窄屏行为矩阵见[响应式设计](./responsive.md)。

### 2.4 字体 token（已实现）

| token | 值 |
| --- | --- |
| `--caomei-font-sans` | `system-ui, -apple-system, sans-serif` |

### 2.5 层级 token（已实现）与规划新增 token

#### 层级 token（已实现）

统一承载浮层层级与局部层叠，替代组件内 `z-index` 字面量；`check:design` 的 `z-index` 预算为 0（数字即失败）。

| token | 值 | 说明 |
| --- | --- | --- |
| `--caomei-z-raise` | `1` | 局部层叠：同容器内焦点成员 / 浮动标签的相对抬升（ButtonGroup / InputGroup / FloatLabel） |
| `--caomei-z-pinned` | `2` | 局部层叠：DataTable 冻结列数据单元格 |
| `--caomei-z-pinned-header` | `3` | 局部层叠：DataTable 冻结列表头（高于数据单元格） |
| `--caomei-z-sticky` | `10` | 浮层层级词表预留（暂无消费点） |
| `--caomei-z-overlay` | `1000` | 遮罩层（Dialog / ConfirmDialog / Drawer）与同值浮层面板（Select / MultiSelect / AutoComplete） |
| `--caomei-z-modal` | `1001` | 模态内容（Dialog / ConfirmDialog / Drawer / ColorPicker 面板） |
| `--caomei-z-dropdown` | `1050` | 锚定浮层面板（DropdownMenu / Popover / DatePicker） |
| `--caomei-z-tooltip` | `1060` | 浮层层级词表预留（暂无消费点） |
| `--caomei-z-toast` | `1100` | Toast 视口 / Image 预览遮罩 |

- 浮层组件保留 `--caomei-<comp>-z-index` 覆盖钩子，未覆盖时回退到上表 token（如 `var(--caomei-popover-z-index, var(--caomei-z-dropdown))`）。
- Image 放大内容取 `calc(var(--caomei-image-preview-z-index, var(--caomei-z-toast)) + 1)`。
- 局部层叠 token（`raise` / `pinned` / `pinned-header`）只用于同一容器内的相对抬升，不与浮层层级混用。

#### 规划新增 token（待实现）

为落实「图标尺寸」「焦点环」等细节，规划新增以下 token（实现归入后续组件增强）：

| 类别 | 规划 token | 说明 |
| --- | --- | --- |
| 图标 | `--caomei-icon-size-sm` / `-md` / `-lg` | 统一 `@lucide/vue` 图标尺寸 |
| 交互 | `--caomei-color-focus-ring` | 焦点环（`--caomei-color-mask` 见 §2.6） |
| 字体 | `--caomei-font-mono` | 代码 / 密钥等场景 |
| 排版 | `--caomei-line-height-tight` / `-normal` / `-relaxed` | 标题与正文行高 |

### 2.6 阴影、遮罩与状态 token（已实现）

| token | 值 | 说明 |
| --- | --- | --- |
| `--caomei-shadow-xs` | `0 1px 2px rgb(0 0 0 / 0.2)` | 微元素阴影（滑块拇指） |
| `--caomei-shadow-sm` | `0 4px 12px rgb(0 0 0 / 0.08)` | 抬升面阴影（卡片） |
| `--caomei-shadow-md` | `0 8px 24px rgb(0 0 0 / 0.12)` | 浮层阴影（DropdownMenu / Popover / Select / MultiSelect / Toast） |
| `--caomei-shadow-lg` | `0 12px 32px rgb(0 0 0 / 0.18)` | 模态类浮层阴影（Dialog / ConfirmDialog / Drawer / ColorPicker） |
| `--caomei-color-mask` | `rgb(0 0 0 / 0.45)` | 浮层遮罩（Dialog / ConfirmDialog / Drawer） |
| `--caomei-skeleton-highlight` | `rgb(255 255 255 / 0.6)` | 骨架屏 `wave` 扫光高光 |
| `--caomei-disabled-opacity` | `0.6` | 禁用态整体不透明度（37 处禁用态——根控件 / 子部件 / 条目——已全部收敛，组件内无字面量残留） |

- 组件层覆盖钩子 `--caomei-card-shadow` / `--caomei-card-shadow-hover` / `--caomei-slider-thumb-shadow` 保留，默认回退到上表档位（`sm` / `md` / `xs`）。
- 阴影档位独立于控件尺寸阶梯（§2.3 的 `control-height-*` 等）：`xs` 专供滑块拇指等微元素，不随控件尺寸缩放。
- 原始字面量不得回到组件样式：`check:design` 的 rgb/hsl 预算已收紧为 0（覆盖 `#hex` / `rgb()` / `rgba()` / `hsl()` / `hsla()`，`color-mix()` 构成的阴影不在其扫描面）。
- 上述 token 由基础层样式入口（`caomei-ui/theme.css`）统一提供，属硬依赖：组件不再保留末位字面量兜底，未引样式入口时相关声明不生效。

## 3. 颜色规范

### 3.1 语义色与状态色

- 语义档位固定为 `tone`：`neutral` / `primary` / `success` / `warning` / `danger`。不新增 `info` / `contrast` 等档位，其语义由映射规范承接（见 §7）。
- `variant` 控制呈现形态（`primary` 实底 / `secondary` 描边 / `ghost` 无底色），`tone` 控制语义色（`neutral` / `primary` / `success` / `warning` / `danger`），二者正交。
- 组件不得自造色值；所有颜色必须来自 token。

### 3.2 对比度要求

- 正文与背景对比度 ≥ 4.5:1；大号文本与图形 ≥ 3:1（WCAG AA）。
- `-solid` 实底与 `--caomei-color-on-solid` 前景必须满足 AA（其余 tone 实底均 ≥ 4.5:1）。
  - **默认主题（2026-09-16 起）达标**：`primary` 与 `primary-foreground` 配对——亮 `#2563eb` + `#fff` = **5.17:1**、暗 `#60a5fa` + `#0b0b0d` = **7.73:1**；`primary-solid` 与 `on-solid` 配对两态均 **5.17:1**。实测证据见 [M2 浏览器验证记录](./governance/2026-09-16-m2-primary-browser-validation.md)。
  - **本节（`-solid` 配对）的唯一例外**：`caomei` 预设 `primary-solid` `#e63946` 配 `on-solid` 白字约 **4.17:1**，略低于阈值；用户决策预设品牌色保持不变，故暂予接受，跟踪见 [Backlog](../plan/backlog.md)「对比度遗留项盘点」。同预设 `danger-solid` `#b91c1c` 配白字 **6.47:1** 达标。
  - **不在本节范围的其它既有缺口**（按第一条「正文 ≥ 4.5:1 / 图形 ≥ 3:1」跟踪，见同一 Backlog 行）：亮色 soft 变体 primary 文本 4.37:1、`.caomei-calendar__weekday` 亮色 4.48:1、`.caomei-toast__icon` 暗色 2.54:1；`caomei` 预设 `danger` `#ef4444` 作为前景色时：纯白底约 **3.76:1**、soft 变体的 `color-mix(tone 12%)` 底约 **3.22:1**（消费点为 soft / outline 文本；invalid 描边属图形、3:1 阈值下达标，无需改动；实底仍走 `danger-solid`）。
- 焦点态必须可见（`--caomei-color-focus-ring` 为规划项），不得仅用颜色细微变化表示状态。

## 4. 主题与暗色

- **默认亮色**；暗色支持：
  - `.dark` class；
  - `[data-theme="dark"]` 属性；
  - 系统跟随为**显式开启**：根元素加 `data-scheme="auto"`，再以 `.light` / `[data-theme="light"]` 可临时锁定亮色。
- 品牌预设通过根元素 `data-preset` 切换：`[data-preset="caomei"]` / `[data-preset="momei"]`（缺省为基础预设）；预设与明暗正交组合，且需挂在**同一元素**上（通常为 `<html>`）。
- `useTheme()` 读取模式与暗色状态（`auto` 时读取系统偏好），见 [主题与样式设计 §3](./theming.md)。

## 5. 主题预设（已实现）

实现位置：`src/styles/theme.css`（基础）与 `src/styles/presets/caomei.css`、`src/styles/presets/momei.css`；随基础层 `caomei-ui/theme.css` 一起分发，经根元素 `data-preset` 激活。文档站顶栏提供演示切换。

### 5.1 caomei 预设（源：caomei-auth）

来源：`caomei-auth` 的 PrimeVue `definePreset(Lara, …)`（`nuxt.config.ts`）与 `styles/_theme.scss`（primary 全阶、surface slate 变体）。

> **与现状的差异**：本表为 caomei-auth 语义派生目标，与当前 `theme.css` 默认值并不完全一致（如 text / border / `success`·`warning`·`danger`、`radius-md` 8px→6px、暗色 `bg` `#0b0b0d`→`#18181b`），预设化将按表调整，属预期外观变更。

| token | 亮色 | 暗色 | 来源 |
| --- | --- | --- | --- |
| `--caomei-color-primary` | `#e63946`（primary.500） | `#ff6b6b`（primary.400） | caomei-auth `nuxt.config.ts` primary 色阶 |
| `--caomei-color-primary-foreground` | `#ffffff` | `#18181b` | Lara `contrastColor` |
| `--caomei-color-primary-solid` | `#e63946` | `#e63946` | 跨主题稳定 |
| `--caomei-color-success` | `#22c55e` | `#4ade80` | Lara button success |
| `--caomei-color-warning` | `#f97316` | `#fb923c` | Lara button warn |
| `--caomei-color-danger` | `#ef4444` | `#f87171` | Lara button error |
| `--caomei-color-bg` | `#ffffff` | `#18181b` | Lara content.background |
| `--caomei-color-bg-elevated` | `#f8fafc`（亮 surface-50） | `#27272a`（暗抬升面，zinc-800） | Lara content.background + 抬升面取 zinc-800 与底 `#18181b` 区分 |
| `--caomei-color-text` | `#475569` | `#ffffff` | Lara text |
| `--caomei-color-text-muted` | `#718096` | `#a1a1aa` | Lara text.muted |
| `--caomei-color-border` | `#e2e8f0` | `#3f3f46` | Lara content.border |
| `--caomei-radius-sm/md/lg` | `4 / 6 / 12` | 同 | 控件 6px / 卡片与浮层 12px |

> 待确认：caomei-auth 暗色存在 PrimeVue zinc（`#18181b`）与应用 SCSS（`#121212`）双轨，本预设取 PrimeVue 轨（与组件语义 token 同源）。
>
> `-solid` 系列（`success` / `warning` / `danger` / `neutral`）未在表中单列，预设实现时按同 tone 深阶覆盖并保证实底前景（`on-solid`）对比度；未列出的 token 继承 `theme.css` 默认值。
>
> 圆角为 caomei-ui 归一化档位（控件 6px / 卡片与浮层 12px），非来源原值；相比当前 `radius-md: 8px` 会改变既有外观。

### 5.2 momei 预设（源：momei）

来源：`momei` 的运行时主题 `PRESETS.default`（`composables/use-theme.ts`）与静态 `MomeiPreset`（`nuxt.config.ts`）。momei 主色为墨色 slate、点缀色为梅红 rose，暗色 surface 为反相 slate。

| token | 亮色 | 暗色 | 来源 |
| --- | --- | --- | --- |
| `--caomei-color-primary` | `#64748b`（slate-500） | `#94a3b8`（slate-400） | use-theme PRESETS.default |
| `--caomei-color-primary-foreground` | `#ffffff` | `#000000` | use-theme primary.contrast |
| `--caomei-color-primary-solid` | `#64748b` | `#64748b` | 跨主题稳定 |
| `--caomei-color-success` | `#22c55e` | `#4ade80` | Aura button green |
| `--caomei-color-warning` | `#f97316` | `#fb923c` | Aura button orange |
| `--caomei-color-danger` | `#ef4444` | `#f87171` | Aura button red |
| `--caomei-color-bg` | `#ffffff`（亮 surface-0） | `#020617`（暗 surface-0） | use-theme `PRESETS.default.surface` |
| `--caomei-color-bg-elevated` | `#f8fafc`（亮 surface-50） | `#0f172a`（暗 surface-50） | MomeiPreset `colorScheme.surface`（静态值；运行时由 `color-mix` 微调） |
| `--caomei-color-text` | `#0f172a`（slate-900） | `#f1f5f9`（slate-100） | use-theme `PRESETS.default.text` |
| `--caomei-color-text-muted` | `#64748b` | `#64748b` | MomeiPreset `text.mutedColor`（亮 `surface.500` / 暗 `surface.400`；暗色 surface 为反相色阶，二者同为 `#64748b`）；运行时为 `color-mix(text, surface 40%)` 近似值 |
| `--caomei-color-border` | `#e2e8f0`（亮 surface-200） | `#334155`（暗 surface-200） | MomeiPreset `colorScheme.surface` + 运行时 `content-border-color = surface-200` |
| `--caomei-radius-sm/md/lg` | `4 / 6 / 12` | 同 | 控件 6px / 卡片与浮层 12px |

> 规划新增 `--caomei-color-accent`（momei 点缀色 rose `#f43f5e` / `#fb7185`）作为可选品牌强调色；是否纳入需评估（当前组件集无 accent 语义）。
>
> `-solid` 系列（`success` / `warning` / `danger` / `neutral`）未在表中单列，预设实现时按同 tone 深阶覆盖并保证实底前景（`on-solid`）对比度；未列出的 token 继承 `theme.css` 默认值。
>
> momei 的代码高亮 / 阅读器皮肤（Primer 色系、sepia 等）**不属于主题预设**，不纳入。

## 6. 组件风格约定

| 组件 | 约定 |
| --- | --- |
| Button | 高度取 `control-height-*`；圆角 `radius-md`（`rounded` 时 `radius-full`）；变体 `primary` / `secondary` / `ghost`；可选 `tone` 语义色（`neutral` / `primary` / `success` / `warning` / `danger`）；`tone` 实底前景用 `--caomei-color-on-solid`，默认 `variant="primary"` 沿用 `--caomei-color-primary` + `--caomei-color-primary-foreground`（随主题自适应）；图标经 `#icon` 插槽与 `iconPosition` 控制位置；角标 `badge` 以右上角外扩叠加（不参与布局），默认 `neutral` 色调 |
| SplitButton | 主按钮与下拉按钮共用 Button 的变体 / `tone` / 尺寸档位与圆角；拼接处移除内侧边框宽度、仅外侧保留圆角（`rounded` 时外侧取 `radius-full`）；下拉按钮仅显示图标并以 `aria-label` 承载可访问名 |
| Input 家族 | 高度 `control-height-*`；圆角 `radius-md`；默认全宽；校验态用 `:invalid` 而非色值类 |
| Calendar / DatePicker | 触发器高度取 `control-height-*`、圆角 `radius-md`、默认 `width: 100%` 并带可覆盖的宽度上限（`--caomei-date-picker-max-width`，未覆盖回退 `--caomei-select-max-width`）；面板圆角 `radius-md`；选中日取 `primary` / `primary-foreground`，今日用 `border` 描边；对外统一使用原生 `Date` |
| ColorPicker | 触发器为 `control-height-md` 方形按钮、圆角 `radius-md`；面板圆角 `radius-lg`、宽度 260px、阴影 `shadow-lg`；色块圆角 `radius-sm`、色板 22px 按钮（选中态用 `primary` 描边 + `aria-pressed`）、滑条取 `radius-full` |
| Card | 圆角 `radius-lg`；`bg-elevated` 或 `bg` + `border`；内边距取 `space-4` |
| Tag / Badge | 圆角 `radius-sm`（Tag 的 `rounded` 时 `radius-full`）；`tone` 语义；字号 `font-size-sm` |
| Message / Alert | 圆角 `radius-md`；变体 `soft` / `solid` / `outline` / `simple`；`size` 影响字号、内边距与图标（`simple` 不消费内边距） |
| Dialog / Popover | 圆角 `radius-lg`；浮层背景 `bg-elevated`；Dialog 阴影取 `shadow-lg`，Popover / DropdownMenu / Select / MultiSelect / Toast 取 `shadow-md` |
| Drawer | 面板贴边、不设圆角；高度 / 宽度取档位（`sm` / `md` / `lg` = 320 / 420 / 560px，按 `90vw` / `90vh` 收敛）；滑入 / 滑出 200ms，`prefers-reduced-motion` 时关闭动画 |
| DataTable | 表头/单元格底部边框取 `border`；排序按钮图标取 `text-muted`；排序态经 `aria-sort` 表达；列样式优先 `headerClass` / `bodyClass` |
| DataView | 内容区不设内边距与背景（条目排版由插槽内容决定）；`layout` 只切换根修饰类与 `list` / `grid` 插槽，网格列定义交给使用方内容层；空态 / 加载态文案居中、取 `text-muted`（加载态取 `primary`） |
| Checkbox / CheckboxGroup | 指示器为 `radius-sm` 方形（尺寸 sm 16 / md 18 / lg 20）；`v-model` 传数组时为分组语义（按 `value` 增删成员）；分组根为 `role="group"`、间距 `--caomei-checkbox-group-gap`（默认 `space-2`），禁用态不在分组层叠加透明度（子项各自处理，避免双重变淡） |
| Textarea | 自动增高时高度由内容决定、默认不出现滚动条；`rows` 为初始最小高度，`resize` 固定 `none` |
| Password | 根为 `.caomei-password` 包裹层（单根），`class` / `style` 留在根元素；强度计量条高度 4px、圆角 `radius-full`；弱 / 中 / 强取 `danger` / `warning` / `success`；未聚焦且无值时强度区域不占布局 |
| 所有组件 | 焦点态可见；禁用态不改变布局尺寸；禁用态不透明度统一为 `--caomei-disabled-opacity`（37 处，含根控件 / 子部件 / 条目，无字面量残留）；`cursor: not-allowed` 与禁用背景按需逐组件声明、未 token 化 |

## 7. 迁移映射规范（PrimeVue → caomei-ui）

详见 [momei 使用复核台账 §4.3](./governance/2026-09-14-momei-usage-audit.md)。要点：

> 迁移口径：判定某个 PrimeVue prop / API「是否在用、是否生效」应以一方源码的 props 列表与消费逻辑为准，而非调用点是否传值——下游传入的 prop 可能长期静默无效。

| 维度 | PrimeVue | caomei-ui |
| --- | --- | --- |
| 语义色 | `severity` | `tone` + `variant`（`secondary` / `contrast` → `neutral`；`info` → `primary`） |
| 尺寸 | `small` / `large` | `sm` / `lg` |
| 图标 | `icon="pi pi-x"` | `#icon` 插槽 + `@lucide/vue` |
| 受控字段 | `v-model:visible` / `v-model:value` | `v-model:open` / `v-model` |
| 浮层标题 | `header` | `title` |
| 校验态 | `class="p-invalid"` | `:invalid` |
| 全宽 | `fluid` | 默认 `width: 100%`（迁移时删除；例外：`Button` 改用 `block`（撑满父容器）、`SplitButton` 未实现 `fluid`（按内容宽度））。选择器家族（`Select` / `MultiSelect` / `AutoComplete` / `DatePicker`）另带 `20rem` 宽度上限，需要真正全宽时把对应上限 token 覆盖为 `none`（`DatePicker` 为 `--caomei-date-picker-max-width`；见[主题与样式设计 §4.1](./theming.md)） |
| 选项字段映射 | `option-label` / `option-value` | `optionLabel` / `optionValue`（字段名或取值函数；值支持 `string` / `number`） |
| 可搜索单选 | `Select filter` | 改用 `CaomeiAutoComplete`（Reka Select 无 filter primitive，面板内搜索框违反 `aria-required-children`；自由文本差异见 [Backlog](../plan/backlog.md)） |

> Button 迁移映射（已实现）：`severity` → `tone`；`text` → `variant="ghost"`；`outlined` → `variant="secondary"`；`rounded` → `rounded`；`fluid` → `block`（撑满父容器）；`size` 的 `small` / `large` → `sm` / `lg`；`icon`（字符串图标名）→ `#icon` 插槽（`@lucide/vue` 组件）；`icon-pos` → `iconPosition`；`:badge` → `badge`（非空字符串渲染于右上角外扩、不参与布局），`badge-severity` → `badgeTone`（`secondary` → `neutral`（默认同为中性色级）、`success` → `success`、`warn` / `warning` → `warning`、`danger` → `danger`；`info` / `contrast` 为**有损近似**，统一落 `neutral`）；**未实现 / 未暴露**：`badge-class` / `icon-class`（角标与图标元素带固定类名，可直接覆盖样式）、`loading-icon`（加载指示内建，`loading` 时自动禁用）、`raised` / `plain` / `link` 与 `variant="outlined" | "text" | "link"`（用 `variant` / `tone` 表达）、`as` / `as-child`（无多态渲染，需语义标签时在组件外包裹）。
>
> SplitButton 迁移映射（已实现）：`label` → 默认插槽（可见文本）；本库 `label` 统一为**不可见可访问名**（`development.md §组件设计`），图标按钮场景改传 `label`。`icon` → `#icon` 插槽（传 `@lucide/vue` 组件，非字符串类名）；`model` → `model`（`MenuItem` 的 `label` / `icon` / `command` / `disabled` 支持，另有 `separator`；`icon` 改传组件）；`severity` → `tone`；`text` → `variant="ghost"`；`outlined` → `variant="secondary"`；`size` 的 `small` / `large` → `sm` / `lg`；`rounded` → `rounded`。**未实现 / 未暴露（下游零用量）**：`MenuItem.items` 子菜单、`url` / `target` 导航、`menuButtonIcon` / `dropdownIcon`、`menuButtonProps` / `buttonProps`、`raised` / `plain`、`appendTo` / `baseZIndex` / `autoZIndex`、`fluid`。实现取向：**自建**（Button + DropdownMenu 组合），Reka 无 SplitButton 对应（`Splitter` 为分栏布局，语义不符）；本库另有 `menuLabel` / `menuSide` / `menuAlign` 控制菜单。
>
> DropdownMenu 迁移映射（已实现）：`<Menu :model :popup>` + `ref.toggle(event)` / `show(event)` / `hide()` → `<CaomeiDropdownMenu>` + `<CaomeiDropdownMenuTrigger>` + `<CaomeiDropdownMenuContent :model="items" />`；**`popup` 无对应 prop**（本库面板恒经 Portal 弹出，迁移时删除），**`toggle(event)` / `show(event)` 改为「原触发按钮本身作为 `CaomeiDropdownMenuTrigger`」**（锚点即该按钮；`as-child` 复用自定义按钮须加 `unstyled`，否则内建外观类合并到子元素），`hide()` 改为受控 `v-model:open`。条目模型：`MenuItem` 的 `label` / `icon` / `command` / `disabled` / `separator` → `DropdownMenuModelItem` 同名字段，`icon` 由字符串类名改为 `@lucide/vue` 组件，`command` 载荷 `{ originalEvent, item }` → `{ item, originalEvent }`（同形）；`show` / `hide` 事件改为监听 `v-model:open`。**未实现 / 未暴露**：`MenuItem.items`（嵌套子菜单；迁移时以 `CaomeiDropdownMenuGroup` + `CaomeiDropdownMenuLabel` 平铺分组）、`MenuItem.class` / `style` / `key`（逐条目类名与内联样式；改用声明式条目 + 原生属性）、`MenuItem.url` / `target`、`MenuItem.visible` / `disabled` 与 `label` 的函数形态（`disabled` 只需布尔）、`#start` / `#end` / `#submenulabel` 插槽、`appendTo` / `autoZIndex` / `baseZIndex`（恒挂 `body`、层级经 `--caomei-dropdown-menu-z-index`）、`tabindex`，以及 PrimeVue 的 `unstyled`（其语义为去除主题样式，与本库 Trigger 的 `unstyled`（去除触发器外观类）不同）。
>
> Toolbar 迁移映射（已实现）：`<Toolbar>` → `<CaomeiToolbar>`；`#start` / `#center` / `#end` → 同名插槽（排布语义：两侧按内容宽度贴主轴两端、中区落在两者之间的剩余空间中部；本库以中区 `flex: 1` 实现该排布；使用任一分区插槽即切到三分区渲染、默认插槽不再渲染，三个分区插槽全缺省时保持默认插槽的单区渲染）；`ariaLabelledby` → `label`（映射 `aria-label`，`aria-labelledby` 亦可经属性透传）。**本库新增**：`orientation`（`horizontal` / `vertical`）、`dir`、`loop`、`id`，以及成员组件的 roving focus。**已知差异（有意）**：① 本库工具条为内容宽度（`inline-flex`），PrimeVue 为块级（撑满容器），需要铺满时设 `width: 100%`；② 本库成员（`CaomeiToolbarButton` / `CaomeiToolbarLink` / `CaomeiToolbarToggleItem`）共享单一 Tab 停靠点并用方向键漫游，PrimeVue Toolbar 无键盘漫游（成员各自形成 Tab 停靠点）。**未实现 / 未暴露**：`pt` / `dt` / `ptOptions` / `unstyled`（主题透传机制未暴露，样式经 CSS variables 覆盖）。
>
> ColorPicker 迁移映射（已实现）：`format` → `format`（`hex` / `rgb` / `hsb` 取值一致）；`disabled` → `disabled`；`inline` → `inline`；`invalid` → `invalid`；`appendTo` / `overlayClass` / `panelClass` 未实现（面板经 Portal 挂载，层级与外观由库管理）。**已知行为差异**：PrimeVue `format="hex"` 的 `v-model` 为**不带 `#`** 的 6 位十六进制（下游现以 `replace('#', '')` / 补 `#` 适配），本库统一使用标准 CSS 颜色字符串 `#rrggbb`（迁移时可移除该适配）；PrimeVue `format="rgb"` / `"hsb"` 的 `v-model` 为 `{ r, g, b }` / `{ h, s, b }` **对象**，本库统一为**字符串**（`rgb(r, g, b)` / `hsb(h, s%, b%)`）；`alpha` 通道不支持（带 alpha 输入按 6 位十六进制归一）；模型仅接受 `#rgb` / `#rrggbb` / `#rrggbbaa`、`rgb()` / `rgba()`、`hsl()` / `hsla()`、`hsb()` / `hsba()`，具名色与 `oklch()` 等不支持（回退 `defaultColor`）。实现取向：封装 Reka ColorArea / ColorSlider / ColorField（Alpha）并按精确版本 `reka-ui@2.10.4` 锁版；**预设色板未采用 Reka `ColorSwatchPicker`**，改为自建 `role="group"` + `aria-pressed` 按钮组——其 `ColorSwatchPickerItem` 会强制注入 Reka 英文色名（`getColorName()`，且内层组件不转发 `aria-hidden`）、外部改色时经 Listbox 高亮链抢占焦点、且选中态无法用 attrs 覆盖（`ListboxItem` 把 `aria-selected` 写在 `$attrs` 之后），三条都直接影响可用性与可访问性。
>
> DataTable 迁移映射（已实现）：**列定义**——PrimeVue `<Column field :header>` → `columns` 数组项 `{ key, header }`（`key` 兼作默认取值字段）；**列插槽**——列级 `#body` / `#header` → 按列 key 命名的 `#cell-{key}` / `#header-{key}` 作用域插槽（优先于列定义的 `cell` 函数；`#header-{key}` 在可排序列中渲染于排序按钮内部，保留排序交互）；**冻结列**——`frozen`（布尔）+ `align-frozen`（`left` / `right`）→ 单个 `frozen: 'left' | 'right'`（本库用一个字段同时表达是否冻结与停靠方向）；**选择列**——列级 `<Column selection-mode>` → 表格级 `selectionMode`，选择列固定渲染在首列，**不支持列位自定义**（momei 两处用量均在首列）。排序：首次点击方向由 `sortDescFirst`（表格级，默认 `false` 升序）决定；受控模式在单列下由是否提供 `sortField` 决定、多列下由是否提供 `multiSortMeta` 决定。**每页条数**：`rows-per-page-options` → `rowsPerPageOptions`（提供后在分页器渲染选择器；切换抛出 `update:rows`，并按偏移保持语义保留首行偏移、重新推导页码；受控分页下同时抛出 `update:page`，裁剪由父级决定）。**多列排序**：`sortMode="multiple"` + `v-model:multiSortMeta`（`DataTableSortMeta[]`：`field` 为列 key、`order` 为 `1 | 0 | -1`）同名承接；点击表头时按住 Cmd / Ctrl 追加排序键、不按修饰键收敛为单列（对齐 PrimeVue 的 `addMultiSortField` 语义），已排序表头渲染优先级序号。**降序优先**：`sortDescFirst`（表格级布尔量）决定首次点击方向，单列与多列模式均生效。**有意差异**：① PrimeVue 的 `DataTableSortMeta.field` 允许字段函数、`order` 允许 `undefined` / `null`，本库只接受列 key 与 `1 | 0 | -1`；② PrimeVue 的 `defaultSortOrder` 有表格级与列级两种形态，本库只提供表格级 `sortDescFirst`；③ PrimeVue 的 `removableSort` 开关本库未提供，排序键固定按「升 → 降 → 移除」循环（与既有单列路径一致）；④ 多列模式下 `sort` 载荷额外带 `multiSortMeta`（完整排序键）。**行展开**：`DataTableColumn.expander` 列 + `v-model:expandedRows`（`string[]` 行 key，受控优先 / 缺省自持）+ `#expansion="{ data, index }"` + `@row-expand` / `@row-collapse` 承接；展开列单元格渲染内建 `<button>`（chevron + `aria-expanded` + `aria-controls` 指向展开行 id + 可访问名，可经 `expandRowLabel` / `collapseRowLabel` 覆盖），该列表头留空。**有意差异**：① PrimeVue 的 `expandedRows` 支持行对象数组与 `{ [key]: true }` 记录两种形态，本库只支持行 key 数组（`rowKey` 口径）；② PrimeVue 的展开按钮 `aria-label` 在展开态取 `aria.expandRow`、收起态取 `aria.collapseRow`（一方源码 `BodyCell.vue#expandButtonAriaLabel`），与按钮实际动作相反，本库按动作取名；③ 展开行横跨全部数据列、不参与冻结列吸边；④ 未提供 `#expansion` 槽时无可见展开区（与上游一致，已在组件页声明）。**行分组**：`rowGroupMode="subheader"` + `groupRowsBy` 同名承接，按**连续同值**切分（对齐 PrimeVue 的 `shouldRenderRowGroupHeader` 口径），分组字段同名列在数据行渲染为**空白占位单元格**、表头保留；`#groupheader="slotProps"` → `#groupheader="{ data, index, groupValue }"`（`data` / `index` 语义对齐，另提供分组键取值；未提供插槽时回退渲染该取值）。**可折叠分组**：`expandableRowGroups` + `v-model:expandedRowGroups`（`string[]` 分组键）+ `@rowgroup-expand` / `@rowgroup-collapse` 同名承接；分组标题行渲染内建 `<button>`（chevron + `aria-expanded` + 可访问名，可经 `expandRowGroupLabel` / `collapseRowGroupLabel` 覆盖）；受控优先、缺省自持，**缺省时全部分组收起**（对齐 PrimeVue）；分组键取分组字段值的字符串形式，非连续同值分组共用同一键。**有意差异**：① 分组标题行横跨全部数据列、**不参与冻结列吸边**；② PrimeVue 在 subheader 模式下不渲染分组列的数据单元格（数据行整体左移一列、与表头错位，primefaces/primevue#6496），本库保留空白占位以维持列对齐；③ PrimeVue 的分组切换按钮无 `aria-expanded` 与内建可访问名（仅 chevron），本库补 `aria-expanded` + `aria-label`；④ `#groupfooter`（分组页脚）与 `rowGroupMode="rowspan"`（行合并）不实现。
>
> Checkbox 分组与 CheckboxGroup（已实现）：PrimeVue 非 binary 的 `<Checkbox v-model="数组" :value="id">` → **同形**（`v-model` 传数组、`value` 作为成员标识，点击按 `value` 增删——经一方源码 `checkbox/index.mjs#onChange` 逐行核对）；PrimeVue `<CheckboxGroup v-model="数组" name>`（仅提供分组上下文、默认插槽渲染子项、不渲染选项、无全选）→ `CaomeiCheckboxGroup` 同形兼容，并**新增** `options`（按 `optionLabel` / `optionValue` 渲染子项）、`selectAll`（全选 / 半选，禁用项不参与）、`label`（分组可访问名）与 `rovingFocus`（默认 `false`，保持原生逐项 Tab 顺序）；`input-id` → `id`。**已知差异（有意）**：分组层不叠加禁用透明度（子项各自处理，避免双重变淡）；子项处于分组上下文时不生成自身隐藏控件（Reka `CheckboxRoot` 的 `isFormControl && name && !checkboxGroupContext` 条件），故分组 `name` 已覆盖整组提交，子项无需再传 `name`。Checkbox 单件映射：`binary` 布尔 `v-model`（半选以模型值 `'indeterminate'` 表达）、`input-id` → `id`、`aria-label` → `label`；`text`（可见文本）为本库新增；**未实现 / 未暴露**：`true-value` / `false-value`、`variant`（`outlined` / `filled`）、`readonly`、`tabindex`、`input-class` / `input-style`。CheckboxGroup 另有 `selectAllText` 为本库新增；`formControl` 未暴露（`invalid` 已由本库 `invalid` 覆盖）。
>
> Panel 迁移映射（不新建组件）：PrimeVue `<Panel :header>` → `CaomeiCard` 的 `title` prop（或 `#title` / `#header` 插槽）；`#header` → `#header`；`#footer` → `#footer`；`#icons` → `#extra`；需要可折叠的面板改用 `CaomeiAccordion`。Card 自身（PrimeVue `Card` 无 props，具名插槽 `header` / `title` / `subtitle` / `content` / `footer`）→ `#header` / `#title`（或 `title` prop）/ `subtitle` prop（仅字符串，无插槽等价）/ 默认插槽 / `#footer`；本库新增 `variant`（`outlined` / `elevated` / `filled`）、`padding`、`hoverable`、`as` 与 `#extra`。
>
> Accordion 迁移映射（已实现）：PrimeVue v4 的 `<Accordion v-model:value>` + `<AccordionPanel :value>` + `<AccordionHeader>` + `<AccordionContent>` 四件组合 → `<CaomeiAccordion v-model>` + `<CaomeiAccordionItem :value :title>` 两件（`title` 承载 `AccordionHeader` 的文本、默认插槽承载 `AccordionContent`；Panel / Header / Content 三层合并为单件）。字段映射：`v-model:value` → `v-model`（值域收窄为 `string | string[]`，`number` 需转字符串）；`multiple`（默认 `false`）→ `type="multiple"`（默认 `single`；属性形态由布尔 `multiple` 改为枚举 `type`，默认语义一致）；`lazy`（默认 `false`；`true` 时隐藏面板不渲染）→ `unmountOnHide`（默认 `true`，`false` 时保留 DOM 并以 `hidden="until-found"` 标记；**同向、默认相反**——`:lazy="true"` 对应默认值，需保留 DOM 时改传 `:unmount-on-hide="false"`）；panel 级 `disabled` → 条目 `disabled`；v3 `activeIndex`（v4 已弃用）/ `header` → `v-model` 的字符串值 / `title`。**本库新增**：`collapsible`（single 下是否允许再点收起，默认 `false`）、`defaultValue`（非受控初始展开）、根级 `disabled` 与 `#trigger` 插槽（富内容触发器）。**已知差异（有意）**：① PrimeVue single 模式**恒可收起**（再点已展开项即置空），本库默认 `collapsible=false`，需要一致时显式传 `collapsible`；② 触发器为 `<h3>` 包裹原生 `<button>`（WAI-ARIA Accordion 推荐），PrimeVue v4 直接渲染 `<button>`；③ 指示箭头为内置 `ChevronDown`（展开旋转 180°），无 `expandIcon` / `collapseIcon`。**未实现（已登记为后续补强项，交付后同步本节）**：`expandIcon` / `collapseIcon` 与 `#expandicon` / `#collapseicon` 插槽（自定义指示图标；富内容可经 `#trigger` 自带图标，内置箭头仍保留、不随 `#trigger` 移除）、`tabindex`（根级；触发器各自可聚焦）、`selectOnFocus`（聚焦即切换）、`AccordionPanel` 与 `AccordionHeader` 的 `as` / `asChild` 多态渲染、`AccordionHeader` 的 `#toggleicon` 插槽，以及 v4 已弃用的 `update:activeIndex` / `tab-open` / `tab-close` / `tab-click` 事件（改用 `v-model`）。
>
> Tabs 迁移映射（已实现）：PrimeVue v4 的 `<Tabs v-model:value>` + `<TabList>` + `<Tab :value>` + `<TabPanels>` + `<TabPanel :value>` 五件组合 → `<CaomeiTabs v-model>` + `<CaomeiTabList>` + `<CaomeiTabTrigger :value>` + `<CaomeiTabContent :value>` 四件（`TabPanels` 容器层合并进面板件）。字段映射：`v-model:value` → `v-model`（值域同为 `string | number`）；`lazy`（默认 `false`；`true` 时隐藏面板不渲染）→ `unmountOnHide`（默认 `true`；`false` 时保留 DOM 并带 `hidden`；**同向、默认相反**）；`selectOnFocus`（默认 `false`）→ `activationMode`（`true` 对应 `automatic`、`false` 对应 `manual`；**同向、默认相反**——本库默认 `automatic`）；v3 `<TabView v-model:activeIndex>` + `<TabPanel :header>` → `<CaomeiTabs v-model>` + `<CaomeiTabTrigger>` / `<CaomeiTabContent>`（索引改为显式 `value` 标识）；`Tab` 的 `disabled` → `CaomeiTabTrigger` 的 `disabled`。**本库新增**：`orientation`（`horizontal` / `vertical`；PrimeVue v4 Tabs 的 props 列表无该字段）、`dir`、`CaomeiTabList` 的 `loop`（默认 `true`）与 `CaomeiTabContent` 的 `forceMount`。**已知差异（有意）**：① `activationMode` 在初始化时生效，运行期切换不改变已建立的激活行为（Reka 内部实现限制）；② `unmountOnHide` 默认卸载内容，PrimeVue `lazy` 默认保留 DOM。**未实现（已登记为后续补强项，交付后同步本节）**：`scrollable` / `showNavigators` 与 `#previcon` / `#nexticon` 插槽（滚动导航按钮；本库列表溢出为原生横向滚动）、`tabindex`（根级；触发器各自可聚焦）、`Tab` 与 `TabPanel` 的 `as` / `asChild` 多态渲染（含 `TabPanel` 默认插槽的 `asChild` 作用域），以及 v4 已弃用且仅 `TabView` 支持的 `TabPanel` 字段（`header` / `disabled` / `headerStyle` / `headerClass` / `headerProps` / `headerActionProps` / `contentStyle` / `contentClass` / `contentProps` 与 `#header` 插槽——header 文本走 `CaomeiTabTrigger` 默认插槽、禁用走 trigger 的 `disabled`、面板样式经类名与 CSS 变量覆盖）。
>
> ButtonGroup 迁移映射（已实现，不新建组件）：PrimeVue `<ButtonGroup>` 与本库 `<CaomeiButtonGroup>` 同为**拼接容器**（PrimeVue 侧 props 仅 `dt` / `pt` / `ptOptions` / `unstyled`，无功能 props；本组件另有布局 prop `orientation`）；成员即普通按钮（Button 家族），拼接规则按成员**根元素**去内侧圆角与边框。**本库新增**：`orientation`（`horizontal` / `vertical`）——PrimeVue 无纵向组合支持。**未实现 / 未暴露**：`pt` / `dt` / `ptOptions` / `unstyled`（主题透传机制未暴露，样式经 CSS 变量与类名覆盖）。
>
> Stepper 迁移映射（已实现）：PrimeVue v4 的 `<Stepper v-model:value>` + `<StepList>` + `<StepItem :value>` + `<Step :value>` + `<StepPanels>` + `<StepPanel :value>` 组合 → `<CaomeiStepper v-model>` + `<CaomeiStepperList>` + `<CaomeiStepperItem :step>` + `CaomeiStepperTrigger` / `CaomeiStepperIndicator` / `CaomeiStepperTitle` / `CaomeiStepperDescription` / `CaomeiStepperSeparator` 组合件（PrimeVue 的 `Step` 把触发器与序号 / 标题合并，本库拆为多个具名件）。字段映射：`v-model:value` → `v-model`（**值域收窄为 `number` 且从 1 开始**；PrimeVue 为 `string | number`、无起始约定，迁移需把步骤值改为 1 基序号）；`linear`（默认 `false`）→ `linear`（默认 `true`；**同向、默认相反**）；`Step` 的 `disabled` → `CaomeiStepperItem` 的 `disabled`；`StepItem` / `Step` 的 `value` → `step`。**本库新增**：`orientation`、`dir`、`label`（可访问名）、`defaultValue`、条目 `completed`（显式覆盖由当前步骤推导的状态）、`CaomeiStepperSeparator`，以及经模板 ref 暴露的 `goToStep` / `nextStep` / `prevStep`。**已知差异（有意）**：① 本库 `linear` 默认 `true`（PrimeVue 默认 `false`，迁移后默认禁止跳步，需要自由跳转时显式传 `:linear="false"`）；② **本库不提供步骤面板容器**——PrimeVue 的 `<StepPanels>` / `<StepPanel>` 无对应件，面板内容由使用方按当前步骤自行渲染（可经根默认插槽的上下文驱动）。**未实现（已登记为后续补强项，交付后同步本节）**：`start` / `end` 插槽（以根默认插槽上下文 + 自定义按钮表达）、`Step` / `StepPanel` 的 `as` 多态渲染（`asChild` 经除 `Item` 外的组合件透传 Reka，`as` 未暴露）、`pt` / `dt` / `ptOptions` / `unstyled`。
>
> Select 家族对象选项映射（已实现）：`option-label` / `option-value` → `optionLabel` / `optionValue`，字符串形态支持 `a.b` 点号路径；`optionValue` 解析结果非 `string` / `number` 的选项不渲染（Select / MultiSelect / SelectButton 一致）。
>
> Select 清空与自定义选项（已实现）：`show-clear` → `showClear`（清除后模型置 `null`、焦点交回触发器）；`#option` 插槽收到原始选项对象与选中态。
>
> Switch 迁移映射（已实现）：`change` → `change`，**载荷差异属有意**——PrimeVue 传原生事件对象，本库直接给出切换后的布尔值；且只在用户交互时触发，父级程序化改 `modelValue` 不触发（下游若只做「切换后刷新」可原样迁移）。`input-id` → `id`；`aria-label` → `label`（本库统一为不可见可访问名，`aria-labelledby` 仍可经属性透传）。**未暴露**：`true-value` / `false-value`（`v-model` 即布尔值，`value` 仅作表单提交值）、`readonly`、`input-class` / `input-style`（下游零用量）。
>
> ToggleButton 迁移映射（已实现）：`on-label` / `off-label` → `onLabel` / `offLabel`；`aria-label` → `label`（本库统一为不可见可访问名）。**已知差异（有意）**：PrimeVue 为两态文案内建 `Yes` / `No` 默认值、且 `hasLabel` 仅在两者都非空时成立；本库不内建任何默认文案，`onLabel` / `offLabel` 需**同时**提供才渲染，否则回退默认插槽。**未实现**：`on-icon` / `off-icon`（字符串图标名；图标用默认插槽内的 `@lucide/vue` 组件表达，不新增 `#icon` 插槽）。
>
> Paginator 迁移映射（已实现）：`rows` → `itemsPerPage`、`total-records` → `total`、`v-model:first`（0 基偏移）→ `v-model:page`（1 基页码）；`rows-per-page-options` → `rowsPerPageOptions`（切换时抛出 `update:itemsPerPage`，并按 PrimeVue 的偏移保持语义保留首行偏移、重新推导页码；`disabled` 一并传递到选择器）；`@page` 的分页状态改用 `update:page` / `update:itemsPerPage` 组合，需要 0 基偏移时按 `(page - 1) * itemsPerPage` 换算。**未实现（下游 1 处用量）**：`template` 与 `CurrentPageReport`——分页器不提供模板插槽与「第 x / 共 y 页」报表，迁移时在分页器旁按 `page` / `itemsPerPage` / `total` 自行渲染。
>
> MultiSelect 清空与自定义选项（已实现）：`show-clear` → `showClear`（清除后模型置为**空数组**、焦点交回搜索输入框）；`#option` 插槽收到原始选项对象与选中态。**与 PrimeVue 的三点差异（均属有意）**：① PrimeVue `#option` 额外提供 `index`，本库未提供（Select 的 `#option` 同此口径），仅用 `option` / `selected` 的下游写法可直接迁移；② 清除按钮为字段内的常规 flex 成员（本组件字段可多行换行，绝对定位叠加会压住标签），非 PrimeVue 的绝对定位形态，可通过 CSS 覆盖；③ 清除按钮显隐条件为 `showClear && 有选中项 && 未禁用`，不附加 PrimeVue 的「`options` 非空」与 `loading` 条件——允许选项未加载或选中值不在 `options` 内时仍可清空。
>
> InputNumber 迁移映射（已实现）：`use-grouping` → `useGrouping`（默认 `true`，对齐 PrimeVue）、`min-fraction-digits` / `max-fraction-digits` → `minFractionDigits` / `maxFractionDigits`（0–20 整数；`minFractionDigits` 仅补零展示，`maxFractionDigits` 同步取整模型）；`precision`（0–20 整数，超出按未提供处理）优先于 `maxFractionDigits`；`show-buttons` → `controls`；`min` / `max` / `step` 同名。**未实现**：`mode`（`decimal` / `currency`）、`currency` / `currencyDisplay`、`prefix` / `suffix`、`format` / `locale` / `localeMatcher`、`buttonLayout`、`incrementIcon` / `decrementIcon` 等图标定制。
>
> Message 迁移映射（已实现）：`severity` → `tone`（`error` → `danger`、`warn` / `warning` → `warning`、`info` → `primary`、`secondary` / `contrast` → `neutral`、`success` → `success`；`secondary` / `contrast` / `info` 为有损近似）；`variant="outlined"` → `variant="outline"`、`variant="simple"` → `variant="simple"`（PrimeVue Message 仅 `outlined` / `simple`，无 `text`；无 `variant` 的默认形态对应 `soft`）；`size` 取 `sm` / `md` / `lg`（对齐 `small` / `large`）。
>
> Tag 迁移映射（已实现）：`severity` → `tone`（`secondary` / `contrast` → `neutral`、`success` → `success`、`warn` / `warning` → `warning`、`danger` → `danger`；`secondary` / `contrast` / `info` 均为**有损近似**）。Tag 无 `error` 用量，通用语义色映射见 [momei 使用复核台账 §4.3](./governance/2026-09-14-momei-usage-audit.md)；`rounded` → `rounded`；`value` → 默认插槽；字符串 `icon` → `#icon` 插槽。Tag **不新增** `severity` / `value` 别名与 prop（**PrimeVue Tag 无 `outlined` prop**——其功能 props 仅 `value` / `severity` / `rounded` / `icon`；`variant` 为本库新增的形态表达）。
>
> Textarea 迁移映射（已实现）：`auto-resize` → `autoResize`（默认 `false`，高度由包装层写入内联 `height`；开启时 `resize` 固定 `none`，`rows` 保留为初始最小高度；不设上限，封顶由消费方在使用层叠加 `max-height`）；`size`（`small` / `large`）→ `size`（`sm` / `lg`）；`invalid` 同名；`fluid` 删除（默认 `width: 100%`）。**未实现**：`variant`（`outlined` / `filled`）、`formControl`。
>
> Password 迁移映射（已实现）：`feedback` → `feedback`（**默认值分歧且为有意**：PrimeVue 默认 `true`，此处默认 `false`。momei 32 处 `<Password>` 仅 8 处显式传 `feedback`，其余 24 处大多为外部服务凭据（密钥 / Token）字段、强度条无实际意义；其中安装向导的 `admin_password` 为用户自设密码，迁移后建议显式传 `:feedback="true"`；默认关闭可避免这些字段凭空多出区块。迁移后这 24 处将失去原先由 PrimeVue 默认开启的强度浮层，属有意行为变更而非回归）。显式开启后显示内联强度计量条与文案，聚焦或有值时可见，空值未聚焦仅保留读屏器 live region；`prompt-label` / `weak-label` / `medium-label` / `strong-label` → `promptLabel` / `weakLabel` / `mediumLabel` / `strongLabel`（默认取内建 locale `password.prompt` / `weak` / `medium` / `strong`）；`toggle-mask` → 内建切换按钮（无需 prop）；`medium-regex` / `strong-regex` 未实现（下游无用量，强度规则固定）；`show-clear` → `clearable`；`size`（`small` / `large`）→ `size`（`sm` / `lg`）；`invalid` 同名。**未实现（补）**：`mask-icon` / `unmask-icon`、`variant`（`outlined` / `filled`）、`append-to`。

> Calendar / DatePicker 迁移映射（已实现，基础日期选择）：`min-value` / `max-value` → `minValue` / `maxValue`；`date-format` → `dateFormat`（PrimeVue 风格 token，缺省按 `locale` 输出本地化短日期）；`show-icon` → `showIcon`（`icon-display="input"` 即本组件默认形态）；`fluid`（撑满容器宽度）迁移时删除，需要真正全宽时把 `--caomei-date-picker-max-width` 覆盖为 `none`（本组件默认带 `20rem` 上限）。对外 `v-model` 沿用 PrimeVue 的原生 `Date` 语义；Reka primitive 使用 `@internationalized/date` 的 `DateValue`，转换收敛在 `_shared/date`（新增该运行时依赖）。时间选择已实现：`show-time` → `showTime`、`hour-format` → `hourFormat`、`show-seconds` → `showSeconds`（面板底部自建时间输入，含时间时选中日期不自动收起；因 Reka `TimeField` 的日序判定仅识别英文、非英文 12 小时制会误判，未直接封装该 primitive）；**范围选择未实现**（`selection-mode`，momei 零用量，经用户决策 2026-09-15 移入 [Backlog](../plan/backlog.md)）。**已知行为差异**：PrimeVue `DatePicker` 是可键入的 input，本组件为「触发按钮 + 面板」，不支持手工键入日期（迁移时需确认下游无键入依赖）；`locale` 仅控制日期 / 日历语言，与内建文案语言相互独立（本库 i18n 机制未暴露 locale tag），需一致时显式传入；**PrimeVue 侧的 `locale` 为全局 config 而非组件 prop**，`weekStartsOn` / `weekdayFormat` / `fixedWeeks` / `preventDeselect` 与 `pagedNavigation` / `initialFocus` 均为本库新增。

> Drawer 迁移映射（已实现）：`visible` → `v-model:open`；`header` → `title`（或 `#header` 插槽，插槽替换标题区域、关闭按钮保留）；`position` → `position`（四向；**默认值对齐 PrimeVue 的 `left`**）；`dismissable` → `closeOnOverlay`；`showCloseIcon` → `closable`；`closeOnEscape` → `closeOnEsc`；`modal` → `modal`。**已知差异**：PrimeVue `blockScroll` 默认 `false`（`modal` 仅加遮罩、不锁滚动），本库 `modal="true"` 同时锁定页面滚动（更严格）；`position="full"` 未实现（momei 零用量，全屏场景可用 `modal="false"` + `style` 铺满）；层级固定为遮罩 1000 / 面板 1001、关闭按钮形态固定；`size` 为本库新增档位（PrimeVue 无此 prop，宽度经 `style` 传入，内联样式优先于档位）。**未暴露项（下游零用量）**：生命周期事件 `show` / `before-hide` / `hide` / `after-show` / `after-hide`，插槽 `#closebutton` / `#closeicon` / `#container`，prop `baseZIndex` / `autoZIndex` / `closeButtonProps` / `closeIcon`。实现取向：封装 **Reka UI 稳定的 Dialog primitive** + 四向定位 CSS，而非 Reka `Drawer`（Alpha，Vaul 形态）——后者不负责面板定位（仅输出 `data-swipe-direction` 与滑动 CSS 变量），定位仍需消费方自绘，却额外引入滑动 / 吸附 / 嵌套抽屉状态与 Alpha API 漂移风险；下游仅需侧边面板、无滑动手势用量。

> DataView 迁移映射（已实现）：`value` → `value`（`null` 与空数组均视为空态）；`layout` → `layout`（默认同为 `list`）；`#list` / `#grid` / `#empty` / `#header` / `#footer` → 同名插槽（`#list` / `#grid` 收到 `{ items }`，`#empty` 额外收到 `layout`）。**已知差异**：PrimeVue v4 `DataView` 无 `loading` prop（官方建议以 Skeleton 自行表达加载态），下游 `:loading` 目前不生效；本组件提供 `loading` / `loadingText` 并在根标注 `aria-busy`。PrimeVue 的 `grid` 模式同样只换根类名与插槽、不内置网格列（官方要求搭配 Tailwind 等 CSS grid），列定义由使用方内容层承担。**未实现（下游零用量）**：分页（`paginator` / `rows` / `first` / `totalRecords` / `alwaysShowPaginator` / `paginatorPosition` / `paginatorTemplate` / `pageLinkSize` / `rowsPerPageOptions` / `currentPageReportTemplate`）、排序（`sortField` / `sortOrder`）、`lazy`、`dataKey`，以及 `#paginatorcontainer` / `#paginatorstart` / `#paginatorend` 插槽；空态文案走内建 locale `dataView.empty`（可用 `emptyText` / `#empty` 覆盖）。实现取向：**自建**（`layout` 插槽分发 + 状态区域），Reka 无对应组件。

> Dialog 迁移映射（已实现）：`visible` → `v-model:open`；`header` → `title`（**可选化**：缺省时以库内建「对话框」文案作为不可见可访问名，不产生空标题；PrimeVue 无 `header` 且未传 `aria-labelledby` 时会把 `aria-labelledby` 指向不存在的标题节点）；`show-header` → `showHeader`（默认同为 `true`；为 `false` 时头部整体不渲染，与 PrimeVue 一致）；`@hide` → `hide`（本组件无出场动画，契约为「`open` 由真转假」，覆盖遮罩 / Esc / 关闭按钮 / 外部受控置假）；`dismissable-mask` / `close-on-escape` → `closeOnOverlay` / `closeOnEsc`；`block-scroll` → 未暴露（`modal="true"` 已锁定页面滚动，比 PrimeVue 默认更严格）。`breakpoints` → `breakpoints`（键为视口最大宽度、值为面板宽度；语义与[响应式设计 §2](./responsive.md) 的 `width <=` 口径一致）。**已知差异（有意）**：① 命中多个断点时以**最窄档**为准、与键顺序无关（定义见[响应式设计 §2](./responsive.md)），PrimeVue 依对象书写顺序由后写规则覆盖（使用方按宽→窄书写时两者等价）；② 断点规则生成在对话框面板自身的 `<style>` 上，以 (0,2,0) 的实例属性选择器限定、不加 `!important`；其生效依赖「面板内样式晚于 head 内 scoped 样式」的源序 tie-break，下游需以**更高特异性或 `!important`** 覆盖；键 / 值须通过安全长度校验，非法条目静默忽略（PrimeVue 不做校验）；③ 面板内 `<style>` 要求消费方 CSP `style-src` 允许内联样式（库内其余样式随构建产物外链，不受影响）。**本批未覆盖**：`maximizable` / `draggable` / `position` / `appendTo` 等布局类 prop，以及 `show` / `after-hide` 生命周期事件。

> ConfirmDialog 迁移映射（已实现）：`<ConfirmDialog />` → `<CaomeiConfirmDialog />`（应用根部放置一次）；确认请求由 `useConfirm().require({ header, message, acceptLabel, rejectLabel, accept, reject })` → `useConfirm().open({ title, description, icon, confirmLabel, cancelLabel, tone })`，**以返回的 `Promise<boolean>`（确认 `true` / 取消或关闭 `false`）取代 `accept` / `reject` 回调**，`confirm(content)` 为字符串简写。字段映射：`header` / `message` → `title` / `description`；`acceptLabel` / `rejectLabel` → `confirmLabel` / `cancelLabel`（请求级 > Provider props > 内建文案）；`acceptClass` / `rejectClass` → `tone`（`danger` 为确认按钮危险态，不提供任意 class 注入）；`icon`（字符串图标类名）→ `icon`（传 `@lucide/vue` 组件），**未传时由本库按 `tone` 回退内建图标**（`neutral` → `Info`、`danger` → `TriangleAlert`；PrimeVue 无此默认，属有意增强）。**未实现 / 未暴露**：`group`、`position` / `draggable` / `breakpoints` / `blockScroll` / `appendTo`（浮层位置、层级与滚动锁由库管理，且恒为模态）。

> Popover 迁移映射（已实现）：`<Popover>`（内容走**默认插槽**；另有 `#container` 插槽可替换整个容器，作用域含 `closeCallback` / `keydownCallback`）→ `<CaomeiPopover>` + `<CaomeiPopoverTrigger>` / `<CaomeiPopoverContent>`（另有 `PopoverArrow` / `PopoverClose`）；显隐统一 `v-model:open`（默认非受控，点击触发器开合）；`dismissable`（默认 `true`）→ 非模态浮层的默认行为（点击外部关闭，`PopoverContent` 的 `disableOutsidePointerEvents` 可解除）；`#container` 作用域的 `closeCallback` → `<CaomeiPopoverClose>`（可用 `as-child` 包裹自定义按钮）；`closeOnEscape`（默认 `true`）→ 默认行为（Esc 关闭），**未暴露开关**。**未实现**：`appendTo` / `baseZIndex` / `autoZIndex` / `breakpoints`（面板经 Portal 挂 `body`、层级由库管理）；`@show` / `@hide` 事件（可改为监听 `v-model:open`）。**命令式锚点 API 不新增，改为声明式等价写法（定案）**：PrimeVue 的 `show(event)` / `toggle(event)` 以事件坐标为锚点，等价落点为**把原触发按钮本身作为 `CaomeiPopoverTrigger`**（事件目标即该按钮，锚点与 `toggle(event)` 一致）；`hide()` 改为受控 `v-model:open` 或 `<CaomeiPopoverClose>`。该形态覆盖 momei 全部 **6 处 / 5 文件** `.toggle(event)`：其中 4 处「触发按钮与浮层同组件」可机械等价（把该按钮本身作为 `CaomeiPopoverTrigger`）；2 处为**跨组件**形态（Popover 与触发按钮分居两个组件、经 `defineExpose` + `show(event)` 调用），因 Reka 触发器必须是 `PopoverRoot` 的后代，需**结构改写**——把 `CaomeiPopover` 上移到二者公共父级、或把触发按钮移入 Popover 子树，并以 `v-model:open` 接管开合。配套新增 `CaomeiPopoverTrigger` 的 `unstyled`（`as-child` 复用自定义按钮时去掉内建外观类，避免 padding / border / background 合并竞争）。

> Toast 迁移映射（已实现）：`<Toast />` → `<CaomeiToastProvider>`（应用根部放置一次）；`useToast().add({ severity, summary, detail, life, closable })` → `useToast().show({ title, description, tone, duration, closable, action })`（另有 `info` / `success` / `warning` / `danger` 语义方法与 `dismiss(id)` / `clear()`）。字段映射：`severity` → `tone`（`success` → `success`、`secondary` / `contrast` → `neutral`、`info` → `primary`、`warn` → `warning`、`error` → `danger`）；`summary` / `detail` → `title` / `description`；`life` → `duration`（毫秒）。**已知差异（有意）**：`position` 为 Provider 级统一配置而非逐条；本库新增 `action`（内联操作按钮）与 `type`（`foreground` / `background`），Provider 另有 `max` / `hotkey` / `swipeThreshold` / `disableSwipe`。**未实现**：`group`（多实例分组）、`styleClass` / `contentStyleClass`、`breakpoints`。

> ProgressBar 迁移映射（已实现）：`value` → `value`（`null` / 非有限值即**不确定态**，对应 PrimeVue 的 `mode="indeterminate"`）；`mode` 未暴露（由 `value` 推导）；`showValue` 未实现（不在条上渲染数值文本，可访问名经 `label` / `aria-label` / 语言兜底文案）；`max`（默认 `100`，越界值收窄）与 `size`（`sm` / `md` / `lg`）为本库新增。

> ProgressSpinner 迁移映射（已实现）：尺寸经 `size` 档位（`sm` / `md` / `lg` ＝ 16 / 24 / 32px）或覆盖 `--caomei-progress-spinner-size`（对应 PrimeVue 经 `style` 传任意 px）；`strokeWidth` → `strokeWidth`（数字与**纯数字字符串**按 px（后者对齐 PrimeVue 的 `'2'` 写法），两者要求 `0 ≤ 值 ≤ 1000`，其余字符串须为合法 `border-width`（`<length>` 或 `thin` / `medium` / `thick`；`%` 与复合值非法）；未提供 / 空串 / 非法值时按 `size` 档位回退 2 / 2 / 3px，提供后所有尺寸共用该值；以**内联同名变量**实现，优先级高于 CSS 变量 `--caomei-progress-spinner-stroke`——白名单校验是必需的，写入语义非法值会因 invalid at computed-value time 令整条 `border` 声明被丢弃、圆环消失。**语义差异（有意）**：PrimeVue 的 `strokeWidth` 为 SVG 用户单位、随渲染尺寸等比缩放，本库为不随组件尺寸缩放的 CSS 长度——迁移时按目标视觉粗细折算）；`fill` 未实现（轨道颜色经 `--caomei-progress-spinner-track`）；`animationDuration` 未实现（固定 `0.6s`，`prefers-reduced-motion` 下 `1.6s`）；`label` 为本库新增可访问名（未提供时回退内建「加载中」文案）。

> Skeleton 迁移映射（已实现）：`shape="circle"` / `"rectangle"` → `variant="circular"` / `"rectangular"`（另有本库默认 `text`）；`width` / `height` 同名；`animation` 的 `wave` / `none` 同名可选，**本库默认 `pulse`（PrimeVue 默认 `wave`）属有意差异**；`size` / `borderRadius` 未实现（分别以 `width` / `height` 与 CSS 覆盖表达）；`lines`（`variant="text"` 时渲染多行）为本库新增。

> Avatar 迁移映射（已实现）：`image` → `src`；`label` → `fallback`（缺省时取 `alt` 首字母大写）；`icon`（字符串图标名）→ 未实现（改用 `#fallback` 插槽 + `@lucide/vue`）；`size`（`normal` / `large` / `xlarge`）→ `size`（`sm` / `md` / `lg`）；`shape`（`square` / `circle`）同名；`aria-label` / `aria-labelledby` 透传。**已知差异（有意）**：默认 `shape` 为 `circle`（PrimeVue 默认 `square`）、默认 `size` 为 `md`（PrimeVue `normal`）；`delayMs`（图片加载失败后的回退延迟）与 `#fallback` 插槽为本库新增。

> Badge 迁移映射（已实现）：`value` → `value`（超过 `max` 截断为 `max+`；`null` / 空串不渲染）；`severity` → `tone`（`secondary` / `contrast` → `neutral`、`info` → `primary`、`success` → `success`、`warn` → `warning`、`danger` → `danger`；`info` / `contrast` 为有损近似）；`size`（`small` / `large` / `xlarge`）→ `size`（`sm` / `md` / `lg`）。**已知差异（有意）**：默认 `tone` 为 `danger`、`variant` 为 `solid`（PrimeVue 未传 `severity` 时走默认主色样式）；`variant`（`soft` / `solid` / `outline`）、`max`、`dot`、`label` 与「默认插槽作为叠加角标」为本库新增。

> Divider 迁移映射（已实现）：`layout`（`horizontal` / `vertical`）→ `orientation`（同名取值）；`type`（`solid` / `dashed` / `dotted`）→ `variant`（同名取值）；`align` → `align`（本库仅 `left` / `center` / `right`，**垂直布局的 `top` / `bottom` 对齐未支持**）；内容经默认插槽（仅横向参与布局）。

> Image 迁移映射（已实现）：`src` → `src`；`preview` → `preview`（默认 `false`；加载成功后出现放大入口，遮罩 / Esc / 关闭按钮均可关闭）；`previewIcon` / `indicatorIcon`（字符串图标类名）→ `previewIcon`（`@lucide/vue` 组件，默认 `Eye`）；`#previewicon` / `#indicatoricon` 插槽 → `#indicatoricon`（合并为单一插槽名，**仅旧名 `#indicatoricon` 可零改动迁移**，`#previewicon` 需改名；插槽优先于 `previewIcon` prop）；`@show` / `@hide` → 同名事件（预览开合时抛出）；`imageStyle` / `imageClass` → 未实现（样式经组件根类与 CSS 变量覆盖；原生图片属性不透传到内层 `<img>`）；`zoomInDisabled` / `zoomOutDisabled`、`#refresh` / `#undo` / `#zoomin` / `#zoomout` / `#close` / `#image` / `#original`（`#preview`）插槽与 `previewButtonProps` → 未实现（本库无旋转 / 缩放工具条，放大图固定沿用 `src` / `alt`，入口外观经类名与 CSS 变量覆盖）。**已知差异（有意）**：① 预览入口仅在图片加载成功后渲染，加载中 / 失败时不可点开；② 遮罩基于 Reka Dialog 模态实现（焦点陷阱 + 滚动锁 + 关闭后焦点回到入口），PrimeVue 为自绘 Portal + FocusTrap。**本库新增**：`alt`、`ratio`（按比例占位防抖动）、`fit`、`lazy`（进入视口再请求）与 `#loading` / `#error` 插槽。

> Input 迁移映射（已实现）：`<InputText>` → `<CaomeiInput>`；`size`（`small` / `large`）→ `size`（`sm` / `lg`）；`invalid` 同名（映射 `aria-invalid`）；`fluid` 删除（默认 `width: 100%`，见 §7 通用表）；`name` / `id` 同名；`aria-label` → `label`。**本库新增**：`clearable`（清除按钮 + `clear` 事件）、`type`、`readonly`、`autocomplete`、`#prefix` / `#suffix` 插槽。**未实现**：`variant`（`outlined` / `filled`）、`formControl`。

> FloatLabel 迁移映射（已实现）：`variant`（`over` / `in` / `on`）→ `variant`（`over` / `in`），**`on` 未支持**；组合子项用法一致（子项需带 `placeholder`）。

> InputGroup 迁移映射（已实现）：`<InputGroup>` → `CaomeiInputGroup`（同为无 props 的拼接容器）；`orientation`（`horizontal` / `vertical`）为本库新增。**边框拼接约定**：圆角去重与「剩余宽度」规则按成员**根元素**生效，选择器家族保留自身宽度上限、不自动铺满（覆盖对应上限 token 可铺满）。

> RadioGroup 迁移映射（已实现）：PrimeVue 多个 `<RadioButton v-model name :value>` → `<CaomeiRadioGroup v-model>` + `<CaomeiRadioButton :value>` 子项（组持模型、子项持值）；`inputId` → `id`；`aria-label` → `label`；`orientation`（默认 `vertical`）/ `loop` / `required` / `invalid` / `dir` 由分组统一提供。**未实现 / 未暴露**：`binary`（二态改用 `CaomeiSwitch`）、`variant`、`readonly`、`tabindex`、`input-class` / `input-style`、`formControl`。

> Slider 迁移映射（已实现）：`range`（布尔）→ 未暴露，由模型推导（`number` → 单滑块、`number[]` → 多滑块）；`min` / `max` / `step` / `orientation` 同名；`ariaLabel` / `ariaLabelledby` → `label`（`aria-labelledby` 透传仍生效）。**本库新增**：`inverted`、`minStepsBetweenThumbs`、`thumbLabels`、`dir`、`name` / `required`。**未实现**：`invalid`、`tabindex`、`formControl`。

> FileUpload 迁移映射（已实现）：`accept` / `multiple` 同名；`mode` → `mode`（默认 `advanced`；`basic` 为紧凑选择按钮 + 已选文案，每次选择替换列表、不渲染拖放区与列表）；`chooseLabel` → `chooseLabel`（`basic` 覆盖按钮文案、`advanced` 覆盖拖放提示，缺省取内建 locale）；`maxFileSize` → `maxFileSize`（字节；超限文件不入列表并在组件内显示内建提示，每次选择清空，被拒文件不影响既有列表）；`auto` → `auto`（选完自动请求上传；仅在 `customUpload` 下产出 `uploader`）；`customUpload` + `@uploader` → `customUpload` + `uploader`（组件不做传输、由业务层上传；`auto` 关闭时以暴露的 `upload()` 手动触发，等价 `ref.upload()`）；`@select` / `@remove` → `select` / `remove`（载荷同形 `{ originalEvent, files }` / `{ file, files }`；`select.files` 为选择后的完整列表，全部被拒时为未变化的当前列表）；`@clear` → `clear`（经暴露的 `clear()`）；`name` → 透传到内层 `<input type="file">`（原生表单提交可用）；选择结果即 `v-model` 的 `File[]`。**本库新增** `disabled`、`label`（可访问名）、`#file` 插槽（自定义列表项）与 `sizeExceeded` 内建 locale 文案。**已知差异（有意）**：basic 形态在「本次选择全部被拒」时保留原列表（PrimeVue 先清空再校验）；超限提示固定走内建 locale，不提供 `invalidFileSizeMessage` prop 覆盖（可经 `CaomeiConfigProvider` 的 `messages` 覆盖）。**未实现（已登记为后续补强项，交付后同步本节）**：`url` / `withCredentials` 与默认 XHR 传输、`before-upload` / `progress` / `upload` / `before-send` / `error` 事件、`fileLimit` / `invalidFileLimitMessage` / `invalidFileTypeMessage`、`uploadLabel` / `cancelLabel` / `showUploadButton` / `showCancelButton`（无上传 / 取消按钮）、`previewWidth`（无图片缩略图）。

> AutoComplete 迁移映射（已实现）：`suggestions` → `options`（`string` 或 `{ label, value, disabled }`；**字段名固定**，不提供 `optionLabel` / `optionValue`）；`optionDisabled` → 选项对象的 `disabled`；`dropdown` / `multiple` 同名；`showClear` → `clearable`（模型置空并抛 `clear` 事件）；`delay` → `debounce`；`minLength` → 由 `ignoreFilter` 承接（默认本地过滤）；`inputId` → `id`；`aria-label` → `label`；`size`（`small` / `large`）→ `size`（`sm` / `lg`）。**已知差异（有意）**：`forceSelection` 未实现——本库**允许自由文本**（回车 / 失焦提交输入值），「值必须来自选项」需使用方自行校验（评估见 [Backlog](../plan/backlog.md)）。**未实现**：`optionGroupLabel` / `optionGroupChildren`、`completeOnFocus`、`typeahead`、`scrollHeight`、`dataKey`、`variant`（`outlined` / `filled`）、`appendTo` 与面板样式 / 类名透传。**本库新增**：`loading`、`emptyLabel`、`bodyLock`。

> TagsInput 迁移映射（已实现）：PrimeVue `Chips`（v4 起为 `InputChips` 的旧名）→ `<CaomeiTagsInput>`，**`Chips` 迁移首选本组件**，`AutoComplete + multiple` 降为**备选**（后者是带选项面板的搜索选择，语义不同，仅在需要异步建议时使用）。映射：`modelValue` 同名（`string[]`）；`separator` → `delimiter`（默认 `,`，另支持正则）；`max` 同名；`allowDuplicate` 同名但**默认相反**（PrimeVue 默认 `true` 允许重复，本库默认 `false` 拒绝重复并在拒绝时抛 `invalidInput`）；`addOnBlur` 同名（默认 `false`）；`inputId` → `id`、`ariaLabel` → `label`、`ariaLabelledby` 经透传作用于输入框；`invalid` / `disabled` / `placeholder` 同名；`fluid` 删除（字段默认 `width: 100%`）。**本库新增或改默认**：`showClear` / `clearLabel`、`size`（`sm` / `md` / `lg`）、`addOnPaste`（**默认 `true`**，与上游 Reka 的默认相反，粘贴按分隔符拆分）、`addOnTab`（默认 `false`）、`label`、`invalidInput` 事件。**包装层 a11y 修复**：标签项显式声明 `role="group"`（Reka 在 `role=generic` 的 div 上输出 `aria-labelledby`，ARIA 1.2 禁止在 generic 上命名；改 `group` 后 axe 无 `aria-prohibited-attr`，未新增例外清单条目）；删除按钮的 `tabindex="-1"` 为 **Reka 上游默认**（非包装层修改），键盘删除走「方向键选中 + `Backspace` / `Delete`」；有标签时字段根输出 `data-filled` 以接入 `FloatLabel` 的 `over` 浮动态。**未实现**：`#chip` / `#chipicon` 插槽、`removeTokenIcon` / `chipIcon`、`variant`（`outlined` / `filled`）、`pt` / `dt` / `unstyled`、对象型标签值（Reka 的 `convertValue` / `displayValue` 未暴露）。

## 8. 规范落实与可验证脚本（已实现）

- **规范可验证脚本**：`scripts/governance/check-design.mjs`，经 `pnpm check:design` 运行，已纳入 `pnpm governance:check` 与 `pnpm verify`：
  1. token 引用存在性（`var(--caomei-*)` 未定义且无 fallback 为错误）；
  2. 组件原始色值（`#hex` 与 `rgb()` / `rgba()` / `hsl()` / `hsla()` 均为错误，rgb/hsl 预算 0）；
  3. 档位常量一致性（`src/types.ts` 的 `ComponentSize` / `ComponentVariant` / `ComponentTone`）；
  4. 旧命名泄漏（组件类型中的 `'small'` / `'large'`）；
  5. 档位块属性（G1）：`:where(.caomei-<comp>[__<el>]--<档位/变体>)` 规则内直接声明属性为错误；
  6. scoped 变量声明（G2）：组件命名空间的 `--caomei-*` 声明必须落在含 `:where(` 的选择器内；
  7. 禁用态字面量（G3）：`opacity: 0.5` / `0.6` 字面量为错误（跳过 `@keyframes`）；
  8. 层级字面量（G4）：数字 `z-index` 为错误，须走 `var(--caomei-z-*)` 或关键字；
  9. 尺寸档位选择器归一（G5，`[tier-where]`）：`.caomei-<comp>[__<el>]--(sm|md|lg)` 未被 `:where(...)` 归零为错误（规则面只含尺寸档位，不含变体 / 语气）；
  10. 同规则重复声明（G6，`[dup-decl]`）：同一规则内同名属性重复声明（含自定义属性）为错误——后写覆盖先写、前者恒为死代码。
- **单测**：`scripts/governance/check-design.test.mjs` 将上述不变量固化为断言。
- **新组件自检清单**：新增组件按下列顺序核对，全部满足方可进入 Review Gate。
  1. 命名与结构：`Caomei` + `PascalCase`；目录 `src/components/<kebab>/`，含同名 `.vue`、`types.ts`、`index.ts` 与 `.test.ts`；在 `src/index.ts` 导出。
  2. 档位：props 复用全局 `ComponentSize` / `ComponentVariant` / `ComponentTone`，不自定义档位命名。
  3. 样式：只消费 `--caomei-*` token，不写原始色值；全局 token 直用，组件覆盖钩子经 `var(--组件-token, 全局 token 或档位)` 消费；档位类用 `:where()`。
  4. 图标：经 `#icon` 插槽 + `@lucide/vue`，不使用字符串图标名。
  5. 无障碍：键盘可达、焦点可见、必要的 ARIA 与文案本地化键。
  6. 文档与测试：API 文档页（中 / 英）与行为测试（含失败路径）。
  7. 收尾：`pnpm check:design` 与 `pnpm verify` 通过。

## 9. 未决项

- caomei-auth 暗色双轨（PrimeVue zinc vs SCSS `#121212`）：预设已取 PrimeVue 轨（见 §5.1）；如后续需要 SCSS 轨可另设变体。
- 是否新增 `--caomei-color-accent` 与 `info` tone，需评估组件使用面。
- 预设承载形式已定稿为「随基础层 `theme.css` 分发 + 根元素 `data-preset` 属性」；是否额外提供独立 CSS 入口或 Nuxt 配置项，待下游接入反馈后评估。
