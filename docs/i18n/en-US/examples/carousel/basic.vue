<script setup lang="ts">
import { CaomeiCarousel, CaomeiCarouselSlide } from '@/components/carousel'

const slides = [
    { title: 'Overview', tone: 'a' },
    { title: 'Trends', tone: 'b' },
    { title: 'Details', tone: 'c' },
]
</script>

<template>
    <CaomeiCarousel
        label="Basic carousel"
        :gap="12"
        style="max-width: 560px"
    >
        <CaomeiCarouselSlide
            v-for="slide in slides"
            :key="slide.title"
        >
            <div
                class="carousel-demo__slide"
                :class="`carousel-demo__slide--${slide.tone}`"
            >
                {{ slide.title }}
            </div>
        </CaomeiCarouselSlide>
    </CaomeiCarousel>
</template>

<style scoped>
.carousel-demo__slide {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 160px;
    border-radius: var(--caomei-radius-md);
    color: var(--caomei-color-text);
    font-weight: 600;
}

.carousel-demo__slide--a {
    background: var(--caomei-color-bg-elevated);
}

.carousel-demo__slide--b {
    background: color-mix(in srgb, var(--caomei-color-primary) 18%, var(--caomei-color-bg));
}

.carousel-demo__slide--c {
    background: color-mix(in srgb, var(--caomei-color-success) 18%, var(--caomei-color-bg));
}
</style>
