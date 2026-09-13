<script setup lang="ts">
import { ToolbarToggleItem } from 'reka-ui'
import { computed, useAttrs } from 'vue'
import type { ToolbarToggleItemProps } from './types'

defineOptions({ name: 'CaomeiToolbarToggleItem', inheritAttrs: false })

const props = withDefaults(defineProps<ToolbarToggleItemProps>(), {
    disabled: false,
    label: '',
})

const attrs = useAttrs()

/** label 属性优先于透传的 aria-label；二者都缺省时由可见文本推导可访问名 */
const forwardedAttrs = computed<Record<string, unknown>>(() => ({
    ...attrs,
    ...(props.label ? { 'aria-label': props.label } : {}),
}))
</script>

<template>
    <ToolbarToggleItem
        v-bind="forwardedAttrs"
        :value="value"
        :disabled="disabled"
        class="caomei-toolbar__button"
    >
        <slot />
    </ToolbarToggleItem>
</template>
