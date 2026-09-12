import { computed, useAttrs, type ClassValue, type ComputedRef, type StyleValue } from 'vue'

export interface AttrForwarding {
    /** 落在组件根元素上的属性（仅 class / style） */
    rootAttrs: ComputedRef<{ class?: ClassValue, style?: StyleValue }>
    /** 透传到内部表单控件的属性（过滤掉 class / style） */
    controlAttrs: ComputedRef<Record<string, unknown>>
}

/**
 * 将 `useAttrs()` 拆分为「根元素」与「内部表单控件」两路：
 * class / style 保留在根元素以便布局覆盖，其余原生属性透传给内层控件。
 * 使用方组件必须设置 `inheritAttrs: false`。
 */
export function useAttrForwarding(): AttrForwarding {
    const attrs = useAttrs()

    const rootAttrs = computed<{ class?: ClassValue, style?: StyleValue }>(() => ({
        class: attrs.class as ClassValue,
        style: attrs.style as StyleValue,
    }))

    const controlAttrs = computed<Record<string, unknown>>(() => {
        const forwarded: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(attrs)) {
            if (key !== 'class' && key !== 'style') {
                forwarded[key] = value
            }
        }
        return forwarded
    })

    return { rootAttrs, controlAttrs }
}
