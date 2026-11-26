<script setup lang="ts">
import { CaomeiWatermark } from '@/components/watermark'

/** 内联 SVG 作为图片水印，避免示例依赖外部资源 */
const logo = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22%20width=%22120%22%20height=%2240%22%3E%3Ctext%20x=%220%22%20y=%2228%22%20font-family=%22sans-serif%22%20font-size=%2220%22%20fill=%22%232563eb%22%3ECAOMEI%3C/text%3E%3C/svg%3E'
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
