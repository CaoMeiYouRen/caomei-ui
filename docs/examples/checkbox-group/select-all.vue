<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiCheckboxGroup } from '@/components/checkbox-group'

const fruits = [
    { label: '苹果', value: 'apple' },
    { label: '香蕉', value: 'banana' },
    { label: '樱桃', value: 'cherry' },
    { label: '榴莲', value: 'durian', disabled: true },
]

const selected = ref<string[]>(['apple'])
const count = computed(() => selected.value.length)
</script>

<template>
    <div class="demo-col">
        <CaomeiCheckboxGroup
            v-model="selected"
            :options="fruits"
            select-all
            label="水果"
        />
        <p class="demo-state">
            已选 {{ count }} 项（「榴莲」禁用，不参与全选）
        </p>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.demo-state {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
