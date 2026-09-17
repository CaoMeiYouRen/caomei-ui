<script setup lang="ts">
import { ProgressIndicator, ProgressRoot } from 'reka-ui'
import { computed } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { labelAttrs } from '../_shared/use-label-attrs'
import type { ProgressSpinnerProps } from './types'

defineOptions({ name: 'CaomeiProgressSpinner' })

const props = withDefaults(defineProps<ProgressSpinnerProps>(), {
    size: 'md',
})

const locale = useLocale()
const label = computed(() => props.label ?? locale.value.progress.loading)

const rootClass = computed(() => `caomei-progress-spinner--${props.size}`)
</script>

<template>
    <ProgressRoot
        :model-value="null"
        as="span"
        class="caomei-progress-spinner"
        :class="rootClass"
        v-bind="labelAttrs(label)"
    >
        <ProgressIndicator
            as="span"
            class="caomei-progress-spinner__indicator"
        />
    </ProgressRoot>
</template>

<style scoped>
/*
  `--caomei-progress-spinner-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  尺寸档位选择器用 :where() 归零特异性，保证使用方单类覆盖生效。
*/
.caomei-progress-spinner {
    display: inline-block;
    flex-shrink: 0;
    width: var(--caomei-progress-spinner-size, 24px);
    height: var(--caomei-progress-spinner-size, 24px);
    vertical-align: middle;
}

:where(.caomei-progress-spinner--sm) {
    --caomei-progress-spinner-size: 16px;
    --caomei-progress-spinner-stroke: 2px;
}

:where(.caomei-progress-spinner--md) {
    --caomei-progress-spinner-size: 24px;
    --caomei-progress-spinner-stroke: 2px;
}

:where(.caomei-progress-spinner--lg) {
    --caomei-progress-spinner-size: 32px;
    --caomei-progress-spinner-stroke: 3px;
}

.caomei-progress-spinner__indicator {
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 100%;
    border: var(--caomei-progress-spinner-stroke, 2px) solid
        var(--caomei-progress-spinner-track, var(--caomei-color-border));
    border-top-color: var(--caomei-progress-spinner-color, var(--caomei-color-primary));
    border-radius: 50%;
    animation: caomei-progress-spinner-spin 0.6s linear infinite;
}

@keyframes caomei-progress-spinner-spin {
    to {
        transform: rotate(360deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .caomei-progress-spinner__indicator {
        animation-duration: 1.6s;
    }
}
</style>
