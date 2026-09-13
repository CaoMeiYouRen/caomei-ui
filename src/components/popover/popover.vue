<script setup lang="ts">
import { PopoverRoot } from 'reka-ui'
import type { PopoverProps } from './types'

// 根为逻辑容器（Reka PopoverRoot 不渲染 DOM），不继承 attrs；
// class / style 请落在触发器或内容等实际元素上，避免 Vue 无法附着到 fragment 根节点的告警。
defineOptions({ name: 'CaomeiPopover', inheritAttrs: false })

withDefaults(defineProps<PopoverProps>(), {
    modal: false,
})

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
    <PopoverRoot
        v-model:open="open"
        :modal="modal"
    >
        <slot />
    </PopoverRoot>
</template>
