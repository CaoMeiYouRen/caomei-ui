<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiRichTextEditor } from '@/components/rich-text-editor'

const content = ref('# 你好，草梅 UI\n\n这是一个 **Markdown** 编辑器，工具栏与预览面板由编辑器内核提供。')
</script>

<template>
    <div class="demo-stack">
        <CaomeiRichTextEditor
            v-model="content"
            label="正文"
            height="18rem"
        />
        <p class="demo-hint">
            字符数：{{ content.length }}
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
