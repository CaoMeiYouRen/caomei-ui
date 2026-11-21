<script setup lang="ts">
import { computed, inject, type StyleValue } from 'vue'
import { descriptionsContextKey } from './context'
import type { DescriptionsItemProps } from './types'

defineOptions({ name: 'CaomeiDescriptionsItem' })

const props = withDefaults(defineProps<DescriptionsItemProps>(), {
    label: '',
    span: 1,
})

const context = inject(descriptionsContextKey, null)

const effectiveSpan = computed(() => {
    const columns = context?.columns.value ?? 1
    return Math.min(columns, Math.max(1, Math.trunc(props.span)))
})

const itemClass = computed(() => [
    `caomei-descriptions__item--${context?.layout ?? 'horizontal'}`,
    `caomei-descriptions__item--${context?.size ?? 'md'}`,
    {
        'caomei-descriptions__item--bordered': context?.bordered ?? false,
        'caomei-descriptions__item--wide': effectiveSpan.value > 1,
    },
])

const itemStyle = computed<StyleValue>(() => ({
    '--caomei-descriptions-item-span': effectiveSpan.value,
}))
</script>

<template>
    <div
        class="caomei-descriptions__item"
        :class="itemClass"
        :style="itemStyle"
    >
        <dt class="caomei-descriptions__label">
            <slot name="label">
                {{ label }}
            </slot>
        </dt>
        <dd class="caomei-descriptions__value">
            <slot />
        </dd>
    </div>
</template>

<style scoped>
.caomei-descriptions__item {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--caomei-descriptions-item-gap, var(--caomei-space-1));
    min-width: 0;
    grid-column: span var(--caomei-descriptions-item-span, 1);
}

.caomei-descriptions__item--horizontal {
    flex-direction: row;
    gap: var(--caomei-descriptions-item-gap, var(--caomei-space-2));
}

.caomei-descriptions__label {
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-descriptions-label-size, var(--caomei-font-size-sm));
    overflow-wrap: anywhere;
}

.caomei-descriptions__item--horizontal .caomei-descriptions__label {
    width: var(--caomei-descriptions-label-width, auto);
}

.caomei-descriptions__value {
    min-width: 0;
    margin: 0;
    color: var(--caomei-color-text);
    font-size: var(--caomei-descriptions-value-size, var(--caomei-font-size-md));
    overflow-wrap: anywhere;
}

/* 带边框：每个条目成为表格单元，标签带浅色底 */
.caomei-descriptions__item--bordered {
    padding: var(--caomei-descriptions-cell-padding, var(--caomei-space-2) var(--caomei-space-3));
    border-right: 1px solid var(--caomei-color-border);
    border-bottom: 1px solid var(--caomei-color-border);
}

.caomei-descriptions__item--bordered:last-child {
    border-right: 0;
}

.caomei-descriptions__item--bordered.caomei-descriptions__item--horizontal .caomei-descriptions__label {
    width: var(--caomei-descriptions-label-width, 7rem);
}

.caomei-descriptions__item--bordered.caomei-descriptions__item--vertical .caomei-descriptions__label {
    padding-bottom: var(--caomei-space-1);
    border-bottom: 1px dashed var(--caomei-color-border);
}

/* 跨列条目在 1024 及以下按整行处理，避免 span 超过当前列数产生隐式列 */
@media (width <= 1024px) {
    .caomei-descriptions__item--wide {
        grid-column: 1 / -1;
    }
}

@media (width <= 640px) {
    .caomei-descriptions__item {
        grid-column: 1 / -1;
    }
}
</style>
