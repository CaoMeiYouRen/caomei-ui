<script setup lang="ts">
import { Check, ChevronDown, Plus, Search, X } from '@lucide/vue'
import { CaomeiIcon } from '@/icons'
</script>

<template>
    <div class="demo-column">
        <div class="demo-row">
            <CaomeiIcon :icon="Check" />
            <CaomeiIcon :icon="ChevronDown" />
            <CaomeiIcon :icon="Plus" />
            <CaomeiIcon :icon="Search" />
            <CaomeiIcon :icon="X" />
        </div>
        <p class="demo-text">
            默认 <code>1em</code>，随文本字号缩放并对齐基线
            <CaomeiIcon :icon="Check" />
            需要固定大小时传入 <code>size</code>（数字按 px）
            <CaomeiIcon
                :icon="Check"
                size="20"
            />
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    font-size: 20px;
}

.demo-text {
    margin: 0;
    color: var(--vp-c-text-2);
    font-size: 13px;
}
</style>
