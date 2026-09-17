<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { labelAttrs } from '../_shared/use-label-attrs'
import type { BadgeProps } from './types'

defineOptions({ name: 'CaomeiBadge', inheritAttrs: false })

const props = withDefaults(defineProps<BadgeProps>(), {
    tone: 'danger',
    variant: 'solid',
    size: 'md',
    dot: false,
})

defineSlots<{
    default?: () => unknown
}>()

const slots = useSlots()
const overlay = computed(() => Boolean(slots.default))

const displayValue = computed(() => {
    if (props.dot) {
        return ''
    }
    const { value, max } = props
    if (value === undefined || value === null || value === '') {
        return ''
    }
    if (typeof value === 'number' && Number.isNaN(value)) {
        return ''
    }
    if (typeof value === 'number' && max !== undefined && value > max) {
        return `${max}+`
    }
    return String(value)
})

const visible = computed(() => props.dot || displayValue.value !== '')

const rootClass = computed(() => [
    `caomei-badge--${props.tone}`,
    `caomei-badge--${props.variant}`,
    `caomei-badge--${props.size}`,
    { 'caomei-badge--dot': props.dot },
])

const ariaHidden = computed(() => (props.dot && !props.label ? 'true' : undefined))

const ariaRole = computed(() => (props.dot && props.label ? 'img' : undefined))

/** `role` / `aria-hidden` 仅在组件有明确意见时输出，避免以 `undefined` 覆盖消费者透传值。 */
const ariaAttrs = computed<Record<string, string>>(() => ({
    ...(ariaHidden.value ? { 'aria-hidden': ariaHidden.value } : {}),
    ...(ariaRole.value ? { role: ariaRole.value } : {}),
}))
</script>

<template>
    <span
        v-if="overlay"
        class="caomei-badge-wrapper"
        v-bind="$attrs"
    >
        <slot />
        <span
            v-if="visible"
            class="caomei-badge"
            :class="rootClass"
            v-bind="{...labelAttrs(label), ...ariaAttrs}"
        >
            {{ displayValue }}
        </span>
    </span>
    <span
        v-else-if="visible"
        class="caomei-badge"
        :class="rootClass"
        v-bind="{...$attrs, ...labelAttrs(label), ...ariaAttrs}"
    >
        {{ displayValue }}
    </span>
</template>

<style scoped>
.caomei-badge-wrapper {
    position: relative;
    display: inline-flex;
    vertical-align: middle;
}

.caomei-badge {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 999px;
    font-family: var(--caomei-font-sans);
    font-variant-numeric: tabular-nums;
    line-height: 1;
    white-space: nowrap;
    vertical-align: middle;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.caomei-badge-wrapper > .caomei-badge {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
}

.caomei-badge--primary {
    --caomei-badge-tone: var(--caomei-color-primary);
    --caomei-badge-solid: var(--caomei-color-primary-solid);
}

.caomei-badge--success {
    --caomei-badge-tone: var(--caomei-color-success);
    --caomei-badge-solid: var(--caomei-color-success-solid);
}

.caomei-badge--warning {
    --caomei-badge-tone: var(--caomei-color-warning);
    --caomei-badge-solid: var(--caomei-color-warning-solid);
}

.caomei-badge--danger {
    --caomei-badge-tone: var(--caomei-color-danger);
    --caomei-badge-solid: var(--caomei-color-danger-solid);
}

.caomei-badge--neutral {
    --caomei-badge-tone: var(--caomei-color-text-muted);
    --caomei-badge-solid: var(--caomei-color-neutral-solid);
}

.caomei-badge--soft {
    background: color-mix(in srgb, var(--caomei-badge-tone) 12%, transparent);
    color: var(--caomei-badge-tone);
}

.caomei-badge--solid {
    background: var(--caomei-badge-solid);
    color: var(--caomei-color-on-solid);
}

.caomei-badge--outline {
    border-color: var(--caomei-badge-tone);
    color: var(--caomei-badge-tone);
}

.caomei-badge--sm {
    min-width: 16px;
    height: 16px;
    padding: 0 2px;
    font-size: var(--caomei-font-size-sm);
}

.caomei-badge--md {
    min-width: 20px;
    height: 20px;
    padding: 0 var(--caomei-space-1);
    font-size: var(--caomei-font-size-sm);
}

.caomei-badge--lg {
    min-width: var(--caomei-control-height-sm);
    height: var(--caomei-control-height-sm);
    padding: 0 var(--caomei-space-2);
    font-size: var(--caomei-font-size-md);
}

.caomei-badge--dot {
    width: 8px;
    height: 8px;
    min-width: 0;
    padding: 0;
}

.caomei-badge--dot.caomei-badge--lg {
    width: 10px;
    height: 10px;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-badge {
        transition: none;
    }
}
</style>
