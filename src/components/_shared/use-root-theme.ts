import { onMounted, onScopeDispose, ref, type Ref } from 'vue'

/**
 * 根元素主题状态的共享观察装置。
 *
 * 与 `useTheme()` 共用同一事实源——根元素上的 `.dark` / `.light` class、`data-scheme="auto"`、
 * 手工设定用的 `data-theme`，以及改变语义 token 取值的 `data-preset`；因为 `useTheme()` 的 `mode`
 * 是每次调用独立创建的局部状态、不是可跨组件读取的全局单例，故此处以**观察 DOM** 取得解析结果。
 *
 * 优先级对齐 `src/styles/theme.css` 与预设样式中的选择器：
 * `.dark` / `[data-theme='dark']` → 暗；`.light` / `[data-theme='light']` → 亮；
 * `[data-scheme='auto']` → 跟随 `prefers-color-scheme`；其余（未挂任何标记）按亮色处理。
 */

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

/**
 * 会影响「解析后的主题」的根元素属性。
 *
 * `data-preset` 不改变暗 / 亮判定，但会改变 `--caomei-*` token 的计算值，故一并纳入观察——
 * 消费方据 `revision` 重新读取 token 即可（重算得到的暗色布尔值不变，不会触发无意义的更新）。
 */
export const ROOT_THEME_ATTRIBUTES = ['class', 'data-theme', 'data-scheme', 'data-preset'] as const

/** 从根元素与系统偏好解析当前是否为暗色（纯函数，便于单测）。 */
export function resolveRootDark(root: HTMLElement, mediaMatches: boolean): boolean {
    if (root.classList.contains('dark') || root.dataset.theme === 'dark') {
        return true
    }
    if (root.classList.contains('light') || root.dataset.theme === 'light') {
        return false
    }
    if (root.dataset.scheme === 'auto') {
        return mediaMatches
    }
    return false
}

export interface UseRootThemeReturn {
    /** 当前是否为暗色 */
    isDark: Ref<boolean>
    /** 主题相关属性或系统偏好变化时自增，供消费方重新读取 token 等计算值 */
    revision: Ref<number>
}

/**
 * 响应式读取宿主主题状态：观察根元素的 class / `data-theme` / `data-scheme` / `data-preset`
 * 与系统配色偏好变化。
 *
 * SSR 下初值固定为 `false` 并在 `onMounted` 后再解析，避免首帧不一致；作用域销毁时清理监听。
 */
export function useRootTheme(): UseRootThemeReturn {
    const isDark = ref(false)
    const revision = ref(0)

    onMounted(() => {
        const media = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
            ? window.matchMedia(DARK_MEDIA_QUERY)
            : null
        const update = (): void => {
            isDark.value = resolveRootDark(document.documentElement, media?.matches ?? false)
            revision.value += 1
        }
        update()

        const observer = typeof MutationObserver === 'function'
            ? new MutationObserver(update)
            : null
        observer?.observe(document.documentElement, {
            attributes: true,
            attributeFilter: [...ROOT_THEME_ATTRIBUTES],
        })

        const onMediaChange = (): void => {
            update()
        }
        media?.addEventListener('change', onMediaChange)

        onScopeDispose(() => {
            observer?.disconnect()
            media?.removeEventListener('change', onMediaChange)
        })
    })

    return { isDark, revision }
}
