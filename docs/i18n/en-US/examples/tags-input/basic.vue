<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTagsInput } from '@/components/tags-input'

const tags = ref<string[]>(['Vue', 'TypeScript'])
</script>

<template>
    <div class="demo-stack">
        <CaomeiTagsInput
            v-model="tags"
            label="Tech stack"
            placeholder="Press Enter or comma to add"
        />
        <p class="demo-hint">
            Current tags: {{ tags.length > 0 ? tags.join(', ') : '(empty)' }}
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
