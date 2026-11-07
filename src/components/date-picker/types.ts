import type { ComponentSize } from '../../types'
import type { DateRangeValue } from '../_shared/date'

/** 时间三段（时 / 分 / 秒），供内部时间输入使用 */
export interface TimeParts {
    hour: number
    minute: number
    second: number
}

/** 范围选择值：已完成的闭区间（开始、结束） */
export type DatePickerRange = DateRangeValue

/** 选择模式：单日期或日期区间 */
export type DatePickerSelectionMode = 'single' | 'range'

/**
 * 组件模型：`single` 为原生 `Date`，`range` 为 `[Date, Date]` 闭区间；未选择时为 `null`。
 *
 * 类型为联合而非按 `selectionMode` 收窄：`selectionMode` 是运行期 prop，无法在消费方
 * 静态窄化模型类型；`single` 用法请把绑定值声明为 `Date | null` 之外的联合（见组件页说明）。
 */
export type DatePickerModelValue = Date | DatePickerRange | null

export interface DatePickerProps {
    /**
     * 选择模式：`single` 单选日期，`range` 选择日期区间
     * @default 'single'
     * @en Selection mode: `single` for one date, `range` for a date interval
     */
    selectionMode?: DatePickerSelectionMode

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
     * @en Whether the picker is disabled
     */
    disabled?: boolean
    /**
     * 是否只读（可聚焦但不可改值）
     * @default false
     * @en Whether the picker is read-only (focusable but not changeable)
     */
    readonly?: boolean
    /**
     * 校验失败态，映射 aria-invalid
     * @default false
     * @en Validation failure state, maps to aria-invalid
     */
    invalid?: boolean
    /**
     * 尺寸
     * @default 'md'
     * @en Size
     */
    size?: ComponentSize
    /**
     * 未选择时的占位文本
     * @default ''
     * @en Placeholder text shown before a date is selected
     */
    placeholder?: string
    /**
     * 日期展示格式（PrimeVue 风格 token，如 `yy-mm-dd`）；缺省按 `locale` 输出本地化短日期
     * @en Display format (PrimeVue-style tokens such as `yy-mm-dd`); falls back to a localized short date based on `locale`
     */
    dateFormat?: string
    /**
     * 是否显示日历图标
     * @default true
     * @en Whether to show the calendar icon
     */
    showIcon?: boolean
    /**
     * 是否在面板中选择时间（时 / 分，可选秒）；`selectionMode="range"` 时不支持（日期区间只含日期，时间部分被忽略）
     * @default false
     * @en Whether to pick a time (hour / minute, optionally seconds) in the panel; not supported when `selectionMode="range"` (a range only carries dates, the time part is ignored)
     */
    showTime?: boolean
    /**
     * 小时制：12 或 24
     * @default '24'
     * @en Hour cycle: 12 or 24
     */
    hourFormat?: '12' | '24'
    /**
     * 时间是否精确到秒（`showTime` 为真时生效）
     * @default false
     * @en Whether the time includes seconds (effective when `showTime` is on)
     */
    showSeconds?: boolean
    /**
     * 选择日期后是否收起面板；`showTime` 为真时不收起（便于继续选时间），取消选择同理
     * @default true
     * @en Whether to close the panel after selecting a date; while `showTime` is on it stays open so the time can be picked next, and the same applies when deselecting
     */
    closeOnSelect?: boolean
    /**
     * 日期格式化语言（BCP 47）；默认取组件库默认语言
     * @en Locale used for date formatting (BCP 47); defaults to the library's default locale
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
     * 触发器的可访问名；优先级为「本 prop > 透传 `aria-label` > 当前语言的「日期」」，有可见文本（日期 / 占位符）且前两者都缺省时不附加
     * @en Accessible name of the trigger; priority is "this prop > forwarded `aria-label` > the current locale's \"Date\" text", and none is added when visible text (date / placeholder) is present and neither applies
     */
    label?: string
    /**
     * 触发按钮的 id，便于与 label 关联
     * @en Id of the trigger button, for associating a label
     */
    id?: string
}
