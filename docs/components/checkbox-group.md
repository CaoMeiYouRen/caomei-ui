# CheckboxGroup 复选框组

复选框组用于把一组复选框的选中值收拢为一个值数组，并提供分组可访问语义、整体表单提交与可选的全选 / 半选，基于 Reka UI CheckboxGroup 封装。

## 基础用法

`options` 传入选项列表，`v-model` 绑定值数组；子项也可改用默认插槽自行提供（子项需给出 `value`，数组模型由分组统一承接）。

<demo
    vue="../examples/checkbox-group/basic.vue"
    ssg="true"
/>

## 全选与半选

`selectAll` 渲染内置全选项：全部选中时为选中、部分选中时为半选、未选中 / 无可选项时为未选中；点击写入或清空**可选项**，禁用项不参与全选（其已选值保持不变）。文案默认取当前语言的「全选」，可用 `selectAllText` 覆盖。

<demo
    vue="../examples/checkbox-group/select-all.vue"
    ssg="true"
/>

## 尺寸、禁用与校验

`size` / `disabled` / `invalid` 同时作用于分组与渲染出的选项；`label` 映射分组自身的可访问名。禁用态不在分组层叠加透明度（子项各自已按 `--caomei-disabled-opacity` 处理），避免双重变淡。

## 键盘行为

默认保持原生逐项 Tab 顺序；`rovingFocus` 开启后组内只保留一个 Tab 停靠点、用方向键在选项间移动（Reka 的漫游焦点）。

## 表单集成

提供 `name` 后，位于 `<form>` 内时按 `name[index]` 为每个选中值生成隐藏控件，可直接被表单收集；`required` 作用于该隐藏控件（需同时提供 `name`）。分组已统一提交全部子项值，**子项无需再传 `name`**（处于分组上下文中的子项不会生成自己的隐藏控件，传了也不会多提交一份）。未选中任何值且 `required` 时，隐藏控件退化为单个 `name`（不带下标），用于触发原生必填校验。

```vue
<form>
  <CaomeiCheckboxGroup v-model="fruits" :options="options" name="fruits" label="水果" />
  <button type="submit">提交</button>
</form>
```

## 无障碍

- 根节点为 `role="group"`，可访问名来自 `label`；`invalid` 映射 `aria-invalid`。
- 全选项与子项均为普通复选框，半选态映射 `aria-checked="mixed"`，`disabled` 逐项下发。
- 分组 `name` 生成的隐藏控件与子项控件同源，键盘与读屏顺序按渲染顺序。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-checkbox-group-gap` | `--caomei-space-2` | 分组与选项之间的纵向间距 |

```css
.caomei-checkbox-group {
    --caomei-checkbox-group-gap: 8px;
}
```

> 档位派生变量（字号）由组件在自身元素上声明，需在 `.caomei-checkbox-group` 元素本身上覆盖，写在 `:root` 等祖先层不会生效。

## 从 PrimeVue 迁移

| PrimeVue | 本组件 |
| --- | --- |
| `<CheckboxGroup v-model="数组" name>`（仅提供分组上下文与默认插槽） | `CaomeiCheckboxGroup` 同形兼容（默认插槽放子项，`name` 覆盖整组提交） |
| 无 | `options`（按 `optionLabel` / `optionValue` 渲染子项）、`selectAll`（全选 / 半选，禁用项不参与）、`selectAllText`、`label`（分组可访问名）、`rovingFocus`（默认 `false`，保持原生逐项 Tab 顺序）为本库新增 |
| `inputId`（子项） | `id` |

**已知差异（有意）**：分组层不叠加禁用透明度（子项各自处理，避免双重变淡）；子项处于分组上下文时**不生成自身隐藏控件**，`name` 由分组统一承载，子项无需再传 `name`。**未实现**：PrimeVue `CheckboxGroup` 的 `formControl` 未暴露（`invalid` 已由本组件 `invalid` 覆盖）。

> 迁移流程与通用陷阱见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="checkbox-group" />
