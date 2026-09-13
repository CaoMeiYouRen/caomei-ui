/** 展开模式：single 同时只展开一项，multiple 可同时展开多项 */
export type AccordionType = 'single' | 'multiple'

export interface AccordionProps {
    /**
     * 展开模式
     * @default 'single'
     */
    type?: AccordionType
    /** 非受控模式下的初始展开项：`type="single"` 传字符串，`type="multiple"` 传数组 */
    defaultValue?: string | string[]
    /**
     * 单开模式下是否允许收起已展开项（`type="multiple"` 时无效）
     * @default false
     */
    collapsible?: boolean
    /**
     * 是否禁用整个折叠面板
     * @default false
     */
    disabled?: boolean
    /**
     * 隐藏时是否卸载内容；设为 `false` 后收起的内容保留在 DOM 中
     * @default true
     */
    unmountOnHide?: boolean
}

export interface AccordionItemProps {
    /** 条目标识，需在单个 Accordion 内唯一 */
    value: string
    /**
     * 触发器文本；需要富内容时改用 `#trigger` 插槽。
     *
     * 注意：作为 prop 会拦截原生 HTML `title` 提示属性；需要原生 tooltip 时请改用其他方式。
     */
    title?: string
    /**
     * 是否禁用该条目
     * @default false
     */
    disabled?: boolean
}
