<script setup lang="ts">
import { TagGroupItemText } from 'reka-ui'

defineOptions({ name: 'CaomeiTagGroupItemText', inheritAttrs: false })
</script>

<template>
    <TagGroupItemText
        v-bind="$attrs"
        class="caomei-tag-group__text"
    >
        <slot />
    </TagGroupItemText>
</template>

<style scoped>
.caomei-tag-group__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>
