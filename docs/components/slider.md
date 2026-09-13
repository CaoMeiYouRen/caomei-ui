# Slider 滑块

滑块用于在数值区间内拖动选择单个或多个值，基于 Reka UI Slider 封装。

## 基础用法

`v-model` 绑定数字表示单滑块；`label` 提供无可见标题时的可访问名。

<demo
    vue="../examples/slider/basic.vue"
    ssg="true"
/>

## 范围选择

`v-model` 绑定数组时渲染多个滑块（数组长度即滑块数量）；`thumb-labels` 按顺序为各滑块提供可访问名，缺省用内建文案（单滑块「滑块」，双滑块「最小值 / 最大值」）。

<demo
    vue="../examples/slider/range.vue"
    ssg="true"
/>

## 方向

`orientation="vertical"` 切换为垂直滑块。

<demo
    vue="../examples/slider/vertical.vue"
    ssg="true"
/>

## 步进与状态

通过 `min` / `max` / `step` 约束取值；`disabled` 禁用交互。`minStepsBetweenThumbs` 可约束范围滑块相邻滑块的最小间隔。

<demo
    vue="../examples/slider/states.vue"
    ssg="true"
/>

## 表单集成

提供 `name` 后，位于 `<form>` 内时会随原生表单提交。Reka UI 以数组形式提交，字段名为 `name[0]`（范围滑块依次为 `name[0]`、`name[1]`），`required` 参与原生校验。

```vue
<form>
  <CaomeiSlider v-model="volume" name="volume" label="音量" required />
  <button type="submit">提交</button>
</form>
```

## 无障碍

- 每个滑块渲染为 `role="slider"` 的可聚焦元素，输出 `aria-valuenow` / `aria-valuemin` / `aria-valuemax` 与 `aria-orientation`。
- 可访问名：单滑块用 `label`，范围滑块用 `thumb-labels`；缺省回退到内建文案。
- 键盘支持：方向键 / `PageUp` / `PageDown` 调整数值（`Shift` 或翻页键加速），`Home` / `End` 跳到最小值 / 最大值。
- `disabled` 时滑块不可聚焦，并设置 `aria-disabled`。
- 描述性属性 `aria-describedby` / `aria-labelledby` 会透传到每个滑块。
- 聚焦时显示 `:focus-visible` 描边。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-slider-width` | `100%` | 水平滑块宽度 |
| `--caomei-slider-min-width` | `120px` | 水平滑块最小宽度 |
| `--caomei-slider-height` | `10rem` | 垂直滑块高度 |
| `--caomei-slider-track-height` | `6px` | 轨道粗细 |
| `--caomei-slider-track-radius` | `999px` | 轨道圆角 |
| `--caomei-slider-track-bg` | `--caomei-color-border` | 轨道背景色 |
| `--caomei-slider-range-bg` | `--caomei-color-primary` | 已选区间背景色 |
| `--caomei-slider-thumb-size` | `18px` | 滑块尺寸 |
| `--caomei-slider-thumb-bg` | `--caomei-color-bg` | 滑块背景色 |
| `--caomei-slider-thumb-border` | `--caomei-color-primary` | 滑块描边色 |
| `--caomei-slider-thumb-shadow` | `0 1px 2px rgb(0 0 0 / 20%)` | 滑块阴影 |
| `--caomei-slider-focus` | `--caomei-color-primary` | 聚焦描边色 |

```css
.caomei-slider {
    --caomei-slider-range-bg: #16a34a;
    --caomei-slider-thumb-border: #16a34a;
    --caomei-slider-thumb-size: 22px;
}
```

<ComponentApi name="slider" />
