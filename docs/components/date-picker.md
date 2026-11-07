# DatePicker 日期选择器

由触发按钮与日历面板组合的日期选择器：点击触发器展开日历，选中后按 `dateFormat` 展示。对外统一使用原生 `Date`；`selectionMode="range"` 时为 `[Date, Date]` 闭区间。

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

## 范围选择

设置 `selectionMode="range"` 后改为选择日期区间，`v-model` 为 `[Date, Date]`（开始、结束）；未选择时为 `null`。依次点击起点与终点即完成选择，`closeOnSelect`（默认 `true`）在两端齐全后收起面板。只选到起点时不会写回模型（半开区间不对外），面板内可继续选择终点。清空行为分三种情形：已有完整区间时点击任意日期会以该日为起点重新开始（触发器仍显示旧区间，直到选完终点）；区间为同一天（`[d, d]`）时再次点击该日取消并写回 `null`；`preventDeselect` 为真时不清空。

<demo
    vue="../examples/date-picker/range.vue"
    ssg="true"
/>

- `dateFormat` 同时作用于两端，展示形式为 `开始 – 结束`（分隔符固定为 ` – `）；`minValue` / `maxValue` 对两端分别生效。
- `selectionMode` 是运行期 prop，`v-model` 的静态类型为 `Date | [Date, Date] | null`；单日期用法请把绑定值**放宽**为该联合（而不是仅 `Date | null`），否则类型检查会在回写时失败。
- **不支持** `showTime` / `showSeconds` / `hourFormat`：区间只承载日期；同时传入 `showTime` 时忽略时间层并给出开发期告警。需要时间范围时请并列两个单日期选择器。
- `multiple` 未实现（无下游用例）。

## 状态与行为

- `disabled` / `readonly` / `invalid` / `size` 与 Input 家族一致。
- 宽度：默认 `width: 100%`，并由 `--caomei-date-picker-max-width` 设可覆盖的 `max-width`（未覆盖时回退 `--caomei-select-max-width`，默认 `20rem`；见[主题与样式设计 §4.1](../design/theming.md)）。需要撑满所在列时在同一元素或其祖先上把该变量覆盖为 `none`。
- `minValue` / `maxValue` 限制可选日期；`closeOnSelect`（默认 `true`）控制选中后是否收起。
- 展开状态支持 `v-model:open` 受控；`showIcon` 控制是否显示日历图标。
- `locale` 控制日历与日期的语言，默认取组件库默认语言（`zh-CN`）；它与注入的内建文案语言相互独立，需要一致时请显式传入。

触摸设备上可在祖先元素设置 `data-density="touch"`，统一放大该子树内的控件高度、字号与内容型宽度上限；密度轴与 `size` 档位正交，详见[触摸密度轴](../guide/mobile.md#触摸密度轴与尺寸覆盖)。

## 无障碍

- 触发器为 `button`，带 `aria-expanded` 表达展开状态；可访问名优先级为 `label` > 透传 `aria-label` > 当前语言的「日期」（单日期）/「日期范围」（区间），三者都不可用时（已有可见日期文本或占位符）不附加 `aria-label`。
- 区间模式已选、且未显式提供 `label` 与透传 `aria-label` 时，不输出 `aria-label`，名称由可见区间文本 + 触发器内隐藏文本「（开始 / 结束）」组成（满足 Label in Name）；显式 `label` / 透传 `aria-label` 仍按上一条优先级优先。
- `class` / `style` / `id` / `data-*` / `title` 等原生属性落在触发器 `<button>` 上，便于外部布局与 `<label for>` 关联；`aria-label` 由 `label` prop 与透传 `aria-label` 共同决定（见上一条），`aria-invalid` 由 `invalid` 管理，`type` 固定为 `button`。
- 面板内日历继承 [Calendar](./calendar.md) 的键盘与无障碍行为；Esc 关闭面板。区间面板的起止日期分别输出 `data-selection-start` / `data-selection-end`，区间内日期以浅色带标示。
- `invalid` 时输出 `aria-invalid="true"`。

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
| `selection-mode="range"` | `selectionMode="range"`；`v-model` 改为 `[Date, Date]`（`null` 表示未选择）。`multiple` 未实现 |
| `manual-input="false"` | 无需映射：本组件固定为「触发按钮 + 面板」，不支持手工键入 |
| `minDate` / `maxDate` | `minValue` / `maxValue` |
| `dateFormat` | `dateFormat`（PrimeVue 风格 token，缺省按 `locale` 输出本地化短日期） |
| `showIcon` / `iconDisplay="input"` | `showIcon`（本组件默认即「触发按钮 + 面板」形态） |
| `showTime` / `hourFormat` / `showSeconds` | 同名 |
| `disabled` / `readonly` / `invalid` / `placeholder` | 同名 |
| `locale`（PrimeVue 侧为**全局 config**，非组件 prop） | `locale`（本组件为 prop，仅控制日期 / 日历语言） |
| `fluid` | 删除：默认带 `20rem` 上限，需要真正全宽时覆盖 `--caomei-date-picker-max-width` 为 `none`（见[主题与样式 §4.1](../design/theming.md)） |
| `inputId` | `id`；`aria-label` → `label` |

**已知差异（有意）**：PrimeVue 的 `Calendar` 是可键入的 input，本组件为「触发按钮 + 面板」，**不支持手工键入日期**（迁移前需确认无键入依赖）；`locale` 仅控制日期 / 日历语言，与内建文案语言相互独立，需要一致时显式传入；区间模式的 `v-model` 静态类型为 `Date | [Date, Date] | null`，从 PrimeVue 迁入的单日期页面需把绑定类型**放宽**为该联合。

**未实现**：`selectionMode` 的 `multiple` 取值（无下游用例，未立候选）、`numberOfMonths`、`view`、`showOtherMonths` / `selectOtherMonths`、`disabledDates` / `disabledDays`、`showButtonBar` / `today` 等按钮栏、`responsiveOptions` / `breakpoint`、`timeOnly` / `stepHour` 等时间步进、`appendTo` 与面板样式透传；`range` 与 `showTime` 不可同时使用（见「范围选择」）。

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="date-picker" />
