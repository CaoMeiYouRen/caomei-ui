<script setup lang="ts">
import { provide } from 'vue'
import { TooltipProvider } from 'reka-ui'
import { CAOMEI_TOOLTIP_PROVIDER_KEY } from './context'
import type { TooltipProviderProps } from './types'

// Provider 为逻辑容器（Reka TooltipProvider 不渲染 DOM），不继承 attrs。
defineOptions({ name: 'CaomeiTooltipProvider', inheritAttrs: false })

// 存在性标记：`CaomeiTooltip` 据此判断是否启用内建兜底 Provider（见 `context.ts`）。
provide(CAOMEI_TOOLTIP_PROVIDER_KEY, true)

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
