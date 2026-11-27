<script setup lang="ts">
import { EditableArea } from 'reka-ui'

defineOptions({ name: 'CaomeiEditableArea', inheritAttrs: false })
</script>

<template>
    <EditableArea
        v-bind="$attrs"
        class="caomei-editable__area"
    >
        <slot />
    </EditableArea>
</template>

<style scoped>
.caomei-editable__area {
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-space-2);
    max-width: 100%;
}
</style>
