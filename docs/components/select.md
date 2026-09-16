# Select 选择器

选择器用于从一组选项中选择单个值，基于 Reka UI Select 封装。

## 基础用法

通过 `v-model` 双向绑定选中值，`options` 传入选项列表。

<demo
    vue="../examples/select/basic.vue"
    ssg="true"
/>

## 对象选项

`options` 可传入任意对象，通过 `optionLabel` / `optionValue` 指定显示文本与值的字段名（也可传入取值函数）；值支持字符串与数字。

<demo
    vue="../examples/select/object-options.vue"
    ssg="true"
/>

> 可搜索单选（PrimeVue `Select filter`）请改用 [`CaomeiAutoComplete`](./auto-complete.md)：Reka Select 的面板固定 `role="listbox"`，面板内搜索框会违反 `aria-required-children`，故不在 Select 上提供 `filter`。
>
> 字段解析：`optionLabel` / `optionValue` 字符串形态支持 `a.b` 点号嵌套路径；`optionValue` 解析结果不是字符串 / 数字（如 `null`、布尔、字段缺省）时该选项**不渲染**，`optionLabel` 解析不到文本时该项文本为空、触发器回退显示 `placeholder`。

## 清除

`showClear` 在**有选中值**时显示清除按钮，点击后模型置为 `null` 并把焦点交回触发器；可访问名默认取当前语言的「清除」，可用 `clearLabel` 覆盖。

<demo
    vue="../examples/select/clear.vue"
    ssg="true"
/>

## 自定义选项

`#option` 插槽用于自定义面板选项内容，收到 `option`（**原始**选项对象）与 `selected`（是否为当前选中项）；未提供时回退渲染映射后的显示文本。

插槽内容按**单行**渲染并带省略号截断（面板宽度在窄屏收敛为可用宽度，见[响应式设计 §3](../design/responsive.md) 矩阵 #4），因此多行 / 富文本选项请自行控制截断。

<demo
    vue="../examples/select/option-slot.vue"
    ssg="true"
/>

## 尺寸

通过 `size` 切换尺寸，支持 `sm` / `md` / `lg`。

<demo
    vue="../examples/select/sizes.vue"
    ssg="true"
/>

## 状态

`disabled` 禁用、`invalid` 标记校验失败；选项级 `disabled` 可禁用单个选项。

<demo
    vue="../examples/select/states.vue"
    ssg="true"
/>

## 无障碍

- 基于 Reka UI 的原生 ARIA 语义，支持键盘导航（方向键 / Enter / Esc / 首字母跳转）。
- `label` 用于无可见标签时提供可访问名，映射为 `aria-label`。
- `invalid` 时输出 `aria-invalid="true"`。
- `#option` 自定义内容请保留可读文本：Reka 以选项文本快照支撑首字母跳转，仅渲染图标会使该跳转退化（触发器显示文本始终取自 `optionLabel`，不受插槽内容影响）。

## 事件与暴露

除 `update:modelValue` 外无额外事件；选项列表通过 `options` 受控传入。

> 受控行为：当 `modelValue` 不在 `options` 中时，触发器回退显示 `placeholder`，但模型值仍保持受控、不会被自动清空；如需同步清理，请在使用方监听 `options` 变化后重置。

> 宽度：默认 `width: 100%`，并由 `--caomei-select-max-width` 设可覆盖的 `max-width`（详见[主题与样式设计 §4.1](../design/theming.md)）；撑满所在列可在字段外层 `.caomei-select__field` 或其祖先上把该变量覆盖为 `none`（写在触发器 `.caomei-select` 上不生效）。清除按钮宽度由 `--caomei-select-clear-width`（默认 `1.25rem`，同样覆盖在字段外层或其祖先）控制。
>
> 滚动：展开时默认不锁定页面滚动（`bodyLock` 默认 `false`），避免滚动条消失引起布局跳动；移动端因此可能出现背景可滚动，如需锁定可传入 `body-lock`。

<ComponentApi name="select" />
