import type { FieldProps, FieldIdentityProps } from '../_shared/field'
import type { OptionFieldAccessor, OptionValue } from '../_shared/option'

/**
 * 默认选项对象形态；`options` 也可传入任意对象并通过 `optionLabel` / `optionValue` 映射字段。
 * @en Default option object shape; `options` may also be arbitrary objects whose fields are mapped via
 * `optionLabel` / `optionValue`.
 */
export interface MultiSelectOption<V extends OptionValue = string> {
    /**
     * 选项显示文本
     * @en Option display text
     */
    label: string
    /**
     * 选项值，需在单个 MultiSelect 内唯一
     * @en Option value; must be unique within a single MultiSelect
     */
    value: V
    /**
     * 是否禁用该选项
     * @en Whether the option is disabled
     */
    disabled?: boolean
}

/**
 * 与公共契约的差异：`id` 与 `name` 落在内层输入框上；`name` 由 Reka 为每个选中值生成 `name[index]` 隐藏控件。
 * @en Differences from the shared contract: `id` and `name` land on the inner input; `name` generates a
 * `name[index]` hidden control per selected value via Reka.
 */
export interface MultiSelectProps<T extends object = MultiSelectOption> extends FieldProps, FieldIdentityProps {
    /**
     * 选项列表；元素可为任意对象，字段由 `optionLabel` / `optionValue` 映射
     * @en Option list; items may be arbitrary objects whose fields are mapped via `optionLabel` / `optionValue`
     */
    options?: T[]
    /**
     * 选项显示文本字段：字段名或取值函数；默认 `label`
     * @en Field for the option display text: a field name or an accessor function; defaults to `label`
     */
    optionLabel?: OptionFieldAccessor<T, string>
    /**
     * 选项值字段：字段名或取值函数；默认 `value`。解析结果支持字符串与数字，为 `undefined` 的选项不渲染
     * @en Field for the option value: a field name or an accessor function; defaults to `value`. Resolved values
     * may be strings or numbers; options resolving to `undefined` are not rendered
     */
    optionValue?: OptionFieldAccessor<T, OptionValue>
    /**
     * 是否必填；作用于隐藏表单控件以触发原生表单校验（需同时提供 name）
     * @en Whether it is required; targets the hidden form controls to trigger native validation (requires name)
     */
    required?: boolean
    /**
     * 展开时是否锁定页面滚动；默认 false，避免滚动条消失引起布局跳动
     * @en Whether to lock page scroll when open; defaults to false to avoid layout shift from the disappearing scrollbar
     */
    bodyLock?: boolean
    /**
     * 展开触发器可访问名；默认取当前语言的「展开选项」
     * @en Accessible name of the open trigger; defaults to the current locale's "Show options" text
     */
    openLabel?: string
    /**
     * 已选项移除按钮可访问名前缀；默认取当前语言的「移除」
     * @en Prefix of the remove button's accessible name for a selected value; defaults to the current locale's "Remove" text
     */
    removeLabel?: string
    /**
     * 无匹配选项时的提示文案；默认取当前语言的「无匹配选项」
     * @en Text shown when no options match; defaults to the current locale's "No matching options" text
     */
    emptyLabel?: string
}
