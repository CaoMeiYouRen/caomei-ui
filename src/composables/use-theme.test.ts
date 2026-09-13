import { describe, expect, it, vi } from 'vitest'
import { useTheme } from './use-theme'

function stubMatchMedia(matches: boolean) {
    const listeners = new Set<(event: { matches: boolean }) => void>()
    const query = {
        matches,
        media: '(prefers-color-scheme: dark)',
        addEventListener: (_: string, cb: (event: { matches: boolean }) => void) => listeners.add(cb),
        removeEventListener: (_: string, cb: (event: { matches: boolean }) => void) => listeners.delete(cb),
    }
    vi.stubGlobal('matchMedia', vi.fn(() => query))
    return {
        emit: (next: boolean) => {
            listeners.forEach((cb) => cb({ matches: next }))
        },
    }
}

describe('useTheme', () => {
    it('默认 auto，且无系统暗色偏好时为亮色', () => {
        stubMatchMedia(false)
        const theme = useTheme()
        expect(theme.mode.value).toBe('auto')
        expect(theme.isDark.value).toBe(false)
        expect(document.documentElement.dataset.scheme).toBe('auto')
        expect(document.documentElement.classList.contains('dark')).toBe(false)
        vi.unstubAllGlobals()
    })

    it('auto 时跟随系统偏好变化', () => {
        const media = stubMatchMedia(false)
        const theme = useTheme()
        expect(theme.isDark.value).toBe(false)
        media.emit(true)
        expect(theme.isDark.value).toBe(true)
        vi.unstubAllGlobals()
    })

    it('显式 dark / light 覆盖系统偏好并同步 DOM', () => {
        stubMatchMedia(true)
        const theme = useTheme('light')
        expect(theme.isDark.value).toBe(false)
        expect(document.documentElement.classList.contains('light')).toBe(true)

        theme.setMode('dark')
        expect(theme.isDark.value).toBe(true)
        expect(document.documentElement.classList.contains('dark')).toBe(true)
        expect(document.documentElement.classList.contains('light')).toBe(false)
        expect(document.documentElement.dataset.scheme).toBeUndefined()

        theme.setMode('light')
        expect(theme.isDark.value).toBe(false)
        expect(document.documentElement.classList.contains('dark')).toBe(false)

        theme.setMode('auto')
        expect(document.documentElement.dataset.scheme).toBe('auto')
        vi.unstubAllGlobals()
    })
})
