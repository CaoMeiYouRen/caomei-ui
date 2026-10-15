# Tooltip 工具提示

工具提示在指针悬停或键盘聚焦时展示一段简短说明，基于 Reka UI Tooltip 封装；由应用根部放置一次的 `CaomeiTooltipProvider` 与 `CaomeiTooltip` / `CaomeiTooltipTrigger` / `CaomeiTooltipContent` / `CaomeiTooltipArrow` 组合使用。

## 基础用法

`CaomeiTooltipProvider` 需在应用根部放置一次（与 `CaomeiToastProvider` / `CaomeiConfirmDialog` 同类的一次性 Provider）——Reka 的 `TooltipRoot` 在缺少 Provider 时会抛错，Provider 同时承载「跨触发器免延迟」的共享状态。

`CaomeiTooltipTrigger` 缺省渲染为**无外观**的可点击容器并接好无障碍接线；包裹既有按钮 / 链接 / 图标时用 `as-child` 复用该元素。

> `class` / `style` 请落在触发器或内容上；根容器不渲染 DOM，其上的其余属性不会生效。

<demo
    vue="../examples/tooltip/basic.vue"
    ssg="true"
/>

## 弹出方向与箭头

`CaomeiTooltipContent` 支持 `side`（`top` / `right` / `bottom` / `left`，默认 `top`）、`align`（`start` / `center` / `end`）与 `side-offset` / `align-offset`，并默认启用碰撞检测自动翻转（可用 `avoid-collisions="false"` 关闭）；`CaomeiTooltipArrow` 渲染指向触发器的箭头。

<demo
    vue="../examples/tooltip/placement.vue"
    ssg="true"
/>

## 延迟与禁用

以下五项均为「**Provider 兜底、单条传值优先**」：缺省不传时取 Provider 上的配置（一处配置全局生效），单条显式传入即覆盖该条 —— `delayDuration`（指针进入触发器到面板出现的等待时长，ms，Provider 缺省 `700`）、`disabled`（停用触发）、`disableHoverableContent`（禁止指针移入面板）、`disableClosingTrigger`（点击触发器不关闭面板）、`ignoreNonKeyboardFocus`（只在键盘焦点 `:focus-visible` 时打开，避免切换浏览器标签页 / 关闭对话框等场景误弹）。

Provider 另有**独有**项 `skipDelayDuration`（缺省 `300`）：从一个触发器移到另一个触发器时，在该时长内免去等待；`CaomeiTooltip` 不暴露该项。

- 展开时点击触发器会收起（Reka 契约）；需要「点击保持展开」时传 `disable-closing-trigger`（Provider 级或单条）。

## 无障碍

- 面板内输出一个**视觉隐藏**的 `role="tooltip"` 元素，其 `id` 即触发器 `aria-describedby` 的指向；面板可见文本同时作为该元素的描述内容——提示只作为**描述**被朗读，不进入触发器的可访问名。
- **不构成焦点陷阱**：展开时不移动焦点、面板不带对话框语义；按 Esc 关闭面板。
- 面板内容不适合朗读（图标 / 缩写）时，用 `CaomeiTooltipContent` 的 `aria-label` 提供替代描述。

## 与 CaomeiPopover 的分工

