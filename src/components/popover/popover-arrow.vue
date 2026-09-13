<script setup lang="ts">
import { PopoverArrow } from 'reka-ui'
import type { PopoverArrowProps } from './types'

defineOptions({ name: 'CaomeiPopoverArrow' })

withDefaults(defineProps<PopoverArrowProps>(), {
    width: 10,
    height: 5,
})
</script>

<template>
    <PopoverArrow
        v-bind="$attrs"
        class="caomei-popover__arrow"
        :width="width"
        :height="height"
    />
</template>
