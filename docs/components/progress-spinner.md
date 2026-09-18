# ProgressSpinner 加载指示

加载指示器用于表示正在进行的异步操作，基于 Reka UI Progress 封装（不确定进度）。

## 基础用法

<demo
    vue="../examples/progress-spinner/basic.vue"
    ssg="true"
/>

## 尺寸

通过 `size` 切换尺寸，支持 `sm` / `md` / `lg`。

<demo
    vue="../examples/progress-spinner/sizes.vue"
    ssg="true"
/>

## 轨道宽度

`strokeWidth` 控制圆环粗细：数字按 px 处理（`4` → `4px`）；纯数字字符串同样按 px（`"4"` → `4px`，对齐 PrimeVue 的写法），两者均要求 `0 ≤ 值 ≤ 1000`；其余字符串须为合法 `border-width`（`<length>` 或 `thin` / `medium` / `thick`，`%` 与复合值非法）并原样使用。未提供或值非法时按 `size` 档位回退（`sm` / `md` 为 `2px`、`lg` 为 `3px`），提供后所有尺寸共用该值。

<demo
    vue="../examples/progress-spinner/stroke.vue"
    ssg="true"
/>

> 与 PrimeVue 的语义差异：其 `strokeWidth` 是 **SVG 用户单位**（随渲染尺寸等比缩放），本库是**不随组件尺寸缩放**的 CSS 长度——迁移时按目标视觉粗细折算为 px / rem。`strokeWidth` 以内联变量实现，优先级高于 CSS 变量 `--caomei-progress-spinner-stroke`。

## 可访问名与颜色

`label` 提供可访问名（默认取当前语言的「加载中」）；颜色与轨道可用 CSS 变量覆盖。

<demo
    vue="../examples/progress-spinner/states.vue"
    ssg="true"
/>

## 无障碍

- 根节点为 `role="progressbar"`；不确定进度下不输出 `aria-valuenow`。
- 可访问名优先级为 `label` > 透传 `aria-label` > 当前语言「加载中」；未提供 `label`（或传空串）时透传值生效；相邻可见文本建议与 `label` 保持一致。
- 遵循 `prefers-reduced-motion`：减弱动画时放慢旋转而非停止（保留运动以表达进行中）。使用方全局的 reduced-motion 规则（如 VitePress 默认主题的 `* { animation-duration: 1ms !important }`）可能完全停用动画；文档站已就地恢复该减速旋转以保证演示可见。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-progress-spinner-size` | 由 `size` 档位决定 | 尺寸（sm 16 / md 24 / lg 32） |
| `--caomei-progress-spinner-stroke` | 由 `size` 档位决定 | 轨道宽度（sm / md 2px，lg 3px）；`strokeWidth` prop 以内联同名变量覆盖，优先级更高 |
| `--caomei-progress-spinner-color` | `--caomei-color-primary` | 指示色 |
| `--caomei-progress-spinner-track` | `--caomei-color-border` | 轨道色 |

```css
.caomei-progress-spinner {
    --caomei-progress-spinner-color: #16a34a;
    --caomei-progress-spinner-track: #d1fae5;
}
```

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| 经 `style` 传宽高（任意 px） | `size` 档位（`sm` / `md` / `lg` ＝ 16 / 24 / 32px）或覆盖 `--caomei-progress-spinner-size` |
| `strokeWidth` | `strokeWidth`（数字与纯数字字符串按 px，其余须为合法 `border-width`）；未提供或非法时按 `size` 档位回退 2 / 2 / 3px。**语义差异**：PrimeVue 为 SVG 用户单位（随尺寸缩放），本库为不随组件尺寸缩放的 CSS 长度 |
| `fill`（圆背景色） | 未实现：轨道颜色经 `--caomei-progress-spinner-track` |
| `animationDuration` | 未实现：固定 `0.6s`，`prefers-reduced-motion` 下 `1.6s` |
| 无 | `label`（可访问名；未提供时回退内建「加载中」文案）为本库新增 |

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="progress-spinner" />
