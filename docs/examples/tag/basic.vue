<script setup lang="ts">
import { CaomeiTag } from '@/components/tag'
</script>

<template>
    <div class="demo-row">
        <CaomeiTag>默认标签</CaomeiTag>
        <CaomeiTag tone="primary">
            主要
        </CaomeiTag>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}
</style>
