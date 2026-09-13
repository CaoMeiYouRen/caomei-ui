<script setup lang="ts">
import { CaomeiMessage } from '@/components/message'
</script>

<template>
    <div class="demo-col">
        <CaomeiMessage
            title="Notice"
            description="This is a neutral notice used for extra context."
        />
        <CaomeiMessage
            tone="success"
            title="Completed"
            description="Data has been saved."
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
