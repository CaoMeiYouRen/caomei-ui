<script setup lang="ts">
import { CaomeiDivider } from '@/components/divider'
</script>

<template>
    <div class="demo-stack">
        <CaomeiDivider>居中</CaomeiDivider>
        <CaomeiDivider align="left">
            左对齐
        </CaomeiDivider>
        <CaomeiDivider align="right">
            右对齐
        </CaomeiDivider>
    </div>
</template>

<style scoped>
.demo-stack {
    display: grid;
    gap: 8px;
}
</style>
