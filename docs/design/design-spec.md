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
| 圆角 | `--caomei-radius-sm` / `-md` / `-lg` | 4 / 8 / 12 px | 控件 / 容器 / 浮层 |
| 组件宽度 | `--caomei-input-number-max-width` / `--caomei-select-max-width` | 12rem / 20rem | 数值输入框 / 选择器默认上限 |

消费统计（`src/` 内引用次数）：radius sm 22 / md 20 / lg 3；control-height sm 11 / md 14 / lg 9；font-size sm 18 / md 39 / lg 15；space-1 ~ 4 分别 41 / 46 / 24 / 23。

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
| 圆角 | `--caomei-radius-full` | 胶囊 / 圆形 |
| 交互 | `--caomei-color-focus-ring`、`--caomei-color-mask` | 焦点环与浮层遮罩 |
| 字体 | `--caomei-font-mono` | 代码 / 密钥等场景 |
| 排版 | `--caomei-line-height-tight` / `-normal` / `-relaxed` | 标题与正文行高 |

## 3. 颜色规范

### 3.1 语义色与状态色

- 语义档位固定为 `tone`：`neutral` / `primary` / `success` / `warning` / `danger`。不新增 `info` / `contrast` 等档位，其语义由映射规范承接（见 §7）。
- `variant`（形态）与 `tone`（语义）正交：`soft` / `solid` / `outline`（以及 Button 的 `text` / `ghost`）。
- 组件不得自造色值；所有颜色必须来自 token。

### 3.2 对比度要求

- 正文与背景对比度 ≥ 4.5:1；大号文本与图形 ≥ 3:1（WCAG AA）。
- `-solid` 实底与 `-foreground` 前景必须满足 AA；暗色下不得仅靠调亮强调色导致白字对比不足。
- 焦点态必须可见（规划 `--caomei-color-focus-ring`），不得仅用颜色细微变化表示状态。

## 4. 主题与暗色

- 亮色为默认；暗色支持 `.dark` class（已实现）。
- 规划补齐 `[data-theme="dark"]` 属性与 `prefers-color-scheme: dark`（跟随系统），与 `.dark` 等价；`useTheme()` 负责管理（见 [主题与样式设计 §3](./theming.md)）。
- 主题预设通过 `[data-theme="<preset>"]` 切换；预设与明暗正交组合。

## 5. 主题预设（规划，待实现）

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
| `--caomei-color-bg-elevated` | `#f8fafc`（亮 surface-50） | `#18181b`（暗内容背景 / surface-900） | Lara content.background |
| `--caomei-color-text` | `#475569` | `#ffffff` | Lara text |
| `--caomei-color-text-muted` | `#718096` | `#a1a1aa` | Lara text.muted |
| `--caomei-color-border` | `#e2e8f0` | `#3f3f46` | Lara content.border |
| `--caomei-radius-sm/md/lg` | `4 / 6 / 12` | 同 | 控件 6px / 卡片与浮层 12px |

> 待确认：caomei-auth 暗色存在 PrimeVue zinc（`#18181b`）与应用 SCSS（`#121212`）双轨，本预设取 PrimeVue 轨（与组件语义 token 同源）。
>
> `-solid` 系列（`success` / `warning` / `danger` / `neutral`）未在表中单列，预设实现时按同 tone 深阶覆盖并保证 `-foreground` 对比度；未列出的 token 继承 `theme.css` 默认值。
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
> `-solid` 系列（`success` / `warning` / `danger` / `neutral`）未在表中单列，预设实现时按同 tone 深阶覆盖并保证 `-foreground` 对比度；未列出的 token 继承 `theme.css` 默认值。
>
> momei 的代码高亮 / 阅读器皮肤（Primer 色系、sepia 等）**不属于主题预设**，不纳入。

## 6. 组件风格约定

| 组件 | 约定 |
| --- | --- |
| Button | 高度取 `control-height-*`；圆角 `radius-md`；变体 `primary` / `secondary` / `ghost` + `solid` / `soft` / `outline`；图标经 `#icon` 插槽 |
| Input 家族 | 高度 `control-height-*`；圆角 `radius-md`；默认全宽；校验态用 `:invalid` 而非色值类 |
| Card | 圆角 `radius-lg`；`bg-elevated` 或 `bg` + `border`；内边距取 `space-4` |
| Tag / Badge | 圆角 `radius-sm`；`tone` 语义；字号 `font-size-sm` |
| Dialog / Popover | 圆角 `radius-lg`；浮层背景 `bg-elevated`；阴影用规划 `shadow-lg` |
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

## 8. 规范落实与可验证脚本（规划，待实现）

- **规范可验证脚本**：对 `src/` 与组件文档执行检查，纳入 `pnpm verify` 或独立 `pnpm check:design`：
  1. 组件内禁止原始色值（`#hex` / `rgb()`）与魔法尺寸，必须消费 token；
  2. 尺寸档位一致性（同语义档位值一致，不出现 `small` / `sm` 混用）；
  3. `variant` / `size` / `tone` 命名与取值白名单；
  4. token 引用存在性（不消费未定义的 `--caomei-*`）。
- **新组件规范模板 / 自检清单**：新增组件时按模板生成骨架，并在 PR 自检清单中逐项核对本规范。

## 9. 未决项

- caomei-auth 暗色双轨（PrimeVue zinc vs SCSS `#121212`）取哪个，需在预设实现前定稿（本规范暂取 PrimeVue 轨）。
- 是否新增 `--caomei-color-accent` 与 `info` tone，需评估组件使用面。
- `prefers-color-scheme`、`[data-theme]` 暗色支持与预设切换的承载形式（独立 CSS 入口 / 属性 / Nuxt 配置）待实现时定稿。
