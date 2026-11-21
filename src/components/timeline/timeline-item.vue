<script setup lang="ts">
import { useSlots } from 'vue'
import { CaomeiIcon } from '../../icons'
import type { TimelineItemProps } from './types'

defineOptions({ name: 'CaomeiTimelineItem' })

withDefaults(defineProps<TimelineItemProps>(), {
    tone: 'primary',
})

const slots = useSlots()
</script>

<template>
    <li
        class="caomei-timeline__item"
        :data-tone="tone"
    >
        <span
            class="caomei-timeline__dot"
            aria-hidden="true"
        >
            <CaomeiIcon
                v-if="icon"
                :icon="icon"
                class="caomei-timeline__icon"
            />
        </span>
        <div class="caomei-timeline__body">
            <span
                v-if="timestamp"
                class="caomei-timeline__timestamp"
            >{{ timestamp }}</span>
            <div
                v-if="title"
                class="caomei-timeline__title"
            >
                {{ title }}
            </div>
            <div
                v-if="slots.default || content"
                class="caomei-timeline__content"
            >
                <slot>{{ content }}</slot>
            </div>
        </div>
    </li>
</template>

<style scoped>
.caomei-timeline__item {
    position: relative;
    display: flex;
    gap: var(--caomei-space-3);
    min-width: 0;
}

.caomei-timeline__item:not(:last-child)::before {
    position: absolute;
    top: 1.25rem;
    bottom: calc(-1 * var(--caomei-space-4));
    left: 0.4375rem;
    width: 1px;
    background: var(--caomei-color-border);
    content: '';
}

.caomei-timeline__dot {
    z-index: var(--caomei-z-raise);
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    width: 0.875rem;
    height: 0.875rem;
    margin-top: 0.3125rem;
    border: 2px solid var(--caomei-color-primary);
    border-radius: 50%;
    background: var(--caomei-color-bg);
}

.caomei-timeline__item[data-tone='neutral'] .caomei-timeline__dot {
    border-color: var(--caomei-color-border);
}

.caomei-timeline__item[data-tone='success'] .caomei-timeline__dot {
    border-color: var(--caomei-color-success);
}

.caomei-timeline__item[data-tone='warning'] .caomei-timeline__dot {
    border-color: var(--caomei-color-warning);
}

.caomei-timeline__item[data-tone='danger'] .caomei-timeline__dot {
    border-color: var(--caomei-color-danger);
}

.caomei-timeline__icon {
    font-size: 0.625rem;
}

.caomei-timeline__body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: var(--caomei-space-1);
    min-width: 0;
}

.caomei-timeline__timestamp {
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
}

.caomei-timeline__title {
    font-weight: 600;
}

.caomei-timeline__content {
    color: var(--caomei-color-text-muted);
    line-height: 1.6;
}

.caomei-timeline--right .caomei-timeline__item:not(:last-child)::before,
.caomei-timeline--alternate .caomei-timeline__item:nth-child(even)::before {
    right: 0.4375rem;
    left: auto;
}
</style>
