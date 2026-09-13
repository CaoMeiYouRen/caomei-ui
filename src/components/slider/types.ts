/** 滑块值：单滑块为数字，范围滑块为数字数组 */
export type SliderValue = number | number[]

/** 滑块方向 */
export type SliderOrientation = 'horizontal' | 'vertical'

/** 阅读方向 */
export type SliderDirection = 'ltr' | 'rtl'

export interface SliderProps {
    /**
     * 非受控模式下的初始值；受控时改用 `v-model`。
     *
     * 传数字为单滑块，传数组为范围滑块（数组长度即滑块数量）。
     */
    defaultValue?: SliderValue
    /** 最小值 */
    min?: number
    /** 最大值 */
    max?: number
    /** 步进间隔 */
    step?: number
    /** 是否禁用 */
    disabled?: boolean
    /** 方向，默认水平 */
    orientation?: SliderOrientation
    /** 阅读方向 */
    dir?: SliderDirection
    /** 是否反转视觉方向 */
    inverted?: boolean
    /** 范围滑块相邻滑块之间的最小步数间隔 */
    minStepsBetweenThumbs?: number
    /** 表单字段名；提供后选中值随表单提交 */
    name?: string
    /** 是否必填（原生表单校验） */
    required?: boolean
    /** 单滑块的可访问名，映射 aria-label */
    label?: string
    /** 范围滑块各滑块的可访问名，按顺序对应；缺省用内建文案 */
    thumbLabels?: string[]
}
