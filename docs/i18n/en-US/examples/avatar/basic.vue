<script setup lang="ts">
import { ref } from 'vue'
import { withBase } from 'vitepress'
import { CaomeiAvatar } from '@/components/avatar'

// The demo uses a built-in local avatar placeholder (no external dependency)
const image = withBase('/demo/avatar.svg')
const broken = ref('data:image/png;base64,invalid')
</script>

<template>
    <div class="demo-row">
        <CaomeiAvatar :src="image" alt="Alice" />
        <CaomeiAvatar :src="broken" alt="Bob" />
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
