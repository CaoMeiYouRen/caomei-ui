import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'

/** 确认对话框语气：neutral 用于常规确认，danger 用于破坏性操作 */
export type ConfirmTone = 'neutral' | 'danger'

export interface ConfirmOptions {
    /** 标题，同时作为无障碍名称（必填） */
    title: string
    /** 描述文本，用于补充说明操作后果 */
    description?: string
    /** 确认按钮文案，缺省取 Provider 默认值 */
    confirmLabel?: string
    /** 取消按钮文案，缺省取 Provider 默认值 */
    cancelLabel?: string
    /** 语气，决定确认按钮的强调色，默认 neutral */
    tone?: ConfirmTone
}

/** 已入队的确认请求（单次仅一个，携带自增 id 以隔离过期回调） */
export interface ConfirmRequest extends ConfirmOptions {
    id: number
}

/** 支持字符串简写（等价于 `{ title }`） */
export type ConfirmContent = string | ConfirmOptions

/** useConfirm 返回的服务接口 */
export interface ConfirmApi {
    /** 打开确认对话框，返回 Promise：确认 `true` / 取消 `false` */
    open: (options: ConfirmOptions) => Promise<boolean>
    /** 打开确认对话框（字符串等价于 `{ title }`），语义同 `open` */
    confirm: (content: ConfirmContent) => Promise<boolean>
    /** 取消当前待决对话框；无待决请求时无副作用 */
    cancel: () => void
}

/** Provider 内部持有的确认请求与结算逻辑 */
export interface ConfirmStore {
    request: Ref<ConfirmRequest | null>
    open: (options: ConfirmOptions) => Promise<boolean>
    confirm: (content: ConfirmContent) => Promise<boolean>
    cancel: () => void
    /**
     * 由 CaomeiConfirmDialog 在确认 / 取消 / 关闭时调用，结算当前 Promise。
     * 传入 `id` 时仅当与当前请求匹配才结算，用于丢弃迟到的过期回调。
     */
    settle: (confirmed: boolean, id?: number) => void
    /** 释放待决请求（宿主卸载时调用），以 `false` 结算避免 Promise 悬挂 */
    dispose: () => void
}

const confirmStoreKey: InjectionKey<ConfirmStore> = Symbol('caomei-confirm-store')

function normalizeConfirm(content: ConfirmContent): ConfirmOptions {
    return typeof content === 'string' ? { title: content } : { ...content }
}

/** 创建一个确认请求队列；每个 Provider 实例持有独立状态与自增序列，避免 SSR 下跨请求串扰 */
export function createConfirmStore(): ConfirmStore {
    const request = ref<ConfirmRequest | null>(null)
    let seed = 0
    let pending: { id: number, resolve: (value: boolean) => void } | null = null

    function settle(confirmed: boolean, id?: number): void {
        if (!pending) {
            return
        }
        if (id !== undefined && pending.id !== id) {
            return
        }
        const { resolve } = pending
        pending = null
        request.value = null
        resolve(confirmed)
    }

    function open(options: ConfirmOptions): Promise<boolean> {
        // 同一时刻只允许一个待决请求；新请求以「取消」结算旧的，避免 Promise 泄漏
        settle(false)
        seed += 1
        const id = seed
        request.value = { ...options, id }
        return new Promise<boolean>((resolve) => {
            pending = { id, resolve }
        })
    }

    function confirm(content: ConfirmContent): Promise<boolean> {
        return open(normalizeConfirm(content))
    }

    return {
        request,
        open,
        confirm,
        cancel: (): void => {
            settle(false)
        },
        settle,
        dispose: (): void => {
            settle(false)
        },
    }
}

/** 由 CaomeiConfirmDialog 在 setup 中调用，向下提供确认服务 */
export function provideConfirmStore(store: ConfirmStore): ConfirmStore {
    provide(confirmStoreKey, store)
    return store
}

/**
 * 获取确认对话框服务。必须在 `<CaomeiConfirmDialog>` 的后代组件中调用。
 *
 * 请求状态由 Provider 实例持有而非模块级单例，因此不会在 SSR 下跨请求泄漏状态。
 */
export function useConfirm(): ConfirmApi {
    const store = inject(confirmStoreKey)
    if (!store) {
        throw new Error(
            '[caomei-ui] useConfirm() 必须在 <CaomeiConfirmDialog> 的后代组件中调用。',
        )
    }

    return {
        open: store.open,
        confirm: store.confirm,
        cancel: store.cancel,
    }
}
