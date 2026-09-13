import type { ComponentSize } from '../../types'

export interface TextareaProps {
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 是否禁用
     * @en Whether the textarea is disabled
     */
    disabled?: boolean
    /**
     * 是否只读
     * @en Whether the textarea is read-only
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
     * 可见行数
     * @en Number of visible lines
     */
    rows?: number
    /**
     * 是否允许调整尺寸
     * @en Whether manual resizing is allowed
     */
    resize?: 'none' | 'both' | 'horizontal' | 'vertical'
    /**
     * 无可见标签时的可访问名，映射 aria-label
     * @en Accessible name when there is no visible label, maps to aria-label
     */
    label?: string
}
