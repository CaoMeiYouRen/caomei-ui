# 设计规范

本文档定义 caomei-ui 的 token 体系、尺寸 / 颜色 / 主题 / 风格规范，以及下游迁移（PrimeVue → caomei-ui）的映射约定。主题实现细节见 [主题与样式设计](./theming.md)；组件实现准则见 [开发规范](../standards/development.md)。

> 标注约定：**已实现**指 `src/styles/theme.css` 当前已定义并可被组件消费；**规划（待实现）**指本规范确定但尚未落地，不得在文档或 API 中描述为已完成。

## 1. 目标与原则

- **组件与样式解耦**：组件只消费 `--caomei-*` 语义 token，不硬编码品牌色 / 尺寸。现状：`src/components` 无 `#hex` 硬编码；仍有 13 处 `rgb()` / `rgba()` 字面量（4 处为 `var(--x, fallback)` 兜底，9 处为遮罩 / 阴影直接字面量），待 §2.5 规划 token 化。
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
| `--caomei-color-primary` | 品牌强调色（文字 / 边框 / soft 底） | `#e63946` | `#e63946` |
| `--caomei-color-primary-foreground` | primary 实底上的前景色 | `#ffffff` | `#ffffff` |
| `--caomei-color-primary-solid` | primary 实底（跨主题稳定） | `#e63946` | `#e63946` |
| `--caomei-color-success` | 成功强调色 | `#15803d` | `#4ade80` |
| `--caomei-color-success-solid` | 成功实底 | `#15803d` | `#15803d` |
| `--caomei-color-warning` | 警告强调色 | `#b45309` | `#fbbf24` |
| `--caomei-color-warning-solid` | 警告实底 | `#b45309` | `#b45309` |
| `--caomei-color-danger` | 危险强调色 | `#dc2626` | `#f87171` |
| `--caomei-color-danger-solid` | 危险实底 | `#dc2626` | `#dc2626` |
| `--caomei-color-neutral-solid` | 中性实底（无强调色） | `#52525b` | `#52525b` |
| `--caomei-color-on-solid` | 实底上的稳定前景色 | `#fff` | `#fff` |
| `--caomei-color-bg` | 页面背景 | `#ffffff` | `#0b0b0d` |
| `--caomei-color-bg-elevated` | 抬升面（卡片 / 浮层） | `#f7f7f8` | `#17171a` |
| `--caomei-color-text` | 主文字 | `#1a1a1a` | `#f5f5f5` |
| `--caomei-color-text-muted` | 次要文字 | `#6b7280` | `#a1a1aa` |
| `--caomei-color-border` | 边框 / 分隔线 | `#e5e7eb` | `#2a2a2e` |

> `--caomei-color-<tone>` 随主题自适应；`--caomei-color-<tone>-solid` 跨主题稳定，保证实底白字对比度；替换品牌色时需同时覆盖对应的 `-solid`。

### 2.3 尺寸 token（已实现）

> 值事实源为 `src/styles/theme.css`；本节为规范摘录。

| 类别 | token | 值 | 消费位置 |
| --- | --- | --- | --- |
| 控件高度 | `--caomei-control-height-sm` / `-md` / `-lg` | 28 / 36 / 44 px | 按钮、输入类、Select 等 |
| 间距 | `--caomei-space-1` ~ `-4` | 4 / 8 / 12 / 16 px | 组件内边距与间隙 |
| 字号 | `--caomei-font-size-sm` / `-md` / `-lg` | 12 / 14 / 16 px | 控件文本与标题 |
| 圆角 | `--caomei-radius-sm` / `-md` / `-lg` / `-full` | 4 / 8 / 12 / 999 px | 控件 / 容器 / 浮层 / 胶囊 |
| 组件宽度 | `--caomei-input-number-max-width` / `--caomei-select-max-width` | 12rem / 20rem | 数值输入框 / 选择器默认上限 |

消费统计（`src/` 内引用次数）：radius sm 22 / md 20 / lg 3 / full 1；control-height sm 11 / md 14 / lg 9；font-size sm 18 / md 39 / lg 15；space-1 ~ 4 分别 41 / 46 / 24 / 23。

> 断点约定为 sm 640px / md 768px / lg 1024px；`@media` 不支持 CSS 自定义属性，故断点以文档约定 + 组件内媒体查询字面量维护，未定义 `--caomei-breakpoint-*` 变量。

### 2.4 字体 token（已实现）

| token | 值 |
| --- | --- |
| `--caomei-font-sans` | `system-ui, -apple-system, sans-serif` |

### 2.5 规划新增 token（待实现）

为落实「层级与阴影」「图标尺寸」「焦点环」「遮罩」等细节，规划新增以下 token（实现归入 M2 主题预设与后续组件增强）：

