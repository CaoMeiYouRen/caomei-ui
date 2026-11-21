import type { ComputedRef } from 'vue'
import type { ComponentSize } from '../../types'

/**
 * 描述列表布局：`horizontal` 标签与内容同行，`vertical` 标签在上
 * @en Descriptions layout: `horizontal` puts the label beside the value, `vertical` puts it above
 */
export type DescriptionsLayout = 'horizontal' | 'vertical'

/**
 * 描述列表尺寸档
 * @en Descriptions size step
 */
export type DescriptionsSize = ComponentSize

export interface DescriptionsProps {
    /**
     * 桌面档列数（1–6），默认 3；≤1024px 时最多 2 列，≤640px 时单列
     * @en Column count on desktop (1–6), defaults to 3; at most 2 columns at ≤1024px and a single
     * column at ≤640px
     */
    columns?: number
    /**
     * 是否使用带边框的表格形态；默认 `false`
     * @en Whether to use the bordered table look; defaults to `false`
     */
    bordered?: boolean
    /**
     * 标签列宽度（任意 CSS 长度）；默认由内容决定
     * @en Label column width (any CSS length); content-sized by default
     */
    labelWidth?: string
    /**
     * 布局方向；默认 `horizontal`
     * @en Layout direction; `horizontal` by default
     */
    layout?: DescriptionsLayout
    /**
     * 尺寸档；默认 `md`
     * @en Size step; `md` by default
     */
    size?: DescriptionsSize
}

export interface DescriptionsItemProps {
    /**
     * 标签文本；也可经 `#label` 插槽提供
     * @en Label text; the `#label` slot can supply it instead
     */
    label?: string
    /**
     * 跨列数；默认 1，超过当前列数时按整行处理
     * @en Number of columns to span; defaults to 1. Values beyond the current columns span the row
     */
    span?: number
}

/** 描述列表向下提供的上下文：当前生效的列数（用于夹取 `span`）与展示形态。 */
export interface DescriptionsContext {
    columns: ComputedRef<number>
    layout: DescriptionsLayout
    bordered: boolean
    size: ComponentSize
}
