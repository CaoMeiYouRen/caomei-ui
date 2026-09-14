<script setup lang="ts">
import { CaomeiDivider } from '@/components/divider'
</script>

<template>
    <div class="demo-stack">
        <CaomeiDivider variant="dashed" />
        <CaomeiDivider variant="dotted" />
        <div class="demo-row">
            <span>编辑</span>
            <CaomeiDivider orientation="vertical" />
            <span>复制</span>
            <CaomeiDivider orientation="vertical" />
            <span>删除</span>
        </div>
    </div>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 8px;
}

.demo-row {
    display: flex;
    align-items: center;
    height: 24px;
}
</style>