| 类别 | 规划 token | 说明 |
| --- | --- | --- |
| 阴影 | `--caomei-shadow-sm` / `-md` / `-lg` | 替代组件内 `box-shadow` 字面量 |
| 层级 | `--caomei-z-dropdown` / `-sticky` / `-overlay` / `-modal` / `-toast` / `-tooltip` | 替代 `z-index` 字面量 |
| 图标 | `--caomei-icon-size-sm` / `-md` / `-lg` | 统一 `@lucide/vue` 图标尺寸 |
| 交互 | `--caomei-color-focus-ring`、`--caomei-color-mask` | 焦点环与浮层遮罩 |
| 字体 | `--caomei-font-mono` | 代码 / 密钥等场景 |
| 排版 | `--caomei-line-height-tight` / `-normal` / `-relaxed` | 标题与正文行高 |

## 3. 颜色规范

### 3.1 语义色与状态色

- 语义档位固定为 `tone`：`neutral` / `primary` / `success` / `warning` / `danger`。不新增 `info` / `contrast` 等档位，其语义由映射规范承接（见 §7）。
- `variant` 控制呈现形态（`primary` 实底 / `secondary` 描边 / `ghost` 无底色），`tone` 控制语义色（`neutral` / `primary` / `success` / `warning` / `danger`），二者正交。
- 组件不得自造色值；所有颜色必须来自 token。

### 3.2 对比度要求

- 正文与背景对比度 ≥ 4.5:1；大号文本与图形 ≥ 3:1（WCAG AA）。
- `-solid` 实底与 `--caomei-color-on-solid` 前景必须满足 AA（其余 tone 实底均 ≥ 4.5:1）。
  - **已知例外**：品牌主色 `#e63946`（caomei 预设 `primary-solid`）配白字约 4.17:1，略低于阈值；作为既有品牌色暂予接受，跟踪见 [Backlog](../plan/backlog.md)。
- 焦点态必须可见（`--caomei-color-focus-ring` 为规划项），不得仅用颜色细微变化表示状态。

## 4. 主题与暗色

- **默认亮色**；暗色支持：
  - `.dark` class；
  - `[data-theme="dark"]` 属性；
  - 系统跟随为**显式开启**：根元素加 `data-scheme="auto"`，再以 `.light` / `[data-theme="light"]` 可临时锁定亮色。
- 品牌预设通过根元素 `data-preset` 切换：`[data-preset="caomei"]` / `[data-preset="momei"]`（缺省为基础预设）；预设与明暗正交组合，且需挂在**同一元素**上（通常为 `<html>`）。
- `useTheme()` 读取模式与暗色状态（`auto` 时读取系统偏好），见 [主题与样式设计 §3](./theming.md)。

## 5. 主题预设（已实现）

实现位置：`src/styles/theme.css`（基础）与 `src/styles/presets/caomei.css`、`src/styles/presets/momei.css`；随 `caomei-ui/styles.css` 一起分发，经根元素 `data-preset` 激活。文档站顶栏提供演示切换。

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
| Button | 高度取 `control-height-*`；圆角 `radius-md`（`rounded` 时 `radius-full`）；变体 `primary` / `secondary` / `ghost`；可选 `tone` 语义色（`neutral` / `primary` / `success` / `warning` / `danger`）；`tone` 实底前景用 `--caomei-color-on-solid`，默认 `variant="primary"` 沿用 `--caomei-color-primary` + `--caomei-color-primary-foreground`（随主题自适应）；图标经 `#icon` 插槽与 `iconPosition` 控制位置 |
| Input 家族 | 高度 `control-height-*`；圆角 `radius-md`；默认全宽；校验态用 `:invalid` 而非色值类 |
| Calendar / DatePicker | 触发器高度取 `control-height-*`、圆角 `radius-md`、默认全宽；面板圆角 `radius-md`；选中日取 `primary` / `primary-foreground`，今日用 `border` 描边；对外统一使用原生 `Date` |
| Card | 圆角 `radius-lg`；`bg-elevated` 或 `bg` + `border`；内边距取 `space-4` |
| Tag / Badge | 圆角 `radius-sm`（Tag 的 `rounded` 时 `radius-full`）；`tone` 语义；字号 `font-size-sm` |
| Message / Alert | 圆角 `radius-md`；变体 `soft` / `solid` / `outline` / `simple`；`size` 影响字号、内边距与图标（`simple` 不消费内边距） |
| Dialog / Popover | 圆角 `radius-lg`；浮层背景 `bg-elevated`；阴影用规划 `shadow-lg` |
| DataTable | 表头/单元格底部边框取 `border`；排序按钮图标取 `text-muted`；排序态经 `aria-sort` 表达；列样式优先 `headerClass` / `bodyClass` |
| Textarea | 自动增高时高度由内容决定、默认不出现滚动条；`rows` 为初始最小高度，`resize` 固定 `none` |
| Password | 根为 `.caomei-password` 包裹层（单根），`class` / `style` 留在根元素；强度计量条高度 4px、圆角 `radius-full`；弱 / 中 / 强取 `danger` / `warning` / `success`；未聚焦且无值时强度区域不占布局 |
| 所有组件 | 焦点态可见；禁用态不改变布局尺寸 |

