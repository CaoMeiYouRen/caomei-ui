<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiCheckbox } from '@/components/checkbox'

const fruits = [
    { value: 'apple', label: '苹果' },
    { value: 'banana', label: '香蕉' },
    { value: 'cherry', label: '樱桃' },
]

const selected = ref<string[]>(['apple'])
const selectedLabels = computed(() =>
    fruits.filter((item) => selected.value.includes(item.value)).map((item) => item.label),
)
</script>

<template>
    <div class="demo-col">
        <CaomeiCheckbox
            v-for="item in fruits"
            :key="item.value"
            v-model="selected"
            :value="item.value"
            :text="item.label"
        />
        <p class="demo-state">
            已选：{{ selectedLabels.join('、') || '无' }}
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
