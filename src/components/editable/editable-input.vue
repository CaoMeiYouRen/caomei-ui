<script setup lang="ts">
import { EditableInput } from 'reka-ui'
import type { EditableInputProps } from './types'

defineOptions({ name: 'CaomeiEditableInput', inheritAttrs: false })

defineProps<EditableInputProps>()
</script>

<template>
    <EditableInput
        v-bind="$attrs"
        :aria-label="label || undefined"
        class="caomei-editable__input"
    />
</template>

<style scoped>
.caomei-editable__input {
    box-sizing: border-box;
    width: var(--caomei-editable-input-width, 12rem);
    max-width: 100%;
    min-height: var(--caomei-control-height-sm);
    padding: 0 var(--caomei-space-2);
    border: 1px solid var(--caomei-color-primary);
    border-radius: var(--caomei-radius-sm);
    background: var(--caomei-color-bg);
    color: inherit;
    font: inherit;
}

.caomei-editable__input:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}
</style>
