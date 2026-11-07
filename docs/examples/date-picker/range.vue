<script setup lang="ts">
import { computed, ref } from 'vue'
import { CaomeiDatePicker, type DatePickerRange } from '@/components/date-picker'

const range = ref<DatePickerRange | null>([new Date(2026, 8, 1), new Date(2026, 8, 7)])
const minValue = new Date(2026, 0, 1)
const maxValue = new Date(2026, 11, 31)

const summary = computed(() => {
    const value = range.value
    if (!value) {
        return '未选择'
    }
    return `${value[0].toLocaleDateString('zh-CN')} 至 ${value[1].toLocaleDateString('zh-CN')}`
})
</script>

<template>
    <div class="demo-column">
        <CaomeiDatePicker
            v-model="range"
            selection-mode="range"
            date-format="yy-mm-dd"
            :min-value="minValue"
            :max-value="maxValue"
            label="统计区间"
            placeholder="请选择开始与结束日期"
        />
        <span class="demo-text">
            已选区间：{{ summary }}
        </span>
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
