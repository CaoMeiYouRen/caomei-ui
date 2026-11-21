import type { Component } from 'vue'

/**
 * 语气：`danger` 用于破坏性操作，确认按钮切换为危险色并默认使用警告图标
 * @en Tone: `danger` is for destructive actions; the confirm button turns danger-colored and the
 * default icon becomes a warning
 */
export type PopconfirmTone = 'neutral' | 'danger'

/**
 * 面板相对触发按钮的弹出方向
 * @en Side of the trigger the panel opens towards
 */
export type PopconfirmSide = 'top' | 'right' | 'bottom' | 'left'

/**
 * 面板与触发按钮的对齐方式
 * @en Alignment of the panel with the trigger
 */
export type PopconfirmAlign = 'start' | 'center' | 'end'

export interface PopconfirmProps {
    /**
     * 标题；也可经 `#title` 插槽提供。缺省时不渲染标题节点
     * @en Title; the `#title` slot can supply it instead. No title node is rendered when absent
     */
    title?: string
    /**
     * 描述文案；也可经默认插槽提供
     * @en Description; the default slot can supply it instead
     */
    description?: string
    /**
     * 确认按钮文案；缺省取当前语言的「确定」
     * @en Confirm button text; defaults to the current locale's "Confirm"
     */
    confirmLabel?: string
    /**
     * 取消按钮文案；缺省取当前语言的「取消」
     * @en Cancel button text; defaults to the current locale's "Cancel"
     */
    cancelLabel?: string
    /**
     * 语气；默认 `neutral`
     * @en Tone; `neutral` by default
     */
    tone?: PopconfirmTone
    /**
     * 确认操作进行中：确认按钮进入加载态，两枚按钮同时禁用
     * @en A confirmation is in flight: the confirm button shows its loading state and both buttons
     * are disabled
     */
    loading?: boolean
    /**
     * 是否禁用触发按钮
     * @en Whether the trigger button is disabled
     */
    disabled?: boolean
    /**
     * 弹出方向；默认 `bottom`
     * @en Placement side; defaults to `bottom`
     */
    placement?: PopconfirmSide
    /**
     * 对齐方式；默认 `end`
     * @en Alignment; defaults to `end`
     */
    align?: PopconfirmAlign
    /**
     * 与触发按钮的偏移距离（px）；默认 8
     * @en Offset from the trigger (px); defaults to 8
     */
    sideOffset?: number
    /**
     * 面板图标；缺省按 `tone` 回退（`danger` → 警告，其余 → 信息）。传 `null` 可隐藏
     * @en Panel icon; defaults by `tone` (`danger` → warning, otherwise info). Pass `null` to hide it
     */
    icon?: Component | null
    /**
     * 触发按钮的可访问名；缺省取默认插槽的文本内容
     * @en Accessible name of the trigger button; defaults to the default slot's text
     */
    triggerLabel?: string
}

/**
 * 弹出确认抛出的事件。
 * @en Events emitted by the popconfirm.
 */
export interface PopconfirmEmits {
    /**
     * 点击确认按钮
     * @en The confirm button was pressed
     */
    confirm: []
    /**
     * 取消：点击取消按钮、按 Esc 或点击面板外部关闭
     * @en Cancelled: the cancel button, Escape, or a click outside the panel closed it
     */
    cancel: []
}
