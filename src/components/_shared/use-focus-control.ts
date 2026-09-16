import type { Ref } from 'vue'

/** 组件对外暴露的聚焦控制。 */
export interface FocusControl {
    /** 让内部可聚焦元素获得焦点 */
    focus: () => void
    /** 让内部可聚焦元素失去焦点 */
    blur: () => void
}

/**
 * 把 `focus` / `blur` 委托给内部可聚焦元素或子组件实例，供 `defineExpose` 暴露。
 *
 * 目标元素 / 组件尚未挂载（`null` / `undefined`）时静默跳过，与原生调用语义一致。
 */
export function useFocusControl<T extends { focus: () => void, blur: () => void }>(
    target: Ref<T | null | undefined>,
): FocusControl {
    return {
        focus: () => target.value?.focus(),
        blur: () => target.value?.blur(),
    }
}
