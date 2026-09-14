import type { ComponentSize } from '../../types'
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

export interface SelectProps<T extends object = SelectOption> {
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
     * 未选择时的占位文本
     * @en Placeholder text when nothing is selected
     */
    placeholder?: string
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 是否禁用
     * @en Whether the select is disabled
     */
    disabled?: boolean
    /**
     * 校验失败态，映射 aria-invalid
     * @en Validation failure state, maps to aria-invalid
     */
    invalid?: boolean
    /**
     * 表单字段名
     * @en Form field name
     */
    name?: string
    /**
     * 关联 label 的 id
     * @en Id of the associated label
     */
    id?: string
    /**
     * 无可见标签时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible label, maps to aria-label
     */
    label?: string
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
