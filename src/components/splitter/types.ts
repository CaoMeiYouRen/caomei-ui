/** 分栏方向：水平（左右）或垂直（上下） */
export type SplitterDirection = 'horizontal' | 'vertical'

export interface SplitterProps {
    /**
     * 分栏方向
     * @default 'horizontal'
     * @en Split direction
     */
    direction?: SplitterDirection
    /**
     * 键盘方向键每次调整的百分比
     * @default 10
     * @en Percentage adjusted per arrow-key press
     */
    keyboardResizeBy?: number
    /**
     * 自动保存 id：提供后按 Reka 的存储键记住上次布局。
     * 与受控 `layout` 同时使用时以受控初值为准（挂载期忽略恢复事件），autoSave 从应用后的值继续记录。
     * @en Auto-save id: remembers the last layout under Reka's storage key when provided.
     * With a controlled `layout`, the controlled value wins on mount (restore events are ignored
     * during initialization) and auto-save continues from the applied value.
     */
    autoSaveId?: string
}

export interface SplitterPanelProps {
    /**
     * 初始尺寸（百分比，缺省均分）
     * @en Initial size in percent (evenly split by default)
     */
    defaultSize?: number
    /**
     * 最小尺寸（百分比）
     * @en Minimum size in percent
     */
    minSize?: number
    /**
     * 最大尺寸（百分比）
     * @en Maximum size in percent
     */
    maxSize?: number
    /**
     * 是否可折叠
     * @default false
     * @en Whether the panel can collapse
     */
    collapsible?: boolean
    /**
     * 折叠后的尺寸（百分比）
     * @en Size in percent when collapsed
     */
    collapsedSize?: number
}

export interface SplitterResizeHandleProps {
    /**
     * 可访问名；缺省取当前语言的「调整面板大小」
     * @en Accessible name; defaults to the locale's "Resize panels"
     */
    label?: string
    /**
     * 是否禁用拖拽与键盘调整
     * @default false
     * @en Whether dragging and keyboard resizing are disabled
     */
    disabled?: boolean
}
