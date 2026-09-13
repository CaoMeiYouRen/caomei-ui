<script setup lang="ts">
import { Upload } from '@lucide/vue'
import { ref } from 'vue'
import { CaomeiFileUpload } from '@/components/file-upload'
import { CaomeiIcon } from '@/icons'

const files = ref<File[]>([])
</script>

<template>
    <div class="demo-column">
        <CaomeiFileUpload :model-value="[]" disabled />

        <CaomeiFileUpload
            v-model="files"
            multiple
            label="上传图片"
        >
            <CaomeiIcon :icon="Upload" class="demo-upload-icon" />
            <template #file="slotProps">
                <span class="demo-file-name">{{ slotProps.file.name }}</span>
                <button
                    type="button"
                    class="demo-file-remove"
                    @click="slotProps.remove()"
                >
                    移除
                </button>
            </template>
        </CaomeiFileUpload>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 420px;
}

.demo-upload-icon {
    color: var(--vp-c-text-2);
    font-size: 24px;
}

.demo-file-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.demo-file-remove {
    flex-shrink: 0;
    padding: 2px 8px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 4px;
    background: transparent;
    color: var(--vp-c-text-2);
    font-size: 12px;
    cursor: pointer;
}
</style>
