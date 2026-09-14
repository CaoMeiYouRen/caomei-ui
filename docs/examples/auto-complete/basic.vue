<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiAutoComplete } from '@/components/auto-complete'

const value = ref('')

const options = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry' },
    { label: '榴莲', value: 'durian', disabled: true },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiAutoComplete
            v-model="value"
            :options="options"
            placeholder="搜索或输入水果"
            label="水果"
            dropdown
        />
        <p class="demo-value">
            当前值：{{ value || '（空）' }}
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
