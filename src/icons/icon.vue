<script setup lang="ts">
import type { IconProps } from './types'

defineOptions({ name: 'CaomeiIcon' })

withDefaults(defineProps<IconProps>(), {
    size: '1em',
})
</script>

<template>
    <component
        :is="icon"
        class="caomei-icon"
        :size="size"
    />
</template>

<style scoped>
.caomei-icon {
    display: inline-block;
    flex-shrink: 0;
    vertical-align: -0.125em;
}
</style>
