<script setup lang="ts">
import { CaomeiCheckbox } from '@/components/checkbox'

const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
    <div class="demo-col">
        <CaomeiCheckbox
            v-for="size in sizes"
            :key="size"
            :size="size"
            :model-value="true"
            :text="`size: ${size}`"
        />
    </div>
</template>

<style scoped>
.demo-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
</style>
