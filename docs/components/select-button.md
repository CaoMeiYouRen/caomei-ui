# SelectButton 分段选择

分段选择在一组互斥或可多选的选项间切换，视觉上呈现为分段按钮组，等价于 SegmentedControl，基于 Reka UI ToggleGroup 封装。

> 分段选择固定为横向排布（方向键为左右），不提供纵向模式。

## 基础用法

通过 `options` 传入选项，`v-model` 绑定选中值；默认为单选（`multiple` 关闭）。单选模式下点击已选项不会取消选择。

<demo
    vue="../examples/select-button/basic.vue"
    ssg="true"
/>

## 对象选项

`options` 可传入任意对象，通过 `optionLabel` / `optionValue` 指定显示文本与值的字段名（也可传入取值函数）；值支持字符串与数字。

<demo
    vue="../examples/select-button/object-options.vue"
    ssg="true"
/>

> 字段解析：`optionLabel` / `optionValue` 字符串形态支持 `a.b` 点号嵌套路径；`optionValue` 解析结果不是字符串 / 数字（如 `null`、布尔、字段缺省）时该选项**不渲染**，`optionLabel` 解析不到文本时该项文本为空。`#option` 插槽仍收到原始选项对象。

## 多选

传入 `multiple` 后 `v-model` 变为值数组，点击可在选中 / 未选中间切换。

<demo
    vue="../examples/select-button/multiple.vue"
    ssg="true"
/>

## 尺寸与状态

`size` 支持 `sm` / `md` / `lg`；`disabled` 禁用整组，选项级 `disabled` 禁用单项；`invalid` 标记校验失败。

<demo
    vue="../examples/select-button/states.vue"
    ssg="true"
/>

## 自定义选项内容

通过 `#option` 插槽自定义每个选项的内容（如「图标 + 文本」），插槽参数为 `{ option, selected }`。选项可携带额外字段（`SelectButtonOption` 已开放索引签名）供插槽使用。

<demo
    vue="../examples/select-button/icon.vue"
    ssg="true"
/>

## 表单集成

提供 `name` 后，位于 `<form>` 内时会随原生表单提交：单选提交 `name=value`（未选中时不产出字段）；多选按索引提交 `name[0]`、`name[1]` 等。

```vue
<form>
  <CaomeiSelectButton v-model="align" :options="options" name="align" label="文本对齐" />
  <button type="submit">提交</button>
</form>
```

## 无障碍

- 根元素渲染 `role="group"`，无可见标签时用 `label` 提供可访问名（映射 `aria-label`）；每个选项为原生 `<button>`，输出 `aria-pressed` 与 `data-state`。
- 使用 roving tabindex 管理焦点：方向键在选项间移动，`Home` / `End` 跳转首尾，空格 / 回车切换选中。
- 禁用选项输出 `disabled` 与 `data-disabled`，不参与指针与键盘交互。
- `invalid` 映射根元素的 `aria-invalid`。
- 根元素为 `role="group"`，不是 labelable 元素，`<label for>` 无法关联；外部标签请用 `label`（`aria-label`）或 `aria-labelledby` 指向标签元素的 id。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-select-button-border` | `--caomei-color-border` | 整组描边与分段分隔线颜色 |
| `--caomei-select-button-radius` | `--caomei-radius-md` | 整组圆角 |
| `--caomei-select-button-bg` | `--caomei-color-bg` | 未选中段背景色 |
| `--caomei-select-button-color` | `--caomei-color-text` | 未选中段文字色 |
| `--caomei-select-button-gap` | `--caomei-space-1` | 选项内图标与文字间距 |
| `--caomei-select-button-active-bg` | `--caomei-color-primary` | 选中段背景色 |
| `--caomei-select-button-active-color` | `--caomei-color-primary-foreground` | 选中段文字色 |
| `--caomei-select-button-invalid-border` | `--caomei-color-danger` | 校验失败态描边色 |

```css
.caomei-select-button {
    --caomei-select-button-active-bg: #16a34a;
    --caomei-select-button-active-color: #fff;
}
```

<ComponentApi name="select-button" />
