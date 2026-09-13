<script setup lang="ts">
import { CaomeiTag } from '@/components/tag'
</script>

<template>
    <div class="demo-row">
        <CaomeiTag>Default tag</CaomeiTag>
        <CaomeiTag tone="primary">
            Primary
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
