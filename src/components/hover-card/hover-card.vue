<script setup lang="ts">
import { HoverCardRoot } from 'reka-ui'
import type { HoverCardProps } from './types'

// 根为逻辑容器（HoverCardRoot 不渲染自有 DOM），不继承 attrs
defineOptions({ name: 'CaomeiHoverCard', inheritAttrs: false })

withDefaults(defineProps<HoverCardProps>(), {
    openDelay: 200,
    closeDelay: 100,
})

/** 展开状态（`v-model:open`）；未绑定时为非受控 */
const open = defineModel<boolean>('open', { default: false })
</script>

<template>
    <HoverCardRoot
        v-model:open="open"
        :open-delay="openDelay"
        :close-delay="closeDelay"
    >
        <slot />
    </HoverCardRoot>
</template>
