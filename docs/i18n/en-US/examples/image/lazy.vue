<script setup lang="ts">
import { CaomeiImage } from '@/components/image'

/*
 * A lazy-loading demo must use an image URL that **no other demo on this page reuses**:
 * reusing one hits the browser cache and the image appears instantly on entering the
 * viewport, so the loading step is invisible. This uses a different image plus the image
 * source's `random` parameter (its response is not cacheable and a new photo is picked
 * every time), so the loading step stays visible on repeat visits too.
 * The photo comes from Lorem Picsum (photos by Unsplash, under the Unsplash License:
 * free for commercial use, no attribution required).
 */
const src = 'https://picsum.photos/1200/675?random=1'
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
