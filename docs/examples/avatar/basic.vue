<script setup lang="ts">
import { ref } from 'vue'
import { CaomeiAvatar } from '@/components/avatar'

// 示例使用 Lorem Picsum 的真实头像照片（源自 Unsplash，遵循 Unsplash License，可商用、免署名）
const image = 'https://picsum.photos/seed/caomei-avatar-basic/96/96'
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
