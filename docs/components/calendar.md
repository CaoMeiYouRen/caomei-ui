# Calendar 日历

月历选择组件（封装 Reka UI Calendar primitive），用于在页面内直接选择日期。对外统一使用原生 `Date`。

## 基础用法

通过 `v-model` 双向绑定；未选中时为 `null`。

<demo
    vue="../examples/calendar/basic.vue"
    ssg="true"
/>

## 选择范围

`minValue` / `maxValue` 限制可选日期，范围外的日期渲染为禁用态；`defaultValue` 用于非受控初始值（首次渲染的预选日期）。

<demo
    vue="../examples/calendar/min-max.vue"
    ssg="true"
/>

## 展示与行为

- `locale` 控制月份 / 星期文案与日期格式，默认取组件库默认语言（`zh-CN`）；它与注入的内建文案语言相互独立，需要一致时请显式传入。
- `weekStartsOn` 指定每周起始日（0 为周日）；`weekdayFormat` 取 `narrow` / `short` / `long`。
- `fixedWeeks` 固定 6 行，避免月份切换时高度跳动；`preventDeselect` 禁止再次点击取消选中。
- `disabled` 禁用整体；`readonly` 可聚焦但不可改值。

## 无障碍

- 键盘可达：方向键切换日期、Enter / Space 选中。
- 翻页按钮的可访问名取当前语言的「上个月 / 下个月」，可经 locale 注入切换。
- 日历容器的可访问名优先级为 `label` > 透传 `aria-label` > 当前语言的「日历」；未显式提供时保留 Reka 合成的月份上下文（`日历, <月份>`）。

<ComponentApi name="calendar" />
