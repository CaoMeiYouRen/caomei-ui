<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { CardProps } from './types'

defineOptions({ name: 'CaomeiCard' })

const props = withDefaults(defineProps<CardProps>(), {
    variant: 'outlined',
    padding: 'md',
    title: '',
    subtitle: '',
    hoverable: false,
    as: 'div',
})

defineSlots<{
    default?: () => unknown
    header?: () => unknown
    title?: () => unknown
    extra?: () => unknown
    footer?: () => unknown
}>()

const slots = useSlots()

const hasHeader = computed(() =>
    [slots.header, slots.title, slots.extra, props.title, props.subtitle].some(Boolean),
)

const rootClass = computed(() => [
    `caomei-card--${props.variant}`,
    `caomei-card--padding-${props.padding}`,
    { 'caomei-card--hoverable': props.hoverable },
])
</script>

<template>
    <component
        :is="as"
        class="caomei-card"
        :class="rootClass"
    >
        <div v-if="hasHeader" class="caomei-card__header">
            <slot name="header">
                <div class="caomei-card__heading">
                    <div v-if="$slots.title || title" class="caomei-card__title">
                        <slot name="title">
                            {{ title }}
                        </slot>
                    </div>
                    <p v-if="subtitle" class="caomei-card__subtitle">
                        {{ subtitle }}
                    </p>
                </div>
                <div v-if="$slots.extra" class="caomei-card__extra">
                    <slot name="extra" />
                </div>
            </slot>
        </div>
        <div v-if="$slots.default" class="caomei-card__body">
            <slot />
        </div>
        <div v-if="$slots.footer" class="caomei-card__footer">
            <slot name="footer" />
        </div>
    </component>
</template>

<style scoped>
/*
  `--caomei-card-*` 只作为覆盖钩子（带默认回退值），不在基类预先声明默认值：
  这样使用方在 `.caomei-card` 上覆盖变量时不会与组件内声明同特异性竞争，
  内边距档位选择器用 :where() 归零特异性，保证「低特异性便于覆盖」成立。
*/
.caomei-card {
    box-sizing: border-box;
    display: block;
    border-radius: var(--caomei-card-radius, var(--caomei-radius-lg));
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
}

.caomei-card--outlined {
    border: 1px solid var(--caomei-card-border, var(--caomei-color-border));
    background: var(--caomei-card-bg, var(--caomei-color-bg));
}

.caomei-card--elevated {
    background: var(--caomei-card-bg, var(--caomei-color-bg));
    box-shadow: var(--caomei-card-shadow, var(--caomei-shadow-sm));
}

.caomei-card--filled {
    background: var(--caomei-card-bg, var(--caomei-color-bg-elevated));
}

:where(.caomei-card--padding-none) {
    --caomei-card-padding: 0;
}

:where(.caomei-card--padding-sm) {
    --caomei-card-padding: var(--caomei-space-3);
}

:where(.caomei-card--padding-md) {
    --caomei-card-padding: var(--caomei-space-4);
}

:where(.caomei-card--padding-lg) {
    --caomei-card-padding: calc(var(--caomei-space-4) + var(--caomei-space-2));
}

.caomei-card--hoverable {
    transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.caomei-card--hoverable:hover {
    box-shadow: var(--caomei-card-shadow-hover, var(--caomei-shadow-md));
    transform: translateY(-2px);
}

.caomei-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--caomei-space-2);
    padding: var(--caomei-card-padding, var(--caomei-space-4));
}

.caomei-card__heading {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-1);
    min-width: 0;
}

.caomei-card__title {
    font-size: var(--caomei-font-size-lg);
    font-weight: 600;
    line-height: 1.4;
}

.caomei-card__subtitle {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-md);
}

.caomei-card__extra {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
}

.caomei-card__body {
    padding: var(--caomei-card-padding, var(--caomei-space-4));
}

.caomei-card__header + .caomei-card__body,
.caomei-card__body + .caomei-card__footer,
.caomei-card__header + .caomei-card__footer {
    padding-top: 0;
}

.caomei-card__footer {
    display: flex;
    align-items: center;
    padding: var(--caomei-card-padding, var(--caomei-space-4));
}

@media (prefers-reduced-motion: reduce) {
    .caomei-card--hoverable {
        transition: none;
    }

    .caomei-card--hoverable:hover {
        transform: none;
    }
}
</style>
