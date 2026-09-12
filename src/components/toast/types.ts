export type ToastPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'

export type ToastSwipeDirection = 'up' | 'down' | 'left' | 'right'

export interface ToastProviderProps {
    /** 视口停靠位置，默认 top-right */
    position?: ToastPosition
    /** 默认展示时长（毫秒），可被单条提示的 duration 覆盖 */
    duration?: number
    /** 每条提示的屏幕阅读器标签，默认取当前语言的「通知」文案 */
    label?: string
    /** 视口 landmark 标签，支持 `{hotkey}` 占位符 */
    viewportLabel?: string
    /** 聚焦视口的快捷键，默认 ['F8'] */
    hotkey?: string[]
    /** 同时展示的最大条数，超出时丢弃最早的，默认 5 */
    max?: number
    /** 是否禁用滑动关闭 */
    disableSwipe?: boolean
    /** 触发关闭的滑动方向，默认 right */
    swipeDirection?: ToastSwipeDirection
    /** 触发关闭所需的滑动距离（像素），默认 50 */
    swipeThreshold?: number
}
