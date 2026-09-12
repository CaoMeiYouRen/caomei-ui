<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiMultiSelect } from '@/components/multi-select'

const options = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry' },
]

const selected = ref<string[]>(['apple'])
</script>

<template>
    <div class="demo-column">
        <CaomeiMultiSelect
            v-model="selected"
            :options="options"
            placeholder="可移除已选项"
        />
        <CaomeiMultiSelect
            :options="options"
            :model-value="['apple']"
            disabled
            placeholder="禁用"
        />
        <CaomeiMultiSelect
            :options="options"
            :model-value="['apple']"
            invalid
            placeholder="校验失败"
        />
        <CaomeiMultiSelect
            :options="options"
            size="lg"
            placeholder="大尺寸"
        />
        <CaomeiMultiSelect
            :options="options"
            body-lock
            placeholder="展开时锁定页面滚动（bodyLock）"
        />
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
}
</style>
