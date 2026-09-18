<script setup lang="ts">
import { CaomeiImage } from '@/components/image'

/**
 * 故意不可解码的 data URI：触发 `error` 事件以演示失败占位，且**不产生网络 404**。
 * 此前用缺失路径（`/caomei-ui-not-found.png`）会在浏览器控制台留下 404 记录，干扰 V 阶段「0 console error」断言。
 */
const brokenSrc = 'data:image/png;base64,iVBORw0KGgo='
</script>

<template>
    <div class="demo-column">
        <CaomeiImage
            :src="brokenSrc"
            alt="默认失败占位"
            ratio="16 / 9"
            class="demo-image"
        />
        <CaomeiImage
            :src="brokenSrc"
            alt="自定义失败占位"
            ratio="16 / 9"
            class="demo-image"
        >
            <template #error>
                <span class="demo-error-text">图片加载失败</span>
            </template>
        </CaomeiImage>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 360px;
}

.demo-image {
    width: 100%;
    border-radius: 8px;
}

.demo-error-text {
    color: var(--vp-c-danger-1);
    font-size: 14px;
}
</style>
