<script setup lang="ts">
import { withBase } from 'vitepress'
import { CaomeiImage } from '@/components/image'

/*
 * 懒加载演示使用**本页其他示例未用过的图片地址**（另用一张不同比例的本地占位图），
 * 以便观察「进入视口后才发起请求」。本地图片加载很快，如需看清加载过程，
 * 可在浏览器 DevTools 中限速或查看网络面板。示例使用站点内置的本地占位图（无外链依赖）。
 */
const src = withBase('/demo/image-landscape-wide.svg')
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
