<script setup lang="ts">
import { ContextMenuRoot } from 'reka-ui'
import { provide, ref, watch } from 'vue'
import { openFocusElementKey, panelElementKey, triggerElementKey } from '../_shared/trigger-element'
import type { ContextMenuProps } from './types'

// 根为逻辑容器（Reka ContextMenuRoot 不渲染 DOM），不继承 attrs。
defineOptions({ name: 'CaomeiContextMenu', inheritAttrs: false })

withDefaults(defineProps<ContextMenuProps>(), {
    modal: false,
})

const open = defineModel<boolean>('open', { default: false })

/**
 * 关闭后的焦点归还：打开前记录最后一个焦点元素，关闭后归还。
 *
 * 不依赖上游 FocusScope 的归还：右键打开时触发区通常不可聚焦，FocusScope 记录的元素在打开期间
 * 被隔离为 `inert`，归还常常落到 `body`。捕获放在 `flush: 'pre'`，确保记录发生在隔离之前。
 */
let restoreEl: HTMLElement | null = null

/**
 * 归还焦点并容忍隔离释放的时序：内容卸载时 `close-auto-focus` 才解除 `inert`，
 * 若此时目标仍在隔离面内，`focus()` 会被忽略——按宏任务重试几次。
 */
function restoreFocus(target: HTMLElement): void {
    let attempts = 0
    const doc = target.ownerDocument
    const attempt = (): void => {
        if (!target.isConnected) {
            return
        }
        // 焦点已被合法接管（如 command 打开了对话框、聚焦了输入框）时不抢回
        const active = doc.activeElement
        const neutral = !active
            || active === doc.body
            || active === doc.documentElement
            || panelEl.value?.contains(active) === true
            || active.closest('[inert]') !== null
        if (!neutral) {
            return
        }
        target.focus({ preventScroll: true })
        if (doc.activeElement === target) {
            return
        }
        attempts += 1
        if (attempts < 12) {
            setTimeout(attempt, 50)
        }
    }
    setTimeout(attempt, 0)
}

watch(open, (value) => {
    if (typeof document === 'undefined') {
        return
    }
    if (value) {
        const active = openFocusEl.value ?? document.activeElement
        restoreEl = active instanceof HTMLElement && active !== document.body && active !== document.documentElement
            ? active
            : null
        openFocusEl.value = null
        return
    }
    const target = restoreEl
    restoreEl = null
    if (target?.isConnected) {
        restoreFocus(target)
    }
}, { flush: 'pre' })

/** 触发区元素：由 CaomeiContextMenuTrigger 写入，内容组件读取以保留为隔离面的第二根 */
const triggerEl = ref<HTMLElement | null>(null)
provide(triggerElementKey, triggerEl)

/** 打开前焦点元素：触发器在 pointerdown 捕获阶段写入（右键会先把焦点挪到 body） */
const openFocusEl = ref<HTMLElement | null>(null)
provide(openFocusElementKey, openFocusEl)

/** 面板根：内容组件写入，关闭时据此判断焦点是否仍留在面板内 */
const panelEl = ref<HTMLElement | null>(null)
provide(panelElementKey, panelEl)
</script>

<template>
    <ContextMenuRoot
        v-model:open="open"
        :modal="modal"
    >
        <slot />
    </ContextMenuRoot>
</template>
