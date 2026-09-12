export interface ButtonProps {
    /** 视觉变体 */
    variant?: 'primary' | 'secondary' | 'ghost'
    /** 尺寸 */
    size?: 'sm' | 'md' | 'lg'
    /** 是否禁用 */
    disabled?: boolean
    /** 原生 button type */
    type?: 'button' | 'submit' | 'reset'
}
