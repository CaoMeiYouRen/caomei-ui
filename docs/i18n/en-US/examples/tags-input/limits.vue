<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTagsInput } from '@/components/tags-input'

const tags = ref<string[]>(['Released', 'Canary'])
const rejected = ref('')

function onInvalidInput(value: string): void {
    rejected.value = value
}
</script>

<template>
    <div class="demo-stack">
        <CaomeiTagsInput
            v-model="tags"
            label="Release scope"
            :max="3"
            show-clear
            placeholder="Max 3 tags; duplicates are rejected"
            @invalid-input="onInvalidInput"
            @add-tag="rejected = ''"
            @remove-tag="rejected = ''"
        />
        <p class="demo-hint">
            {{ rejected ? `Rejected: ${rejected} (duplicate or over the limit)` : `Current ${tags.length} / 3 tags` }}
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
