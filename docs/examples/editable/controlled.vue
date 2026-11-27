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

const nickname = ref('草梅')
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
                <CaomeiEditableInput label="昵称" />
                <span class="editable-demo__actions">
                    <CaomeiEditableEditTrigger>编辑</CaomeiEditableEditTrigger>
                    <CaomeiEditableSubmitTrigger>提交</CaomeiEditableSubmitTrigger>
                    <CaomeiEditableCancelTrigger>取消</CaomeiEditableCancelTrigger>
                </span>
            </CaomeiEditableArea>
        </CaomeiEditable>
        <p class="editable-demo__hint">
            {{ submitted ? `最近提交：${submitted}` : '用「提交」保存、「取消」回退；Esc 同样回退。' }}
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
