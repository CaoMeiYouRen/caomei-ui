<script setup lang="ts">
import { injectPopoverRootContext } from 'reka-ui'
import { watchEffect } from 'vue'

/**
 * 内部接线组件：把使用方显式提供的 `id` 写成 `PopoverRoot` 的 `triggerId`。
 *
 * 为什么需要它：Reka 的触发器 id 由 `PopoverRoot` 上下文生成，并在触发器渲染时**覆盖**子元素
 * 自带的 `id`；面板的 `aria-labelledby` 也引用同一个值。若直接在触发按钮上写 `id`，面板引用
 * 会指向被顶掉的生成值（悬空 IDREF）。在触发**之前**注入同一 id，可让 DOM id 与面板引用同源。
 *
 * 不渲染任何节点；未提供 `id` 时保持 Reka 的自动生成值。
 */
defineOptions({ name: 'CaomeiPopoverTriggerId' })

const props = defineProps<{ id?: string }>()

const context = injectPopoverRootContext()
watchEffect(() => {
    if (props.id) {
        context.triggerId = props.id
    }
}, { flush: 'sync' })
</script>

<template>
    <!-- 纯接线组件，无渲染输出 -->
    <slot />
</template>
