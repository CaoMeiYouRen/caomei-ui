# Tooltip 工具提示

工具提示在指针悬停或键盘聚焦时展示一段简短说明，基于 Reka UI Tooltip 封装；建议在应用根部放置一次 `CaomeiTooltipProvider`，再与 `CaomeiTooltip` / `CaomeiTooltipTrigger` / `CaomeiTooltipContent` / `CaomeiTooltipArrow` 组合使用（未放置时组件内建兜底，见下）。

## 基础用法

`CaomeiTooltipProvider` 建议在应用根部放置一次（与 `CaomeiToastProvider` / `CaomeiConfirmDialog` 同类的一次性 Provider），它承载「跨触发器免延迟」的共享状态（`skipDelayDuration`）与全局的 `delayDuration` / `disabled` 等配置。

**未放置 Provider 时不会抛错**：`CaomeiTooltip` 会以内建默认配置（延迟 700ms）兜底，单个提示仍可正常打开；代价是这类提示之间不共享「跨触发器免延迟」。组件库的内建提示（如 Button 的 `tooltip`）同样走这条兜底路径——存量应用升级后无需先改应用根部。

`CaomeiTooltipTrigger` 缺省渲染为**无外观**的可点击容器并接好无障碍接线；包裹既有按钮 / 链接 / 图标时用 `as-child` 复用该元素。

> `class` / `style` 请落在触发器或内容上；根容器不渲染 DOM，其上的其余属性不会生效。

<demo
    vue="../examples/tooltip/basic.vue"
    ssg="true"
/>

## 组件内建提示

除自建 `CaomeiTooltip` 组合外，库内「无可见文本、或文本会被截断」的触发面自带内建提示。本阶段接线时**没有为每个触发面各开一个新 prop**：Button / Toolbar / Paginator / SplitButton 沿用各自既有的 `tooltip` prop 开关，其余触发面（含长文本面）默认开启、经根部 Provider 统一关闭。提示内容默认取该触发面既有的可访问名（显式内容与原生 `title` 优先），因此提示文本与读屏名称同源、不会漂移。

> 唯一的默认例外是 `CaomeiButton`：它的 `tooltip` 默认关闭（文本按钮上贸然加提示会打扰既有页面），图标按钮需显式传 `tooltip` 才启用。

<demo
    vue="../examples/tooltip/built-in.vue"
    ssg="true"
/>

| 触发面 | 默认 | 内容来源 | 关闭方式 |
| --- | :-: | --- | --- |
| Button（图标 / 文本截断） | 关闭 | 显式 `tooltip` 文案 > 原生 `title` > 可访问名 / 可见文本 | 不传 `tooltip`，或传 `:tooltip="false"` |
| Toolbar 图标按钮 / 链接 | 开启 | 显式内容 > 原生 `title` > `label` / `aria-label` | `:tooltip="false"` |
| Paginator 首页 / 上一页 / 下一页 / 末页 | 开启 | 各按钮可访问名（不支持覆盖） | `:tooltip="false"` |
| SplitButton 下拉按钮 | 开启 | `menuLabel`（字符串 / `{ content }` 可覆盖） | `:tooltip="false"` |
| Dialog / Drawer 关闭按钮 | 开启 | 关闭文案（`closeLabel`） | 根部 `CaomeiTooltipProvider :disabled` |
| Select 族清除、InputNumber 步进、Password 显隐 | 开启 | 既有可访问名 | 根部 Provider `:disabled` |
| Calendar 上 / 下月、DatePicker / ColorPicker、Image、FileUpload、Message（含 Alert） | 开启 | 既有可访问名 | 根部 Provider `:disabled` |
| Tag / Breadcrumb / Menu / DataTable 长文本 | 开启 | 可见文本（仅截断时显示） | 根部 Provider `:disabled` |

