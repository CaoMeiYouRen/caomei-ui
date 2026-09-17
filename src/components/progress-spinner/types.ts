import type { ComponentSize } from '../../types'

export interface ProgressSpinnerProps {
    /**
     * 尺寸
     * @en Size
     */
    size?: ComponentSize
    /**
     * 可访问名；优先级高于透传的 `aria-label`，两者都未提供时取当前语言的「加载中」文案
     * @en Accessible name; takes precedence over a forwarded `aria-label`, falling back to the current locale's "Loading" text when neither is given
     */
    label?: string
}
