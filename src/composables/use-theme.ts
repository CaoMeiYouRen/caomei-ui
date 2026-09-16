import { computed, getCurrentScope, onMounted, onScopeDispose, ref, type ComputedRef, type Ref } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

export interface UseThemeReturn {
    mode: Ref<ThemeMode>
    isDark: ComputedRef<boolean>
    setMode: (next: ThemeMode) => void
}

const MEDIA_QUERY = '(prefers-color-scheme: dark)'

function getRoot(): HTMLElement | null {
    return typeof document === 'undefined' ? null : document.documentElement
}

/**
 * 管理模式状态并同步到根元素。
 *
 * - `dark` / `light`：在 `<html>` 上切换 `.dark` / `.light` class；
 * - `auto`：在 `<html>` 上设置 `data-scheme="auto"`，交由 CSS 跟随系统，`isDark` 读取系统偏好。
 *
 * SSR 下初始读取推迟到 `onMounted`，避免服务端与客户端首帧不一致（hydration mismatch）；
 * 非组件作用域调用时立即读取（不注册媒体监听）。
 */
export function useTheme(initial: ThemeMode = 'auto'): UseThemeReturn {
    const mode = ref<ThemeMode>(initial)
    const systemDark = ref(false)

    function syncDom(next: ThemeMode): void {
        const root = getRoot()
        if (!root) {
            return
        }
        root.classList.toggle('dark', next === 'dark')
        root.classList.toggle('light', next === 'light')
        if (next === 'auto') {
            root.dataset.scheme = 'auto'
        } else {
            delete root.dataset.scheme
        }
    }

    function subscribe(): void {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return
        }
        const query = window.matchMedia(MEDIA_QUERY)
        systemDark.value = query.matches
        const onChange = (event: MediaQueryListEvent): void => {
            systemDark.value = event.matches
        }
        if (typeof query.addEventListener === 'function') {
            query.addEventListener('change', onChange)
            if (getCurrentScope()) {
                onScopeDispose(() => {
                    query.removeEventListener('change', onChange)
                })
            }
        }
    }

    if (getCurrentScope()) {
        onMounted(() => {
            subscribe()
            syncDom(mode.value)
        })
    } else {
        subscribe()
        syncDom(mode.value)
    }

    const isDark = computed(() => (mode.value === 'auto' ? systemDark.value : mode.value === 'dark'))

    function setMode(next: ThemeMode): void {
        mode.value = next
        syncDom(next)
    }

    return { mode, isDark, setMode }
}
