<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import { CaomeiButton } from '../button'
import {
    CaomeiPopover,
    CaomeiPopoverContent,
    CaomeiPopoverTrigger,
} from '../popover'
import type { PopconfirmEmits, PopconfirmProps } from './types'

defineOptions({ name: 'CaomeiPopconfirm' })

const props = withDefaults(defineProps<PopconfirmProps>(), {
    title: undefined,
    description: undefined,
    confirmLabel: undefined,
    cancelLabel: undefined,
    tone: 'neutral',
    loading: false,
    disabled: false,
    placement: 'bottom',
    align: 'end',
    sideOffset: 8,
    icon: undefined,
    triggerLabel: undefined,
})

const emit = defineEmits<PopconfirmEmits>()

const open = defineModel<boolean>('open', { default: false })

const locale = useLocale()
const icons = useInternalIcons()

const titleId = useId()
const descriptionId = useId()

const confirmText = computed(() => props.confirmLabel ?? locale.value.confirm.confirm)
const cancelText = computed(() => props.cancelLabel ?? locale.value.confirm.cancel)
const panelLabel = computed(() => props.title ?? props.description ?? confirmText.value)
const icon = computed(() => {
    if (props.icon === null) {
        return undefined
    }
    return props.icon ?? (props.tone === 'danger' ? icons.value.warning : icons.value.info)
})

const confirmWrapper = ref<HTMLElement | null>(null)
const triggerRef = ref<{ $el?: unknown } | null>(null)

/** 由确认按钮关闭时不再把关闭解读为取消。 */
let confirmedClose = false

/**
 * 关闭后归还焦点。
 * 浮层关闭时背景隔离（`inert`）由 MutationObserver 异步回退，早于它聚焦会被浏览器拒绝，
 * 因此等一轮宏任务再交还焦点。
 */
function restoreTriggerFocus(): void {
    setTimeout(() => {
        const element = triggerRef.value?.$el
        if (element instanceof HTMLElement) {
            element.focus()
        }
    }, 0)
}

function onOpenChange(next: boolean): void {
    if (next === open.value) {
        return
    }
    open.value = next
    if (next) {
        return
    }
    if (confirmedClose) {
        confirmedClose = false
    } else {
        emit('cancel')
    }
    if (!open.value) {
        restoreTriggerFocus()
    }
}

/** 打开后把焦点交给确认按钮：Enter 即确认，Esc 关闭即取消。 */
function onOpenAutoFocus(event: Event): void {
    event.preventDefault()
    setTimeout(() => {
        confirmWrapper.value?.querySelector('button')?.focus()
    }, 50)
}

function closePanel(): void {
    open.value = false
}

function onConfirm(): void {
    if (props.loading || props.disabled) {
        return
    }
    emit('confirm')
    confirmedClose = true
    closePanel()
}

function onCancel(): void {
    if (props.loading) {
        return
    }
    emit('cancel')
    confirmedClose = true
    closePanel()
}
</script>

<template>
    <CaomeiPopover
        :open="open"
        @update:open="onOpenChange"
    >
        <CaomeiPopoverTrigger
            ref="triggerRef"
            as-child
            :disabled="disabled"
        >
            <CaomeiButton
                :label="triggerLabel"
                :disabled="disabled"
                variant="secondary"
            >
                <slot name="trigger" />
            </CaomeiButton>
        </CaomeiPopoverTrigger>
        <CaomeiPopoverContent
            :side="placement"
            :align="align"
            :side-offset="sideOffset"
            role="dialog"
            :aria-label="title ? undefined : panelLabel"
            :aria-labelledby="title ? titleId : undefined"
            :aria-describedby="($slots.default || description) ? descriptionId : undefined"
            class="caomei-popconfirm"
            @open-auto-focus="onOpenAutoFocus"
        >
            <div class="caomei-popconfirm__body">
                <CaomeiIcon
                    v-if="icon"
                    class="caomei-popconfirm__icon"
                    :class="{'caomei-popconfirm__icon--danger': tone === 'danger'}"
                    :icon="icon"
                    aria-hidden="true"
                />
                <div class="caomei-popconfirm__content">
                    <div
                        v-if="title || $slots.title"
                        :id="titleId"
                        class="caomei-popconfirm__title"
                    >
                        <slot name="title">
                            {{ title }}
                        </slot>
                    </div>
                    <div
                        v-if="$slots.default || description"
                        :id="descriptionId"
                        class="caomei-popconfirm__description"
                    >
                        <slot>
                            {{ description }}
                        </slot>
                    </div>
                </div>
            </div>
            <div class="caomei-popconfirm__footer">
                <CaomeiButton
                    size="sm"
                    variant="ghost"
                    :disabled="loading"
                    @click="onCancel"
                >
                    {{ cancelText }}
                </CaomeiButton>
                <span
                    ref="confirmWrapper"
                    class="caomei-popconfirm__confirm"
                >
                    <CaomeiButton
                        size="sm"
                        :tone="tone === 'danger' ? 'danger' : undefined"
                        :loading="loading"
                        :disabled="disabled"
                        @click="onConfirm"
                    >
                        {{ confirmText }}
                    </CaomeiButton>
                </span>
            </div>
        </CaomeiPopoverContent>
    </CaomeiPopover>
</template>

<style scoped>
.caomei-popconfirm {
    width: var(--caomei-popconfirm-width, min(20rem, var(--reka-popover-content-available-width)));
}

.caomei-popconfirm__body {
    display: flex;
    gap: var(--caomei-space-2);
    align-items: flex-start;
    min-width: 0;
}

.caomei-popconfirm__icon {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--caomei-color-primary);
    font-size: var(--caomei-font-size-lg);
}

.caomei-popconfirm__icon--danger {
    color: var(--caomei-color-danger);
}

.caomei-popconfirm__content {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-1);
    min-width: 0;
}

.caomei-popconfirm__title {
    color: var(--caomei-color-text);
    font-weight: var(--caomei-font-weight-medium, 600);
    font-size: var(--caomei-font-size-md);
    overflow-wrap: anywhere;
}

.caomei-popconfirm__description {
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
    overflow-wrap: anywhere;
}

.caomei-popconfirm__footer {
    display: flex;
    flex-wrap: wrap;
    gap: var(--caomei-space-2);
    justify-content: flex-end;
    margin-top: var(--caomei-space-3);
}

.caomei-popconfirm__confirm {
    display: inline-flex;
}
</style>
