<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiDatePicker } from '@/components/date-picker'

const value = ref<Date | null>(null)
</script>

<template>
    <div class="demo-column">
        <CaomeiDatePicker
            v-model="value"
            placeholder="请选择日期"
        />
        <span class="demo-text">
            已选：{{ value ? value.toLocaleDateString('zh-CN') : '未选择' }}
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
