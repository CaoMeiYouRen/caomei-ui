import { computed, toValue, useAttrs, type ComputedRef, type MaybeRefOrGetter } from 'vue'

/**
 * 可访问名转属性：有值时输出 `aria-label`，缺省（含空字符串）时不输出该属性，
 * 因此不会覆盖元素上已有的透传值。
 *
 * 供**内层可访问控件**在模板中转发可访问名（`v-bind="labelAttrs(label)"`）；
 * 根即可访问控件的整体透传用 `useLabelAttrs`。
 */
export function labelAttrs(label: string | undefined | null): Record<string, string> {
    return label ? { 'aria-label': label } : {}
}

/**
 * 透传 attrs，并让显式提供的可访问名优先于外部传入的 `aria-label`。
 *
 * 供「根即可访问控件」的组件使用（使用方必须设置 `inheritAttrs: false`）：
 * 默认整体透传 `useAttrs()`，**不做 class / style 分流**（需要分流时用 `useAttrForwarding`，
 * 并把 `controlAttrs` 或合并后的基座作为第二参数传入）；
 * 可访问名有值时覆盖 `aria-label`，其缺省（含空字符串）时保留基座值。
 */
export function useLabelAttrs(
    label: MaybeRefOrGetter<string | undefined>,
    baseAttrs?: MaybeRefOrGetter<Record<string, unknown> | undefined>,
): ComputedRef<Record<string, unknown>> {
    const attrs = useAttrs()

    return computed<Record<string, unknown>>(() => {
        const base = baseAttrs ? (toValue(baseAttrs) ?? {}) : attrs
        const text = toValue(label)
        return {
            ...base,
            ...labelAttrs(text),
        }
    })
}
