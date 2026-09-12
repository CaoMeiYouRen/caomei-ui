<script setup lang="ts">
import { CaomeiMessage } from '@/components/message'
</script>

<template>
    <div class="demo-col">
        <CaomeiMessage
            title="提示"
            description="这是一条中性提示，用于补充说明。"
        />
        <CaomeiMessage
            tone="success"
            title="已完成"
            description="数据已保存。"
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
