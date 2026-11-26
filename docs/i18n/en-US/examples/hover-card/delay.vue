<script setup lang="ts">
import { CaomeiHoverCard, CaomeiHoverCardContent, CaomeiHoverCardTrigger } from '@/components/hover-card'
</script>

<template>
    <CaomeiHoverCard
        :open-delay="500"
        :close-delay="300"
    >
        <CaomeiHoverCardTrigger>Opens after 500ms</CaomeiHoverCardTrigger>
        <CaomeiHoverCardContent side="right">
            A longer open delay avoids accidental reveals when the pointer passes by; the close delay works the same way.
        </CaomeiHoverCardContent>
    </CaomeiHoverCard>
</template>
