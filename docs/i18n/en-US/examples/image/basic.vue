<script setup lang="ts">
import { withBase } from 'vitepress'
import { CaomeiImage } from '@/components/image'

/*
 * The source is a 1:1 square while the container is 16:9: only when the two ratios differ
 * can the difference between the `fit` modes be seen — cover crops the top and bottom,
 * contain shows the whole image and leaves the sides blank.
 * The demo uses a built-in local placeholder (no external dependency).
 */
const src = withBase('/demo/image-square.svg')
</script>

<template>
    <div class="demo-row">
        <div class="demo-item">
            <CaomeiImage
                :src="src"
                alt="cover fit: the photo is cropped to fill the container"
                ratio="16 / 9"
                class="demo-image"
            />
            <span class="demo-label">cover (default): cropped to fill</span>
        </div>
        <div class="demo-item">
            <CaomeiImage
                :src="src"
                alt="contain fit: the whole photo is shown and the container background shows through"
                ratio="16 / 9"
                fit="contain"
                class="demo-image demo-image--contain"
            />
            <span class="demo-label">contain: whole photo, blank sides</span>
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

/* Only to make the blank area of contain visible in the docs; also shows --caomei-image-bg can be overridden */
.demo-image--contain {
    --caomei-image-bg: var(--vp-c-brand-soft);
}

.demo-label {
    font-size: 12px;
    color: var(--vp-c-text-2);
}
</style>
