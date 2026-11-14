import { defineComponent, type VNodeChild } from 'vue'

/**
 * 无 DOM 的透传层：只把默认插槽原样交出，不渲染任何元素。
 *
 * 用在「包装组件按配置在『真正包装』与『什么都不做』之间切换」的场景：直接写条件兄弟节点会把
 * 组件根变成 Fragment（破坏 `v-show` 与组件级指令），而额外包一层真实元素又会改变 DOM 结构 /
 * 布局。以本组件作为 `:is` 的目标即可保持单一根，且启用 / 停用两态共用同一份模板。
 *
 * `inheritAttrs: false`：切换过程中传入的配置类属性（如 `disabled`）不得落到子元素上。
 */
export const Passthrough = defineComponent({
    name: 'CaomeiPassthrough',
    inheritAttrs: false,
    setup(_, context): () => VNodeChild {
        return () => context.slots.default?.()
    },
})
