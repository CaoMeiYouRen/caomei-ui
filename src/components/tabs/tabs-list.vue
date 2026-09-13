<script setup lang="ts">
import { TabsList } from 'reka-ui'
import type { TabListProps } from './types'

defineOptions({ name: 'CaomeiTabList', inheritAttrs: false })

withDefaults(defineProps<TabListProps>(), {
    loop: true,
})
</script>

<template>
    <TabsList
        v-bind="$attrs"
        :loop="loop"
        class="caomei-tabs__list"
    >
        <slot />
    </TabsList>
</template>

<style scoped>
.caomei-tabs__list {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--caomei-tabs-list-gap, var(--caomei-space-1));
    overflow-x: auto;
    border-bottom: 1px solid var(--caomei-tabs-border, var(--caomei-color-border));
}

:where(.caomei-tabs--vertical) .caomei-tabs__list {
    flex-direction: column;
    align-items: stretch;
    overflow: visible;
    border-right: 1px solid var(--caomei-tabs-border, var(--caomei-color-border));
    border-bottom: none;
}
</style>
