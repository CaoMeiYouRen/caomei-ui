<script setup lang="ts">
import { CaomeiButton } from '@/components/button'
</script>

<template>
    <div class="demo-row">
        <CaomeiButton size="sm">
            Small
        </CaomeiButton>
        <CaomeiButton size="md">
            Medium
        </CaomeiButton>
        <CaomeiButton size="lg">
            Large
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
