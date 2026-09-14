export type FloatLabelVariant = 'over' | 'in'

export interface FloatLabelProps {
    /**
     * 标签浮动方式：`over` 默认居中、聚焦或有值时上浮；`in` 标签常驻字段顶部
     * @en Label style: `over` centers when empty and floats on focus/filled; `in` keeps the label at the top of the field
     */
    variant?: FloatLabelVariant
}
