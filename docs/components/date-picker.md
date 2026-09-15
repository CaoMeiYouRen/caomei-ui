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

## 状态与行为

- `disabled` / `readonly` / `invalid` / `size` 与 Input 家族一致。
- `minValue` / `maxValue` 限制可选日期；`closeOnSelect`（默认 `true`）控制选中后是否收起。
- 展开状态支持 `v-model:open` 受控；`showIcon` 控制是否显示日历图标。
- `locale` 控制日历与日期的语言，默认取组件库默认语言（`zh-CN`）；它与注入的内建文案语言相互独立，需要一致时请显式传入。

## 无障碍

- 触发器为 `button`，带 `aria-expanded` 表达展开状态；无可见文本（日期 / 占位符）时使用 `label` 或当前语言的「日期」作为可访问名。
- `class` / `style` / `id` / `data-*` / `title` 等原生属性落在触发器 `<button>` 上，便于外部布局与 `<label for>` 关联；`aria-label` 由 `label` prop 管理（未传 `label` 且有可见文本时不附加），`aria-invalid` 由 `invalid` 管理，`type` 固定为 `button`。
- 面板内日历继承 [Calendar](./calendar.md) 的键盘与无障碍行为；Esc 关闭面板。
- `invalid` 时输出 `aria-invalid="true"`。

> 迁移映射：PrimeVue `show-icon` → `showIcon`；`icon-display="input"` 对应本组件默认（图标在触发器内）；`date-format` → `dateFormat`；`fluid` 默认全宽，迁移时删除。

<ComponentApi name="date-picker" />
