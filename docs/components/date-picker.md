# DatePicker 日期选择器

由触发按钮与日历面板组合的日期选择器：点击触发器展开日历，选中后按 `dateFormat` 展示。对外统一使用原生 `Date`。

## 基础用法

通过 `v-model` 双向绑定；未选择时展示 `placeholder`。

<demo
    vue="../examples/date-picker/basic.vue"
    ssg="true"
/>

## 展示格式

`dateFormat` 支持 PrimeVue 风格 token：`yyyy` / `yy` 年、`mm` / `m` 月（数字）、`MM` / `M` 月名、`dd` / `d` 日、`DD` / `D` 星期名。未提供时按 `locale` 输出本地化短日期。

<demo
    vue="../examples/date-picker/format.vue"
    ssg="true"
/>

## 时间选择

设置 `showTime` 后在面板底部显示时间输入（时 / 分）；`hourFormat` 切换 `12` / `24` 小时制，`showSeconds` 精确到秒。含时间选择时选中日期不会自动收起面板，便于继续选时间；未选择日期时时间输入为禁用（先选日期再选时间）；时间文案随 `locale` 变化。

<demo
    vue="../examples/date-picker/datetime.vue"
    ssg="true"
/>

## 状态与行为

- `disabled` / `readonly` / `invalid` / `size` 与 Input 家族一致。
- 宽度：默认 `width: 100%`，并由 `--caomei-date-picker-max-width` 设可覆盖的 `max-width`（未覆盖时回退 `--caomei-select-max-width`，默认 `20rem`；见[主题与样式设计 §4.1](../design/theming.md)）。需要撑满所在列时在同一元素或其祖先上把该变量覆盖为 `none`。
- `minValue` / `maxValue` 限制可选日期；`closeOnSelect`（默认 `true`）控制选中后是否收起。
- 展开状态支持 `v-model:open` 受控；`showIcon` 控制是否显示日历图标。
- `locale` 控制日历与日期的语言，默认取组件库默认语言（`zh-CN`）；它与注入的内建文案语言相互独立，需要一致时请显式传入。

## 无障碍

- 触发器为 `button`，带 `aria-expanded` 表达展开状态；可访问名优先级为 `label` > 透传 `aria-label` > 当前语言的「日期」，三者都不可用时（已有可见日期文本或占位符）不附加 `aria-label`。
- `class` / `style` / `id` / `data-*` / `title` 等原生属性落在触发器 `<button>` 上，便于外部布局与 `<label for>` 关联；`aria-label` 由 `label` prop 与透传 `aria-label` 共同决定（见上一条），`aria-invalid` 由 `invalid` 管理，`type` 固定为 `button`。
- 面板内日历继承 [Calendar](./calendar.md) 的键盘与无障碍行为；Esc 关闭面板。
- `invalid` 时输出 `aria-invalid="true"`。

> 迁移映射：PrimeVue `show-icon` → `showIcon`；`icon-display="input"` 对应本组件默认（图标在触发器内）；`date-format` → `dateFormat`；`show-time` → `showTime`；`hour-format` → `hourFormat`；`show-seconds` → `showSeconds`；`fluid`（撑满容器宽度）迁移时删除，需要真正全宽时把 `--caomei-date-picker-max-width` 覆盖为 `none`（本组件默认带 `20rem` 上限）。范围选择（`selection-mode`）未实现：momei 零用量，经用户决策延后，见 [Backlog](../plan/backlog.md) §1.1。

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-date-picker-max-width` | `--caomei-select-max-width` | 触发器最大宽度 |

```css
.caomei-date-picker {
    --caomei-date-picker-max-width: none;
}
```

## 从 PrimeVue 迁移

PrimeVue v4 用单个 `DatePicker`（`Calendar` 为其历史别名）同时承载内联与输入形态；本库输入形态为 `CaomeiDatePicker`（触发器 + 面板），内联日历见 `CaomeiCalendar`。

| PrimeVue | 本组件 |
| --- | --- |
| `modelValue`（`Date`） | `v-model`（原生 `Date`，语义一致） |
| `minDate` / `maxDate` | `minValue` / `maxValue` |
| `dateFormat` | `dateFormat`（PrimeVue 风格 token，缺省按 `locale` 输出本地化短日期） |
| `showIcon` / `iconDisplay="input"` | `showIcon`（本组件默认即「触发按钮 + 面板」形态） |
| `showTime` / `hourFormat` / `showSeconds` | 同名 |
| `disabled` / `readonly` / `invalid` / `placeholder` | 同名 |
| `locale`（PrimeVue 侧为**全局 config**，非组件 prop） | `locale`（本组件为 prop，仅控制日期 / 日历语言） |
| `fluid` | 删除：默认带 `20rem` 上限，需要真正全宽时覆盖 `--caomei-date-picker-max-width` 为 `none`（见[主题与样式 §4.1](../design/theming.md)） |
| `inputId` | `id`；`aria-label` → `label` |

**已知差异（有意）**：PrimeVue 的 `Calendar` 是可键入的 input，本组件为「触发按钮 + 面板」，**不支持手工键入日期**（迁移前需确认无键入依赖）；`locale` 仅控制日期 / 日历语言，与内建文案语言相互独立，需要一致时显式传入。

**未实现**：`selectionMode`（`multiple` / `range` 多选与范围，见 §7 与 [Backlog](../plan/backlog.md)）、`numberOfMonths`、`view`、`showOtherMonths` / `selectOtherMonths`、`disabledDates` / `disabledDays`、`showButtonBar` / `today` 等按钮栏、`responsiveOptions` / `breakpoint`、`timeOnly` / `stepHour` 等时间步进、`appendTo` 与面板样式透传。

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="date-picker" />
