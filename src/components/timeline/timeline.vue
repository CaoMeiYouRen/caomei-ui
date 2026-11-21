<script setup lang="ts">
import { computed } from 'vue'
import type { TimelineProps } from './types'
import { labelAttrs } from '../_shared/use-label-attrs'

defineOptions({ name: 'CaomeiTimeline' })

const props = withDefaults(defineProps<TimelineProps>(), {
    mode: 'left',
    reverse: false,
})

const rootClass = computed(() => [
    `caomei-timeline--${props.mode}`,
    props.reverse ? 'caomei-timeline--reverse' : undefined,
])
</script>

<template>
    <ol
        class="caomei-timeline"
        :class="rootClass"
        v-bind="labelAttrs(label)"
    >
        <slot />
    </ol>
</template>

<style scoped>
.caomei-timeline {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-4);
    margin: 0;
    padding: 0;
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    list-style: none;
}

.caomei-timeline--reverse {
    flex-direction: column-reverse;
}

.caomei-timeline--right :deep(.caomei-timeline__item) {
    flex-direction: row-reverse;
    text-align: right;
}

.caomei-timeline--alternate :deep(.caomei-timeline__item:nth-child(even)) {
    flex-direction: row-reverse;
    text-align: right;
}
</style>
