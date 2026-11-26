<script setup lang="ts">
import { withBase } from 'vitepress'
import { CaomeiWatermark } from '@/components/watermark'

/** 站点内置占位图（docs/public/demo），示例不依赖外部资源 */
const logo = withBase('/demo/watermark-logo.svg')
</script>

<template>
    <CaomeiWatermark
        :image="logo"
        :image-width="100"
        :image-height="34"
        :gap="[60, 40]"
        :opacity="0.25"
        content="图片加载失败时显示这段文字"
    >
        <div class="watermark-demo">
            图片水印按旋转包围盒平铺；加载失败时回退到文本水印。
        </div>
    </CaomeiWatermark>
</template>

<style scoped>
.watermark-demo {
    display: flex;
    align-items: center;
    min-height: 160px;
    padding: 24px;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
}
</style>
