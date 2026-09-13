# ProgressBar 进度条

进度条用于展示确定的进度值或不确定的等待状态，基于 Reka UI Progress 封装，与 ProgressSpinner 同源。

## 基础用法

通过 `value` 传入当前进度（`0` ~ `max`，默认 `max` 为 `100`）；`max` 可自定义量程。越界的 `value` 会被收窄到合法区间；非正或非有限的 `max` 会回退为默认值 `100`。

<demo
    vue="../examples/progress-bar/basic.vue"
    ssg="true"
/>

## 状态

- 确定进度：`value` 为数字，`data-state` 为 `loading`；当 `value === max` 时为 `complete`。
- 不确定进度：`value` 为 `null`（或未传）时为 `indeterminate`，显示循环动画。

<demo
    vue="../examples/progress-bar/states.vue"
    ssg="true"
/>

## 尺寸

通过 `size` 切换高度，支持 `sm` / `md` / `lg`。

<demo
    vue="../examples/progress-bar/sizes.vue"
    ssg="true"
/>

## 无障碍

- 渲染为 `role="progressbar"`，确定进度输出 `aria-valuenow` / `aria-valuemin` / `aria-valuemax`；不确定进度不输出 `aria-valuenow`。
- 可访问名默认取当前语言的「进度」文案，可用 `label` 覆盖；`label` 优先级高于透传的 `aria-label`。
- 不确定进度的循环动画遵循 `prefers-reduced-motion`（降速而非移除）。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-progress-bar-width` | `100%` | 进度条宽度 |
| `--caomei-progress-bar-height` | 由 `size` 档位决定 | 进度条高度（sm 4 / md 8 / lg 12） |
| `--caomei-progress-bar-radius` | `999px` | 圆角 |
| `--caomei-progress-bar-track` | `--caomei-color-border` | 轨道背景色 |
| `--caomei-progress-bar-color` | `--caomei-color-primary` | 进度指示色 |

```css
.caomei-progress-bar {
    --caomei-progress-bar-color: #16a34a;
    --caomei-progress-bar-height: 10px;
}
```

<ComponentApi name="progress-bar" />