## 7. 迁移映射规范（PrimeVue → caomei-ui）

详见 [momei 使用复核台账 §4.3](./governance/2026-09-14-momei-usage-audit.md)。要点：

| 维度 | PrimeVue | caomei-ui |
| --- | --- | --- |
| 语义色 | `severity` | `tone` + `variant`（`secondary` / `contrast` → `neutral`；`info` → `primary`） |
| 尺寸 | `small` / `large` | `sm` / `lg` |
| 图标 | `icon="pi pi-x"` | `#icon` 插槽 + `@lucide/vue` |
| 受控字段 | `v-model:visible` / `v-model:value` | `v-model:open` / `v-model` |
| 浮层标题 | `header` | `title` |
| 校验态 | `class="p-invalid"` | `:invalid` |
| 全宽 | `fluid` | 默认全宽（迁移时删除） |
| 选项字段映射 | `option-label` / `option-value` | `optionLabel` / `optionValue`（字段名或取值函数；值支持 `string` / `number`） |
| 可搜索单选 | `Select filter` | 改用 `CaomeiAutoComplete`（Reka Select 无 filter primitive，面板内搜索框违反 `aria-required-children`；自由文本差异见 [Backlog](../plan/backlog.md)） |

> Button 迁移映射（已实现）：`severity` → `tone`；`text` → `variant="ghost"`；`outlined` → `variant="secondary"`；`rounded` → `rounded`；`icon-pos` → `iconPosition`；`:badge` 待评估。
>
> DataTable 排序：首次点击为**升序**（内部固定 `sortDescFirst: false`，对齐 PrimeVue 语义）；受控模式由挂载时是否提供 `sortField` 决定。
>
> Panel 迁移映射（不新建组件）：PrimeVue `<Panel :header>` → `CaomeiCard` 的 `title` prop（或 `#title` / `#header` 插槽）；`#header` → `#header`；`#footer` → `#footer`；`#icons` → `#extra`；需要可折叠的面板改用 `CaomeiAccordion`。
>
> Select 家族对象选项映射（已实现）：`option-label` / `option-value` → `optionLabel` / `optionValue`，字符串形态支持 `a.b` 点号路径；`optionValue` 解析结果非 `string` / `number` 的选项不渲染（Select / MultiSelect / SelectButton 一致）。
>
> Select 清空与自定义选项（已实现）：`show-clear` → `showClear`（清除后模型置 `null`、焦点交回触发器）；`#option` 插槽收到原始选项对象与选中态。
>
> InputNumber 迁移映射（已实现）：`use-grouping` → `useGrouping`（默认 `true`，对齐 PrimeVue）、`min-fraction-digits` / `max-fraction-digits` → `minFractionDigits` / `maxFractionDigits`（0–20 整数；`minFractionDigits` 仅补零展示，`maxFractionDigits` 同步取整模型）；`precision`（0–20 整数，超出按未提供处理）优先于 `maxFractionDigits`；`show-buttons` → `controls`。
>
> Message 迁移映射（已实现）：`severity` → `tone`（`error` → `danger`、`warn` / `warning` → `warning`、`info` → `primary`、`secondary` / `contrast` → `neutral`、`success` → `success`；`secondary` / `contrast` / `info` 为有损近似）；`variant="outlined"` → `variant="outline"`、`variant="simple"` → `variant="simple"`（PrimeVue Message 仅 `outlined` / `simple`，无 `text`；无 `variant` 的默认形态对应 `soft`）；`size` 取 `sm` / `md` / `lg`（对齐 `small` / `large`）。
>
> Tag 迁移映射（已实现）：`severity` → `tone`（`secondary` / `contrast` → `neutral`、`success` → `success`、`warn` / `warning` → `warning`、`danger` → `danger`；`secondary` / `contrast` / `info` 均为**有损近似**）。Tag 无 `error` 用量，通用语义色映射见 [momei 使用复核台账 §4.3](./governance/2026-09-14-momei-usage-audit.md)；`outlined` → `variant="outline"`；`rounded` → `rounded`；`value` → 默认插槽；字符串 `icon` → `#icon` 插槽。Tag **不新增** `outlined` / `severity` 布尔别名与 `value` prop（`variant` 已覆盖形态、映射走 `tone`、内容走插槽）。
>
> Textarea 迁移映射（已实现）：`auto-resize` → `autoResize`（默认 `false`，高度由包装层写入内联 `height`；开启时 `resize` 固定 `none`，`rows` 保留为初始最小高度；不设上限，封顶由消费方在使用层叠加 `max-height`）。
>
> Password 迁移映射（已实现）：`feedback` → `feedback`（**默认值分歧且为有意**：PrimeVue 默认 `true`，此处默认 `false`。momei 32 处 `<Password>` 仅 8 处显式传 `feedback`，其余 24 处大多为外部服务凭据（密钥 / Token）字段、强度条无实际意义；其中安装向导的 `admin_password` 为用户自设密码，迁移后建议显式传 `:feedback="true"`；默认关闭可避免这些字段凭空多出区块。迁移后这 24 处将失去原先由 PrimeVue 默认开启的强度浮层，属有意行为变更而非回归）。显式开启后显示内联强度计量条与文案，聚焦或有值时可见，空值未聚焦仅保留读屏器 live region；`prompt-label` / `weak-label` / `medium-label` / `strong-label` → `promptLabel` / `weakLabel` / `mediumLabel` / `strongLabel`（默认取内建 locale `password.prompt` / `weak` / `medium` / `strong`）；`toggle-mask` → 内建切换按钮（无需 prop）；`medium-regex` / `strong-regex` 未实现（下游无用量，强度规则固定）。

