<script setup lang="ts">
import { computed, provide, type StyleValue } from 'vue'
import { descriptionsContextKey } from './context'
import type { DescriptionsProps } from './types'

defineOptions({ name: 'CaomeiDescriptions' })

const props = withDefaults(defineProps<DescriptionsProps>(), {
    columns: 3,
    bordered: false,
    labelWidth: undefined,
    layout: 'horizontal',
    size: 'md',
})

const columnCount = computed(() => Math.min(6, Math.max(1, Math.trunc(props.columns))))

provide(descriptionsContextKey, {
    columns: columnCount,
    layout: props.layout,
    bordered: props.bordered,
    size: props.size,
})

const rootClass = computed(() => [
    `caomei-descriptions--${props.size}`,
    `caomei-descriptions--${props.layout}`,
    {
        'caomei-descriptions--bordered': props.bordered,
        [`caomei-descriptions--cols-${columnCount.value}`]: true,
    },
])

const rootStyle = computed<StyleValue>(() => ({
    '--caomei-descriptions-base-columns': columnCount.value,
    ...(props.labelWidth ? { '--caomei-descriptions-label-width': props.labelWidth } : {}),
}))
</script>

<template>
    <dl
        class="caomei-descriptions"
        :class="rootClass"
        :style="rootStyle"
    >
        <slot />
    </dl>
</template>

<style scoped>
/*
  `--caomei-descriptions-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  档位选择器用 :where() 归零特异性，只声明自定义属性。
*/
.caomei-descriptions {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(var(--caomei-descriptions-columns, var(--caomei-descriptions-base-columns, 3)), minmax(0, 1fr));
    gap: var(--caomei-descriptions-gap, var(--caomei-space-3));
    width: 100%;
    min-width: 0;
    margin: 0;
    font-family: var(--caomei-font-sans);
}

.caomei-descriptions--bordered {
    gap: 0;
    border: 1px solid var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    overflow: hidden;
}

:where(.caomei-descriptions--sm) {
    --caomei-descriptions-gap: var(--caomei-space-2);
    --caomei-descriptions-label-size: var(--caomei-font-size-sm);
    --caomei-descriptions-value-size: var(--caomei-font-size-sm);
}

:where(.caomei-descriptions--lg) {
    --caomei-descriptions-gap: var(--caomei-space-4);
    --caomei-descriptions-label-size: var(--caomei-font-size-md);
    --caomei-descriptions-value-size: var(--caomei-font-size-lg);
}

/* 窄屏档：3 列及以上退 2 列；640 以下全部单列 */
@media (width <= 1024px) {
    .caomei-descriptions:not(.caomei-descriptions--cols-1) {
        --caomei-descriptions-columns: 2;
    }
}

@media (width <= 640px) {
    .caomei-descriptions:not(.caomei-descriptions--cols-1) {
        --caomei-descriptions-columns: 1;
    }
}
</style>
