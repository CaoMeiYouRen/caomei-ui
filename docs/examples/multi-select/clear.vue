<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiMultiSelect } from '@/components/multi-select'

const value = ref<string[]>(['apple', 'banana'])

const options = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry' },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiMultiSelect
            v-model="value"
            :options="options"
            show-clear
            placeholder="请选择水果"
        />
        <p class="demo-value">
            当前值：{{ value.length > 0 ? value.join('、') : '（空）' }}
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}

.demo-value {
    margin: 0;
    font-size: 13px;
    color: var(--vp-c-text-2);
}
</style>
