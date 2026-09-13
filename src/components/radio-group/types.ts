import type { ComponentSize } from '../../types'

/** 单选项值，取 Reka UI `AcceptableValue` 中可用的 `string | number` 子集 */
export type RadioValue = string | number

/** 组内排列方向 */
export type RadioGroupOrientation = 'horizontal' | 'vertical'

/** 阅读方向 */
export type RadioGroupDirection = 'ltr' | 'rtl'

export interface RadioGroupProps {
    /** 尺寸 */
    size?: ComponentSize
    /**
     * 非受控模式下的初始选中值；受控时改用 `v-model`。
     *
     * 值为 `undefined` 表示未选中。
     */
    defaultValue?: RadioValue
    /** 是否禁用整组 */
    disabled?: boolean
    /** 是否必填（原生表单校验） */
    required?: boolean
    /** 表单字段名；提供后选中值随表单提交 */
    name?: string
    /** 组内排列方向，默认垂直 */
    orientation?: RadioGroupOrientation
    /** 阅读方向 */
    dir?: RadioGroupDirection
    /** 键盘导航是否首尾循环 */
    loop?: boolean
    /** 校验失败态，映射 aria-invalid */
    invalid?: boolean
    /** 根元素 id */
    id?: string
    /** 无可见分组标签时的可访问名，映射 aria-label */
    label?: string
}

export interface RadioButtonProps {
    /** 该选项的值，需在同一组内唯一 */
    value: RadioValue
    /** 是否禁用该选项 */
    disabled?: boolean
    /** 关联外部 label 的 id，缺省自动生成 */
    id?: string
    /** 可见标签文本（也可用默认插槽自定义） */
    text?: string
    /** 无可见文本时的可访问名，映射 aria-label */
    label?: string
}
