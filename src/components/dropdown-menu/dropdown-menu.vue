<script setup lang="ts">
import { DropdownMenuRoot } from 'reka-ui'
import { provide, ref } from 'vue'
import { triggerElementKey } from '../_shared/trigger-element'
import type { DropdownMenuProps } from './types'

// 根为逻辑容器（Reka DropdownMenuRoot 不渲染 DOM），不继承 attrs；
// class / style 请落在触发器等实际元素上，避免 Vue 无法附着到 fragment 根节点的告警。
defineOptions({ name: 'CaomeiDropdownMenu', inheritAttrs: false })

withDefaults(defineProps<DropdownMenuProps>(), {
    modal: false,
})

const open = defineModel<boolean>('open', { default: false })

/** 触发器元素：由 CaomeiDropdownMenuTrigger 写入，内容组件读取以保留为隔离面的第二根 */
const triggerEl = ref<HTMLElement | null>(null)
provide(triggerElementKey, triggerEl)
</script>

<template>
    <DropdownMenuRoot
        v-model:open="open"
        :modal="modal"
        :dir="dir"
    >
        <slot />
    </DropdownMenuRoot>
</template>
