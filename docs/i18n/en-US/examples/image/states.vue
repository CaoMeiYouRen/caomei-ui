<script setup lang="ts">
import { CaomeiImage } from '@/components/image'
</script>

<template>
    <div class="demo-column">
        <CaomeiImage
            src="/caomei-ui-not-found.png"
            alt="Default error placeholder"
            ratio="16 / 9"
            class="demo-image"
        />
        <CaomeiImage
            src="/caomei-ui-not-found.png"
            alt="Custom error placeholder"
            ratio="16 / 9"
            class="demo-image"
        >
            <template #error>
                <span class="demo-error-text">Image failed to load</span>
            </template>
        </CaomeiImage>
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

.demo-error-text {
    color: var(--vp-c-danger-1);
    font-size: 14px;
}
</style>
