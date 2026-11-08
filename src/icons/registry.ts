import { computed, inject, provide, toValue, type ComputedRef, type InjectionKey, type MaybeRefOrGetter } from 'vue'
import type { IconRegistry } from './types'

/** 空注册表（无 provider 时的稳定回退；不可变，可跨请求复用）。 */
const EMPTY_ICON_REGISTRY: IconRegistry = Object.freeze({})

/** 图标注册表注入键；`provideIconRegistry()` 自动注入，通常无需手动使用。 */
export const caomeiIconRegistryKey: InjectionKey<ComputedRef<IconRegistry>> = Symbol('caomei-icon-registry')

/** `provideIconRegistry()` 支持普通对象、`ref` 或 getter。 */
export type IconRegistrySource = MaybeRefOrGetter<IconRegistry>

/**
 * 提供图标注册表（provide/inject）。
 *
 * - 在应用根组件 / 布局中调用，`CaomeiIcon` 即可按 `name` 解析；
 * - 传入 `ref` / getter 时注册表变化会响应式更新；
 * - 不写入模块级变量，SSR 下每个请求独立，不会跨请求泄漏。
 *
 * @param source 注册表对象、`ref` 或 getter
 * @returns 解析后的响应式注册表
 */
export function provideIconRegistry(source: IconRegistrySource): ComputedRef<IconRegistry> {
    const registry = computed(() => toValue(source))
    provide(caomeiIconRegistryKey, registry)
    return registry
}

/**
 * 读取当前作用域的图标注册表；无 provider 时返回空注册表。
 *
 * @returns 响应式注册表
 */
export function useIconRegistry(): ComputedRef<IconRegistry> {
    return inject(caomeiIconRegistryKey, null) ?? computed(() => EMPTY_ICON_REGISTRY)
}
