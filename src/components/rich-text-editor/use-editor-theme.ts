import { onMounted, onScopeDispose, ref, type Ref } from 'vue'

/**
 * 编辑器包装组件的暗色解析。
 *
 * 与 `useTheme()` 共用同一事实源——根元素上的 `.dark` / `.light` class、`data-scheme="auto"`
 * 与手工设定用的 `data-theme`；因为 `useTheme()` 的 `mode` 是每次调用独立创建的局部状态、
 * 不是可跨组件读取的全局单例，故此处以**观察 DOM**（而非读取 composable 状态）取得解析结果。
 *
 * 优先级对齐 `src/styles/theme.css` 与预设样式中的选择器：
 * `.dark` / `[data-theme='dark']` → 暗；`.light` / `[data-theme='light']` → 亮；
 * `[data-scheme='auto']` → 跟随 `prefers-color-scheme`；其余（未挂任何标记）按亮色处理。
 */

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)'

/** 从根元素与系统偏好解析当前是否为暗色（纯函数，便于单测）。 */
export function resolveEditorDark(root: HTMLElement, mediaMatches: boolean): boolean {
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

/**
 * 响应式读取宿主当前的暗色状态：观察根元素的 `class` / `data-theme` / `data-scheme` 属性
 * 与系统配色偏好变化，返回随其更新的布尔量。
 *
 * SSR 下初值固定为 `false` 并在 `onMounted` 后再解析，避免首帧不一致；作用域销毁时清理监听。
 */
export function useEditorTheme(): Ref<boolean> {
    const isDark = ref(false)

    onMounted(() => {
        const media = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
            ? window.matchMedia(DARK_MEDIA_QUERY)
            : null
        const update = (): void => {
            isDark.value = resolveEditorDark(document.documentElement, media?.matches ?? false)
        }
        update()

        const observer = typeof MutationObserver === 'function'
            ? new MutationObserver(update)
            : null
        observer?.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'data-theme', 'data-scheme'],
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

    return isDark
}
