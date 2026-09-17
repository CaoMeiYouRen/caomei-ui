import type { FieldIdentityProps, FieldStateProps } from '../_shared/field'
import type { OptionFieldAccessor, OptionValue } from '../_shared/option'

/**
 * 默认选项对象形态；`options` 也可传入任意对象并通过 `optionLabel` / `optionValue` 映射字段。
 * @en Default option object shape; `options` may also be arbitrary objects whose fields are mapped via
 * `optionLabel` / `optionValue`.
 */
export interface CheckboxGroupOption<V extends OptionValue = string> {
    /**
     * 选项可见文本
     * @en Option display text
     */
    label: string
    /**
     * 选项值，需在单个分组内唯一
     * @en Option value; must be unique within a single group
     */
    value: V
    /**
     * 是否禁用该选项
     * @en Whether the option is disabled
     */
    disabled?: boolean
}

/**
 * 与公共契约的差异：`name` 挂在分组自身的隐藏表单控件上（提交整个值数组），子项不重复携带；
 * `id` 用于关联外部 label；`size` / `disabled` / `invalid` 同时下发给分组内渲染的选项。
 * @en Differences from the shared contract: `name` lands on the group's own hidden form control
 * (submitting the whole value array) rather than on each item; `id` associates an external label;
 * `size` / `disabled` / `invalid` are also passed down to the options rendered by the group.
 */
export interface CheckboxGroupProps<T extends object = CheckboxGroupOption>
    extends FieldStateProps, FieldIdentityProps {
    /**
     * 选项列表；提供后按 `optionLabel` / `optionValue` 渲染子项，也可只用默认插槽自定义
     * @en Option list; when provided, items are rendered from `optionLabel` / `optionValue`. The default
     * slot may be used instead for fully custom children
     */
    options?: T[]
    /**
     * 选项文本字段：字段名或取值函数；默认 `label`
     * @en Field for the option text: a field name or an accessor function; defaults to `label`
     */
    optionLabel?: OptionFieldAccessor<T, string>
    /**
     * 选项值字段：字段名或取值函数；默认 `value`。解析不到字符串 / 数字的选项不渲染
     * @en Field for the option value: a field name or an accessor function; defaults to `value`. Options
     * that do not resolve to a string or number are not rendered
     */
    optionValue?: OptionFieldAccessor<T, OptionValue>
    /**
     * 是否渲染内置全选项；仅对 `options` 提供的选项生效（插槽自定义子项不在统计范围内）
     * @en Whether to render the built-in select-all item; it only covers options from `options`, not
     * custom children in the default slot
     */
    selectAll?: boolean
    /**
     * 全选项可见文本；默认取当前语言的「全选」
     * @en Visible text of the select-all item; defaults to the current locale's "Select all" text
     */
    selectAllText?: string
    /**
     * 是否启用漫游焦点（分组内仅一个 Tab 停靠点，方向键切换）；默认 false，保持原生逐项 Tab 顺序
     * @en Whether to enable roving focus (a single tab stop inside the group, arrow keys move between
     * items); defaults to false to keep the native per-item tab order
     */
    rovingFocus?: boolean
    /**
     * 是否必填（作用于分组隐藏表单控件以触发原生表单校验，需同时提供 `name`）
     * @en Whether it is required; targets the group's hidden form control to trigger native validation
     * (requires `name`)
     */
    required?: boolean
}
