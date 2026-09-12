import type { ComponentSize } from '../../types'

export interface TextareaProps {
    /** 尺寸 */
    size?: ComponentSize
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
    /** 可见行数 */
    rows?: number
    /** 是否允许调整尺寸 */
    resize?: 'none' | 'both' | 'horizontal' | 'vertical'
    /** 无可见标签时的可访问名，映射 aria-label */
    label?: string
}
