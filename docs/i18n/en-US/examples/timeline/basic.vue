<script setup lang="ts">
import { CaomeiTimeline, CaomeiTimelineItem } from '@/components/timeline'
</script>

<template>
    <CaomeiTimeline label="Release history">
        <CaomeiTimelineItem
            title="1.4.0"
            timestamp="November 21, 2026"
            tone="success"
            content="Internationalization cleanup and the remaining P1 components."
        />
        <CaomeiTimelineItem
            title="1.3.0"
            timestamp="November 14, 2026"
            content="Dependency and toolchain upgrades, component enhancements and quality guards."
        />
        <CaomeiTimelineItem
            title="1.2.0"
            timestamp="November 8, 2026"
            content="caomei-auth migration feedback and the icon system research."
        />
    </CaomeiTimeline>
</template>
