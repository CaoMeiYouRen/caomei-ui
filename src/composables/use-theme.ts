import { computed, ref, type ComputedRef, type Ref } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'

export interface UseThemeReturn {
    mode: Ref<ThemeMode>
    isDark: ComputedRef<boolean>
    setMode: (next: ThemeMode) => void
}

export function useTheme(initial: ThemeMode = 'auto'): UseThemeReturn {
    const mode = ref<ThemeMode>(initial)
    const isDark = computed(() => mode.value === 'dark')

    function setMode(next: ThemeMode): void {
        mode.value = next
    }

    return { mode, isDark, setMode }
}
