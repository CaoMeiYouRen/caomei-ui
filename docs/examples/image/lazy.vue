<script setup lang="ts">
import { CaomeiImage } from '@/components/image'

function placeholder(text: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#bbf7d0"/><text x="160" y="100" font-size="28" text-anchor="middle" fill="#166534">${text}</text></svg>`
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const src = placeholder('进入视口后加载')
</script>

<template>
    <div class="demo-scroll">
        <p class="demo-tip">
            向下滚动，图片进入视口后才会请求 src。
        </p>
        <div class="demo-spacer" />
        <CaomeiImage
            :src="src"
            alt="懒加载图片"
            ratio="16 / 9"
            lazy
            class="demo-image"
        />
    </div>
</template>

<style scoped>
.demo-scroll {
    max-width: 360px;
    max-height: 180px;
    overflow: auto;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    padding: 12px;
}

.demo-tip {
    margin: 0;
    color: var(--vp-c-text-2);
    font-size: 13px;
}

.demo-spacer {
    height: 240px;
}

.demo-image {
    width: 100%;
    border-radius: 8px;
}
</style>
