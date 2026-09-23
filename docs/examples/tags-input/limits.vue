<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiTagsInput } from '@/components/tags-input'

const tags = ref<string[]>(['已上线', '灰度'])
const rejected = ref('')

function onInvalidInput(value: string): void {
    rejected.value = value
}
</script>

<template>
    <div class="demo-stack">
        <CaomeiTagsInput
            v-model="tags"
            label="发布范围"
            :max="3"
            show-clear
            placeholder="最多 3 个，重复会被拒绝"
            @invalid-input="onInvalidInput"
            @add-tag="rejected = ''"
            @remove-tag="rejected = ''"
        />
        <p class="demo-hint">
            {{ rejected ? `已拒绝：${rejected}（重复或超出上限）` : `当前 ${tags.length} / 3 个标签` }}
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
