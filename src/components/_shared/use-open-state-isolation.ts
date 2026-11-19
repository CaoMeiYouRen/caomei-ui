import { nextTick, onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import { suppressOutside } from '../../_shared/open-state-inert'

/** 打开态来源：由组件自持的 `open` 状态（未提供时改看内容根的 `data-state`） */
export type OpenStateSource = () => boolean

/**
 * 浮层打开态隔离：给浮层之外的兄弟节点补 `inert`，关闭 / 卸载时回退。
 *
 * 两种触发源：
 * - 提供 `open` 时以组件自持的开合状态为准，关闭**同步**回退。键盘 / 程序关闭后组件常在同一
 *   刷新内把焦点交还触发器，若回退晚一步，触发器仍在 `inert` 子树里、焦点会掉到 `body`。
 * - 未提供 `open` 时（`PopoverContent` / `DropdownMenuContent` 拿不到根组件的开合状态）监听
 *   内容根的 `data-state`（`MutationObserver`）。用 `data-state` 而不是 `open-auto-focus`：
 *   `forceMount` 时内容常驻，`FocusScope` 不会重新挂载，`open-auto-focus` 只在首次打开触发一次。
 *
 * @param contentRef 内容根（Reka Content 组件实例）
 * @param extraRoots 额外保留根（触发器元素等）；非元素项忽略
 * @param open 组件自持的打开态；提供时按它同步回退，否则监听内容根 `data-state`
 * @returns `release` 供组件提前回退（如背景点击前解除隔离），`sync` 供手动重算
 */
export function useOpenStateIsolation(
    contentRef: Ref<{ $el?: unknown } | null>,
    extraRoots: () => unknown[] = () => [],
    open?: OpenStateSource,
): { release: () => void, sync: () => void } {
    let restores: (() => void)[] = []
    let observer: MutationObserver | undefined

    function release(): void {
        for (const restore of restores) {
            restore()
        }
        restores = []
    }

    /** 按当前内容根与额外根重算隔离面；内容不在文档中时回退 */
    function apply(): void {
        const content = contentRef.value?.$el
        if (!(content instanceof HTMLElement) || !content.isConnected) {
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

    /** 依据内容根 `data-state` 重算（仅 `data-state` 模式使用） */
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
        apply()
    }

    if (open) {
        // 关闭同步回退：必须先于 Reka 的焦点归还，否则触发器仍在 `inert` 子树、焦点掉到 body
        watch(
            open,
            (isOpen) => {
                if (isOpen) {
                    return
                }
                release()
            },
            { flush: 'sync', immediate: true },
        )
        // 打开等面板落位再补隔离：`post` 之后的 `nextTick` 才保证 portal 内容已挂载
        watch(
            open,
            (isOpen) => {
                if (!isOpen) {
                    return
                }
                void nextTick(() => {
                    if (open()) {
                        apply()
                    }
                })
            },
            { flush: 'post' },
        )
    }

    onMounted(() => {
        if (open) {
            // 受控用法下挂载即展开：`open` 不会变化，watch 不触发，这里补一次
            void nextTick(() => {
                if (open()) {
                    apply()
                }
            })
            return
        }
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
