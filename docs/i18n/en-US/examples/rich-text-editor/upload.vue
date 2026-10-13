<script setup lang="ts">
import { ref } from 'vue'
import { withBase } from 'vitepress'
import { CaomeiRichTextEditor } from '@/components/rich-text-editor'

const content = ref('')

// Demo uploader contract: the returned values are written into the Markdown; this example returns a bundled local placeholder (no external dependency)
const uploader = (files: File[]): Promise<string[]> =>
    Promise.resolve(files.map(() => withBase('/demo/image-square.svg')))
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
