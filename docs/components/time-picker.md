# TimePicker 时间选择器

TimePicker 用于录入一天内的时间：默认精确到分钟，可开启秒；支持 12 / 24 小时制与步进。

## 基础用法

`v-model` 是 `Date | null`：只取时 / 分 / 秒，日期部分仅作载体（编辑时保留当前日期，空值取今天）。`label` 既是可见标签，也是可访问名；可用 `ariaLabel` 覆盖。

<demo
    vue="../examples/time-picker/basic.vue"
    ssg="true"
/>

## 精度与小时制

- `showSeconds`：默认 `false`（只到分钟）；开启后显示秒输入。关闭后**下一次编辑**时秒归零，编辑前模型仍保留原秒值。
- `hourFormat`：`'24'`（默认）或 `'12'`；12 小时制下小时输入范围 1–12，并提供本地化日序选择（上午 / 下午）。
- `step`：`{ hour?, minute?, second? }`，同时作用于数字输入的 `step` 属性与上下方向键，默认每段 1。
- 12 小时制下方向键按 24 小时值取模：11 上午按 ↑ 会变为 12 下午（日序随之切换）。

## 边界与空值

- `minValue` / `maxValue` 传 `Date`，只比较时间部分；编辑结果夹到区间内。`minValue > maxValue`（跨日）视为无解，不夹取。
- `null` 与非法日期显示为空输入，不把「未填」读成 00:00。
- `disabled` / `readonly` 同时作用于输入与日序选择；只读下键盘与日序切换都不会改写值。

## 无障碍

- 容器为 `role="group"`，名称取 `label` / `ariaLabel`；默认渲染「时 / 分」两个输入，开启 `showSeconds` 后增加「秒」输入。
- 日序选择是原生 `<select>`，选项文案取当前语言。
- `readonly` 的日序选择带 `aria-readonly`，并在交互层阻止改值。

## 样式定制

字段默认 `width: 100%`，并带可覆盖的宽度上限：`--caomei-time-picker-max-width` 未覆盖时回退 `--caomei-select-max-width`（默认 `20rem`）。需要撑满所在列时在同一元素或其祖先上把该变量覆盖为 `none`。触摸设备上设置 `data-density="touch"` 时，该回退链的上限会放开（与其它选择器一致），详见[触摸密度轴](../guide/mobile.md#触摸密度轴与尺寸覆盖)。

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-time-picker-height` | `--caomei-control-height-md` | 字段最小高度 |
| `--caomei-time-picker-max-width` | `--caomei-select-max-width`（`20rem`） | 字段宽度上限；需要撑满所在列时覆盖为 `none` |
| `--caomei-time-picker-padding-inline` | `--caomei-space-2` | 字段行内内边距 |
| `--caomei-time-picker-border` | `--caomei-color-border` | 边框颜色 |
| `--caomei-time-picker-radius` | `--caomei-radius-md` | 圆角 |
| `--caomei-time-picker-bg` | `--caomei-color-bg` | 背景色 |
| `--caomei-time-picker-color` | `--caomei-color-text` | 文本颜色 |

## 从 PrimeVue 迁移

| PrimeVue `DatePicker`（`timeOnly`） | 本组件 |
| --- | --- |
| `timeOnly` + `hourFormat` | 独立 `TimePicker`；`hourFormat` 同名（`'12'` / `'24'`），不再需要 `timeOnly` 开关 |
| `showSeconds` | 同名 |
| `stepMinute` / `stepHour` / `stepSecond` | 合并为 `step` 对象 |
| `minDate` / `maxDate` | `minValue` / `maxValue`（只比较时间部分） |
| `v-model` 为 `Date` | 同名 `Date \| null` |
| 面板式选择 | 内联三段输入，无弹层 |

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="time-picker" />
