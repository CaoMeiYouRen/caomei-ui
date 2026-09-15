import type { ComponentSize } from '../../types'

export interface InputNumberProps {
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 允许的最小值；失焦或步进时钳制
     * @en Minimum allowed value; clamped on blur or step
     */
    min?: number
    /**
     * 允许的最大值；失焦或步进时钳制
     * @en Maximum allowed value; clamped on blur or step
     */
    max?: number
    /**
     * 步进值
     * @en Step increment
     */
    step?: number
    /**
     * 小数位数（0–100 的整数）；设置后失焦与步进结果按该精度取整，且展示上限不低于该精度。
     * 超过 20 的取值依赖 `Intl.NumberFormat` v3（Node ≥ 20 与现代浏览器）
     * @en Number of decimal places (an integer from 0 to 100); when set, results are rounded to this precision on blur and step, and the display limit is never lower than it.
     * Values above 20 rely on `Intl.NumberFormat` v3 (Node >= 20 and modern browsers)
     */
    precision?: number
    /**
     * 是否禁用
     * @en Whether the input is disabled
     */
    disabled?: boolean
    /**
     * 是否只读
     * @en Whether the input is read-only
     */
    readonly?: boolean
    /**
     * 校验失败态，映射 aria-invalid
     * @en Validation failure state, maps to aria-invalid
     */
    invalid?: boolean
    /**
     * 占位文本
     * @en Placeholder text
     */
    placeholder?: string
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
     * 浏览器自动填充提示
     * @en Browser autocomplete hint
     */
    autocomplete?: string
    /**
     * 是否使用千分位等分组分隔符；默认 true（对齐 PrimeVue）
     * @en Whether to use grouping separators such as thousands separators; defaults to true (matching PrimeVue)
     */
    useGrouping?: boolean
    /**
     * 显示的最少小数位（0–20 的整数）；仅补零展示，不改变模型值
     * @en Minimum fraction digits to display (an integer from 0 to 20); pads the display only and does not change the model
     */
    minFractionDigits?: number
    /**
     * 允许的最大小数位（0–20 的整数）；设置后模型也按该位数取整（`precision` 优先）
     * @en Maximum fraction digits allowed (an integer from 0 to 20); when set, the model is rounded to this precision too (`precision` takes precedence)
     */
    maxFractionDigits?: number
    /**
     * 是否显示增减按钮
     * @en Whether to show the increment/decrement steppers
     */
    controls?: boolean
    /**
     * 增加按钮的可访问标签；默认取当前语言的「增加」文案
     * @en Accessible label of the increment button; defaults to the current locale's "Increase" text
     */
    increaseLabel?: string
    /**
     * 减少按钮的可访问标签；默认取当前语言的「减少」文案
     * @en Accessible label of the decrement button; defaults to the current locale's "Decrease" text
     */
    decreaseLabel?: string
    /**
     * 无可见标签时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible label, maps to aria-label
     */
    label?: string
}
