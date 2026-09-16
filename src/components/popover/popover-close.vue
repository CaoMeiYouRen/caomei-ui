<script setup lang="ts">
import { PopoverClose } from 'reka-ui'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { PopoverCloseProps } from './types'

defineOptions({ name: 'CaomeiPopoverClose', inheritAttrs: false })

const props = withDefaults(defineProps<PopoverCloseProps>(), {
    label: '',
})

/** label 属性优先于透传的 aria-label；二者都缺省时由可见文本推导可访问名 */
const forwardedAttrs = useLabelAttrs(() => props.label)
</script>

<template>
    <PopoverClose
        v-bind="forwardedAttrs"
        class="caomei-popover__close"
    >
        <slot />
    </PopoverClose>
</template>
