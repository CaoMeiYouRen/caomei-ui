<script setup lang="ts">
import { CaomeiHoverCard, CaomeiHoverCardArrow, CaomeiHoverCardContent, CaomeiHoverCardTrigger } from '@/components/hover-card'
</script>

<template>
    <p class="hover-card-demo__text">
        把鼠标移到
        <CaomeiHoverCard>
            <CaomeiHoverCardTrigger>「无障碍名称」</CaomeiHoverCardTrigger>
            <CaomeiHoverCardContent>
                供辅助技术朗读的元素名称；可由可见文本、aria-label 或 aria-labelledby 提供。
                <CaomeiHoverCardArrow />
            </CaomeiHoverCardContent>
        </CaomeiHoverCard>
        上查看解释。
    </p>
</template>

<style scoped>
.hover-card-demo__text {
    margin: 0;
    color: var(--caomei-color-text);
    line-height: 1.7;
}
</style>
