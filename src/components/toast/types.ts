export type ToastPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'

export type ToastSwipeDirection = 'up' | 'down' | 'left' | 'right'

export interface ToastProviderProps {
    /**
     * 视口停靠位置，默认 top-right
     * @en Viewport docking position, defaults to top-right
     */
    position?: ToastPosition
    /**
     * 默认展示时长（毫秒），可被单条提示的 duration 覆盖
     * @en Default display duration (ms), overridable per toast
     */
    duration?: number
    /**
     * 每条提示的屏幕阅读器标签，默认取当前语言的「通知」文案
     * @en Screen-reader label for each toast; defaults to the current locale's "Notification" text
     */
    label?: string
    /**
     * 视口 landmark 标签，支持 `{hotkey}` 占位符；优先级为「本 prop > 透传 `aria-label` > 当前语言文案」
     * @en Viewport landmark label; supports the `{hotkey}` placeholder. Priority is "this prop > forwarded `aria-label` > the current locale text"
     */
    viewportLabel?: string
    /**
     * 聚焦视口的快捷键，默认 ['F8']
     * @en Hotkey to focus the viewport, defaults to ['F8']
     */
    hotkey?: string[]
    /**
     * 同时展示的最大条数，超出时丢弃最早的，默认 5
     * @en Max toasts shown at once; the oldest is dropped when exceeded, defaults to 5
     */
    max?: number
    /**
     * 是否禁用滑动关闭
     * @en Whether to disable swipe-to-dismiss
     */
    disableSwipe?: boolean
    /**
     * 触发关闭的滑动方向，默认 right
     * @en Swipe direction that dismisses a toast, defaults to right
     */
    swipeDirection?: ToastSwipeDirection
    /**
     * 触发关闭所需的滑动距离（像素），默认 50
     * @en Swipe distance (px) required to dismiss, defaults to 50
     */
    swipeThreshold?: number
}
