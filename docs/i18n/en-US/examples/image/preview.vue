<script setup lang="ts">
import { ZoomIn } from '@lucide/vue'
import { CaomeiImage } from '@/components/image'

/*
 * The demo uses real photos from Lorem Picsum (photos by Unsplash, under the Unsplash
 * License: free for commercial use, no attribution required).
 * The source is 3:2 while the container is 16:9, so the crop and the overlay are both
 * visible when the preview opens.
 */
const src = 'https://picsum.photos/seed/caomei-image-preview/1200/800'
</script>

<template>
    <div class="demo-row">
        <div class="demo-item">
            <CaomeiImage
                :src="src"
                alt="A landscape photo shown enlarged after clicking"
                ratio="16 / 9"
                preview
                class="demo-image"
            />
            <span class="demo-label">preview: indicator on hover / focus, click to enlarge</span>
        </div>
        <div class="demo-item">
            <CaomeiImage
                :src="src"
                alt="A landscape photo using a custom indicator icon"
                ratio="16 / 9"
                preview
                :preview-icon="ZoomIn"
                class="demo-image"
            />
            <span class="demo-label">previewIcon: custom indicator icon</span>
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
