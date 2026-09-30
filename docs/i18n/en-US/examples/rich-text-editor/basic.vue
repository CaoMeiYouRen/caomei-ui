<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiRichTextEditor } from '@/components/rich-text-editor'

const content = ref('# Hello, caomei-ui\n\nThis is a **Markdown** editor; the toolbar and preview pane come from the editor kernel.')
</script>

<template>
    <div class="demo-stack">
        <CaomeiRichTextEditor
            v-model="content"
            label="Content"
            height="18rem"
        />
        <p class="demo-hint">
            Characters: {{ content.length }}
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
