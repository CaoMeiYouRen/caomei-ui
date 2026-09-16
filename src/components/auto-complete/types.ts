import type { FieldProps, FieldIdentityProps } from '../_shared/field'

/**
 * 建议项
 * @en Suggestion option
 */
export interface AutoCompleteOption {
    /**
     * 选项显示文本
     * @en Option display text
     */
    label: string
    /**
     * 选项值，需在单个 AutoComplete 内唯一且非空字符串
     * @en Option value; must be unique within a single AutoComplete and must not be an empty string
     */
    value: string
    /**
     * 是否禁用该选项
     * @en Whether the option is disabled
     */
    disabled?: boolean
}

/**
 * 建议项输入：字符串等价于 `{ label: value, value }`
 * @en Option input: a string is shorthand for `{ label: value, value }`
 */
export type AutoCompleteOptionInput = AutoCompleteOption | string

/**
 * `complete` 事件在输入停顿 `debounce` 毫秒后触发，供使用方异步拉取建议。
 * @en The `complete` event fires after input pauses for `debounce` milliseconds, for asynchronously fetching suggestions.
 */
export interface AutoCompleteEmits {
    /**
     * 输入停顿后触发，参数为当前输入文本
     * @en Fires after the input pauses; the payload is the current input text
     */
    complete: [query: string]
    /**
     * 提交一个值时触发（选中建议项或回车 / 失焦提交自由文本）
     * @en Fires when a value is committed (selecting a suggestion, or committing free text via Enter / blur)
     */
    select: [value: string]
    /**
     * 输入框获得焦点
     * @en The input is focused
     */
    focus: [event: FocusEvent]
    /**
     * 输入框失去焦点
     * @en The input is blurred
     */
    blur: [event: FocusEvent]
    /**
     * 清除按钮清空值时触发
     * @en Fires when the clear button empties the value
     */
    clear: []
}

/**
 * 与公共契约的差异：`id` 与 `name` 落在内层输入框上；`name` 由 Reka 生成隐藏表单控件。
 * @en Differences from the shared contract: `id` and `name` land on the inner input; `name` generates a
 * hidden form control via Reka.
 */
export interface AutoCompleteProps extends FieldProps, FieldIdentityProps {
    /**
     * 建议列表；字符串项视作 `label` 与 `value` 相同的建议
     * @en Suggestion list; string items are treated as suggestions whose `label` equals their `value`
     */
    options?: AutoCompleteOptionInput[]
    /**
     * 是否多选；多选时 `v-model` 为 `string[]`，单选为 `string`
     * @en Whether multiple; `v-model` is `string[]` when multiple and `string` when single
     */
    multiple?: boolean
    /**
     * 是否渲染右侧下拉触发器
     * @en Whether to render the dropdown trigger on the right
     */
    dropdown?: boolean
    /**
     * 展开时是否锁定页面滚动；默认 false，避免滚动条消失引起布局跳动
     * @en Whether to lock page scroll when open; defaults to false to avoid layout shift from the disappearing scrollbar
     */
    bodyLock?: boolean
    /**
     * 无匹配建议时的提示文案；默认取当前语言的「无匹配建议」
     * @en Text shown when no suggestions match; defaults to the current locale's "No matching suggestions" text
     */
    emptyLabel?: string
    /**
     * 是否处于异步加载中，渲染加载指示
     * @en Whether suggestions are loading asynchronously, renders a loading indicator
     */
    loading?: boolean
    /**
     * 输入停顿多少毫秒后触发 `complete` 事件
     * @en Delay in milliseconds before the `complete` event fires after input pauses
     */
    debounce?: number
    /**
     * 是否显示清除按钮（仅单选）；默认 true
     * @en Whether to show the clear button (single-select only); defaults to true
     */
    clearable?: boolean
    /**
     * 清除按钮可访问名；默认取当前语言的「清除」
     * @en Accessible name of the clear button; defaults to the current locale's "Clear" text
     */
    clearLabel?: string
    /**
     * 展开触发器可访问名；默认取当前语言的「展开建议」
     * @en Accessible name of the open trigger; defaults to the current locale's "Show suggestions" text
     */
    openLabel?: string
    /**
     * 是否跳过客户端按 label 过滤建议。异步 / 模糊检索时建议开启，避免服务端返回但不含关键字的建议被滤除
     * @en Whether to skip client-side filtering of suggestions by label. Enable it for async / fuzzy search so suggestions returned by the server but not containing the query are not filtered out
     */
    ignoreFilter?: boolean
}
