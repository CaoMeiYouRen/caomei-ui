<script setup lang="ts">
import { CaomeiCarousel, CaomeiCarouselSlide } from '@/components/carousel'

const slides = ['January', 'February', 'March', 'April', 'May', 'June']
</script>

<template>
    <CaomeiCarousel
        label="Multiple items"
        :slides-per-view="2"
        :gap="12"
        loop
        style="max-width: 560px"
    >
        <CaomeiCarouselSlide
            v-for="slide in slides"
            :key="slide"
        >
            <div class="carousel-demo__slide">
                {{ slide }}
            </div>
        </CaomeiCarouselSlide>
    </CaomeiCarousel>
</template>

<style scoped>
.carousel-demo__slide {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 120px;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg-elevated);
    color: var(--caomei-color-text);
    font-weight: 600;
}
</style>
