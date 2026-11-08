import {
    Calendar as CalendarIcon,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ChevronUp,
    CircleAlert,
    CircleCheck,
    CircleDot,
    CircleX,
    Eye,
    EyeOff,
    FileUp,
    ImageOff,
    Info,
    LoaderCircle,
    Minus,
    Plus,
    TriangleAlert,
    X,
} from '@lucide/vue'
import { computed, inject, provide, toValue, type Component, type ComputedRef, type InjectionKey, type MaybeRefOrGetter } from 'vue'

/**
 * 内置图标的**唯一语义映射表**。
 *
 * 组件只引用语义名（`icons.dismiss` / `icons.chevronDown`），不直接 import `@lucide/vue`；
 * 下游可通过 `provideIconOverrides()` 按语义名替换，未覆盖项保持 Lucide 默认。
 *
 * 语义边界：`error`（Message 的 CircleAlert）与 `danger`（Toast 的 CircleX）语义相近但**不得合并**，
 * 两者视觉回归分别覆盖 Message / Toast 四语气。
 */
export const internalIcons = Object.freeze({
    calendar: CalendarIcon,
    check: Check,
    chevronDown: ChevronDown,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    chevronsLeft: ChevronsLeft,
    chevronsRight: ChevronsRight,
    chevronUp: ChevronUp,
    error: CircleAlert,
    success: CircleCheck,
    radio: CircleDot,
    danger: CircleX,
    eye: Eye,
    eyeOff: EyeOff,
    upload: FileUp,
    imageOff: ImageOff,
    info: Info,
    loading: LoaderCircle,
    minus: Minus,
    plus: Plus,
    warning: TriangleAlert,
    dismiss: X,
})

/** 内置图标的语义名。 */
export type InternalIconName = keyof typeof internalIcons

/** 解析后的内置图标映射（语义名 → 组件）。 */
export type InternalIconMap = Record<InternalIconName, Component>

/** 内置图标覆盖注入键；`provideIconOverrides()` 自动注入。 */
export const caomeiIconOverridesKey: InjectionKey<ComputedRef<InternalIconMap>> = Symbol('caomei-icon-overrides')

/** `provideIconOverrides()` 支持普通对象、`ref` 或 getter。 */
export type IconOverridesSource = MaybeRefOrGetter<Partial<InternalIconMap>>

/**
 * 应用级替换内置图标（按语义名）。
 *
 * - 只覆盖传入的键，其余保持 Lucide 默认；
 * - 不使用模块级可变单例，SSR 按请求隔离；
 * - 通过 provide/inject 注入，最近 provider 生效。
 *
 * @param source 覆盖对象、`ref` 或 getter
 * @returns 合并后的响应式映射
 */
export function provideIconOverrides(source: IconOverridesSource): ComputedRef<InternalIconMap> {
    const overrides = computed(() => toValue(source))
    const merged = computed<InternalIconMap>(() => ({ ...internalIcons, ...overrides.value }))
    provide(caomeiIconOverridesKey, merged)
    return merged
}

/**
 * 读取当前作用域的内置图标映射（含应用级覆盖）。
 *
 * 组件在 `setup` 中调用一次，模板中以 `icons.dismiss` 等形式消费；无 provider 时回退 Lucide 默认。
 *
 * @returns 响应式内置图标映射
 */
export function useInternalIcons(): ComputedRef<InternalIconMap> {
    return inject(caomeiIconOverridesKey, null) ?? computed(() => internalIcons)
}
