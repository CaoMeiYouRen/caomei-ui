import { Comment, defineComponent, isVNode, type VNodeChild } from 'vue'

/**
 * 无 DOM 的透传层：只把默认插槽原样交出，不渲染任何元素。
 *
 * 用在「包装组件按配置在『真正包装』与『什么都不做』之间切换」的场景：直接写条件兄弟节点会把
 * 组件根变成 Fragment（破坏 `v-show`、`v-model` 之外的原生指令与**父级 scoped 属性**），
 * 而额外包一层真实元素又会改变 DOM 结构 / 布局。以本组件作为 `:is` 的目标即可保持单一根，
 * 且启用 / 停用两态共用同一份模板。
 *
 * 单一根并非「返回数组」就能得到：数组在 vnode 层仍是 Fragment，父组件的 `data-v-*` 只有落到
 * **元素根**时才会被运行时继承（`setScopeId` 沿 `subTree` 递归）。故只有一个可见子节点时直接
 * 返回该节点本身；`v-if` 关闭分支产生的注释节点不算可见根，不阻止收敛。
 *
 * `inheritAttrs: false`：切换过程中传入的配置类属性（如 `disabled`）不得落到子元素上。
 */
export const Passthrough = defineComponent({
    name: 'CaomeiPassthrough',
    inheritAttrs: false,
    setup(_, context): () => VNodeChild {
        return () => {
            const children = context.slots.default?.() ?? []
            const visible = children.filter((child) => !(isVNode(child) && child.type === Comment))
            return visible.length === 1 ? visible[0] : children
        }
    },
})
