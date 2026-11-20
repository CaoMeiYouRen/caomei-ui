import type { Component } from 'vue'

/**
 * 标签栏条目值
 * @en Tab bar item value
 */
export type TabbarValue = string | number

/**
 * 数据驱动模式下的一项
 * @en One item in data-driven mode
 */
export interface TabbarItemOption {
    /**
     * 该项唯一值
     * @en Unique value of the item
     */
    value: TabbarValue
    /**
     * 文案
     * @en Label text
     */
    label?: string
    /**
     * 图标组件
     * @en Icon component
     */
    icon?: Component
    /**
     * 角标内容；缺省不显示
     * @en Badge content; hidden when omitted
     */
    badge?: string | number
    /**
     * 是否禁用
     * @en Whether the item is disabled
     */
    disabled?: boolean
}

export interface TabbarProps {
    /**
     * 导航区的可访问名；缺省取当前语言的「主导航」文案
     * @en Accessible name of the navigation region; defaults to the current locale's "Main navigation" text
     */
    label?: string
    /**
     * 是否固定到视口底部（`position: fixed`）；默认 false，由使用方决定是否吸底
     * @en Whether to pin to the viewport bottom (`position: fixed`); false by default, leaving the choice to the consumer
     */
    fixed?: boolean
    /**
     * 数据驱动条目；提供后不再渲染默认插槽
     * @en Data-driven items; when provided the default slot is not rendered
     */
    items?: TabbarItemOption[]
}

export interface TabbarItemProps {
    /**
     * 该项唯一值，与 `CaomeiTabbar` 的 `v-model` 比较
     * @en Unique value of the item, compared with `CaomeiTabbar`'s `v-model`
     */
    value: TabbarValue
    /**
     * 文案
     * @en Label text
     */
    label?: string
    /**
     * 图标组件
     * @en Icon component
     */
    icon?: Component
    /**
     * 角标内容；缺省不显示
     * @en Badge content; hidden when omitted
     */
    badge?: string | number
    /**
     * 是否禁用
     * @en Whether the item is disabled
     */
    disabled?: boolean
}
