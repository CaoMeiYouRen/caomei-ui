# AutoComplete 自动补全

自动补全是一个「异步建议 + 自由输入」的输入框：既可以从建议列表中选择，也可以直接输入任意文本作为值。基于 Reka UI Combobox 封装。

## 基础用法

`v-model` 在单选模式下为 `string`。点击右侧触发器或聚焦输入框都会展开建议面板，输入关键字会按 `label` 过滤。

<demo
    vue="../examples/auto-complete/basic.vue"
    ssg="true"
/>

列表项可以是字符串（`label` 与 `value` 相同），也可以是 `{ label, value, disabled? }` 对象。`value` 必须为非空字符串且在单个组件内唯一。

## 异步建议

监听 `complete` 事件按需拉取建议：输入停顿 `debounce` 毫秒（默认 300ms）后触发，参数为当前输入文本。加载期间通过 `loading` 展示加载指示。

<demo
    vue="../examples/auto-complete/async.vue"
    ssg="true"
/>

> 连续输入会重置计时器，只在真正停顿后触发一次 `complete`。
>
> 默认情况下 Reka 会再按 `label` 对建议做一次客户端过滤，服务端模糊 / 语义检索返回但 `label` 不含关键字的建议会被滤除。此类场景请开启 `ignore-filter`（跳过客户端过滤），并自行保证服务端返回结果的相关性。

## 多选

`multiple` 开启多选，此时 `v-model` 为 `string[]`，已选项以标签展示并可逐个移除；输入框在没有标签时才显示占位文本。

<demo
    vue="../examples/auto-complete/multiple.vue"
    ssg="true"
/>

## 自由输入与清除

- 单选模式下，输入自由文本后按 `Enter` 或失焦，会把文本提交为 `modelValue`（若当前有高亮建议项，则优先选中该建议）。
- 选中建议项时提交其 `value`，并把输入框回显为对应 `label`。
- 单选且 `clearable`（默认 `true`）时，有值会显示清除按钮；`clearable` 为 `false` 或多选模式不显示。
- `complete` 在输入停顿后触发，`select` 在提交一个值（选中建议或提交自由文本）时触发；多选模式下点击已选项取消选择也会触发 `select`，携带被切换的值；通过标签移除按钮删除已选项只触发 `update:modelValue`。

## 无障碍

- 输入框由 Reka Combobox 提供 `role="combobox"` 与 `aria-autocomplete`，并通过 `aria-expanded` / `aria-controls` 关联面板。
- 无可见标签时用 `label` 提供可访问名；`id` 落在内层输入框上，便于外部 `<label for>` 关联。
- 空态与展开触发器分别使用本地化文案（`autoComplete.empty` / `autoComplete.open`），可通过 `emptyLabel` / `openLabel` 覆盖。
- 禁用建议项输出 `data-disabled`，不可被选中。

## 样式定制

样式基于 CSS variables，保持低特异性便于覆盖：

| 变量 | 默认 | 说明 |
|------|------|------|
| `--caomei-auto-complete-max-width` | `--caomei-select-max-width` | 字段最大宽度 |
| `--caomei-select-max-width` | `20rem` | 选择类控件的默认宽度上限 |

```css
.caomei-auto-complete {
    --caomei-auto-complete-max-width: 28rem;
}
```

<ComponentApi name="auto-complete" />