- **只在被截断时显示**：Tag / Breadcrumb / Menu / DataTable 的文本面按 `scrollWidth > clientWidth + 1` 判定，装得下时完全静默（元素上不会出现 `aria-describedby`）。
- **程序化聚焦不弹**：Dialog / Drawer 关闭按钮与日期 / 颜色选择器的日历导航在打开时会被自动聚焦，这两类触发面按「仅键盘 `:focus-visible`」处理，避免一打开就弹提示。
- **键盘边界**：长文本面（Tag / Breadcrumb / Menu / DataTable）的触发器是文本盒本身、不可聚焦，提示只覆盖指针路径；读屏不受影响（截断只是视觉裁切，文本仍在 DOM 中）。
- **数据表格的列宽**：只有 `columns[].width` 为绝对长度（`px` / `rem` / `em` / `ch` 等，小写）时单元格才单行省略；百分比会以内容盒为基准二次取百分比，`auto` / `min-content` 一类关键字与视口单位（`vh` / `vw` / `vmin` / `vmax`）都不参与截断，未设列宽时保持既有换行。可排序表头的上限未扣排序指示器的预留宽，声明列宽的可排序列会略宽于声明值（明细见 [DataTable](./data-table.md#长文本截断与提示)）。

### 从原生 `title` 迁移

接入内建提示的**按钮类**组件在提示启用时不再把原生 `title` 透传到 DOM（其值改为提示内容兜底），避免系统提示与内建提示双显。当前接管 `title` 的只有 `CaomeiButton`（`tooltip` 开启时）与 `CaomeiToolbarButton` / `CaomeiToolbarLink`（默认开启）；Paginator / SplitButton 下拉 / Dialog / Drawer 关闭按钮的内容固定取可访问名，不读取也不吞掉 `title`，长文本面（Tag / Breadcrumb / Menu / DataTable）也不处理 `title`。

| 下游现状 | 迁移做法 |
| --- | --- |
| 想保留浏览器系统提示 | 按组件关闭内建提示：`Button` 不传 `tooltip` / 传 `:tooltip="false"`，`Toolbar` 传 `:tooltip="false"`；`title` 照旧透传 |
| 想改用内建提示（Toolbar） | 无需改动：Toolbar 默认开启，原 `title` 文案会作为提示内容，DOM 上的 `title` 被移除 |
| 想改用内建提示（Button） | 需要显式开启：传 `tooltip`（沿用 `title` 文案）或 `tooltip="新文案"`；不传仍是浏览器系统提示 |
| 已有 `title`、又想换成别的提示文案 | 直接给 `tooltip="新文案"`：提示内容以它为准，`title` 仍会被移除 |
| 想全局关闭内建提示 | 根部 `CaomeiTooltipProvider` 传 `:disabled="true"`（一次性关闭全部内建提示，含长文本面）。注意：**全局关闭不会恢复已被接管的 `title`**——这些组件既无内建提示也没有系统提示；要保留系统提示请按组件关闭 |

> 原生 `title` 的系统提示延迟由浏览器决定（通常 1 秒以上）、样式不可定制、移动端基本不出现；内建提示统一走库内 token 与延迟配置。

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

## 文本溢出提示

`CaomeiTooltipText` 把「元素 + 溢出提示」封装成一个盒子：内容装不下时显示提示，装得下时完全静默（元素上不会出现 `aria-describedby`）。它只负责接线与可测量的盒子，**是否截断由使用方决定**——须自行声明 `white-space: nowrap` + 定宽 / `max-width` + `overflow: hidden` + `text-overflow: ellipsis`。

```vue
<template>
    <div class="cell">
        <CaomeiTooltipText mode="auto">
            {{ fullText }}
        </CaomeiTooltipText>
    </div>
</template>

<style scoped>
.cell {
    max-width: 12rem;
}

/* 提示包装经多层组件渲染，使用方的 scope id 到不了内层 span，截断样式要用 :deep() */
.cell :deep(.caomei-tooltip-text) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
```

> **覆盖 `display` 时须保留可测量盒**：溢出判据读的是 `scrollWidth` / `clientWidth`，而这两个读数对 `display: inline` 的非替换元素恒为 0。把默认的 `inline-block` 改成 `inline` / `contents` 会让检测永久失效（真实浏览器里提示永不出现，happy-dom 单测因读数被桩替换也发现不了）。组件内的默认形态用 `:where()` 归零特异性，`display` / `box-sizing` / `max-width` / `min-width` 都是可覆盖的常规声明——覆盖时请保留一个可测量的盒子（`block` / `inline-block` / flex 或 grid 子项）。

- `mode`（默认 `auto`）：`auto` 仅在溢出时显示；`always` 始终显示；
- `content` 缺省时取元素的可见文本；
- `disabled` 关闭提示，元素的渲染与截断不受影响；
- 需要键盘用户也能查看时，给元素补 `tabindex="0"`（继承的 `class` / `style` / `aria-*` 等属性会落到根元素）。

`CaomeiButton` 的 `tooltip` 内建提示是同一能力的组件级封装，见 [Button](./button.md#文本溢出与提示)。

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

**已知差异（有意）**：① 建议显式放置 `CaomeiTooltipProvider` 以获得「跨触发器免延迟」（`skipDelayDuration`）；未放置时由 `CaomeiTooltip` 内建兜底（每个提示各自持有默认配置），行为可用但不共享该状态；② 提示只作为**描述**朗读——`role="tooltip"` 落在面板内视觉隐藏元素上（其 `id` 即触发器 `aria-describedby` 的指向），不进入触发器的可访问名；③ 与 `CaomeiPopover` 按语义分工（只读短提示 vs 可交互内容），层级分别为 `--caomei-z-tooltip`（1060）与 `--caomei-z-dropdown`（1050）。

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
