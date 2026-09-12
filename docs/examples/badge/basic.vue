<script setup lang="ts">
import { CaomeiBadge } from '@/components/badge'
</script>

<template>
    <div class="demo-row">
        <CaomeiBadge :value="1" />
        <CaomeiBadge :value="5" />
        <CaomeiBadge :value="12" tone="primary" />
        <CaomeiBadge value="NEW" tone="success" />
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
}
</style>
