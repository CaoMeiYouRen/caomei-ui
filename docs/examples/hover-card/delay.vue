<script setup lang="ts">
import { CaomeiHoverCard, CaomeiHoverCardContent, CaomeiHoverCardTrigger } from '@/components/hover-card'
</script>

<template>
    <CaomeiHoverCard
        :open-delay="500"
        :close-delay="300"
    >
        <CaomeiHoverCardTrigger>延迟 500ms 展开</CaomeiHoverCardTrigger>
        <CaomeiHoverCardContent side="right">
            适当延长展开延迟，可以避免指针掠过时误触发；收起延迟同理。
        </CaomeiHoverCardContent>
    </CaomeiHoverCard>
</template>
