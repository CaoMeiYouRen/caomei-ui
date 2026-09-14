<script setup lang="ts">
import { CaomeiDivider } from '@/components/divider'
</script>

<template>
    <div class="demo-stack">
        <CaomeiDivider>Center</CaomeiDivider>
        <CaomeiDivider align="left">
            Left
        </CaomeiDivider>
        <CaomeiDivider align="right">
            Right
        </CaomeiDivider>
    </div>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 8px;
}
</style>
