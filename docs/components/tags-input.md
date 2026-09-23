# TagsInput 标签输入

标签输入框用于录入多个自由文本标签：回车或分隔符提交、点击标签删除、支持数量上限与去重校验。封装 Reka UI 的 `TagsInput` primitive。

## 基础用法

`v-model` 绑定标签数组（`string[]`）；`placeholder` 提示录入方式，`label` 提供无可见标签时的可访问名（与 Input / Select 同口径，缺省不输出 `aria-label`）。

<demo
    vue="../examples/tags-input/basic.vue"
    ssg="true"
/>

## 提交与删除

- **回车**提交当前输入为标签；键入 `delimiter`（默认 `,`，支持正则）即提交。
- **粘贴**默认按分隔符拆分批量新增（`addOnPaste` 默认 `true`，与上游 Reka 的默认相反，可置 `false` 关闭）。
- `addOnTab` / `addOnBlur` 分别控制 Tab / 失焦时提交，默认均为 `false`（保留 Tab 的焦点移动语义）。
- **删除**：点击标签上的删除按钮；键盘用户在输入框内按 `Backspace` 先选中末位标签，再次按下即删除；已有选中标签时 `Backspace` / `Delete` 均可删除（方向键可在标签间移动选择，选中态由 `data-state="active"` 表达）。
- 抛出 `addTag` / `removeTag`（载荷为标签文本）与 `invalidInput`（载荷为被拒绝的输入）。

## 数量与去重

- `max` 限制标签数量，达到上限后新增被拒绝并抛出 `invalidInput`；缺省不限。
- `allowDuplicate` 默认 `false`（**与 PrimeVue `InputChips` 的默认相反**）：重复输入被拒绝并抛出 `invalidInput`；需要允许重复时显式传 `allowDuplicate`。
- 被拒绝的输入（重复 / 超出上限）**保留在输入框中**以便修正，不会被自动清空；本组件**未提供清空该草稿文本的程序化入口**（草稿文本由 Reka 内部输入框持有，不在 `v-model` 内），需要在拒绝后清空时可用 `:key` 重挂载组件。
- `showClear` 为真且存在标签时显示清空按钮（可访问名默认取当前语言的「清空」，可用 `clearLabel` 覆盖）；清空只重置模型并抛出 `update:modelValue`，不逐个抛出 `removeTag`。

<demo
    vue="../examples/tags-input/limits.vue"
    ssg="true"
/>

## 状态与尺寸

`size` 提供 `sm` / `md` / `lg` 三档（默认 `md`）；`invalid` 映射 `aria-invalid` 与错误态描边；`disabled` 透传到输入框并禁用全部交互。

## 表单与无障碍

- `name` + `required` 在 `<form>` 内生成隐藏控件以触发原生校验；数组值按 `name[index]` 展开。
- `id` 落在内层输入框上，供 `<label for>` 关联；`label` 提供 `aria-label`。
- 每个标签渲染为 `role="group"`（允许命名，规避 Reka 在 `role=generic` 上输出 `aria-labelledby` 的规范偏差）；删除按钮的可访问名由 Reka 经 `aria-labelledby` 指向标签文本提供（朗读为「标签名, 按钮」，不含「删除」字样）。
- 删除按钮为 `tabindex="-1"`（不参与 Tab 序列）：键盘删除走「方向键选中 + `Backspace` / `Delete`」，与 Reka 的键盘模型一致。
- 有标签时字段根输出 `data-filled="true"`，供 `CaomeiFloatLabel` 的上浮判定使用。

<demo
    vue="../examples/tags-input/form.vue"
    ssg="true"
/>

## 范围说明

- `v-model` 为 `string[]`：标签值只支持字符串。Reka 的对象值形态（`convertValue` / `displayValue`）本库未暴露。
- 自定义标签内容（PrimeVue 的 `#chip`）、图标替换（`removeTokenIcon` / `chipIcon`）、`variant`（`outlined` / `filled`）未实现。
- 标签增删只影响模型；`size` / `invalid` / `disabled` 等状态不受影响。
- 清空（`showClear`）不逐个抛出 `removeTag`，只抛出 `update:modelValue`（与 Reka 的 `TagsInputClear` 一致）。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-tags-input-min-height` | `--caomei-control-height-md` | 字段最小高度 |
| `--caomei-tags-input-padding-block` | `--caomei-space-1` | 字段纵向内边距 |
| `--caomei-tags-input-padding-inline` | `--caomei-space-3` | 字段横向内边距 |
| `--caomei-tags-input-font-size` | `--caomei-font-size-md` | 字段字号 |

字段默认 `width: 100%` 且无宽度上限；需要收窄时在使用层用容器或 `max-width` 约束。

## 从 PrimeVue 迁移

| PrimeVue（`InputChips`，旧名 `Chips`） | 本组件 |
|----------|--------|
| `modelValue` | 同名（`string[]`） |
| `separator` | `delimiter`（默认 `,`，另支持正则） |
| `max` | 同名 |
| `allowDuplicate`（默认 `true`） | 同名但**默认 `false`**（拒绝重复）；需要允许重复时显式传 `true` |
| `addOnBlur` | 同名（默认 `false`） |
| `inputId` | `id`；`ariaLabel` → `label`；`ariaLabelledby` 经透传作用于输入框 |
| `invalid` / `disabled` / `placeholder` | 同名 |
| `fluid` | 删除：字段默认 `width: 100%` |
| `inputClass` / `inputStyle` / `inputProps` | 用根 `class` / `style` 覆盖（class / style 落在字段根元素）；其余原生属性透传到输入框 |
| 无 | `showClear` / `clearLabel`、`size`、`addOnPaste`、`addOnTab`、`label` 为本库新增或改默认 |

> **`Chips` 迁移首选本组件**：PrimeVue `Chips`（v4 起为 `InputChips` 的旧名）与本组件语义一致（自由文本多值录入），迁移时首选 `CaomeiTagsInput`；`AutoComplete + multiple` 降为**备选**——它是带选项面板的搜索选择，与本组件的「自由文本 + 标签」语义不同，仅在需要异步建议时使用。

**未实现**：`#chip` / `#chipicon` 插槽、`removeTokenIcon` / `chipIcon`、`variant`（`outlined` / `filled`）、`pt` / `dt` / `unstyled`、对象型标签值。

> 迁移流程、通用陷阱与逐组件对照入口见[从 PrimeVue 迁移](../guide/primevue-migration.md)。

<ComponentApi name="tags-input" />
