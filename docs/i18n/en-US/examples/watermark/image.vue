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
        content="Fallback text when the image fails"
    >
        <div class="watermark-demo">
            The image tiles through its rotated bounding box and falls back to the text watermark on failure.
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
