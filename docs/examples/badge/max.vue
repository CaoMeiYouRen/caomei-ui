<script setup lang="ts">
import { CaomeiBadge } from '@/components/badge'
</script>

<template>
    <div class="demo-row">
        <CaomeiBadge :value="99" :max="99" />
        <CaomeiBadge :value="100" :max="99" />
        <CaomeiBadge :value="1000" :max="999" />
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
