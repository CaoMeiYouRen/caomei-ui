<script setup lang="ts">
import { TooltipProvider } from 'reka-ui'
import type { TooltipProviderProps } from './types'

// Provider 为逻辑容器（Reka TooltipProvider 不渲染 DOM），不继承 attrs。
defineOptions({ name: 'CaomeiTooltipProvider', inheritAttrs: false })

withDefaults(defineProps<TooltipProviderProps>(), {
    delayDuration: 700,
    skipDelayDuration: 300,
    disabled: false,
    disableHoverableContent: false,
    disableClosingTrigger: false,
    ignoreNonKeyboardFocus: false,
})

defineSlots<{
    default?: () => unknown
}>()
</script>

<template>
    <TooltipProvider
        :delay-duration="delayDuration"
        :skip-delay-duration="skipDelayDuration"
        :disabled="disabled"
        :disable-hoverable-content="disableHoverableContent"
        :disable-closing-trigger="disableClosingTrigger"
        :ignore-non-keyboard-focus="ignoreNonKeyboardFocus"
    >
        <slot />
    </TooltipProvider>
</template>
