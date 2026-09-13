# ToggleButton 开关按钮

开关按钮用于在单个按钮上切换按下 / 未按下状态（如工具条中的加粗、斜体），基于 Reka UI Toggle 封装。

## 基础用法

`v-model` 双向绑定按下态（`boolean`）；无可见文本时应通过 `label` 提供可访问名。

<demo
    vue="../examples/toggle-button/basic.vue"
    ssg="true"
/>

## 图标用法

仅图标时用 `label` 提供可访问名。

<demo
    vue="../examples/toggle-button/icon.vue"
    ssg="true"
/>

## 尺寸

通过 `size` 切换尺寸，支持 `sm` / `md` / `lg`。

<demo
    vue="../examples/toggle-button/sizes.vue"
    ssg="true"
/>

## 状态

按下态由 `v-model` 决定；`disabled` 禁用交互。

<demo
    vue="../examples/toggle-button/states.vue"
    ssg="true"
/>

## 无障碍

- 控件渲染为原生 `<button>`（隐式 button 角色），`aria-pressed` 输出 `true` / `false`。
- 支持键盘聚焦与空格 / 回车切换。
- 可见文本即其可访问名；仅图标时用 `label` 提供可访问名（映射 `aria-label`）。
- 同时提供可见文本与 `label` 时，`label` 应包含或等于可见文本，避免可访问名与可见文案分叉（WCAG 2.5.3）。
- 聚焦时显示 `:focus-visible` 描边，并遵循 `prefers-reduced-motion`。

## 表单集成

本组件不提供原生表单提交能力（Reka UI Toggle 在表单内生成的隐藏输入语义不完整）；需要参与表单提交的开关请使用 Switch 或 Checkbox。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-toggle-button-gap` | `--caomei-space-1` | 图标与文本间距 |
| `--caomei-toggle-button-radius` | `--caomei-radius-md` | 圆角 |
| `--caomei-toggle-button-height` | 由 `size` 档位决定 | 高度（sm 28 / md 36 / lg 44） |
| `--caomei-toggle-button-padding-x` | 由 `size` 档位决定 | 水平内边距（sm 8 / md 12 / lg 16） |
| `--caomei-toggle-button-padding-y` | `0` | 垂直内边距 |
| `--caomei-toggle-button-font-size` | 由 `size` 档位决定 | 字号（sm 12 / md 14 / lg 16） |
| `--caomei-toggle-button-active-bg` | `--caomei-color-primary` | 按下态背景与描边色 |
| `--caomei-toggle-button-active-color` | `--caomei-color-primary-foreground` | 按下态文字色 |

> 档位派生变量（`height` / `padding-x` / `font-size`）由组件在自身元素上声明，需在 `.caomei-toggle-button` 元素本身上覆盖，写在 `:root` 等祖先层不会生效。

```css
.caomei-toggle-button {
    --caomei-toggle-button-active-bg: #16a34a;
    --caomei-toggle-button-radius: 999px;
}
```

<ComponentApi name="toggle-button" />
