<script setup lang="ts">
import { computed } from 'vue'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import type { ResultProps } from './types'

defineOptions({ name: 'CaomeiResult' })

const props = withDefaults(defineProps<ResultProps>(), {
    status: 'info',
    title: '',
    description: '',
    icon: undefined,
    size: 'md',
    as: 'div',
    live: true,
})

const icons = useInternalIcons()

const statusIconMap = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    danger: 'danger',
    403: 'error',
    404: 'info',
    500: 'danger',
} as const

const icon = computed(() => {
    if (props.icon === null) {
        return undefined
    }
    return props.icon ?? icons.value[statusIconMap[props.status]]
})

const toneClass = computed(() => `caomei-result--${props.status}`)
</script>

<template>
    <component
        :is="as"
        class="caomei-result"
        :class="[`caomei-result--${size}`, toneClass]"
        :role="live ? 'status' : undefined"
        :aria-live="live ? 'polite' : undefined"
    >
        <CaomeiIcon
            v-if="icon"
            class="caomei-result__icon"
            :icon="icon"
            aria-hidden="true"
        />
        <h2
            v-if="title || $slots.title"
            class="caomei-result__title"
        >
            <slot name="title">
                {{ title }}
            </slot>
        </h2>
        <p
            v-if="description || $slots.description"
            class="caomei-result__description"
        >
            <slot name="description">
                {{ description }}
            </slot>
        </p>
        <div
            v-if="$slots.extra"
            class="caomei-result__extra"
        >
            <slot name="extra" />
        </div>
    </component>
</template>

<style scoped>
/*
  `--caomei-result-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  档位选择器用 :where() 归零特异性，只声明自定义属性。
*/
.caomei-result {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--caomei-result-gap, var(--caomei-space-2));
    align-items: center;
    justify-content: center;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    padding: var(--caomei-result-padding, calc(var(--caomei-space-4) + var(--caomei-space-2))) var(--caomei-space-3);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    text-align: center;
}

.caomei-result__icon {
    flex-shrink: 0;
    color: var(--caomei-result-icon-color, var(--caomei-color-primary));
    font-size: var(--caomei-result-icon-size, 3rem);
}

.caomei-result--success .caomei-result__icon {
    --caomei-result-icon-color: var(--caomei-color-success);
}

.caomei-result--warning .caomei-result__icon,
.caomei-result--403 .caomei-result__icon {
    --caomei-result-icon-color: var(--caomei-color-warning);
}

.caomei-result--danger .caomei-result__icon,
.caomei-result--500 .caomei-result__icon {
    --caomei-result-icon-color: var(--caomei-color-danger);
}

.caomei-result--404 .caomei-result__icon {
    --caomei-result-icon-color: var(--caomei-color-text-muted);
}

.caomei-result__title {
    max-width: 100%;
    margin: 0;
    color: var(--caomei-result-title-color, var(--caomei-color-text));
    font-weight: var(--caomei-font-weight-medium, 600);
    font-size: var(--caomei-result-title-size, var(--caomei-font-size-lg));
    overflow-wrap: anywhere;
}

.caomei-result__description {
    max-width: 32rem;
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-result-description-size, var(--caomei-font-size-sm));
    overflow-wrap: anywhere;
}

.caomei-result__extra {
    display: flex;
    flex-wrap: wrap;
    gap: var(--caomei-space-2);
    justify-content: center;
    margin-top: var(--caomei-space-2);
}

:where(.caomei-result--sm) {
    --caomei-result-icon-size: 2rem;
    --caomei-result-title-size: var(--caomei-font-size-md);
    --caomei-result-padding: var(--caomei-space-4) var(--caomei-space-3);
}

:where(.caomei-result--lg) {
    --caomei-result-icon-size: 4rem;
    --caomei-result-title-size: var(--caomei-font-size-xl);
    --caomei-result-padding: calc(var(--caomei-space-4) + var(--caomei-space-4)) var(--caomei-space-3);
}
</style>
