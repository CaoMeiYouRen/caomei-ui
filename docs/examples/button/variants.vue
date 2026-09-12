<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
</script>

<template>
    <div class="demo-row">
        <CaomeiButton variant="primary">
            Primary
        </CaomeiButton>
        <CaomeiButton variant="secondary">
            Secondary
        </CaomeiButton>
        <CaomeiButton variant="ghost">
            Ghost
        </CaomeiButton>
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
