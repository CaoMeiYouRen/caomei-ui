<script setup lang="ts">
import { TagGroupRoot } from 'reka-ui'
import type { TagGroupProps } from './types'

defineOptions({ name: 'CaomeiTagGroup', inheritAttrs: false })

withDefaults(defineProps<TagGroupProps>(), {
    selectionMode: 'none',
    disallowEmptySelection: false,
    disabled: false,
    loop: true,
})

/**
 * 受控选中值。`single` 模式为字符串、`multiple` 为字符串数组；`none` 模式下不参与选择，
 * 传 `undefined` 时 Reka 视作未受控。
 */
const model = defineModel<string | string[] | null>('modelValue')

const emit = defineEmits<{
    /**
     * 用户移除某个标签时触发，载荷为被移除标签的值
     * @en Emitted when the user removes a tag, with the removed value
     */
    remove: [value: string]
}>()

/**
 * Reka 只在**根节点带 `onRemove` 监听**时才允许移除（`allowsRemoving()` 检查 vnode props），
 * 因此必须在本层接住并转成逐值事件，否则删除触发器点了没反应。
 */
function onRemove(values: string[]): void {
    for (const value of values) {
        emit('remove', value)
    }
}
</script>

<template>
    <!-- `remove` 由标签项冒泡：Reka 的 ItemDelete 只负责从选择集合里移除 -->
    <TagGroupRoot
        v-bind="$attrs"
        :model-value="model ?? undefined"
        :selection-mode="selectionMode"
        :disallow-empty-selection="disallowEmptySelection || undefined"
        :disabled="disabled || undefined"
        :loop="loop"
        class="caomei-tag-group"
        :class="{'caomei-tag-group--disabled': disabled}"
        @update:model-value="model = $event"
        @remove="onRemove"
    >
        <slot />
    </TagGroupRoot>
</template>

<style scoped>
.caomei-tag-group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--caomei-tag-group-gap, var(--caomei-space-2));
    align-items: center;
    max-width: 100%;
}

.caomei-tag-group--disabled {
    opacity: var(--caomei-disabled-opacity);
}
</style>
