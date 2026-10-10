<script setup lang="ts">
import { withBase } from 'vitepress'
import { CaomeiImage } from '@/components/image'

/*
 * A lazy-loading demo uses an image URL that **no other demo on this page reuses**
 * (a different local placeholder), so "the request starts only after entering the viewport"
 * can be observed. Local images load fast, so use browser DevTools throttling or the network
 * panel to see the loading step. The demo uses a built-in local placeholder (no external dependency).
 */
const src = withBase('/demo/image-landscape-wide.svg')
</script>

<template>
    <div class="demo-scroll">
        <p class="demo-tip">
            Scroll down; src is requested only after the image enters the viewport.
        </p>
        <div class="demo-spacer" />
        <CaomeiImage
            :src="src"
            alt="Lazy-loaded image"
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
