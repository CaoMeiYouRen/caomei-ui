<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiRichTextEditor } from '@/components/rich-text-editor'

const content = ref('')

const uploader = (files: File[]): Promise<string[]> =>
    Promise.resolve(files.map((file) => `https://cdn.example.com/${encodeURIComponent(file.name)}`))
</script>

<template>
    <div class="demo-stack">
        <CaomeiRichTextEditor
            v-model="content"
            label="带上传的正文"
            height="18rem"
            :uploader="uploader"
        />
        <p class="demo-hint">
            图片经 <code>uploader</code> 处理，返回值直接写入 Markdown。
        </p>
    </div>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 12px;
}

.demo-hint {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: 13px;
}
</style>
