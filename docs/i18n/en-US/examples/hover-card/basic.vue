<script setup lang="ts">
import { CaomeiHoverCard, CaomeiHoverCardArrow, CaomeiHoverCardContent, CaomeiHoverCardTrigger } from '@/components/hover-card'
</script>

<template>
    <p class="hover-card-demo__text">
        Move the pointer to
        <CaomeiHoverCard>
            <CaomeiHoverCardTrigger>“accessible name”</CaomeiHoverCardTrigger>
            <CaomeiHoverCardContent>
                The name announced to assistive technology; it can come from visible text, aria-label or aria-labelledby.
                <CaomeiHoverCardArrow />
            </CaomeiHoverCardContent>
        </CaomeiHoverCard>
        to see the explanation.
    </p>
</template>

<style scoped>
.hover-card-demo__text {
    margin: 0;
    color: var(--caomei-color-text);
    line-height: 1.7;
}
</style>
