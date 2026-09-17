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
import { computed, watch } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import {
    buildDialogBreakpointCss,
    createDialogBreakpointId,
    parseDialogBreakpoints,
} from './breakpoints'
import type { DialogProps } from './types'

defineOptions({ name: 'CaomeiDialog', inheritAttrs: false })

const props = withDefaults(defineProps<DialogProps>(), {
    description: '',
    size: 'md',
    closable: true,
    closeOnOverlay: true,
    closeOnEsc: true,
    modal: true,
    showHeader: true,
})

const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{ hide: [] }>()

// PrimeVue 的 `hide` 在面板开始收起时触发；本组件无出场动画，等价契约为「open 由真转假」
// （含遮罩 / Esc / 关闭按钮 / 外部受控置假）。`watch` 默认 `flush: 'pre'`：同一 tick 内先置真再置假
// 无中间渲染，不产生 `hide`；emit 不回写 `open`，外部受控置假不会回环。
watch(open, (value, previous) => {
    if (previous && !value) {
        emit('hide')
    }
})

defineSlots<{
    trigger?: () => unknown
    default?: () => unknown
    footer?: () => unknown
}>()

const locale = useLocale()
const closeLabel = computed(() => props.closeLabel ?? locale.value.dialog.close)
// 始终渲染 DialogTitle 以满足 Reka 的可访问名要求；title 缺省时回退内建文案并转为视觉隐藏
const accessibleTitle = computed(() => props.title || locale.value.dialog.label)

const contentClass = computed(() => `caomei-dialog__content--${props.size}`)

// 断点以媒体查询承载（非 JS 视口分支）；实例选择器把规则限定在本对话框面板上。
// 该规则与 scoped 基线特异性同为 (0,2,0)，依赖「面板内样式晚于 head 内 scoped 样式」的源序取胜，
// 故不使用 `!important` 也仍能让使用方以更高特异性覆盖；改动 Portal 目标或样式位置时须复核。
const breakpointId = createDialogBreakpointId()
const breakpointEntries = computed(() => parseDialogBreakpoints(props.breakpoints))
const breakpointCss = computed(() => {
    if (!breakpointEntries.value.length) {
        return ''
    }
    return buildDialogBreakpointCss(
        `.caomei-dialog__content[data-caomei-dialog-breakpoint="${breakpointId}"]`,
        breakpointEntries.value,
    )
})

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
                :data-caomei-dialog-breakpoint="breakpointEntries.length ? breakpointId : undefined"
                :aria-modal="modal ? 'true' : undefined"
                @escape-key-down="onEscapeKeyDown"
                @pointer-down-outside="onPointerDownOutside"
            >
                <component
                    :is="'style'"
                    v-if="breakpointCss"
                >
                    {{ breakpointCss }}
                </component>
                <div v-if="showHeader" class="caomei-dialog__header">
                    <div class="caomei-dialog__heading">
                        <DialogTitle
                            class="caomei-dialog__title"
                            :class="{'caomei-dialog__title--hidden': !title}"
                        >
                            {{ accessibleTitle }}
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
                <DialogTitle
                    v-else
                    class="caomei-dialog__title caomei-dialog__title--hidden"
                >
                    {{ accessibleTitle }}
                </DialogTitle>
                <DialogDescription
                    v-if="!showHeader"
                    class="caomei-dialog__description caomei-dialog__description--hidden"
                >
                    {{ description }}
                </DialogDescription>
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
    background: var(--caomei-color-mask);
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
    box-shadow: var(--caomei-shadow-lg);
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

/*
  `title` 缺省 / `showHeader="false"` 时标题（与描述）仍需留在 DOM 中供 Reka 关联
  `aria-labelledby` / `aria-describedby`，故转为视觉隐藏而非不渲染。
*/
.caomei-dialog__title--hidden,
.caomei-dialog__description--hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    padding: 0;
    border: 0;
    margin: -1px;
    clip-path: inset(50%);
    white-space: nowrap;
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
    flex-wrap: wrap;
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

@media (width <= 640px) {
    .caomei-dialog__content {
        width: calc(100vw - 2 * var(--caomei-space-4));
    }
}
</style>
