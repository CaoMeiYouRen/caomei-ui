<script setup lang="ts">
import { CaomeiProgressSpinner } from '@/components/progress-spinner'
</script>

<template>
    <div class="demo-row">
        <div class="demo-item">
            <CaomeiProgressSpinner :stroke-width="1" />
            <span class="demo-label">1px</span>
        </div>
        <div class="demo-item">
            <CaomeiProgressSpinner :stroke-width="3" />
            <span class="demo-label">3px</span>
        </div>
        <!-- 静态属性传的是字符串（PrimeVue 迁移的常见写法），按 px 处理，与数字等价 -->
        <div class="demo-item">
            <CaomeiProgressSpinner stroke-width="4" />
            <span class="demo-label">4px</span>
        </div>
        <div class="demo-item">
            <CaomeiProgressSpinner :stroke-width="6" />
            <span class="demo-label">6px</span>
        </div>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    align-items: center;
    gap: 24px;
}

.demo-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.demo-label {
    color: var(--caomei-color-text-muted);
    font-size: 13px;
}
</style>
