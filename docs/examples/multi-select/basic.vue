<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiMultiSelect } from '@/components/multi-select'

const options = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry' },
    { label: '榴莲', value: 'durian', disabled: true },
    { label: '接骨木', value: 'elderberry' },
    { label: '无花果', value: 'fig' },
]

const selected = ref<string[]>(['apple', 'banana'])
const count = computed(() => selected.value.length)
</script>

<template>
    <div class="demo-column">
        <CaomeiMultiSelect
            v-model="selected"
            :options="options"
            label="水果"
            placeholder="请选择水果"
        />
        <span class="demo-text">已选 {{ count }} 项；展开后可输入关键字过滤</span>
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
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
