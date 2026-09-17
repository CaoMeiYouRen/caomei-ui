<script setup lang="ts">
import { computed } from 'vue'
import type { SkeletonProps } from './types'

defineOptions({ name: 'CaomeiSkeleton' })

const props = withDefaults(defineProps<SkeletonProps>(), {
    variant: 'text',
    lines: 1,
    animation: 'pulse',
})

const lineCount = computed(() => {
    if (props.variant !== 'text') {
        return 1
    }
    const lines = Math.floor(props.lines)
    return Number.isFinite(lines) && lines > 0 ? lines : 1
})

function toCssSize(value?: string | number): string | undefined {
    if (value === undefined) {
        return undefined
    }
    return typeof value === 'number' ? `${value}px` : value
}

const rootStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {}
    const width = toCssSize(props.width)
    const height = toCssSize(props.height)
    if (width) {
        style['--caomei-skeleton-width'] = width
    }
    if (height) {
        style['--caomei-skeleton-height'] = height
    }
    return style
})

/** 多行 text 的末行收窄，模拟真实文本段落 */
function lineStyle(index: number): Record<string, string> {
    if (props.variant === 'text' && lineCount.value > 1 && index === lineCount.value - 1) {
        return { width: 'var(--caomei-skeleton-last-line-width, 60%)' }
    }
    return {}
}
</script>

<template>
    <span
        class="caomei-skeleton"
        :class="[
            `caomei-skeleton--${variant}`,
            `caomei-skeleton--${animation}`
        ]"
        :style="rootStyle"
        aria-hidden="true"
    >
        <span
            v-for="index in lineCount"
            :key="index"
            class="caomei-skeleton__line"
            :style="lineStyle(index - 1)"
        />
    </span>
</template>

<style scoped>
/*
  `--caomei-skeleton-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  形状档位选择器用 :where() 归零特异性，只声明 CSS 变量，避免被基类属性覆盖。
*/
.caomei-skeleton {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-skeleton-gap, var(--caomei-space-2));
    width: var(--caomei-skeleton-width, 100%);
}

:where(.caomei-skeleton--circular) {
    --caomei-skeleton-width: 40px;
    --caomei-skeleton-height: 40px;
}

:where(.caomei-skeleton--rectangular) {
    --caomei-skeleton-height: 80px;
}

.caomei-skeleton__line {
    position: relative;
    display: block;
    overflow: hidden;
    width: 100%;
    height: var(--caomei-skeleton-height, 1em);
    border-radius: var(--caomei-skeleton-radius, var(--caomei-radius-sm));
    background: var(--caomei-skeleton-bg, var(--caomei-color-bg-elevated));
}

:where(.caomei-skeleton--circular) .caomei-skeleton__line {
    border-radius: 50%;
}

.caomei-skeleton--pulse .caomei-skeleton__line {
    animation: caomei-skeleton-pulse 1.5s ease-in-out infinite;
}

.caomei-skeleton--wave .caomei-skeleton__line::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
        90deg,
        transparent,
        var(--caomei-skeleton-highlight),
        transparent
    );
    transform: translateX(-100%);
    animation: caomei-skeleton-wave 1.5s ease-in-out infinite;
}

@keyframes caomei-skeleton-pulse {
    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

@keyframes caomei-skeleton-wave {
    100% {
        transform: translateX(100%);
    }
}

@media (prefers-reduced-motion: reduce) {
    .caomei-skeleton--pulse .caomei-skeleton__line {
        animation-duration: 2.4s;
    }

    .caomei-skeleton--wave .caomei-skeleton__line::after {
        animation-duration: 2.4s;
    }
}
</style>
