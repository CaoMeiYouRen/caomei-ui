<script setup lang="ts">
import { CaomeiProgressSpinner } from '@/components/progress-spinner'
</script>

<template>
    <div class="demo-col">
        <div class="demo-row">
            <CaomeiProgressSpinner label="正在提交表单" />
            <span class="demo-text">自定义可访问名（label）</span>
        </div>
        <div class="demo-row">
            <CaomeiProgressSpinner class="demo-brand" />
            <span class="demo-text">通过 CSS 变量覆盖颜色</span>
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

.demo-brand {
    --caomei-progress-spinner-color: #16a34a;
    --caomei-progress-spinner-track: #d1fae5;
}
</style>
