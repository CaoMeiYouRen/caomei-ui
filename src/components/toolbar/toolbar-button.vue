<script setup lang="ts">
import { ToolbarButton } from 'reka-ui'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { ToolbarButtonProps } from './types'

defineOptions({ name: 'CaomeiToolbarButton', inheritAttrs: false })

const props = withDefaults(defineProps<ToolbarButtonProps>(), {
    disabled: false,
    label: '',
})

/** label 属性优先于透传的 aria-label；二者都缺省时由可见文本推导可访问名 */
const forwardedAttrs = useLabelAttrs(() => props.label)
</script>

<template>
    <ToolbarButton
        v-bind="forwardedAttrs"
        :disabled="disabled"
        class="caomei-toolbar__button"
    >
        <slot />
    </ToolbarButton>
</template>
