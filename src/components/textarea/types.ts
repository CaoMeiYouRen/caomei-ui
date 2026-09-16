import type { FieldProps, FieldIdentityProps } from '../_shared/field'

export interface TextareaProps extends FieldProps, FieldIdentityProps {
    /**
     * 是否只读
     * @en Whether the textarea is read-only
     */
    readonly?: boolean
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
     * 高度随内容自动增减（不再需要滚动条）；`rows` 仍作为初始最小高度。开启后 `resize` 固定为 `none`（手动调整会被下一次测量覆盖）
     * @en Whether the height follows the content automatically (no scrollbar needed); `rows` still acts as the initial minimum height. While enabled, `resize` is fixed to `none` (manual resizing would be overwritten by the next measurement)
     */
    autoResize?: boolean
}
