<script setup lang="ts">
import { CaomeiWatermark } from '@/components/watermark'
</script>

<template>
    <CaomeiWatermark
        content="caomei-ui 内部资料"
        :gap="80"
        :opacity="0.2"
        :rotate="-22"
    >
        <div class="watermark-demo">
            水印覆盖在内容之上，正文仍可选中与朗读。
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