> Calendar / DatePicker 迁移映射（已实现，基础日期选择）：`min-value` / `max-value` → `minValue` / `maxValue`；`date-format` → `dateFormat`（PrimeVue 风格 token，缺省按 `locale` 输出本地化短日期）；`show-icon` → `showIcon`（`icon-display="input"` 即本组件默认形态）；`fluid` 默认全宽，迁移时删除。对外 `v-model` 沿用 PrimeVue 的原生 `Date` 语义；Reka primitive 使用 `@internationalized/date` 的 `DateValue`，转换收敛在 `_shared/date`（新增该运行时依赖）。`show-time` / `hour-format` / 范围选择属 [待办事项](../plan/todo.md) 的「DatePicker 时间 / 范围」条目，本批未实现。**已知行为差异**：PrimeVue `DatePicker` 是可键入的 input，本组件为「触发按钮 + 面板」，不支持手工键入日期（迁移时需确认下游无键入依赖）；`locale` 仅控制日期 / 日历语言，与内建文案语言相互独立（本库 i18n 机制未暴露 locale tag），需一致时显式传入。

## 8. 规范落实与可验证脚本（已实现）

- **规范可验证脚本**：`scripts/governance/check-design.mjs`，经 `pnpm check:design` 运行，已纳入 `pnpm governance:check` 与 `pnpm verify`：
  1. token 引用存在性（`var(--caomei-*)` 未定义且无 fallback 为错误）；
  2. 组件原始色值（`#hex` 为错误；`rgb()` / `hsl()` 为警告，已知 13 处待 token 化）；
  3. 档位常量一致性（`src/types.ts` 的 `ComponentSize` / `ComponentVariant` / `ComponentTone`）；
  4. 旧命名泄漏（组件类型中的 `'small'` / `'large'`）。
- **单测**：`scripts/governance/check-design.test.mjs` 将上述不变量固化为断言。
- **新组件自检清单**：新增组件按下列顺序核对，全部满足方可进入 Review Gate。
  1. 命名与结构：`Caomei` + `PascalCase`；目录 `src/components/<kebab>/`，含同名 `.vue`、`types.ts`、`index.ts` 与 `.test.ts`；在 `src/index.ts` 导出。
  2. 档位：props 复用全局 `ComponentSize` / `ComponentVariant` / `ComponentTone`，不自定义档位命名。
  3. 样式：只消费 `--caomei-*` token，不写原始色值；档位类用 `:where()`，默认值经 `var(--x, fallback)` 消费。
  4. 图标：经 `#icon` 插槽 + `@lucide/vue`，不使用字符串图标名。
  5. 无障碍：键盘可达、焦点可见、必要的 ARIA 与文案本地化键。
  6. 文档与测试：API 文档页（中 / 英）与行为测试（含失败路径）。
  7. 收尾：`pnpm check:design` 与 `pnpm verify` 通过。

## 9. 未决项

- caomei-auth 暗色双轨（PrimeVue zinc vs SCSS `#121212`）：预设已取 PrimeVue 轨（见 §5.1）；如后续需要 SCSS 轨可另设变体。
- 是否新增 `--caomei-color-accent` 与 `info` tone，需评估组件使用面。
- 预设承载形式已定稿为「随 `styles.css` 分发 + 根元素 `data-preset` 属性」；是否额外提供独立 CSS 入口或 Nuxt 配置项，待下游接入反馈后评估。
