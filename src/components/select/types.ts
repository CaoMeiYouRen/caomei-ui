import type { FieldProps, FieldIdentityProps } from '../_shared/field'
import type { OptionFieldAccessor, OptionValue } from '../_shared/option'

/**
 * 默认选项对象形态；`options` 也可传入任意对象并通过 `optionLabel` / `optionValue` 映射字段。
 * @en Default option object shape; `options` may also be arbitrary objects whose fields are mapped via
 * `optionLabel` / `optionValue`.
 */
export interface SelectOption<V extends OptionValue = string> {
    /**
     * 选项显示文本
     * @en Option display text
     */
    label: string
    /**
     * 选项值，需在单个 Select 内唯一
     * @en Option value; must be unique within a single Select
     */
    value: V
    /**
     * 是否禁用该选项
     * @en Whether the option is disabled
     */
    disabled?: boolean
}

/**
 * 分组选项形态；`options` 支持嵌套分组（最大建议深度 3 层）。
 * @en Group option shape; `options` supports nested groups (recommended max depth: 3).
 */
export interface SelectOptionGroup<T extends object = SelectOption> {
    /**
     * 分组标签文本
     * @en Group label text
     */
    label: string
    /**
     * 分组内的选项列表
     * @en Options within the group
     */
    options: T[]
}

/**
 * 与公共契约的差异：`id` / `name` 落在内层输入框上，`name` 由 Reka 生成隐藏表单控件。
 * @en Differences from the shared contract: `id` / `name` land on the inner input, and `name` generates a
 * hidden form control via Reka.
 */
export interface SelectProps<T extends object = SelectOption> extends FieldProps, FieldIdentityProps {
    /**
     * 选项列表；元素可为任意对象，字段由 `optionLabel` / `optionValue` 映射。支持分组形态（`SelectOptionGroup`）与扁平形态混用
     * @en Option list; items may be arbitrary objects whose fields are mapped via `optionLabel` / `optionValue`. Supports group shape (`SelectOptionGroup`) mixed with flat shape
     */
    options?: (T | SelectOptionGroup<T>)[]
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
     * 展开时是否锁定页面滚动（映射自 Reka SelectContent 的 `bodyLock`）；默认 false，避免滚动条消失引起布局跳动
     * @en Whether to lock page scroll when expanded (mapped from Reka SelectContent's `bodyLock`); defaults to false to avoid layout shift from the disappearing scrollbar
     */
    bodyLock?: boolean
    /**
     * 是否有选中值时显示清除按钮（`disabled` 时不渲染）；默认 false。点击后模型置为 `null` 并把焦点交回触发器
     * @en Whether to show a clear button when a value is selected (not rendered when `disabled`); defaults to false. Clicking it sets the model to `null` and returns focus to the trigger
     */
    showClear?: boolean
    /**
     * 清除按钮可访问名；默认取当前语言的「清除」
     * @en Accessible name of the clear button; defaults to the current locale's "Clear" text
     */
    clearLabel?: string
}
