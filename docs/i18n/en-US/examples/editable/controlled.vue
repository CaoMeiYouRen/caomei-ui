<script setup lang="ts">
import { ref } from 'vue'
import {
    CaomeiEditable,
    CaomeiEditableArea,
    CaomeiEditableCancelTrigger,
    CaomeiEditableEditTrigger,
    CaomeiEditableInput,
    CaomeiEditablePreview,
    CaomeiEditableSubmitTrigger,
} from '@/components/editable'

const nickname = ref('CaoMei')
const submitted = ref('')

function onSubmit(value: string | null): void {
    submitted.value = value ?? ''
}
</script>

<template>
    <div class="editable-demo">
        <CaomeiEditable
            v-model="nickname"
            submit-mode="none"
            @submit="onSubmit"
        >
            <CaomeiEditableArea>
                <CaomeiEditablePreview />
                <CaomeiEditableInput label="Nickname" />
                <span class="editable-demo__actions">
                    <CaomeiEditableEditTrigger>Edit</CaomeiEditableEditTrigger>
                    <CaomeiEditableSubmitTrigger>Submit</CaomeiEditableSubmitTrigger>
                    <CaomeiEditableCancelTrigger>Cancel</CaomeiEditableCancelTrigger>
                </span>
            </CaomeiEditableArea>
        </CaomeiEditable>
        <p class="editable-demo__hint">
            {{ submitted ? `Last submitted: ${submitted}` : 'Use “Submit” to save and “Cancel” to revert; Esc also reverts.' }}
        </p>
    </div>
</template>

<style scoped>
.editable-demo {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
}

.editable-demo__actions {
    display: inline-flex;
    gap: var(--caomei-space-1);
    align-items: center;
}

.editable-demo__hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}
</style>
