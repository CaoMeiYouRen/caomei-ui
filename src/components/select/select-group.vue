<script setup lang="ts">
import {
    SelectGroup,
    SelectLabel,
} from 'reka-ui'

defineOptions({ name: 'CaomeiSelectGroup' })

defineProps<{
    /** 分组标签文本
     * @en Group label text
     */
    label?: string
}>()
</script>

<template>
    <SelectGroup class="caomei-select-group">
        <SelectLabel v-if="label" class="caomei-select-group__label">
            {{ label }}
        </SelectLabel>
        <slot />
    </SelectGroup>
</template>

<style scoped>
.caomei-select-group {
    padding-block: var(--caomei-space-1);
}

.caomei-select-group__label {
    display: block;
    padding: var(--caomei-space-1) var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
    font-weight: 600;
    color: var(--caomei-color-text-muted);
    user-select: none;
}
</style>
