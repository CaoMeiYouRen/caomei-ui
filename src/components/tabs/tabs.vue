<script setup lang="ts">
import { TabsRoot } from 'reka-ui'
import { computed } from 'vue'
import type { TabsProps } from './types'

defineOptions({ name: 'CaomeiTabs', inheritAttrs: false })

const props = withDefaults(defineProps<TabsProps>(), {
    orientation: 'horizontal',
    activationMode: 'automatic',
    unmountOnHide: true,
})

const model = defineModel<string | number | undefined>()

const rootClass = computed(() => `caomei-tabs--${props.orientation}`)
</script>

<template>
    <TabsRoot
        v-bind="$attrs"
        v-model="model"
        :default-value="defaultValue"
        :orientation="orientation"
        :activation-mode="activationMode"
        :unmount-on-hide="unmountOnHide"
        :dir="dir"
        class="caomei-tabs"
        :class="rootClass"
    >
        <slot />
    </TabsRoot>
</template>

<style scoped>
.caomei-tabs {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--caomei-tabs-gap, var(--caomei-space-2));
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
}

.caomei-tabs--vertical {
    flex-direction: row;
}
</style>
