<script setup lang="ts">
import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogRoot,
    AlertDialogTitle,
} from 'reka-ui'
import { computed, nextTick, onUnmounted } from 'vue'
import {
    createConfirmStore,
    provideConfirmStore,
    type ConfirmRequest,
} from '../../composables/use-confirm'
import { useLocale } from '../../composables/use-locale'
import { CaomeiButton } from '../button'
import type { ConfirmDialogProps } from './types'

defineOptions({ name: 'CaomeiConfirmDialog', inheritAttrs: false })

const props = defineProps<ConfirmDialogProps>()

const store = createConfirmStore()
provideConfirmStore(store)

const locale = useLocale()

const open = computed(() => store.request.value !== null)
const request = computed<ConfirmRequest | null>(() => store.request.value)

const confirmLabel = computed(
    () => request.value?.confirmLabel ?? props.confirmLabel ?? locale.value.confirm.confirm,
)
const cancelLabel = computed(
    () => request.value?.cancelLabel ?? props.cancelLabel ?? locale.value.confirm.cancel,
)
const confirmClass = computed(() =>
    request.value?.tone === 'danger' ? 'caomei-confirm-dialog__confirm--danger' : undefined,
)

/*
  AlertDialogAction / AlertDialogCancel 的内建关闭会先于按钮自身 click 监听触发。
  为不依赖该顺序：仅由「确认」按钮置位 confirmIntent（true 一经置位不再被关闭事件覆盖），
  并延后到 nextTick 按最终意图结算；同时带上请求 id，迟到的过期回调整体丢弃。
*/
let confirmIntent = false
let scheduledId: number | null = null
let flushScheduled = false

function settleDeferred(confirmed: boolean): void {
    const id = request.value?.id
    if (id === undefined) {
        return
    }
    if (confirmed) {
        confirmIntent = true
    }
    scheduledId = id
    if (flushScheduled) {
        return
    }
    flushScheduled = true
    void nextTick(() => {
        flushScheduled = false
        const result = confirmIntent
        const target = scheduledId
        confirmIntent = false
        scheduledId = null
        store.settle(result, target ?? undefined)
    })
}

function onOpenChange(next: boolean): void {
    if (!next) {
        settleDeferred(false)
    }
}

function onConfirm(): void {
    settleDeferred(true)
}

function onCancel(): void {
    settleDeferred(false)
}

onUnmounted(() => {
    store.dispose()
})
</script>

<template>
    <slot />
    <AlertDialogRoot :open="open" @update:open="onOpenChange">
        <AlertDialogPortal>
            <AlertDialogOverlay class="caomei-confirm-dialog__overlay" />
            <AlertDialogContent
                v-bind="$attrs"
                class="caomei-confirm-dialog__content"
                aria-modal="true"
            >
                <AlertDialogTitle class="caomei-confirm-dialog__title">
                    {{ request?.title }}
                </AlertDialogTitle>
                <AlertDialogDescription class="caomei-confirm-dialog__description">
                    {{ request?.description ?? '' }}
                </AlertDialogDescription>
                <div class="caomei-confirm-dialog__footer">
                    <AlertDialogCancel as-child>
                        <CaomeiButton variant="secondary" @click="onCancel">
                            {{ cancelLabel }}
                        </CaomeiButton>
                    </AlertDialogCancel>
                    <AlertDialogAction as-child>
                        <CaomeiButton :class="confirmClass" @click="onConfirm">
                            {{ confirmLabel }}
                        </CaomeiButton>
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialogPortal>
    </AlertDialogRoot>
</template>

<style scoped>
.caomei-confirm-dialog__overlay {
    position: fixed;
    z-index: 1000;
    inset: 0;
    background: var(--caomei-color-mask);
}

.caomei-confirm-dialog__content {
    --caomei-confirm-dialog-width: 400px;

    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 1001;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-3);
    width: min(90vw, var(--caomei-confirm-dialog-width));
    max-height: 85vh;
    overflow: auto;
    padding: var(--caomei-space-4);
    border-radius: var(--caomei-radius-lg);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    box-shadow: var(--caomei-shadow-lg);
    transform: translate(-50%, -50%);
}

.caomei-confirm-dialog__title {
    margin: 0;
    font-size: var(--caomei-font-size-lg);
    font-weight: 600;
}

.caomei-confirm-dialog__description {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-md);
}

.caomei-confirm-dialog__footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--caomei-space-2);
}

/*
  danger 语气复用 CaomeiButton 的 primary 变体，仅就地覆写强调色变量；
  实底取 `-danger-solid`（`-solid` 类），故前景必须同步取 `--caomei-color-on-solid`——
  暗色下 `--caomei-color-primary-foreground` 是深色，配实底会掉到 AA 以下。
*/
.caomei-confirm-dialog__confirm--danger {
    --caomei-color-primary: var(--caomei-color-danger-solid);
    --caomei-color-primary-foreground: var(--caomei-color-on-solid);
}

@media (width <= 640px) {
    .caomei-confirm-dialog__content {
        width: calc(100vw - 2 * var(--caomei-space-4));
    }
}
</style>
