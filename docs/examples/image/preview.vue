<script setup lang="ts">
import { ZoomIn } from '@lucide/vue'
import { withBase } from 'vitepress'
import { CaomeiImage } from '@/components/image'

/*
 * 源图为 3:2、容器为 16:9，放大预览时能同时看清裁切与遮罩。
 * 示例使用站点内置的本地占位图（无外链依赖）。
 */
const src = withBase('/demo/image-landscape.svg')
</script>

<template>
    <div class="demo-row">
        <div class="demo-item">
            <CaomeiImage
                :src="src"
                alt="点击后放大展示的风景照片"
                ratio="16 / 9"
                preview
                class="demo-image"
            />
            <span class="demo-label">preview：悬停 / 聚焦显示指示器，点击放大</span>
        </div>
        <div class="demo-item">
            <CaomeiImage
                :src="src"
                alt="使用自定义指示器图标的风景照片"
                ratio="16 / 9"
                preview
                :preview-icon="ZoomIn"
                class="demo-image"
            />
            <span class="demo-label">previewIcon：自定义指示器图标</span>
        </div>
    </div>
</template>

<style scoped>
.demo-row {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.demo-item {
    display: flex;
    flex: 1 1 220px;
    flex-direction: column;
    gap: 8px;
    max-width: 320px;
}

.demo-image {
    width: 100%;
    border-radius: 8px;
}

.demo-label {
    font-size: 12px;
    color: var(--vp-c-text-2);
}
</style>
