<script setup lang="ts">
import { ref } from 'vue'
import { withBase } from 'vitepress'
import { CaomeiAvatar } from '@/components/avatar'

// 示例使用站点内置的本地头像占位图（无外链依赖）
const image = withBase('/demo/avatar.svg')
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
