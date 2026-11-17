import { nextTick, onBeforeUnmount, onMounted, type Ref } from 'vue'
import { suppressOutside } from '../../_shared/open-state-inert'

/**
 * 浮层打开态隔离：以内容根的 `data-state` 为唯一触发源（`MutationObserver`），
 * 同时保留内容根与调用方给出的额外根（通常是触发器），关闭 / 卸载时回退。
 *
 * 用 `data-state` 而不是 `open-auto-focus`：`forceMount` 时内容常驻，`FocusScope` 不会
 * 重新挂载，`open-auto-focus` 只在首次打开触发一次，后续打开将永不隔离。
 *
 * @param contentRef 内容根（Reka Content 组件实例）
 * @param extraRoots 额外保留根（触发器元素等）
 * @returns `release` 供 `@close-auto-focus` 提前回退，`sync` 供手动重算
 */
export function useOpenStateIsolation(
    contentRef: Ref<{ $el?: unknown } | null>,
    extraRoots: () => (Element | null | undefined)[] = () => [],
): { release: () => void, sync: () => void } {
    let restores: (() => void)[] = []
    let observer: MutationObserver | undefined

    function release(): void {
        for (const restore of restores) {
            restore()
        }
        restores = []
    }

    function sync(): void {
        const content = contentRef.value?.$el
        if (!(content instanceof HTMLElement) || !content.isConnected) {
            release()
            return
        }
        const state = content.getAttribute('data-state')
        if (state !== null && state !== 'open') {
            release()
            return
        }
        release()
        restores.push(suppressOutside(content))
        for (const root of extraRoots()) {
            if (root instanceof HTMLElement && root.isConnected) {
                restores.push(suppressOutside(root))
            }
        }
    }

    onMounted(() => {
        void nextTick(() => {
            const content = contentRef.value?.$el
            if (content instanceof HTMLElement) {
                observer = new MutationObserver(sync)
                observer.observe(content, { attributes: true, attributeFilter: ['data-state'] })
            }
            sync()
        })
    })

    onBeforeUnmount(() => {
        observer?.disconnect()
        observer = undefined
        release()
    })

    return { release, sync }
}
