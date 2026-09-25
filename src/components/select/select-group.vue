<script setup lang="ts">
import {
    SelectGroup,
    SelectLabel,
} from 'reka-ui'

defineOptions({ name: 'CaomeiSelectGroup' })

const props = defineProps<{
    /** 分组标签文本
     * @en Group label text
     */
    label?: string
}>()
</script>

<template>
    <!--
      Reka 的 SelectGroup 无条件绑定 `aria-labelledby`（指向标签元素 id），
      未提供 `label` 时该目标不渲染 → 条件省略该属性，避免悬空引用。
    -->
    <SelectGroup
        class="caomei-select-group"
        v-bind="props.label ? {} : {'aria-labelledby': undefined}"
    >
        <SelectLabel
            v-if="props.label"
            class="caomei-select-group__label"
        >
            {{ props.label }}
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
