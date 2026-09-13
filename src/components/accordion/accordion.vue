<script setup lang="ts">
import { AccordionRoot } from 'reka-ui'
import type { AccordionProps } from './types'

defineOptions({ name: 'CaomeiAccordion', inheritAttrs: false })

withDefaults(defineProps<AccordionProps>(), {
    type: 'single',
    collapsible: false,
    disabled: false,
    unmountOnHide: true,
})

const model = defineModel<string | string[] | undefined>()
</script>

<template>
    <AccordionRoot
        v-bind="$attrs"
        v-model="model"
        :type="type"
        :default-value="defaultValue"
        :collapsible="collapsible"
        :disabled="disabled"
        :unmount-on-hide="unmountOnHide"
        class="caomei-accordion"
    >
        <slot />
    </AccordionRoot>
</template>

<style scoped>
.caomei-accordion {
    box-sizing: border-box;
    overflow: hidden;
    border: 1px solid var(--caomei-accordion-border, var(--caomei-color-border));
    border-radius: var(--caomei-accordion-radius, var(--caomei-radius-md));
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
}
</style>
