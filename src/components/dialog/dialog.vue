<script setup lang="ts">
import { X } from '@lucide/vue'
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
import { computed } from 'vue'
import { CaomeiIcon } from '../../icons'
import { defaultLocaleMessages } from '../../locale'
import type { DialogProps } from './types'

defineOptions({ name: 'CaomeiDialog', inheritAttrs: false })

const props = withDefaults(defineProps<DialogProps>(), {
    description: '',
    size: 'md',
    closable: true,
    closeLabel: defaultLocaleMessages.dialog.close,
    closeOnOverlay: true,
    closeOnEsc: true,
    modal: true,
})

const open = defineModel<boolean>('open', { default: false })

defineSlots<{
    trigger?: () => unknown
    default?: () => unknown
    footer?: () => unknown
}>()

const contentClass = computed(() => `caomei-dialog__content--${props.size}`)

function onPointerDownOutside(event: Event): void {
    if (!props.closeOnOverlay) {
        event.preventDefault()
    }
}

function onEscapeKeyDown(event: KeyboardEvent): void {
    if (!props.closeOnEsc) {
        event.preventDefault()
    }
}
</script>

<template>
    <DialogRoot v-model:open="open" :modal="modal">
        <DialogTrigger v-if="$slots.trigger" as-child>
            <slot name="trigger" />
        </DialogTrigger>
        <DialogPortal>
            <DialogOverlay v-if="modal" class="caomei-dialog__overlay" />
            <DialogContent
                v-bind="$attrs"
                class="caomei-dialog__content"
                :class="contentClass"
                :aria-modal="modal ? 'true' : undefined"
                @escape-key-down="onEscapeKeyDown"
                @pointer-down-outside="onPointerDownOutside"
            >
                <div class="caomei-dialog__header">
                    <div class="caomei-dialog__heading">
                        <DialogTitle class="caomei-dialog__title">
                            {{ title }}
                        </DialogTitle>
                        <DialogDescription class="caomei-dialog__description">
                            {{ description }}
                        </DialogDescription>
                    </div>
                    <DialogClose
                        v-if="closable"
                        class="caomei-dialog__close"
                        :aria-label="closeLabel"
                    >
                        <CaomeiIcon :icon="X" />
                    </DialogClose>
                </div>
                <div class="caomei-dialog__body">
                    <slot />
                </div>
                <div v-if="$slots.footer" class="caomei-dialog__footer">
                    <slot name="footer" />
                </div>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>

<style scoped>
.caomei-dialog__overlay {
    position: fixed;
    z-index: 1000;
    inset: 0;
    background: rgb(0 0 0 / 0.45);
}

.caomei-dialog__content {
    --caomei-dialog-width: 480px;

    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 1001;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-3);
    width: min(90vw, var(--caomei-dialog-width));
    max-height: 85vh;
    overflow: hidden;
    padding: var(--caomei-space-4);
    border-radius: var(--caomei-radius-lg);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.18);
    transform: translate(-50%, -50%);
}

.caomei-dialog__content--sm {
    --caomei-dialog-width: 360px;
}

.caomei-dialog__content--md {
    --caomei-dialog-width: 480px;
}

.caomei-dialog__content--lg {
    --caomei-dialog-width: 640px;
}

.caomei-dialog__header {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--caomei-space-2);
}

.caomei-dialog__heading {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-1);
    min-width: 0;
}

.caomei-dialog__title {
    margin: 0;
    font-size: var(--caomei-font-size-lg);
    font-weight: 600;
}

.caomei-dialog__description {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-md);
}

.caomei-dialog__body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    font-size: var(--caomei-font-size-md);
}

.caomei-dialog__footer {
    display: flex;
    flex-shrink: 0;
    justify-content: flex-end;
    gap: var(--caomei-space-2);
}

.caomei-dialog__close {
    display: inline-flex;
    flex-shrink: 0;
    padding: var(--caomei-space-1);
    border: 0;
    border-radius: var(--caomei-radius-sm);
    background: transparent;
    color: var(--caomei-color-text-muted);
    cursor: pointer;
}

.caomei-dialog__close:hover {
    color: var(--caomei-color-text);
}

.caomei-dialog__close:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

@media (max-width: 640px) {
    .caomei-dialog__content {
        width: calc(100vw - 2 * var(--caomei-space-4));
    }
}
</style>
