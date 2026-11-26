<script setup lang="ts">
import { MenubarMenu } from 'reka-ui'
import type { MenubarMenuProps } from './types'

// 仅透传 Reka 菜单上下文，不渲染自有 DOM；class / style 请落在触发器或内容上
defineOptions({ name: 'CaomeiMenubarMenu', inheritAttrs: false })

withDefaults(defineProps<MenubarMenuProps>(), {
    value: undefined,
})
</script>

<template>
    <MenubarMenu :value="value">
        <slot />
    </MenubarMenu>
</template>
