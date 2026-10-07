import { Fragment, type Slot, type VNode } from 'vue'

/**
 * 判断槽内容中是否渲染了指定组件（含 `Fragment` 展平）。
 *
 * 用途：对「有配对部件才建立 ARIA 关联」的引用型属性做**条件输出**——例如分组容器在**无内嵌
 * 标签**时省略 `aria-labelledby`，避免指向不存在 id 的悬空引用。只识别直系与 `Fragment` 展平的
 * 组件节点（深层嵌套包装不在检测面内，属已知边界）。
 *
 * @param slot 待检测的槽函数（通常为 `useSlots().default`）
 * @param target 目标组件（SFC 组件对象）
 * @returns 是否包含目标组件
 */
export function slotContainsComponent(slot: Slot | undefined, target: unknown): boolean {
    if (!slot) {
        return false
    }
    const walk = (vnodes: readonly VNode[]): boolean =>
        vnodes.some((vnode) => {
            if (vnode.type === target) {
                return true
            }
            if (vnode.type === Fragment && Array.isArray(vnode.children)) {
                return walk(vnode.children as VNode[])
            }
            return false
        })
    return walk(slot())
}
