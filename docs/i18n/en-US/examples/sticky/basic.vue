<script setup lang="ts">
import { CaomeiSticky } from '@/components/sticky'
</script>

<template>
    <div class="sticky-demo">
        <div class="sticky-demo__scroll">
            <CaomeiSticky class="sticky-demo__bar">
                <span class="sticky-demo__title">
                    Article toolbar
                </span>
                <span class="sticky-demo__meta">
                    offset 8px
                </span>
            </CaomeiSticky>
            <p
                v-for="index in 12"
                :key="index"
                class="sticky-demo__line"
            >
                Paragraph {{ index }}: scroll this container to watch the toolbar stick.
            </p>
        </div>
    </div>
</template>

<style scoped>
.sticky-demo__scroll {
    height: 12rem;
    overflow-y: auto;
    padding: var(--caomei-space-2);
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
}

.sticky-demo__bar {
    display: flex;
    gap: var(--caomei-space-2);
    align-items: center;
    justify-content: space-between;
    padding: var(--caomei-space-2) var(--caomei-space-3);
    border-bottom: 1px solid var(--caomei-color-border);
}

.sticky-demo__title {
    font-weight: 600;
}

.sticky-demo__meta {
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}

.sticky-demo__line {
    margin: var(--caomei-space-2) 0;
    color: var(--caomei-color-text);
    line-height: 1.6;
}
</style>
