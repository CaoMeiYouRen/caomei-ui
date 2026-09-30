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
            label="Content with upload"
            height="18rem"
            :uploader="uploader"
        />
        <p class="demo-hint">
            Images are handled by <code>uploader</code>; the returned URLs are written into the Markdown.
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
