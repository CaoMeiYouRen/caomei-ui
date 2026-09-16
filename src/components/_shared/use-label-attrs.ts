import { computed, toValue, useAttrs, type ComputedRef, type MaybeRefOrGetter } from 'vue'

/**
 * 透传全部 attrs，并让显式提供的可访问名优先于外部传入的 `aria-label`。
 *
 * 供「根即可访问控件」的组件使用（使用方必须设置 `inheritAttrs: false`）：
 * 其余属性原样透传，**不做 class / style 分流**（需要分流时用 `useAttrForwarding`）；
 * 可访问名有值时覆盖 `aria-label`，其缺省（含空字符串）时保留外部透传值。
 */
export function useLabelAttrs(
    label: MaybeRefOrGetter<string | undefined>,
): ComputedRef<Record<string, unknown>> {
    const attrs = useAttrs()

    return computed<Record<string, unknown>>(() => {
        const text = toValue(label)
        return {
            ...attrs,
            ...(text ? { 'aria-label': text } : {}),
        }
    })
}
