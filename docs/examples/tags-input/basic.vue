<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTagsInput } from '@/components/tags-input'

const tags = ref<string[]>(['Vue', 'TypeScript'])
</script>

<template>
    <div class="demo-stack">
        <CaomeiTagsInput
            v-model="tags"
            label="技术栈"
            placeholder="回车或逗号添加标签"
        />
        <p class="demo-hint">
            当前标签：{{ tags.length > 0 ? tags.join('、') : '（空）' }}
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
