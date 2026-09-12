<script setup lang="ts">
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from 'reka-ui'
import type { DialogProps } from './types'

withDefaults(defineProps<DialogProps>(), {
    description: '',
    closeLabel: '关闭',
})

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
    <DialogRoot v-model:open="open">
        <DialogTrigger as-child>
            <slot name="trigger" />
        </DialogTrigger>
        <DialogPortal>
            <DialogOverlay class="caomei-dialog__overlay" />
            <DialogContent class="caomei-dialog__content">
                <DialogTitle class="caomei-dialog__title">
                    {{ title }}
                </DialogTitle>
                <DialogDescription class="caomei-dialog__description">
                    {{ description }}
                </DialogDescription>
                <slot />
                <DialogClose class="caomei-dialog__close" :aria-label="closeLabel">
                    ×
                </DialogClose>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>

<style scoped>
.caomei-dialog__overlay {
    position: fixed;
    inset: 0;
    background: rgb(0 0 0 / 0.45);
}

.caomei-dialog__content {
    position: fixed;
    top: 50%;
    left: 50%;
    width: min(90vw, 420px);
    padding: var(--caomei-space-4);
    border-radius: var(--caomei-radius-lg);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    transform: translate(-50%, -50%);
}

.caomei-dialog__close {
    position: absolute;
    top: var(--caomei-space-2);
    right: var(--caomei-space-2);
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
}
</style>
