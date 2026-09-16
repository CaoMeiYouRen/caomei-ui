import type { CaomeiLocale, CaomeiLocaleMessageOverrides } from '../../locale'

export interface ConfigProviderProps {
    /**
     * 基准语言：取 `CaomeiLocale` 之一（内建语种见 locale 指南），默认 `zh-CN`；未注册语种回退默认文案
     * @en Base locale: one of `CaomeiLocale` (see the locale guide for built-in ids), defaults to `zh-CN`; an unregistered id falls back to the default messages
     */
    locale?: CaomeiLocale
    /**
     * 覆盖文案：按命名空间合并到基准语言之上，未提供的键回退基准文案
     * @en Message overrides: merged per namespace onto the base locale; missing keys fall back to the base text
     */
    messages?: CaomeiLocaleMessageOverrides
}
