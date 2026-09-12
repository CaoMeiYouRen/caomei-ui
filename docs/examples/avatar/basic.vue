<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiAvatar } from '@/components/avatar'

const image = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZTYzOTQ2Ii8+PC9zdmc+'
const broken = ref('data:image/png;base64,invalid')
</script>

<template>
    <div class="demo-row">
        <CaomeiAvatar :src="image" alt="草梅友仁" />
        <CaomeiAvatar :src="broken" alt="Alice" />
        <CaomeiAvatar fallback="CM" />
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    align-items: center;
    gap: 16px;
}
</style>
