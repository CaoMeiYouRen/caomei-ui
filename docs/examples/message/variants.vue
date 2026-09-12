<script setup lang="ts">
import { CaomeiMessage } from '@/components/message'
</script>

<template>
    <div class="demo-col">
        <CaomeiMessage
            variant="soft"
            tone="primary"
            title="soft"
            description="浅色背景，默认变体。"
        />
        <CaomeiMessage
            variant="solid"
            tone="primary"
            title="solid"
            description="实底背景，使用 -solid token。"
        />
        <CaomeiMessage
            variant="outline"
            tone="primary"
            title="outline"
            description="描边与文字着色。"
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
