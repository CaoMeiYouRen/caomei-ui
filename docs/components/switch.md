# Switch 开关

开关用于切换单个选项的开启 / 关闭状态，基于 Reka UI Switch 封装。

## 基础用法

通过 `v-model` 双向绑定开关状态（`boolean`）。无可见标签时应通过 `label` 提供可访问名。

<demo
    vue="../examples/switch/basic.vue"
    ssg="true"
/>

## 状态

`disabled` 禁用开关；开启 / 关闭态由 `modelValue` 决定。

<demo
    vue="../examples/switch/states.vue"
    ssg="true"
/>

## 表单集成

提供 `name` 后，位于 `<form>` 内时会随原生表单提交；`value` 为提交值（默认 `'on'`），`required` 参与原生校验。

```vue
<form>
  <CaomeiSwitch v-model="notify" name="notify" value="yes" required label="推送通知" />
  <button type="submit">提交</button>
</form>
```

## 事件

- `update:modelValue`：随 `v-model` 使用，值由父级驱动。
- `change`：**仅用户交互**（点击 / 键盘切换）时触发，载荷为切换后的布尔值；父级程序化改 `modelValue` 不触发。

> PrimeVue 的 `change` 载荷是原生事件对象，本库改为直接给出布尔值；下游只做「切换后刷新」而不读取载荷时可原样迁移。

## 无障碍

- 控件基于 Reka UI 渲染为 `role="switch"` 的按钮，`aria-checked` 输出 `true` / `false`，支持键盘聚焦与切换。
- `required` 映射 `aria-required`。
- 无可见标签时用 `label` 提供可访问名（映射 `aria-label`）；也可用外部 `<label :for="id">` 关联，Reka 会在缺少 `aria-label` 时读取该 label 文本推导可访问名。
- `id` 仅用于关联外部 label，不会自动生成（与 Checkbox 的 `id` 语义不同，Checkbox 缺省会自动生成）。
- 同时提供可见文本与 `label` 时，`label` 应包含或等于可见文本，避免可访问名与可见文案分叉（WCAG 2.5.3）。
- 键盘聚焦时显示 `:focus-visible` 描边，并遵循 `prefers-reduced-motion`。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-switch-width` | `40px` | 开关宽度 |
| `--caomei-switch-height` | `22px` | 开关高度 |
| `--caomei-switch-radius` | `999px` | 轨道圆角 |
| `--caomei-switch-bg` | `--caomei-color-border` | 未开启轨道背景色 |
| `--caomei-switch-border` | `--caomei-color-border` | 未开启轨道描边色 |
| `--caomei-switch-active-bg` | `--caomei-color-primary` | 开启态轨道背景与描边色 |
| `--caomei-switch-thumb-size` | `16px` | 滑块尺寸 |
| `--caomei-switch-thumb-bg` | `--caomei-color-bg` | 滑块背景色 |
| `--caomei-switch-thumb-travel` | `18px` | 开启态滑块水平位移 |

> 覆盖 `--caomei-switch-width` / `--caomei-switch-height` 时，请同步调整 `--caomei-switch-thumb-size` 与 `--caomei-switch-thumb-travel` 以保持对齐。

```css
.caomei-switch {
    --caomei-switch-active-bg: #16a34a;
    --caomei-switch-width: 48px;
    --caomei-switch-thumb-travel: 26px;
}
```

<ComponentApi name="switch" />
