<script setup lang="ts">
import { TooltipRoot } from 'reka-ui'
import type { TooltipProps } from './types'

// 根为逻辑容器（Reka TooltipRoot 不渲染 DOM），不继承 attrs；
// class / style 请落在触发器或内容等实际元素上，避免 Vue 无法附着到 fragment 根节点的告警。
defineOptions({ name: 'CaomeiTooltip', inheritAttrs: false })

/*
  **五项一律声明 `default: undefined`**：Reka 的 `TooltipRoot` 对这五项均为
  `props.X ?? providerContext.X.value` —— 只有「根未传（`undefined`）」时才回落到 Provider。
  两项陷阱：① 具名默认值（如 `disabled: false`）会让 Provider 配置被**静默压掉**；
  ② 布尔型 prop 若**没有** `default` 键，Vue 的布尔转换会把「未传」解析成 `false`，
  同样压掉 Provider 配置。故五项显式声明 `default: undefined`（与 Reka 自身 prop 声明同形），
  既保留 Provider 兜底、又保留「单条显式传值优先」。
*/
withDefaults(defineProps<TooltipProps>(), {
    delayDuration: undefined,
    disabled: undefined,
    disableHoverableContent: undefined,
    disableClosingTrigger: undefined,
    ignoreNonKeyboardFocus: undefined,
})

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
    <TooltipRoot
        v-model:open="open"
        :delay-duration="delayDuration"
        :disabled="disabled"
        :disable-hoverable-content="disableHoverableContent"
        :disable-closing-trigger="disableClosingTrigger"
        :ignore-non-keyboard-focus="ignoreNonKeyboardFocus"
    >
        <slot />
    </TooltipRoot>
</template>
