<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiAutoComplete } from '@/components/auto-complete'

const options = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry' },
    { label: '榴莲', value: 'durian', disabled: true },
]

const selected = ref<string[]>(['apple'])
const count = computed(() => selected.value.length)
</script>

<template>
    <div class="demo-column">
        <CaomeiAutoComplete
            v-model="selected"
            :options="options"
            multiple
            placeholder="输入或选择水果"
            label="水果"
        />
        <span class="demo-text">已选 {{ count }} 项；标签可逐个移除</span>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.demo-text {
    color: var(--vp-c-text-2);
    font-size: 13px;
}
</style>
