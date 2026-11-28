# Picker 滚轮选择器

通用滚轮选择器：单列或多列选项在固定高度区域内滚动，停下即吸附到最近项。与 `TimePicker` 的 wheel 模式**共用同一份滚轮交互**（吸附、动量收敛、方向键、程序化对齐），只是数据换成任意选项。

## 基础用法

`v-model` 是数组，长度与 `columns` 对齐；单列时就是长度为 1 的数组。未选择时各列回退到自己的首项，但**不写入模型**——只有用户交互才回写。

<demo
    vue="../examples/picker/basic.vue"
    ssg="true"
/>

## 多列与循环

多列各自独立滚动（不做级联重置）；`loop` 开启后方向键与点击在首末项之间回绕。

<demo
    vue="../examples/picker/multi.vue"
    ssg="true"
/>

## 交互与无障碍

- **吸附与动量**：`scroll-snap-type: y mandatory` 负责视觉吸附；逻辑在滚动停止 140ms 后按 `scrollTop / 行高` 四舍五入取最近项，触屏惯性滚动同样走这条路径。
- **程序化对齐**：模型变化时把选中项滚到中央，随后 200ms 内的滚动事件被忽略，避免「对齐」被当成用户选择。
- **循环的边界**：`loop` 只作用于**键盘与点击**（首尾相接）；滚动不做无限循环——无限滚动需要在首尾复制多份选项，会让 `scrollTop` 与当前项语义脱耦，故作此取舍。
- **键盘**：每列是 `role="listbox"`、单一 Tab 停靠点；`↑` / `↓` 逐项、`PageUp` / `PageDown` 跨 5 项、`Home` / `End` 到首末项。
- **禁用与只读**：`disabled` / `readonly` 时不响应滚动落点判定、键盘与点击。
- **行高契约**：`itemHeight`（默认 36）必须与样式行高一致（`--caomei-picker-item-height` 同步取自该 prop），否则落点判定会累积偏移。

## 属性

| 组件 | 主要 props |
|------|------|
| `CaomeiPicker` | `v-model`、`columns`、`disabled`、`readonly`、`loop`、`itemHeight`、`visibleCount`、`label` |
| `CaomeiPickerColumn` | `options`、`modelValue`、`label`、`disabled`、`readonly`、`loop`、`itemHeight`、`visibleCount` |

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-picker-border` | `--caomei-color-border` | 整组描边 |
| `--caomei-picker-bg` | `--caomei-color-bg` | 整组底色 |
| `--caomei-picker-column-width` | `6rem` | 单列宽度 |
| `--caomei-picker-item-height` | 由 `itemHeight` 派生 | 行高，须与 prop 一致 |

<ComponentApi name="picker" />
