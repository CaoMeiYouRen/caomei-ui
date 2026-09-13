# RadioGroup 单选组

单选组用于在一组互斥选项中选择一项，基于 Reka UI RadioGroup 封装，由 `CaomeiRadioGroup` 与 `CaomeiRadioButton` 组合使用。

## 基础用法

`CaomeiRadioGroup` 通过 `v-model` 双向绑定选中值（`string | number`），`CaomeiRadioButton` 的 `value` 为该项的值，`text` 提供可见标签。

<demo
    vue="../examples/radio-group/basic.vue"
    ssg="true"
/>

## 状态

- `disabled` 可禁用单项（置于 `CaomeiRadioButton`）或整组（置于 `CaomeiRadioGroup`）。
- `invalid` 标记整组校验失败，映射 `aria-invalid`，并将未选中项描边改为危险色。

<demo
    vue="../examples/radio-group/states.vue"
    ssg="true"
/>

## 排列方向

默认垂直排列；`orientation="horizontal"` 切换为水平排列。

<demo
    vue="../examples/radio-group/horizontal.vue"
    ssg="true"
/>

## 尺寸

通过 `size` 切换尺寸，支持 `sm` / `md` / `lg`。

<demo
    vue="../examples/radio-group/sizes.vue"
    ssg="true"
/>

## 表单集成

提供 `name` 后，位于 `<form>` 内时会随原生表单提交；Reka UI 会输出一个携带当前选中值的隐藏输入，`required` 参与原生校验。

```vue
<form>
  <CaomeiRadioGroup v-model="plan" name="plan" required label="订阅方案">
    <CaomeiRadioButton value="free" text="免费版" />
    <CaomeiRadioButton value="pro" text="专业版" />
  </CaomeiRadioGroup>
  <button type="submit">提交</button>
</form>
```

## 无障碍

- 组容器渲染为 `role="radiogroup"`，输出 `aria-orientation` 与 `aria-required`。
- 每个条目渲染为 `role="radio"` 的按钮，`aria-checked` 输出 `true` / `false`。
- 键盘支持：方向键在组内移动并选中（垂直组用 ↑ / ↓，水平组用 ← / →；默认首尾循环），空格选中当前项。
- 组的可访问名用 `label`（映射 `aria-label`）提供；也可用外部 `<fieldset>` + `<legend>` 或 `aria-labelledby` 关联可见分组标题。
- 条目的可见文本即其可访问名；图标等无可见文本场景用 `label` 提供可访问名。
- 聚焦时显示 `:focus-visible` 描边，并遵循 `prefers-reduced-motion`。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-radio-group-gap` | `--caomei-space-2` | 组内条目间距 |
| `--caomei-radio-size` | 由 `size` 档位决定 | 指示器直径（sm 16 / md 18 / lg 20） |
| `--caomei-radio-gap` | `--caomei-space-2` | 指示器与标签间距 |
| `--caomei-radio-bg` | `--caomei-color-bg` | 未选中指示器背景色 |
| `--caomei-radio-border` | `--caomei-color-border` | 未选中指示器描边色（`invalid` 时为 `--caomei-color-danger`） |
| `--caomei-radio-active-bg` | `--caomei-color-primary` | 选中指示器背景与描边色 |
| `--caomei-radio-dot` | `--caomei-color-primary-foreground` | 选中圆点颜色 |
| `--caomei-radio-focus` | `--caomei-color-primary` | 聚焦描边色（`invalid` 时为 `--caomei-color-danger`） |

```css
.caomei-radio-group {
    --caomei-radio-active-bg: #16a34a;
    --caomei-radio-dot: #fff;
}
```

## CaomeiRadioButton 属性

`CaomeiRadioButton` 为组内子件，须置于 `CaomeiRadioGroup` 内；其属性如下：

| 属性 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `value` | `string \| number` | — | 该项的值，同一组内需唯一（必填） |
| `disabled` | `boolean` | `false` | 是否禁用该选项 |
| `text` | `string` | `''` | 可见标签文本（也可用默认插槽自定义） |
| `label` | `string` | `''` | 无可见文本时的可访问名，映射 `aria-label` |
| `id` | `string` | 自动生成 | 关联外部 label 的 id |

<ComponentApi name="radio-group" />
