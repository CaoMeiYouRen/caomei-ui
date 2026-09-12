import type { ComponentSize } from '../../types'

export interface InputNumberProps {
    /** 尺寸 */
    size?: ComponentSize
    /** 允许的最小值；失焦或步进时钳制 */
    min?: number
    /** 允许的最大值；失焦或步进时钳制 */
    max?: number
    /** 步进值 */
    step?: number
    /** 小数位数；设置后失焦与步进结果按该精度取整 */
    precision?: number
    /** 是否禁用 */
    disabled?: boolean
    /** 是否只读 */
    readonly?: boolean
    /** 校验失败态，映射 aria-invalid */
    invalid?: boolean
    /** 占位文本 */
    placeholder?: string
    /** 表单字段名 */
    name?: string
    /** 关联 label 的 id */
    id?: string
    /** 浏览器自动填充提示 */
    autocomplete?: string
    /** 是否显示增减按钮 */
    controls?: boolean
    /** 增加按钮的可访问标签；默认取当前语言的「增加」文案 */
    increaseLabel?: string
    /** 减少按钮的可访问标签；默认取当前语言的「减少」文案 */
    decreaseLabel?: string
    /** 无可见标签时的可访问名，映射 aria-label */
    label?: string
}
