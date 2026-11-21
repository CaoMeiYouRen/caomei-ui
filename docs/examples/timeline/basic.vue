<script setup lang="ts">
import { CaomeiTimeline, CaomeiTimelineItem } from '@/components/timeline'
</script>

<template>
    <CaomeiTimeline label="版本记录">
        <CaomeiTimelineItem
            title="1.4.0"
            timestamp="2026-11-21"
            tone="success"
            content="国际化收口与 P1 组件补齐。"
        />
        <CaomeiTimelineItem
            title="1.3.0"
            timestamp="2026-11-14"
            content="依赖与工具链升级、组件增强与质量守卫。"
        />
        <CaomeiTimelineItem
            title="1.2.0"
            timestamp="2026-11-08"
            content="caomei-auth 迁移反馈收口与图标体系调研。"
        />
    </CaomeiTimeline>
</template>
