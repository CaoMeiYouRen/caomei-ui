/** 各时间段的步进：方向键与原生 `step` 属性共用该值（缺省 1）。 */
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
     * 小时制：12 或 24，默认 24
     * @default '24'
     * @en Hour cycle: 12 or 24, defaults to 24
     */
    hourFormat?: '12' | '24'
    /**
     * 是否精确到秒，默认 false（只到分钟）
     * @default false
     * @en Whether seconds are editable, defaults to false (minutes only)
     */
    showSeconds?: boolean
    /**
     * 步进配置：各段方向键 / 输入时的最小增量
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
    /**
     * 时间格式语言（BCP 47）；默认取组件库默认语言
     * @en Locale used for time formatting (BCP 47); defaults to the library locale
     */
    locale?: string
    /** 根元素 id（可选） */
    id?: string
}

/** 时间变化：编辑后抛出 `Date`（组件不提供清空路径，不会抛 `null`） */
export type TimePickerEmits = (event: 'update:modelValue', value: Date | null) => void
