<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiAvatar } from '@/components/avatar'

// The demo uses a real photo from Lorem Picsum
// (photo by Unsplash, under the Unsplash License: free for commercial use)
const image = 'https://picsum.photos/seed/caomei-avatar-basic/96/96'
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
