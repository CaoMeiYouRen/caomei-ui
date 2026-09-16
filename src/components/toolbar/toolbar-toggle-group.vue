<script setup lang="ts">
import { ToolbarToggleGroup } from 'reka-ui'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { ToolbarToggleGroupModelValue, ToolbarToggleGroupProps } from './types'

defineOptions({ name: 'CaomeiToolbarToggleGroup', inheritAttrs: false })

const props = withDefaults(defineProps<ToolbarToggleGroupProps>(), {
    type: 'single',
    disabled: false,
    required: false,
    label: '',
})

const model = defineModel<ToolbarToggleGroupModelValue | undefined>()

const forwardedAttrs = useLabelAttrs(() => props.label)

/** Reka 载荷为更宽的 AcceptableValue，收窄为组件支持的 string | number（及数组） */
function handleUpdate(value: unknown): void {
    if (Array.isArray(value)) {
        model.value = value.filter((item): item is string | number => typeof item === 'string' || typeof item === 'number')
        return
    }
    if (typeof value === 'string' || typeof value === 'number') {
        model.value = value
        return
    }
    model.value = undefined
}
</script>

<template>
    <ToolbarToggleGroup
        v-bind="forwardedAttrs"
        :type="type"
        :model-value="model"
        :disabled="disabled"
        :orientation="orientation"
        :name="name"
        :required="required || undefined"
        class="caomei-toolbar__toggle-group"
        @update:model-value="handleUpdate"
    >
        <slot />
    </ToolbarToggleGroup>
</template>

<style scoped>
/* 开关组作为工具条内的一个整体，条目间距由组内 gap 控制 */
.caomei-toolbar__toggle-group {
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-toolbar-gap, var(--caomei-space-1));
}
</style>
