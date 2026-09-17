import type { DateValue } from '@internationalized/date'

/** Reka 日历网格：按月分组，`rows` 为按周切分的日期（与 reka-ui 的 `Grid<T>` 结构一致） */
export interface CalendarGrid {
    value: DateValue
    rows: DateValue[][]
}

export interface CalendarViewProps {
    /** 星期表头文案（已按 locale 格式化） */
    weekDays: string[]
    /** 月份网格 */
    grid: CalendarGrid[]
}

export interface CalendarProps {
    /**
     * 非受控初始日期
     * @en Initial date when uncontrolled
     */
    defaultValue?: Date
    /**
     * 可选最早日期
     * @en Earliest selectable date
     */
    minValue?: Date
    /**
     * 可选最晚日期
     * @en Latest selectable date
     */
    maxValue?: Date
    /**
     * 是否禁用
     * @default false
     * @en Whether the calendar is disabled
     */
    disabled?: boolean
    /**
     * 是否只读（可聚焦但不可改值）
     * @default false
     * @en Whether the calendar is read-only (focusable but not changeable)
     */
    readonly?: boolean
    /**
     * 日期格式化与文案语言（BCP 47）
     * @en Locale used for date formatting (BCP 47)
     */
    locale?: string
    /**
     * 每周起始日，0 为周日
     * @en First day of the week, 0 is Sunday
     */
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    /**
     * 星期表头格式
     * @default 'narrow'
     * @en Weekday header format
     */
    weekdayFormat?: 'narrow' | 'short' | 'long'
    /**
     * 固定 6 行，避免月份切换时高度跳动
     * @default false
     * @en Keep six weeks so the height does not jump between months
     */
    fixedWeeks?: boolean
    /**
     * 禁止取消已选日期（再次点击不会清空）
     * @default false
     * @en Prevent deselecting the selected date
     */
    preventDeselect?: boolean
    /**
     * 翻页按可见月份数步进（多月份视图）
     * @default false
     * @en Advance by the number of visible months when paging
     */
    pagedNavigation?: boolean
    /**
     * 挂载时聚焦首个可聚焦日期
     * @default false
     * @en Focus the first focusable date on mount
     */
    initialFocus?: boolean
    /**
     * 日历容器的可访问名；优先级为「本 prop > 透传 `aria-label` > 当前语言的「日历」」
     * @en Accessible name of the calendar; priority is "this prop > forwarded `aria-label` > the current locale's \"Calendar\" text"
     */
    label?: string
}

/**
 * 内部日历面板（CalendarRoot + 呈现层）的 props，与 `CalendarProps` 一致。
 *
 * 供 `CaomeiCalendar` 与 `CaomeiDatePicker` 复用同一份 Root 接线，避免两处漂移。
 */
export type CalendarPanelProps = CalendarProps
