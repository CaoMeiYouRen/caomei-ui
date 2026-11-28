<script setup lang="ts">
import { EditableSubmitTrigger } from 'reka-ui'
import type { EditableTriggerProps } from './types'

defineOptions({ name: 'CaomeiEditableSubmitTrigger', inheritAttrs: false })

withDefaults(defineProps<EditableTriggerProps>(), {
    label: '',
})
</script>

<template>
    <EditableSubmitTrigger
        v-bind="$attrs"
        :aria-label="label || undefined"
        class="caomei-editable__trigger"
    >
        <slot />
    </EditableSubmitTrigger>
</template>

<style scoped>
.caomei-editable__trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--caomei-hit-target-min, 1.75rem);
    min-height: var(--caomei-hit-target-min, 1.75rem);
    padding: 0 var(--caomei-space-1);
    border: 0;
    border-radius: var(--caomei-radius-sm);
    background: transparent;
    color: var(--caomei-color-text-muted);
    font: inherit;
    cursor: pointer;
}

.caomei-editable__trigger:hover {
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
}

.caomei-editable__trigger:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-editable__trigger:disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}
</style>
