<script setup lang="ts">
import { ref } from 'vue'
import {
    CaomeiEditable,
    CaomeiEditableArea,
    CaomeiEditableInput,
    CaomeiEditablePreview,
} from '@/components/editable'

const title = ref('Quarterly business review')
</script>

<template>
    <div class="editable-demo">
        <p class="editable-demo__label">
            Document title
        </p>
        <CaomeiEditable
            v-model="title"
            placeholder="Click to enter a title"
        >
            <CaomeiEditableArea>
                <CaomeiEditablePreview />
                <CaomeiEditableInput label="Document title" />
            </CaomeiEditableArea>
        </CaomeiEditable>
        <p class="editable-demo__hint">
            Focus the preview to edit; press Enter to submit or Esc to revert.
        </p>
    </div>
</template>

<style scoped>
.editable-demo {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
}

.editable-demo__label {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}

.editable-demo__hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
