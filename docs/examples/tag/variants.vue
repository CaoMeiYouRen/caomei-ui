<script setup lang="ts">
import { CaomeiTag } from '@/components/tag'

const variants = ['soft', 'solid', 'outline'] as const
const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
    <div class="demo-column">
        <div class="demo-row">
            <CaomeiTag
                v-for="variant in variants"
                :key="variant"
                tone="primary"
                :variant="variant"
            >
                {{ variant }}
            </CaomeiTag>
        </div>
        <div class="demo-row">
            <CaomeiTag
                v-for="size in sizes"
                :key="size"
                tone="success"
                :size="size"
            >
                {{ size }}
            </CaomeiTag>
        </div>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}
</style>
