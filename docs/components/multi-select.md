# MultiSelect 多选选择器

多选选择器基于 Reka UI `Combobox` 封装，支持多选、`v-model` 数组、已选项标签与输入过滤。展开后可直接输入关键字筛选本地选项。

## 基础用法

通过 `v-model` 绑定值数组（字符串或数字）；已选项以标签展示，标签上的移除按钮按值过滤。

<demo
    vue="../examples/multi-select/basic.vue"
    ssg="true"
/>

## 对象选项

`options` 可传入任意对象，通过 `optionLabel` / `optionValue` 指定显示文本与值的字段名（也可传入取值函数）；值支持字符串与数字。

<demo
    vue="../examples/multi-select/object-options.vue"
    ssg="true"
/>

> 字段解析：`optionLabel` / `optionValue` 字符串形态支持 `a.b` 点号嵌套路径；`optionValue` 解析结果不是字符串 / 数字（如 `null`、布尔、字段缺省）时该选项**不渲染**，`optionLabel` 解析不到文本时该项文本为空。

## 状态与尺寸

`disabled` 禁用、`invalid` 标记校验失败（映射 `aria-invalid`）；`size` 支持 `sm` / `md` / `lg`。

<demo
    vue="../examples/multi-select/states.vue"
    ssg="true"
/>

## 表单与无障碍

- 在 `<form>` 内提供 `name` 时会为每个选中值生成一个表单控件，命名形如 `name[index]`，可直接被表单收集。
- `required` 作用于隐藏表单控件（需同时提供 `name`），未选择任何项时触发原生表单校验失败。
- `label` 映射为内层输入框的 `aria-label`；`id` 也落在内层输入框，便于 `<label for>` 关联。
- 注意：`maxlength` 等原生属性透传到的是**搜索输入框**而非所选值文本，仅影响过滤输入长度。
- 展开触发器默认可访问名为「展开选项」，可用 `openLabel` 覆盖（覆盖 Reka 内建英文名）。
- 移除按钮可访问名为「移除 + 选项文本」，前缀可用 `removeLabel` 覆盖；无匹配选项时显示「无匹配选项」，可用 `emptyLabel` 覆盖。
- 展开时默认不锁定页面滚动（`bodyLock=false`），避免滚动条消失引起布局跳动；需要时可通过 `bodyLock` 开启。

## 范围说明

- 仅支持本地过滤与扁平选项；**不做分组、远程搜索与虚拟滚动**（长列表可按需在后续迭代补齐）。
- 值不在 `options` 中时，该值不渲染标签，但仍保留在 `v-model` 数组中。

## 样式定制

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-multi-select-max-width` | `--caomei-select-max-width` | 字段最大宽度 |

```css
.caomei-multi-select {
    --caomei-multi-select-max-width: 24rem;
}
```

<ComponentApi name="multi-select" />
