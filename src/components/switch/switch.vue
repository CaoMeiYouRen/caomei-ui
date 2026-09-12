<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui'
import type { SwitchProps } from './types'

withDefaults(defineProps<SwitchProps>(), {
    disabled: false,
})

const model = defineModel<boolean>({ default: false })
</script>

<template>
    <SwitchRoot
        v-model="model"
        :disabled="disabled"
        class="caomei-switch"
    >
        <SwitchThumb class="caomei-switch__thumb" />
    </SwitchRoot>
</template>

<style scoped>
.caomei-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 40px;
    height: 22px;
    padding: 2px;
    border: 1px solid var(--caomei-color-border);
    border-radius: 999px;
    background: var(--caomei-color-border);
    cursor: pointer;
    transition: background 0.15s ease;
}

.caomei-switch[data-state='checked'] {
    background: var(--caomei-color-primary);
    border-color: var(--caomei-color-primary);
}

.caomei-switch__thumb {
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--caomei-color-bg);
    transition: transform 0.15s ease;
}

.caomei-switch[data-state='checked'] .caomei-switch__thumb {
    transform: translateX(18px);
}
</style>
