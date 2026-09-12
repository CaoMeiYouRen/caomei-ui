<script setup lang="ts">
import { CaomeiProgressSpinner } from '@/components/progress-spinner'
</script>

<template>
    <div class="demo-col">
        <div class="demo-row">
            <CaomeiProgressSpinner />
            <span class="demo-text">加载中…</span>
        </div>
        <div class="demo-row">
            <CaomeiProgressSpinner size="lg" />
            <span class="demo-text">可与其他内容并排</span>
        </div>
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.demo-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.demo-text {
    color: var(--caomei-color-text-muted);
    font-size: 14px;
}
</style>
