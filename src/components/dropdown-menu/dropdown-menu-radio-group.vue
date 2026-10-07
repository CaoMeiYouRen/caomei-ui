<script setup lang="ts">
import { useSlots } from 'vue'
import { DropdownMenuRadioGroup } from 'reka-ui'
import { slotContainsComponent } from '../_shared/slot-presence'
import CaomeiDropdownMenuLabel from './dropdown-menu-label.vue'

defineOptions({ name: 'CaomeiDropdownMenuRadioGroup', inheritAttrs: false })

const model = defineModel<string | number | undefined>()
const slots = useSlots()

/**
 * 单选分组仅在**内嵌标签**在位时建立 `aria-labelledby` 关联：Reka 的 `MenuGroup` 无条件绑定其生成的
 * 分组 id，无标签即悬空引用。这里做槽内标签在位检测，缺席时以空值覆盖移除属性；**使用方显式传入的
 * 属性优先**（`$attrs` 后置展开）。以渲染期函数（而非缓存 `computed`）求值以感知标签动态增减。
 */
function labelAria(): Record<string, string | null> {
    return slotContainsComponent(slots.default, CaomeiDropdownMenuLabel) ? {} : { 'aria-labelledby': null }
}
</script>

<template>
    <DropdownMenuRadioGroup
        v-bind="{...labelAria(), ...$attrs}"
        v-model="model"
        class="caomei-dropdown-menu__group"
    >
        <slot />
    </DropdownMenuRadioGroup>
</template>
