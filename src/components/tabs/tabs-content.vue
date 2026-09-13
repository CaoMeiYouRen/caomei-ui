<script setup lang="ts">
import { TabsContent } from 'reka-ui'
import type { TabContentProps } from './types'

defineOptions({ name: 'CaomeiTabContent', inheritAttrs: false })

withDefaults(defineProps<TabContentProps>(), {
    forceMount: false,
})
</script>

<template>
    <TabsContent
        v-bind="$attrs"
        :value="value"
        :force-mount="forceMount"
        class="caomei-tabs__content"
    >
        <slot />
    </TabsContent>
</template>

<style scoped>
.caomei-tabs__content {
    box-sizing: border-box;
    min-width: 0;
    color: var(--caomei-color-text);
    font-size: var(--caomei-font-size-md);
    line-height: 1.6;
}

.caomei-tabs__content:focus-visible {
    border-radius: var(--caomei-radius-sm);
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

:where(.caomei-tabs--vertical) .caomei-tabs__content {
    flex: 1;
}
</style>
