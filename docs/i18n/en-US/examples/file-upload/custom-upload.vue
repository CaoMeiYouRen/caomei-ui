<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiFileUpload } from '@/components/file-upload'

/*
 * customUpload: the component performs no transfer — after selection (auto) it emits
 * `uploader` and the application takes over; this demo only records the requested names.
 */
const uploaded = ref<string[]>([])

function handleUploader(payload: { files: File[] }): void {
    uploaded.value = payload.files.map((file) => file.name)
}
</script>

<template>
    <div class="demo-row">
        <CaomeiFileUpload
            mode="basic"
            choose-label="Choose and upload"
            custom-upload
            auto
            accept="image/*"
            :max-file-size="1024 * 1024"
            @uploader="handleUploader"
        />
        <p class="demo-hint">
            Upload requested: {{ uploaded.length ? uploaded.join(', ') : '(none)' }}
        </p>
        <p class="demo-hint">
            Files larger than 1 MB are rejected with a message.
        </p>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.demo-hint {
    margin: 0;
    font-size: 12px;
    color: var(--vp-c-text-2);
}
</style>
