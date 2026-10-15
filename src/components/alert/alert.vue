<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { CaomeiMessage } from '../message'
import type { AlertProps } from './types'

/*
 * 语义预设包装（薄封装）：**不承载任何自有外观**——样式、色板 token 与 `--caomei-message-*`
 * 覆盖钩子全部复用 `CaomeiMessage`，本组件只做三件事：
 *   1. 收敛语义为「静态档」：`role="none"` ⇒ 不渲染 `role`、不进 live region；
 *   2. 收敛 API：变体去掉 `simple`（行内无框形态属 Message 的字段校验场景）；
 *   3. 挂 `caomei-alert` 类名钩子，便于下游定位与覆盖。
 * 需要 live region（播报）或 `simple` 形态时，请直接用 `CaomeiMessage`（见组件页分工表）。
 */
defineOptions({ name: 'CaomeiAlert', inheritAttrs: false })

withDefaults(defineProps<AlertProps>(), {
    tone: 'neutral',
    variant: 'soft',
    title: '',
    description: '',
    icon: true,
    closable: false,
})

const emit = defineEmits<{
    close: []
}>()

/*
 * `size` 是 `CaomeiMessage` 的能力而**不在 Alert 的收敛 API 内**：若经 `$attrs` 透传即为
 * 「类型上不可表达、运行时却生效」的隐形能力，与本组件「API 收敛」的口径相悖，故在此过滤，
 * 需要字号档时改用 `CaomeiMessage`（或用 CSS 覆盖 `--caomei-message-font-size`）。
 */
const attrs = useAttrs()
const forwardAttrs = computed(() => {
    const { size: _size, ...rest } = attrs
    return rest
})

defineSlots<{
    default?: () => unknown
    icon?: () => unknown
    actions?: () => unknown
}>()
</script>

<template>
    <CaomeiMessage
        v-bind="forwardAttrs"
        class="caomei-alert"
        role="none"
        :tone="tone"
        :variant="variant"
        :title="title"
        :description="description"
        :icon="icon"
        :closable="closable"
        :close-label="closeLabel"
        @close="emit('close')"
    >
        <template v-if="$slots.icon" #icon>
            <slot name="icon" />
        </template>
        <slot />
        <template v-if="$slots.actions" #actions>
            <slot name="actions" />
        </template>
    </CaomeiMessage>
</template>
