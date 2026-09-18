<script setup lang="ts">
import { CaomeiImage } from '@/components/image'

/*
 * 懒加载演示必须使用**本页其他示例没用过的图片地址**：
 * 复用同一地址会直接命中浏览器缓存，图片进入视口时瞬间完成，看不出加载过程。
 * 这里另用一张图，并加上图片源的 `random` 参数（该响应不可缓存、每次都会重新挑图），
 * 保证重复访问时同样能看到「进入视口才开始加载」。
 * 示例图片来自 Lorem Picsum（照片源自 Unsplash，遵循 Unsplash License，可商用、免署名）。
 */
const src = 'https://picsum.photos/1200/675?random=1'
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
