<script setup lang="ts">
import { CaomeiMessage } from '@/components/message'

const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
    <div class="demo-col">
        <CaomeiMessage
            v-for="size in sizes"
            :key="size"
            :size="size"
            tone="primary"
            :title="size"
            description="尺寸影响字号与内边距。"
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
