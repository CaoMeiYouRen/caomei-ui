<script setup lang="ts">
import { useSlots } from 'vue'
import { DropdownMenuGroup } from 'reka-ui'
import { slotContainsComponent } from '../_shared/slot-presence'
import CaomeiDropdownMenuLabel from './dropdown-menu-label.vue'

defineOptions({ name: 'CaomeiDropdownMenuGroup', inheritAttrs: false })

const slots = useSlots()

/**
 * 分组仅在**内嵌标签**在位时建立 `aria-labelledby` 关联：Reka 的 `MenuGroup` 无条件绑定其生成的分组
 * id，而该 id 只在 `DropdownMenuLabel` 渲染时落 DOM——无标签即悬空引用。这里做槽内标签在位检测，
 * 缺席时以空值覆盖（Vue 对 `null` 会移除属性）；**使用方显式传入的属性优先**（`$attrs` 后置展开）。
 *
 * 以渲染期函数（而非缓存 `computed`）求值：`useSlots()` 返回的槽对象非响应式，`computed` 只会求值
 * 一次，无法感知标签的动态增减。
 */
function labelAria(): Record<string, string | null> {
    return slotContainsComponent(slots.default, CaomeiDropdownMenuLabel) ? {} : { 'aria-labelledby': null }
}
</script>

<template>
    <DropdownMenuGroup
        v-bind="{...labelAria(), ...$attrs}"
        class="caomei-dropdown-menu__group"
    >
        <slot />
    </DropdownMenuGroup>
</template>
