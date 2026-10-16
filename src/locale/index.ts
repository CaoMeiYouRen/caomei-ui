import enUS from './en-us'
import zhCN from './zh-cn'
import type { CaomeiLocaleMessages } from './types'

export type { CaomeiLocaleMessageOverrides, CaomeiLocaleMessages } from './types'

/**
 * 内建（随包发布）语言标识。
 *
 * **显式声明、不由注册表派生**：注册表在运行期可变（见 `registerLocale`），若类型由
 * `keyof typeof caomeiLocales` 派生，类型集合会随注册表内容漂移，并使各处
 * `Record<CaomeiLocale, string>` 全函数映射（图表 / 富文本语言映射）随之报错。
 *
 * 注意：**类型联合不等于「已可用」**——成员只表示本库随包提供该语言的文案文件；
 * 实际可用与否取决于是否已注册（见 `PRE_REGISTERED_LOCALES`）。
 */
export type CaomeiLocale = 'zh-CN' | 'en-US' | 'zh-TW' | 'ja-JP' | 'ko-KR'

/**
 * 随包根**预注册**的语言：无需注册即可 `provideLocale({ locale })` / `<CaomeiConfigProvider locale>`。
 *
 * 其余内建语言经 `caomei-ui/locale/<code>` 子路径按需引入，再经 `registerLocale` 注册。
 * 本常量是「预注册集合」的**单一事实源**：守卫与测试引用它，不另行抄写清单。
 */
export const PRE_REGISTERED_LOCALES = ['zh-CN', 'en-US'] as const satisfies readonly CaomeiLocale[]

/** 已注册语言表：初值 = 预注册集合；运行期可经 `registerLocale` 扩展。 */
export const caomeiLocales: Partial<Record<CaomeiLocale, CaomeiLocaleMessages>> = {
    'zh-CN': zhCN,
    'en-US': enUS,
}

/**
 * 注册一门内建语言的文案（幂等；同标识重复注册以最后一次为准）。
 *
 * **须在 `provideLocale` / `<CaomeiConfigProvider>` 之前调用**：provider 侧的文案为
 * `computed`，不会因后续注册而重算；异步场景（`await import(...)`）须先注册再挂载 provider。
 *
 * @param code 语言标识（本库内建语言之一）
 * @param messages 该语言的完整文案对象（来自 `caomei-ui/locale/<code>` 子路径）
 */
export function registerLocale(code: CaomeiLocale, messages: CaomeiLocaleMessages): void {
    caomeiLocales[code] = messages
}

/** 默认语言（亦是基准语种：文案键集合与占位符的比对基准）。 */
export const defaultLocale: CaomeiLocale = 'zh-CN'

/** 默认语言的完整文案对象；未注册任何语言时的回退来源。 */
export const defaultLocaleMessages: CaomeiLocaleMessages = zhCN
