<script setup lang="ts">
import { CaomeiMessage } from '@/components/message'
</script>

<template>
    <div class="demo-col">
        <CaomeiMessage
            variant="soft"
            tone="primary"
            title="soft"
            description="Soft background, the default variant."
        />
        <CaomeiMessage
            variant="solid"
            tone="primary"
            title="solid"
            description="Solid background, using the -solid token."
        />
        <CaomeiMessage
            variant="outline"
            tone="primary"
            title="outline"
            description="Border and colored text."
        />
        <CaomeiMessage
            variant="simple"
            tone="danger"
            description="simple: inline validation text with no background, border or padding."
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
