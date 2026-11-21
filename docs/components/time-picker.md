# TimePicker 时间选择器

TimePicker 用于录入一天内的时间：默认精确到秒并补 0（`09:30:00`）；支持 12 / 24 小时制、补 0 开关与步进。

## 基础用法

`v-model` 是 `Date | null`：只取时 / 分 / 秒，日期部分仅作载体（编辑时保留当前日期，空值取今天）。`label` 既是可见标签，也是可访问名；可用 `ariaLabel` 覆盖。默认显示时 / 分 / 秒并补 0，需要只到分钟时传 `:show-seconds="false"`。

<demo
    vue="../examples/time-picker/basic.vue"
    ssg="true"
/>

## 升级说明

本版将 `showSeconds` 默认值改为 `true`，并把字段默认宽度从选择器家族的 `20rem` 改为时间内容档位。两项都是展示默认值调整，不视为破坏性变更；需要旧行为时显式传 `:show-seconds="false"`，或用 `--caomei-time-picker-max-width` 恢复所需宽度。`pad` 为新增开关，默认开启。

## 选择模式

- `mode="input"`（默认）：内联时 / 分 / 秒输入，键盘直接编辑；无滚轮入口。
- `mode="wheel"`：只读展示当前时间，点击字段任意位置打开滚轮弹层；滚轮列支持触屏 / 鼠标滚动与 ↑↓、PageUp / PageDown、Home / End 键（↑ 上一条、↓ 下一条，与滚动方向一致）。
- `mode="both"`：保留内联输入，并在字段**右缘**增加滚轮入口，两种方式共用同一受控值；两套方向键语义不同（输入段按数值增减，滚轮列按列表上 / 下一条）。

三种模式共用同一套字段外壳与段位布局：高度、左右内边距、圆角、字号、段位宽度与起点一致，冒号位于相邻数字正中间；`wheel` / `both` 的箭头都贴在字段右缘，弹层以**整条字段**为锚点从字段左缘展开，不会随内部按钮位置漂移。默认模式保持 `input`。

滚轮选择沿用 `minValue` / `maxValue` 夹取、`showSeconds`、`pad` 与 12 小时制日序。`step` 是增量提示，不是取值约束：直接输入或滚轮滚动仍可落在任意值上（滚轮列不按 `step` 过滤）。

<demo
    vue="../examples/time-picker/modes.vue"
    ssg="true"
/>

## 精度与小时制

- `showSeconds`：默认 `true`（时 / 分 / 秒）；需要只到分钟时显式传 `:show-seconds="false"`。关闭后**下一次编辑**时秒归零，编辑前模型仍保留原秒值。
- `pad`：默认 `true`，时间段补 0（`09:30:00`）；传 `false` 显示自然数字（`9:30:0`）。内联输入与滚轮列使用同一开关。
- `hourFormat`：`'24'`（默认）或 `'12'`；12 小时制下小时输入范围 1–12，并提供本地化日序选择（上午 / 下午）。
- `step`：`{ hour?, minute?, second? }`，作用于上下方向键，默认每段 1；手工输入不按步进过滤。
- 12 小时制下**内联输入**的方向键按 24 小时值取模：11 上午按 ↑ 会变为 12 下午（日序随之切换）；滚轮列不适用该规则（↑↓ 按列表上 / 下一条）。

## 边界与空值

- `minValue` / `maxValue` 传 `Date`，只比较时间部分；编辑结果夹到区间内。`minValue > maxValue`（跨日）视为无解，不夹取。
- `null` 与非法日期显示为空输入，不把「未填」读成 00:00。
- `disabled` / `readonly` 同时作用于输入与日序选择；只读下键盘与日序切换都不会改写值。

## 无障碍

