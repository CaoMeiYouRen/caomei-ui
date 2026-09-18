<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiFileUpload } from '@/components/file-upload'

/*
 * customUpload：组件不做传输，选完文件后（auto）抛出 uploader，
 * 由业务层接管上传；示例仅记录已请求上传的文件名。
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
            choose-label="选择并上传"
            custom-upload
            auto
            accept="image/*"
            :max-file-size="1024 * 1024"
            @uploader="handleUploader"
        />
        <p class="demo-hint">
            已请求上传：{{ uploaded.length ? uploaded.join('、') : '（无）' }}
        </p>
        <p class="demo-hint">
            超过 1 MB 的文件会被拒绝并显示提示。
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
