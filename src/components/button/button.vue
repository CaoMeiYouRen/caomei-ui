<script setup lang="ts">
import { computed } from 'vue'
import { CaomeiBadge } from '../badge'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { ButtonProps } from './types'

defineOptions({ name: 'CaomeiButton', inheritAttrs: false })

const props = withDefaults(defineProps<ButtonProps>(), {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    block: false,
    rounded: false,
    iconPosition: 'start',
    type: 'button',
    badgeTone: 'neutral',
})

const emit = defineEmits<{
    click: [event: MouseEvent]
}>()

defineSlots<{
    default?: () => unknown
    icon?: () => unknown
}>()

const isInactive = computed(() => props.disabled || props.loading)

const forwardedAttrs = useLabelAttrs(() => props.label)

/** 加载态由组件表达 `aria-busy`；非加载态保留消费者透传值。 */
const rootAttrs = computed<Record<string, unknown>>(() => ({
    ...forwardedAttrs.value,
    ...(props.loading ? { 'aria-busy': 'true' } : {}),
}))

const rootClass = computed(() => [
    `caomei-button--${props.variant}`,
    `caomei-button--${props.size}`,
    {
        [`caomei-button--tone-${props.tone}`]: Boolean(props.tone),
        'caomei-button--block': props.block,
        'caomei-button--rounded': props.rounded,
        'caomei-button--loading': props.loading,
    },
])

function onClick(event: MouseEvent): void {
    emit('click', event)
}
</script>

<template>
    <button
        v-bind="rootAttrs"
        class="caomei-button"
        :class="rootClass"
        :type="type"
        :disabled="isInactive"
        @click="onClick"
    >
        <span
            v-if="loading"
            class="caomei-button__spinner"
            aria-hidden="true"
        />
        <span
            v-if="!loading && $slots.icon && iconPosition === 'start'"
            class="caomei-button__icon"
        >
            <slot name="icon" />
        </span>
        <span v-if="$slots.default" class="caomei-button__content">
            <slot />
        </span>
        <span
            v-if="!loading && $slots.icon && iconPosition === 'end'"
            class="caomei-button__icon"
        >
            <slot name="icon" />
        </span>
        <CaomeiBadge
            v-if="badge"
            class="caomei-button__badge"
            :value="badge"
            :tone="badgeTone"
        />
    </button>
</template>

<style scoped>
.caomei-button {
    --caomei-button-bg: var(--caomei-color-primary);
    --caomei-button-fg: var(--caomei-color-primary-foreground);
    --caomei-button-border: var(--caomei-color-border);
    --caomei-button-text: var(--caomei-color-text);
    --caomei-button-focus: var(--caomei-color-primary);

    position: relative;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-space-1);
    border: 1px solid transparent;
    border-radius: var(--caomei-radius-md);
    font-family: var(--caomei-font-sans);
    line-height: 1;
    cursor: pointer;
    user-select: none;
    transition: opacity 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
}

.caomei-button:disabled {
    cursor: not-allowed;
    opacity: var(--caomei-disabled-opacity);
}

.caomei-button:focus-visible {
    outline: 2px solid var(--caomei-button-focus);
    outline-offset: 2px;
}

.caomei-button--block {
    width: 100%;
}

.caomei-button--rounded {
    border-radius: var(--caomei-radius-full);
}

.caomei-button--primary {
    background: var(--caomei-button-bg);
    color: var(--caomei-button-fg);
}

.caomei-button--secondary {
    background: var(--caomei-color-bg);
    border-color: var(--caomei-button-border);
    color: var(--caomei-button-text);
}

.caomei-button--ghost {
    background: transparent;
    color: var(--caomei-button-text);
}

.caomei-button--tone-neutral {
    --caomei-button-bg: var(--caomei-color-neutral-solid);
    --caomei-button-fg: var(--caomei-color-on-solid);
    --caomei-button-border: var(--caomei-color-border);
    --caomei-button-text: var(--caomei-color-text);
    --caomei-button-focus: var(--caomei-color-text);
}

.caomei-button--tone-primary {
    --caomei-button-bg: var(--caomei-color-primary-solid);
    --caomei-button-fg: var(--caomei-color-on-solid);
    --caomei-button-border: var(--caomei-color-primary);
    --caomei-button-text: var(--caomei-color-primary);
    --caomei-button-focus: var(--caomei-color-primary);
}

.caomei-button--tone-success {
    --caomei-button-bg: var(--caomei-color-success-solid);
    --caomei-button-fg: var(--caomei-color-on-solid);
    --caomei-button-border: var(--caomei-color-success);
    --caomei-button-text: var(--caomei-color-success);
    --caomei-button-focus: var(--caomei-color-success);
}

.caomei-button--tone-warning {
    --caomei-button-bg: var(--caomei-color-warning-solid);
    --caomei-button-fg: var(--caomei-color-on-solid);
    --caomei-button-border: var(--caomei-color-warning);
    --caomei-button-text: var(--caomei-color-warning);
    --caomei-button-focus: var(--caomei-color-warning);
}

.caomei-button--tone-danger {
    --caomei-button-bg: var(--caomei-color-danger-solid);
    --caomei-button-fg: var(--caomei-color-on-solid);
    --caomei-button-border: var(--caomei-color-danger);
    --caomei-button-text: var(--caomei-color-danger);
    --caomei-button-focus: var(--caomei-color-danger);
}

.caomei-button--sm {
    height: var(--caomei-control-height-sm);
    padding: 0 var(--caomei-space-2);
    font-size: var(--caomei-font-size-sm);
}

.caomei-button--md {
    height: var(--caomei-control-height-md);
    padding: 0 var(--caomei-space-3);
    font-size: var(--caomei-font-size-md);
}

.caomei-button--lg {
    height: var(--caomei-control-height-lg);
    padding: 0 var(--caomei-space-4);
    font-size: var(--caomei-font-size-lg);
}

.caomei-button__icon,
.caomei-button__spinner,
.caomei-button__content {
    display: inline-flex;
    align-items: center;
}

.caomei-button__icon,
.caomei-button__spinner {
    flex-shrink: 0;
}

/*
  角标以右上角外扩方式叠加（对齐 PrimeVue）：按钮需为定位上下文且不裁切，
  `pointer-events: none` 保证角标不吞掉按钮的点击区域。
*/
.caomei-button__badge {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    pointer-events: none;
}

.caomei-button__spinner {
    width: 1em;
    height: 1em;
    border: 2px solid currentcolor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: caomei-button-spin 0.6s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-button {
        transition: none;
    }

    .caomei-button__spinner {
        animation: none;
    }
}

@keyframes caomei-button-spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
