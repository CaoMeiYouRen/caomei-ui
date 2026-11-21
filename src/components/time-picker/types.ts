/** 滚轮列的一个候选项。 */
export interface TimeWheelOption {
    value: string | number
    label: string
}

/**
 * 各时间段的步进：方向键按该值增减（缺省 1）。
 * 它是增量提示而非取值约束：输入与滚轮仍可落在任意值上（滚轮列不按该值过滤）。
 * @en Step for arrow keys (default 1). It is an increment hint, not a validity constraint:
 * typing and the wheel can still land on any value.
 */
export interface TimePickerStep {
    /** 小时步进 */
    hour?: number
    /** 分钟步进 */
    minute?: number
    /** 秒步进 */
    second?: number
}

export interface TimePickerProps {
    /**
     * 受控时间值：`Date` 的日期部分不参与展示，只取时 / 分 / 秒；`null` 表示空值
     * @en Controlled time value: only hours / minutes / seconds are shown; `null` means empty
     */
    modelValue?: Date | null
    /**
     * 可见标签文本；同时作为时间字段的可访问名（提供 `ariaLabel` 时以它为准）
     * @en Visible label text, also used as the accessible name of the time field
     * (overridden by `ariaLabel`)
     */
    label?: string
    /** 显式可访问名；不提供时回退 `label` */
    ariaLabel?: string
    /**
     * 选择模式：`input` 为内联输入（默认）；`wheel` 为只读展示 + 滚轮弹层；
     * `both` 为内联输入 + 滚轮入口
     * @default 'input'
     * @en Picker mode: `input` for inline fields (default), `wheel` for a read-only display
     * with a wheel popover, `both` for inline fields plus a wheel entry
     */
    mode?: 'input' | 'wheel' | 'both'
    /**
     * 小时制：12 或 24，默认 24
     * @default '24'
     * @en Hour cycle: 12 or 24, defaults to 24
     */
    hourFormat?: '12' | '24'
    /**
     * 是否精确到秒，默认 true（显示时 / 分 / 秒）；需要只到分钟时显式关闭
     * @default true
     * @en Whether seconds are editable, defaults to true (hours / minutes / seconds);
     * turn it off explicitly for minute precision
     */
    showSeconds?: boolean
    /**
     * 时间段是否补 0，默认 true（`09:30:00`）；关闭后显示 `9:30:0`
     * @default true
     * @en Whether time segments are zero-padded, defaults to true (`09:30:00`);
     * turning it off shows `9:30:0`
     */
    pad?: boolean
    /**
     * 步进配置：各段方向键的最小增量（不约束手工输入）
     * @en Step configuration for keyboard and typed increments
     */
    step?: TimePickerStep
    /**
     * 最小可选时刻（含）；只比较时间部分
     * @en Minimum selectable time (inclusive); only the time part is compared
     */
    minValue?: Date
    /**
     * 最大可选时刻（含）；只比较时间部分
     * @en Maximum selectable time (inclusive); only the time part is compared
     */
    maxValue?: Date
    /** 是否停用 */
    disabled?: boolean
    /** 是否只读 */
    readonly?: boolean
    /** 根元素 id（可选） */
    id?: string
}

/** 时间变化：编辑后抛出 `Date`（组件不提供清空路径，不会抛 `null`） */
export type TimePickerEmits = (event: 'update:modelValue', value: Date | null) => void
