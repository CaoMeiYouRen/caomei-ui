<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
import { CaomeiCard } from '@/components/card'
</script>

<template>
    <CaomeiCard
        class="demo-card"
        title="卡片标题"
        subtitle="一句话说明卡片用途"
    >
        <p class="demo-text">
            卡片正文内容，可放置任意元素。
        </p>
        <template #footer>
            <CaomeiButton size="sm">
                查看详情
            </CaomeiButton>
        </template>
    </CaomeiCard>
</template>

<style scoped>
.demo-card {
    max-width: 360px;
}

.demo-text {
    margin: 0;
}
</style>
