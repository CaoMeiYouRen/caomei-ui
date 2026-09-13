<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTag } from '@/components/tag'

const tags = ref(['Vue', 'TypeScript', 'Vite'])

function remove(index: number): void {
    tags.value = tags.value.filter((_, current) => current !== index)
}
</script>

<template>
    <div class="demo-row">
        <CaomeiTag
            v-for="(tag, index) in tags"
            :key="tag"
            tone="primary"
            closable
            @close="remove(index)"
        >
            {{ tag }}
        </CaomeiTag>
        <span v-if="tags.length === 0" class="demo-empty">All removed</span>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.demo-empty {
    font-size: 13px;
    color: var(--vp-c-text-2);
}
</style>
