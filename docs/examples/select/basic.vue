<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiSelect } from '@/components/select'

const value = ref<string>()

const options = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry' },
]
</script>

<template>
    <div class="demo-column">
        <CaomeiSelect
            v-model="value"
            :options="options"
            placeholder="请选择水果"
        />
        <p class="demo-value">
            当前值：{{ value ?? '（空）' }}
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