- 容器为 `role="group"`，名称取 `label` / `ariaLabel`；默认渲染「时 / 分 / 秒」三个输入，关闭 `showSeconds` 后回退为「时 / 分」。
- 日序选择是原生 `<select>`，选项文案取当前语言。
- `readonly` 的日序选择带 `aria-readonly`，并在交互层阻止改值；`wheel` / `both` 的入口仍可打开查看，但滚轮列不可聚焦、不可修改。
- 滚轮弹层内每列是一个 `role="listbox"`，可访问名取当前语言的「时 / 分 / 秒」；选项为 `role="option"` 并暴露 `aria-selected`，`aria-activedescendant` 随选择更新。`readonly` / `disabled` 时列不可聚焦，`aria-disabled` / `aria-readonly` 同步输出。

## 样式定制

时间文本长度可预见，默认宽度只保留刚好展示时分秒的内容宽度（含秒 `11.5rem`、只到分钟 `8.5rem`、12 小时制再加 `3.75rem`），**不再继承选择器家族的 `20rem`**。字段仍声明 `width: 100%` 并在窄容器内收缩；需要与其它表单控件对齐或撑满所在列时，把 `--caomei-time-picker-max-width` 覆盖为 `100%`（或 `none`）。

```css
/* 与同列 Select / Input 对齐 */
.caomei-time-picker {
  --caomei-time-picker-max-width: 100%;
}
```

触摸密度轴仍会放大高度与字号；默认内容宽度保持不变。详见[触摸密度轴](../guide/mobile.md#触摸密度轴与尺寸覆盖)。

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-time-picker-height` | `--caomei-control-height-md` | 字段最小高度 |
| `--caomei-time-picker-max-width` | 内容档位（含秒 `11.5rem` / 分钟 `8.5rem` / 12 小时制 `+3.75rem`） | 字段宽度上限；与其它表单对齐时覆盖为 `100%` 或 `none` |
| `--caomei-time-picker-padding-inline` | `--caomei-space-2` | 字段行内内边距（左右同值，对称） |
| `--caomei-time-picker-segment-width` | `2.25rem` | 单个时间段宽度（输入与滚轮显示共用） |
| `--caomei-time-picker-separator-width` | `0.75rem` | 冒号列宽（居中于相邻数字之间） |
| `--caomei-time-picker-period-width` | `3.75rem` | 12 小时制日序选择宽度 |
| `--caomei-time-picker-border` | `--caomei-color-border` | 边框颜色 |
| `--caomei-time-picker-radius` | `--caomei-radius-md` | 圆角 |
| `--caomei-time-picker-bg` | `--caomei-color-bg` | 背景色 |
| `--caomei-time-picker-color` | `--caomei-color-text` | 文本颜色 |
| `--caomei-time-picker-trigger-size` | `1.5rem` | `both` 模式下滚轮入口的按钮边长 |
| `--caomei-time-picker-wheel-item-height` | `2.25rem` | 滚轮单行高度（同时决定面板高度与吸附步长） |
| `--caomei-time-picker-wheel-column-width` | `3.25rem` | 滚轮列宽 |
| `--caomei-time-picker-z-index` | `--caomei-z-dropdown` | 滚轮面板层级 |

## 从 PrimeVue 迁移

| PrimeVue `DatePicker`（`timeOnly`） | 本组件 |
| --- | --- |
| `timeOnly` + `hourFormat` | 独立 `TimePicker`；`hourFormat` 同名（`'12'` / `'24'`），不再需要 `timeOnly` 开关 |
| `showSeconds` | 同名；本组件默认 `true`（含秒），只到分钟时显式关闭 |
| `pad` | 本组件新增：默认 `true` 补 0 |
| `stepMinute` / `stepHour` / `stepSecond` | 合并为 `step` 对象 |
| `minDate` / `maxDate` | `minValue` / `maxValue`（只比较时间部分） |
| `v-model` 为 `Date` | 同名 `Date \| null` |
| 面板式选择 | 默认内联输入；需要面板时用 `mode="wheel"` 或 `mode="both"` 打开滚轮弹层 |

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="time-picker" />
