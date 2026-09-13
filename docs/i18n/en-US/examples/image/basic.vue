<script setup lang="ts">
import { CaomeiImage } from '@/components/image'

function placeholder(text: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#c7d2fe"/><text x="160" y="100" font-size="28" text-anchor="middle" fill="#3730a3">${text}</text></svg>`
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const src = placeholder('16 / 9')
</script>

<template>
    <div class="demo-column">
        <CaomeiImage
            :src="src"
            alt="Aspect ratio placeholder"
            ratio="16 / 9"
            class="demo-image"
        />
        <CaomeiImage
            :src="src"
            alt="contain fit"
            ratio="16 / 9"
            fit="contain"
            class="demo-image demo-image--contain"
        />
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

.demo-image--contain {
    background: var(--vp-c-bg-soft);
}
</style>
