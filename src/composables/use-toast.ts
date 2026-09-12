import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'

/** 轻提示语气，用于语义色与图标 */
export type ToastTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

/** 无障碍播报优先级：用户操作触发的提示用 foreground，后台任务用 background */
export type ToastType = 'foreground' | 'background'

export interface ToastActionOptions {
    /** 操作按钮文案 */
    label: string
    /** 屏幕阅读器播报的操作描述，缺省回退为 label */
    altText?: string
    /** 点击操作时的回调，点击后提示自动关闭 */
    onClick?: () => void
}

export interface ToastOptions {
    /** 标题 */
    title?: string
    /** 描述文本 */
    description?: string
    /** 语气，决定语义色与图标，默认 neutral */
    tone?: ToastTone
    /** 播报优先级，默认 foreground */
    type?: ToastType
    /** 展示时长（毫秒），覆盖 Provider 默认值；<= 0 或 Infinity 表示不自动关闭 */
    duration?: number
    /** 是否显示关闭按钮，默认 true */
    closable?: boolean
    /** 操作按钮 */
    action?: ToastActionOptions
}

/** 已入队的提示项 */
export interface ToastItem extends ToastOptions {
    id: string
}

/** 支持字符串简写（等价于 `{ title }`） */
export type ToastContent = string | ToastOptions

/** useToast 返回的服务接口 */
export interface ToastApi {
    /** 入队一条提示，返回其 id */
    show: (content: ToastContent) => string
    /** 入队一条中性语气提示 */
    info: (content: ToastContent) => string
    /** 入队一条成功语气提示 */
    success: (content: ToastContent) => string
    /** 入队一条警告语气提示 */
    warning: (content: ToastContent) => string
    /** 入队一条危险语气提示 */
    danger: (content: ToastContent) => string
    /** 关闭指定提示 */
    dismiss: (id: string) => void
    /** 关闭全部提示 */
    clear: () => void
}

/** Provider 内部持有的提示队列 */
export interface ToastStore {
    toasts: Ref<ToastItem[]>
    max: Ref<number>
    add: (content: ToastContent, tone?: ToastTone) => string
    dismiss: (id: string) => void
    clear: () => void
    setMax: (max: number) => void
}

const toastStoreKey: InjectionKey<ToastStore> = Symbol('caomei-toast-store')

function normalizeToast(content: ToastContent, tone?: ToastTone): ToastOptions {
    const options: ToastOptions = typeof content === 'string' ? { title: content } : { ...content }
    if (tone) {
        options.tone = tone
    }
    return options
}

/** 创建一个提示队列；每个 Provider 实例持有独立队列与自增序列，避免 SSR 下跨请求串扰 */
export function createToastStore(max = 5): ToastStore {
    const toasts = ref<ToastItem[]>([])
    const limit = ref(max)
    let seed = 0

    function nextId(): string {
        seed += 1
        return `caomei-toast-${seed}`
    }

    function trim(items: ToastItem[]): ToastItem[] {
        const overflow = limit.value > 0 ? items.length - limit.value : 0
        return overflow > 0 ? items.slice(overflow) : items
    }

    function add(content: ToastContent, tone?: ToastTone): string {
        const id = nextId()
        toasts.value = trim([...toasts.value, { ...normalizeToast(content, tone), id }])
        return id
    }

    function dismiss(id: string): void {
        toasts.value = toasts.value.filter((item) => item.id !== id)
    }

    function clear(): void {
        toasts.value = []
    }

    function setMax(next: number): void {
        limit.value = next
        toasts.value = trim(toasts.value)
    }

    return { toasts, max: limit, add, dismiss, clear, setMax }
}

/** 由 CaomeiToastProvider 在 setup 中调用，向下提供提示队列 */
export function provideToastStore(store: ToastStore): ToastStore {
    provide(toastStoreKey, store)
    return store
}

/**
 * 获取轻提示服务。必须在 `<CaomeiToastProvider>` 的后代组件中调用。
 *
 * 队列由 Provider 实例持有而非模块级单例，因此不会在 SSR 下跨请求泄漏状态。
 */
export function useToast(): ToastApi {
    const store = inject(toastStoreKey)
    if (!store) {
        throw new Error('[caomei-ui] useToast() 必须在 <CaomeiToastProvider> 的后代组件中调用。')
    }

    return {
        show: (content) => store.add(content),
        info: (content) => store.add(content, 'neutral'),
        success: (content) => store.add(content, 'success'),
        warning: (content) => store.add(content, 'warning'),
        danger: (content) => store.add(content, 'danger'),
        dismiss: store.dismiss,
        clear: store.clear,
    }
}