| | Tooltip | Popover |
| --- | --- | --- |
| 内容 | 只读的短说明 | 可交互内容（表单 / 操作） |
| 触发 | 指针悬停 + 键盘聚焦（缺省延迟） | 点击 |
| 层级档位 | `--caomei-z-tooltip`（1060） | `--caomei-z-dropdown`（1050） |
| 焦点 | 不移入（无焦点陷阱） | 移入面板（对话框语义） |
| 关闭 | 指针移出 / 失焦 / Esc | 点击外部 / Esc / 关闭按钮 |

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-tooltip-z-index` | `1060` | 面板层级 |
| `--caomei-tooltip-width` | `max-content` | 面板宽度 |
| `--caomei-tooltip-max-width` | `min(20rem, 可用宽度)` | 面板最大宽度 |
| `--caomei-tooltip-padding` | `--caomei-space-1 --caomei-space-2` | 面板内边距 |
| `--caomei-tooltip-bg` | `--caomei-color-neutral-solid` | 面板背景色 |
| `--caomei-tooltip-color` | `--caomei-color-on-solid` | 面板文字色 |
| `--caomei-tooltip-border` | `transparent` | 面板描边色 |
| `--caomei-tooltip-radius` | `--caomei-radius-sm` | 面板圆角 |
| `--caomei-tooltip-font-size` | `--caomei-font-size-sm` | 面板字号 |
| `--caomei-tooltip-shadow` | `--caomei-shadow-sm` | 面板阴影 |
| `--caomei-tooltip-arrow-bg` | 面板背景色 | 箭头填充色 |
| `--caomei-tooltip-trigger-gap` | `--caomei-space-1` | 触发器内图标与文本间距 |
| `--caomei-tooltip-trigger-padding` | `0` | 触发器内边距（缺省已复位） |
| `--caomei-tooltip-trigger-radius` | `--caomei-radius-sm` | 触发器圆角 |

## 从 PrimeVue 迁移

PrimeVue 的 `v-tooltip` 指令 / `<Tooltip>` 与本组件同为「悬停 / 聚焦即显」的只读提示，差异集中在接入形态：

| PrimeVue | 本组件 |
| --- | --- |
| `v-tooltip` 指令（`v-tooltip="'文本'"` / `v-tooltip.bottom`） | `<CaomeiTooltipTrigger>` + `<CaomeiTooltipContent>` 声明式组合；方向改用 `side` / `align` |
| `v-tooltip:left` 等方向修饰符 | `CaomeiTooltipContent` 的 `side`（`top` / `right` / `bottom` / `left`）与 `align` |
| `<Tooltip>` 组件 + `#content` 插槽 | `CaomeiTooltipContent` 的默认插槽 |
| `showDelay` / `hideDelay` | `delayDuration`（Provider 级或单条）；**未提供独立隐藏延迟**（指针移出即关） |
| `disabled` | `disabled`（Provider 级或单条） |
| `escape`（Esc 关闭） | 默认行为，未暴露开关 |
| 指令式挂载（任意元素加属性即可） | 需显式包一层 `CaomeiTooltipTrigger`（`as-child` 复用原元素） |

**已知差异（有意）**：① 需显式放置 `CaomeiTooltipProvider`（Reka 的 `TooltipRoot` 缺 Provider 时抛错），并据此获得「跨触发器免延迟」（`skipDelayDuration`）；② 提示只作为**描述**朗读——`role="tooltip"` 落在面板内视觉隐藏元素上（其 `id` 即触发器 `aria-describedby` 的指向），不进入触发器的可访问名；③ 与 `CaomeiPopover` 按语义分工（只读短提示 vs 可交互内容），层级分别为 `--caomei-z-tooltip`（1060）与 `--caomei-z-dropdown`（1050）。

### 与 Element Plus `el-tooltip` 的差异

| Element Plus | 本组件 |
| --- | --- |
| `<el-tooltip content="文本">` + `#content` 插槽 | `CaomeiTooltipContent` 默认插槽（无 `content` prop） |
| `placement`（12 档，如 `top` / `top-start`） | `side` + `align` 两轴组合（4 方向 × 3 对齐 = 同 12 种落点） |
| `effect`（`dark` / `light`） | 深色底为默认样式（可用 `--caomei-tooltip-bg` / `--caomei-tooltip-color` 覆盖为浅色） |
| `show-after` / `hide-after` / `show-arrow` | `delayDuration`；**未提供隐藏延迟**；箭头为独立的 `CaomeiTooltipArrow`（缺省不渲染） |
| `trigger`（`hover` / `click` / `focus` / `contextmenu`） | 固定为悬停 + 聚焦（点击为收起）——**未提供 click / contextmenu 触发** |
| `disabled` | `disabled` |
| `teleported` / `append-to` | 恒经 Portal 挂到 `body`；层级由 `--caomei-tooltip-z-index` 管理 |

<ComponentApi name="tooltip" />
