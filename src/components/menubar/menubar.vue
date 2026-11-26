<script setup lang="ts">
import { MenubarRoot } from 'reka-ui'
import type { MenubarProps } from './types'

defineOptions({ name: 'CaomeiMenubar', inheritAttrs: false })

withDefaults(defineProps<MenubarProps>(), {
    loop: true,
    dir: undefined,
})

/** 当前展开的菜单标识（`v-model:modelValue`），对应各 `CaomeiMenubarMenu` 的 `value` */
const modelValue = defineModel<string | undefined>('modelValue', { default: undefined })
</script>

<template>
    <MenubarRoot
        v-bind="$attrs"
        v-model="modelValue"
        :loop="loop"
        :dir="dir"
        class="caomei-menubar"
    >
        <slot />
    </MenubarRoot>
</template>

<style scoped>
.caomei-menubar {
    display: flex;
    align-items: center;
    gap: var(--caomei-menubar-gap, var(--caomei-space-1));
    padding: var(--caomei-menubar-padding, var(--caomei-space-1));
    border: 1px solid var(--caomei-menubar-border, var(--caomei-color-border));
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-menubar-bg, var(--caomei-color-bg-elevated));
    font-family: var(--caomei-font-sans);
}
</style>
