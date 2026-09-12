<script setup lang="ts">
import { CaomeiMessage } from '@/components/message'

const tones = [
    { tone: 'neutral', title: '中性', description: '普通信息提示。' },
    { tone: 'primary', title: '主要', description: '强调当前操作。' },
    { tone: 'success', title: '成功', description: '操作已成功完成。' },
    { tone: 'warning', title: '警告', description: '请注意潜在风险。' },
    { tone: 'danger', title: '错误', description: '操作失败，请重试。' },
] as const
</script>

<template>
    <div class="demo-col">
        <CaomeiMessage
            v-for="item in tones"
            :key="item.tone"
            :tone="item.tone"
            :title="item.title"
            :description="item.description"
        />
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
</style>
