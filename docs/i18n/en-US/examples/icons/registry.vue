<script setup lang="ts">
import { Heart, Star } from '@lucide/vue'
import { CaomeiIcon, provideIconRegistry } from '@/icons'

// Provided per request: each SSR request is isolated, with no module-level singleton
provideIconRegistry({
    star: Star,
    heart: Heart,
})
</script>

<template>
    <div class="demo-column">
        <div class="demo-row">
            <CaomeiIcon
                name="star"
                label="Favourite"
            />
            <CaomeiIcon
                name="heart"
                label="Like"
            />
            <CaomeiIcon
                name="star"
                size="20"
            />
        </div>
        <p class="demo-text">
            The first two icons resolve from the registry by <code>name</code>; <code>label</code> supplies the accessible
            name. The third is decorative and defaults to <code>aria-hidden="true"</code>.
        </p>
    </div>
</template>

<style scoped>
.demo-column {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.demo-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
    font-size: 20px;
}

.demo-text {
    margin: 0;
    color: var(--vp-c-text-2);
    font-size: 13px;
}
</style>
