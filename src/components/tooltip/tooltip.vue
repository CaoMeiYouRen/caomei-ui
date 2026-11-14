<script setup lang="ts">
import { computed, defineComponent, inject, type VNodeChild } from 'vue'
import { TooltipRoot } from 'reka-ui'
import CaomeiTooltipProvider from './tooltip-provider.vue'
import { CAOMEI_TOOLTIP_PROVIDER_KEY } from './context'
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

/**
 * 无 Provider 时的透传层：不渲染 DOM，只把插槽原样交出。
 *
 * 用于「上层已有 `CaomeiTooltipProvider`」的分支——直接渲染 `TooltipRoot`，不再叠一层 Provider，
 * 以免默认配置覆盖使用方在根部设置的延迟与禁用策略。
 */
const Passthrough = defineComponent({
    name: 'CaomeiTooltipPassthrough',
    inheritAttrs: false,
    setup(_, { slots }): () => VNodeChild {
        return () => slots.default?.()
    },
})

/**
 * Provider 缺失策略 = **内建兜底**。
 *
 * 组件库内建提示（Button 等组件的 `tooltip`）由组件自身渲染，若要求使用方必须在应用根部放置
 * Provider，未接入过 Tooltip 的存量应用升级后会直接抛错。故缺 Provider 时以默认配置兜底：
 * 行为可用，代价是这类提示之间不共享「相邻触发器免延迟」——需要该体验时在根部放置 Provider。
 */
const hasProvider = inject(CAOMEI_TOOLTIP_PROVIDER_KEY, false)
const RootWrapper = computed(() => (hasProvider ? Passthrough : CaomeiTooltipProvider))
</script>

<template>
    <component :is="RootWrapper">
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
    </component>
</template>
