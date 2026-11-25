<script setup lang="ts">
import { ContextMenuRoot } from 'reka-ui'
import { provide, ref } from 'vue'
import { triggerElementKey } from '../_shared/trigger-element'
import type { ContextMenuProps } from './types'

// 根为逻辑容器（Reka ContextMenuRoot 不渲染 DOM），不继承 attrs。
defineOptions({ name: 'CaomeiContextMenu', inheritAttrs: false })

withDefaults(defineProps<ContextMenuProps>(), {
    modal: false,
})

const open = defineModel<boolean>('open', { default: false })

/** 触发区元素：由 CaomeiContextMenuTrigger 写入，内容组件读取以保留为隔离面的第二根 */
const triggerEl = ref<HTMLElement | null>(null)
provide(triggerElementKey, triggerEl)
</script>

<template>
    <ContextMenuRoot
        v-model:open="open"
        :modal="modal"
    >
        <slot />
    </ContextMenuRoot>
</template>
