<script setup lang="ts">
import { Primitive } from 'reka-ui'
import type { StepperListProps } from './types'

defineOptions({ name: 'CaomeiStepperList', inheritAttrs: false })

withDefaults(defineProps<StepperListProps>(), {
    asChild: false,
})
</script>

<template>
    <Primitive
        v-bind="$attrs"
        as="div"
        :as-child="asChild"
        class="caomei-stepper__list"
    >
        <slot />
    </Primitive>
</template>

<style scoped>
.caomei-stepper__list {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    gap: var(--caomei-stepper-list-gap, var(--caomei-space-2));
    width: 100%;
}

:where(.caomei-stepper[data-orientation='vertical']) .caomei-stepper__list {
    flex-direction: column;
    align-items: stretch;
}
</style>
