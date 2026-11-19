import type { RatingRootProps } from 'reka-ui'
import type { ComponentSize } from '../../types'
import type { FieldIdentityProps, FieldStateProps } from '../_shared/field'

/** 评分图标尺寸档位（与字段公共尺寸同源） */
export type RatingSize = ComponentSize

export interface RatingProps extends FieldStateProps, FieldIdentityProps {
    /**
     * 最大分值（渲染的图标个数）
     * @default 5
     * @en Maximum score (number of icons rendered)
     */
    max?: number
    /**
     * 分值步进：`1` 为整星，`0.5` 为半星
     * @default 1
     * @en Score step: `1` for whole stars, `0.5` for half stars
     */
    step?: 1 | 0.5
    /**
     * 只读：显示当前分值但不可交互（与 `disabled` 语义不同，视觉上同为不可交互）
     * @default false
     * @en Read-only: shows the current score but is not interactive (semantics differ from
     * `disabled`, though both are non-interactive visually)
     */
    readonly?: boolean
    /**
     * 再次点击当前分值是否清零
     * @default false
     * @en Whether clicking the current score again clears it
     */
    clearable?: RatingRootProps['clearable']
}
