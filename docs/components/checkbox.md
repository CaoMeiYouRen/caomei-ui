# Checkbox 复选框

复选框用于在多个选项中选择若干项，或表示单个布尔开关，基于 Reka UI Checkbox 封装。

## 基础用法

通过 `v-model` 双向绑定选中状态（`boolean`），`text` 提供可见标签，也可用默认插槽自定义标签内容。

<demo
    vue="../examples/checkbox/basic.vue"
    ssg="true"
/>

## 状态

- `modelValue` 为 `'indeterminate'` 时表示半选，映射 `aria-checked="mixed"`；点击后变为选中。
- `disabled` 禁用、`invalid` 标记校验失败（映射 `aria-invalid`）。

<demo
    vue="../examples/checkbox/states.vue"
    ssg="true"
/>

## 尺寸

通过 `size` 切换尺寸，支持 `sm` / `md` / `lg`。

<demo
    vue="../examples/checkbox/sizes.vue"
    ssg="true"
/>

## 多选组合

`v-model` 传数组、并用 `value` 标识成员时进入分组语义：点击按 `value` 增删该数组（对齐 PrimeVue）。同组复选框共享同一个数组模型即可，无需再手工维护包含关系。

<demo
    vue="../examples/checkbox/group.vue"
    ssg="true"
/>

> 数组模型下必须提供 `value`，否则点击不改写模型。需要分组容器（分组可访问语义、整体 `name` 提交、全选 / 半选）时改用 [CheckboxGroup](./checkbox-group.md)。

## 表单集成

提供 `name` 后，位于 `<form>` 内时会随原生表单提交；`value` 为提交值（默认 `'on'`），`required` 参与原生校验。

```vue
<form>
  <CaomeiCheckbox v-model="agree" name="agree" value="yes" required text="同意条款" />
  <button type="submit">提交</button>
</form>
```

> 数组模型下每个复选框按自身 `name` 提交一个值（同组共用同名 `name` 即为多值提交）；需要分组整体提交数组或全选能力时改用 [CheckboxGroup](./checkbox-group.md)。

## 无障碍

- 控件基于 Reka UI 渲染为 `role="checkbox"` 的按钮，支持键盘聚焦与空格切换。
- `aria-checked` 输出 `true` / `false` / `mixed`；`required` 映射 `aria-required`。
- `text` 属性或默认插槽渲染为 `<label for>`，与控件自动关联。
- 无可见标签（如需保持布局紧凑）时用 `label` 提供可访问名，映射控件 `aria-label`。
- 同时提供可见文本与 `label` 时，`label` 应包含或等于可见文本，避免可访问名与可见文案分叉（WCAG 2.5.3）。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-checkbox-size` | 由 `size` 档位决定 | 复选框边长（sm 16 / md 18 / lg 20） |
| `--caomei-checkbox-font-size` | 由 `size` 档位决定 | 标签字号（sm 12 / md 14 / lg 16） |
| `--caomei-checkbox-radius` | `--caomei-radius-sm` | 圆角 |
| `--caomei-checkbox-bg` | `--caomei-color-bg` | 未选中背景色 |
| `--caomei-checkbox-border` | `--caomei-color-border` | 未选中描边色 |
| `--caomei-checkbox-active-bg` | `--caomei-color-primary` | 选中 / 半选背景与描边色 |
| `--caomei-checkbox-foreground` | `--caomei-color-primary-foreground` | 指示图标颜色 |

```css
.caomei-checkbox {
    --caomei-checkbox-active-bg: #16a34a;
    --caomei-checkbox-radius: 999px;
}
```

<ComponentApi name="checkbox" />
