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
    defaultLocale,
    defaultLocaleMessages,
    type CaomeiLocale,
    type CaomeiLocaleMessageOverrides,
    type CaomeiLocaleMessages,
} from '../locale'
import { warnDev } from '../_shared/dev-warn'

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

/** 注入键：值为响应式的语言标识（locale 代码，如 `zh-CN`），供需要「按语言分支」的消费组件使用。 */
export const caomeiLocaleCodeKey: InjectionKey<ComputedRef<CaomeiLocale>> = Symbol(
    'caomei-locale-code',
)

/** 无 provider 时的回退文案；保持稳定引用，避免 `inject` 缺省值触发开发期告警。 */
const fallbackLocale: ComputedRef<CaomeiLocaleMessages> = computed(() => defaultLocaleMessages)

/** 无 provider 时的回退语言标识；同样保持稳定引用。 */
const fallbackLocaleCode: ComputedRef<CaomeiLocale> = computed(() => defaultLocale)

/**
 * 归一化语言标识：未注册（含未知值与原型链键）回退默认语言，并在开发期给出可操作告警。
 *
 * 告警的必要性：`CaomeiLocale` 是「随包提供文案的语言」集合，**不等于「已注册」**——
 * 非预注册语言须先 `import` 子路径并 `registerLocale` 后方可生效，否则会静默回落。
 *
 * 内部工具：仅供 `provideLocale` / 测试使用，不在包根导出面内。
 */
export function resolveLocaleCode(locale?: CaomeiLocale): CaomeiLocale {
    if (locale && Object.prototype.hasOwnProperty.call(caomeiLocales, locale) && caomeiLocales[locale]) {
        return locale
    }
    if (locale) {
        warnDev(
            `[caomei-ui] 语言 '${locale}' 未注册，已回落默认语言 '${defaultLocale}'。`
            + `内建语言需按需引入并注册（须在 provideLocale 之前）：`
            + `import messages from 'caomei-ui/locale/${locale.toLowerCase()}'; registerLocale('${locale}', messages)。`,
        )
    }
    return defaultLocale
}

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
    for (const [namespace, values] of Object.entries(overrides) as [string, Partial<Record<string, string>> | undefined][]) {
        if (values) {
            writable[namespace] = { ...writable[namespace], ...values } as Record<string, string>
        }
    }
    return merged
}

/**
 * 解析基准语言与覆盖文案，得到完整文案对象；未注册语言回退默认文案（见 `resolveLocaleCode`）。
 *
 * 内部工具：仅供 `provideLocale` / 测试使用，不在包根导出面内。
 */
export function resolveLocaleMessages(
    locale?: CaomeiLocale,
    overrides?: CaomeiLocaleMessageOverrides,
): CaomeiLocaleMessages {
    const code = resolveLocaleCode(locale)
    return mergeLocaleMessages(caomeiLocales[code] ?? defaultLocaleMessages, overrides)
}

/**
 * 向下提供组件内建文案与语言标识，在应用根部调用一次（或使用 `<CaomeiConfigProvider>`）。
 *
 * `locale` / `messages` 可为 ref / getter，运行时变化会自动传播到消费组件；
 * 每个 Provider 实例持有独立上下文，不会在 SSR 下跨请求串扰。
 */
export function provideLocale(
    options: ProvideLocaleOptions = {},
): ComputedRef<CaomeiLocaleMessages> {
    // 语言标识只解析一次：两个注入值共用同一 `computed`，
    // 避免同一次解析触发两条未注册告警（同时消费 `useLocale` 与 `useLocaleCode` 的组件会各读一次）。
    const code = computed(() => resolveLocaleCode(toValue(options.locale)))
    const messages = computed(() =>
        mergeLocaleMessages(caomeiLocales[code.value] ?? defaultLocaleMessages, toValue(options.messages)),
    )
    provide(caomeiLocaleKey, messages)
    provide(caomeiLocaleCodeKey, code)
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

/**
 * 读取当前注入的语言标识（locale 代码）；未注入时回退 `defaultLocale`。
 *
 * 供需要按语言分支（而非取文案）的组件使用，例如把本库语言映射到第三方库的语言键；
 * 返回值随 provider 的 `locale` 变化而更新。
 */
export function useLocaleCode(): ComputedRef<CaomeiLocale> {
    return inject(caomeiLocaleCodeKey, fallbackLocaleCode)
}
