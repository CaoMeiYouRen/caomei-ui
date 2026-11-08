<script setup lang="ts">
import { Check, Search } from '@lucide/vue'
import { CaomeiIcon } from '@/icons'

const sizes = [16, 20, 24, 32]
</script>

<template>
    <div class="demo-column">
        <div class="demo-row">
            <CaomeiIcon
                v-for="size in sizes"
                :key="size"
                :icon="Search"
                :size="size"
            />
        </div>
        <div class="demo-row">
            <span class="demo-text">sm <CaomeiIcon :icon="Search" size="sm" /></span>
            <span class="demo-text">md <CaomeiIcon :icon="Search" size="md" /></span>
            <span class="demo-text">lg <CaomeiIcon :icon="Search" size="lg" /></span>
        </div>
        <div class="demo-row">
            <span class="demo-text demo-text--sm">Small <CaomeiIcon :icon="Check" /></span>
            <span class="demo-text demo-text--md">Body <CaomeiIcon :icon="Check" /></span>
            <span class="demo-text demo-text--lg">Heading <CaomeiIcon :icon="Check" /></span>
        </div>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 20px;
}

.demo-text {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.demo-text--sm {
    font-size: 12px;
}

.demo-text--md {
    font-size: 16px;
}

.demo-text--lg {
    font-size: 24px;
}
</style>
