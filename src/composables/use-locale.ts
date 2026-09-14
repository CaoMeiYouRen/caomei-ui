import {
    computed,
    inject,
    provide,
    toValue,
    type ComputedRef,
    type InjectionKey,
    type MaybeRefOrGetter,
} from 'vue'
import {
    caomeiLocales,
    defaultLocaleMessages,
    type CaomeiLocale,
    type CaomeiLocaleMessageOverrides,
    type CaomeiLocaleMessages,
} from '../locale'

/** `provideLocale` / `<CaomeiConfigProvider>` 的选项。 */
export interface ProvideLocaleOptions {
    /** 基准语言：决定未覆盖文案的回退来源，默认 `zh-CN` */
    locale?: MaybeRefOrGetter<CaomeiLocale | undefined>
    /** 覆盖文案：按命名空间浅合并到基准语言之上，可为 ref / getter 以支持运行时切换 */
    messages?: MaybeRefOrGetter<CaomeiLocaleMessageOverrides | undefined>
}

/** 注入键：值为响应式的完整文案对象，语言切换时消费组件自动更新。 */
export const caomeiLocaleKey: InjectionKey<ComputedRef<CaomeiLocaleMessages>> = Symbol(
    'caomei-locale',
)

/** 无 provider 时的回退文案；保持稳定引用，避免 `inject` 缺省值触发开发期告警。 */
const fallbackLocale: ComputedRef<CaomeiLocaleMessages> = computed(() => defaultLocaleMessages)

/**
 * 将文案覆盖按命名空间浅合并到基准文案之上，返回新对象（不修改入参）。
 *
 * 内部工具：仅供 `provideLocale` / 测试使用，不在包根导出面内。
 */
export function mergeLocaleMessages(
    base: CaomeiLocaleMessages,
    overrides?: CaomeiLocaleMessageOverrides,
): CaomeiLocaleMessages {
    if (!overrides) {
        return base
    }
    const merged = { ...base }
    const writable = merged as Record<string, Record<string, string>>
    for (const [namespace, values] of Object.entries(overrides) as Array<
        [string, Partial<Record<string, string>> | undefined]
    >) {
        if (values) {
            writable[namespace] = { ...writable[namespace], ...values } as Record<string, string>
        }
    }
    return merged
}

/**
 * 解析基准语言与覆盖文案，得到完整文案对象；未知语言回退默认文案。
 *
 * 内部工具：仅供 `provideLocale` / 测试使用，不在包根导出面内。
 */
export function resolveLocaleMessages(
    locale?: CaomeiLocale,
    overrides?: CaomeiLocaleMessageOverrides,
): CaomeiLocaleMessages {
    // 用 hasOwnProperty 而非真值判断，避免 'constructor' / 'toString' 等原型键被误当作内建语言
    const base = locale && Object.prototype.hasOwnProperty.call(caomeiLocales, locale)
        ? caomeiLocales[locale]
        : defaultLocaleMessages
    return mergeLocaleMessages(base, overrides)
}

/**
 * 向下提供组件内建文案，在应用根部调用一次（或使用 `<CaomeiConfigProvider>`）。
 *
 * `locale` / `messages` 可为 ref / getter，运行时变化会自动传播到消费组件；
 * 每个 Provider 实例持有独立上下文，不会在 SSR 下跨请求串扰。
 */
export function provideLocale(
    options: ProvideLocaleOptions = {},
): ComputedRef<CaomeiLocaleMessages> {
    const messages = computed(() =>
        resolveLocaleMessages(toValue(options.locale), toValue(options.messages)),
    )
    provide(caomeiLocaleKey, messages)
    return messages
}

/**
 * 读取当前注入的组件内建文案；未注入时回退默认语言文案。
 *
 * 返回值随 provider 的语言 / 覆盖变化而更新，组件应以 `computed` 消费。
 */
export function useLocale(): ComputedRef<CaomeiLocaleMessages> {
    return inject(caomeiLocaleKey, fallbackLocale)
}
