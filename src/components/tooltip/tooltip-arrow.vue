<script setup lang="ts">
import { TooltipArrow } from 'reka-ui'
import type { TooltipArrowProps } from './types'

defineOptions({ name: 'CaomeiTooltipArrow', inheritAttrs: false })

withDefaults(defineProps<TooltipArrowProps>(), {
    width: 10,
    height: 5,
})
</script>

<template>
    <TooltipArrow
        v-bind="$attrs"
        :width="width"
        :height="height"
        class="caomei-tooltip__arrow"
    />
</template>
