<script setup lang="ts">
import { CaomeiMessage } from '@/components/message'

const tones = [
    { tone: 'neutral', title: 'Neutral', description: 'A general informational notice.' },
    { tone: 'primary', title: 'Primary', description: 'Highlights the current action.' },
    { tone: 'success', title: 'Success', description: 'The action completed successfully.' },
    { tone: 'warning', title: 'Warning', description: 'Be aware of potential risks.' },
    { tone: 'danger', title: 'Error', description: 'The action failed, please retry.' },
] as const
</script>

<template>
    <div class="demo-col">
        <CaomeiMessage
            v-for="item in tones"
            :key="item.tone"
            :tone="item.tone"
            :title="item.title"
            :description="item.description"
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
