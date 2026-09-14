<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { DividerProps } from './types'

defineOptions({ name: 'CaomeiDivider' })

const props = withDefaults(defineProps<DividerProps>(), {
    orientation: 'horizontal',
    align: 'center',
    variant: 'solid',
})

defineSlots<{
    default?: () => unknown
}>()

const slots = useSlots()
const hasContent = computed(() => Boolean(slots.default) && props.orientation === 'horizontal')

const rootClass = computed(() => [
    `caomei-divider--${props.orientation}`,
    `caomei-divider--${props.variant}`,
    {
        [`caomei-divider--align-${props.align}`]: hasContent.value,
        'caomei-divider--with-content': hasContent.value,
    },
])
</script>

<template>
    <div
        class="caomei-divider"
        :class="rootClass"
        role="separator"
        :aria-orientation="orientation"
    >
        <span v-if="hasContent" class="caomei-divider__content">
            <slot />
        </span>
    </div>
</template>

<style scoped>
/*
  `--caomei-divider-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值：
  否则 scoped 根选择器（0,2,0）会压过使用方 `.caomei-divider`（0,1,0）的同名覆盖。
*/
.caomei-divider {
    border: 0 solid var(--caomei-divider-color, var(--caomei-color-border));
}

.caomei-divider--horizontal {
    margin: var(--caomei-divider-margin, var(--caomei-space-4) 0);
}

.caomei-divider--horizontal:not(.caomei-divider--with-content) {
    border-top-width: var(--caomei-divider-thickness, 1px);
}

.caomei-divider--vertical {
    display: inline-block;
    align-self: stretch;
    min-height: 1em;
    margin: 0 var(--caomei-divider-vertical-margin, var(--caomei-space-2));
    border-left-width: var(--caomei-divider-thickness, 1px);
}

.caomei-divider--dashed {
    border-style: dashed;
}

.caomei-divider--dotted {
    border-style: dotted;
}

.caomei-divider--horizontal.caomei-divider--with-content {
    display: flex;
    align-items: center;
    gap: var(--caomei-divider-gap, var(--caomei-space-3));
    color: var(--caomei-color-text-muted);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-sm);
}

.caomei-divider--horizontal.caomei-divider--with-content::before,
.caomei-divider--horizontal.caomei-divider--with-content::after {
    content: '';
    flex: 1;
    border-top: var(--caomei-divider-thickness, 1px) solid var(--caomei-divider-color, var(--caomei-color-border));
}

.caomei-divider--with-content.caomei-divider--dashed::before,
.caomei-divider--with-content.caomei-divider--dashed::after {
    border-top-style: dashed;
}

.caomei-divider--with-content.caomei-divider--dotted::before,
.caomei-divider--with-content.caomei-divider--dotted::after {
    border-top-style: dotted;
}

.caomei-divider--align-left::before,
.caomei-divider--align-right::after {
    display: none;
}

.caomei-divider__content {
    white-space: nowrap;
}
</style>
