/** 穿梭框的选项值：与 Select 一致，仅接受可稳定比较的字符串 / 数字 */
export type TransferValue = string | number

export interface TransferOption {
    /** 展示文案，同时作为搜索匹配文本 */
    label: string
    value: TransferValue
    /** 禁用该项：不可勾选、不参与移动 */
    disabled?: boolean
}

export interface TransferProps {
    /**
     * 右侧（已选）列表的值集合
     * @default []
     * @en Values on the target (selected) side
     */
    modelValue?: TransferValue[]
    /**
     * 全量数据源
     * @default []
     * @en All available options
     */
    dataSource?: TransferOption[]
    /**
     * 左右面板标题；缺省取内建 locale
     * @en Panel titles; defaults to the built-in locale
     */
    titles?: [string, string]
    /**
     * 是否显示搜索框
     * @default true
     * @en Whether to show the search inputs
     */
    searchable?: boolean
    /**
     * 是否禁用全部交互
     * @default false
     * @en Whether to disable all interactions
     */
    disabled?: boolean
    /**
     * 根容器的可访问名
     * @en Accessible name of the root
     */
    label?: string
}
