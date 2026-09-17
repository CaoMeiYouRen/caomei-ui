/**
 * 滑块值：单滑块为数字，范围滑块为数字数组
 * @en Slider value: a number for a single thumb, an array of numbers for a range
 */
export type SliderValue = number | number[]

/**
 * 滑块方向
 * @en Slider orientation
 */
export type SliderOrientation = 'horizontal' | 'vertical'

/**
 * 阅读方向
 * @en Reading direction
 */
export type SliderDirection = 'ltr' | 'rtl'

export interface SliderProps {
    /**
     * 非受控模式下的初始值；受控时改用 `v-model`。
     *
     * 传数字为单滑块，传数组为范围滑块（数组长度即滑块数量）。
     * @en Initial value in uncontrolled mode; use `v-model` instead when controlled. Pass a number for a single thumb or an array for a range slider (the array length is the number of thumbs).
     */
    defaultValue?: SliderValue
    /**
     * 最小值
     * @en Minimum value
     */
    min?: number
    /**
     * 最大值
     * @en Maximum value
     */
    max?: number
    /**
     * 步进间隔
     * @en Step interval
     */
    step?: number
    /**
     * 是否禁用
     * @en Whether the slider is disabled
     */
    disabled?: boolean
    /**
     * 方向，默认水平
     * @en Orientation, horizontal by default
     */
    orientation?: SliderOrientation
    /**
     * 阅读方向
     * @en Reading direction
     */
    dir?: SliderDirection
    /**
     * 是否反转视觉方向
     * @en Whether to invert the visual direction
     */
    inverted?: boolean
    /**
     * 范围滑块相邻滑块之间的最小步数间隔
     * @en Minimum step gap between adjacent thumbs on a range slider
     */
    minStepsBetweenThumbs?: number
    /**
     * 表单字段名；提供后选中值随表单提交
     * @en Form field name; when provided the selected value is submitted with the form
     */
    name?: string
    /**
     * 是否必填（原生表单校验）
     * @en Whether it is required (native form validation)
     */
    required?: boolean
    /**
     * 单滑块的可访问名，映射 aria-label；优先级为「本 prop > 透传 `aria-label` > 内建文案」
     * @en Accessible name of a single thumb, maps to aria-label; priority is "this prop > forwarded `aria-label` > the built-in text"
     */
    label?: string
    /**
     * 范围滑块各滑块的可访问名，按顺序对应；缺省用内建文案
     * @en Accessible name of each thumb on a range slider, in order; defaults to the built-in text
     */
    thumbLabels?: string[]
}
