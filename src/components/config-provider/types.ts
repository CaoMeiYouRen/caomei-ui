import type { CaomeiLocale, CaomeiLocaleMessageOverrides } from '../../locale'

export interface ConfigProviderProps {
    /**
     * 基准语言：内建 `zh-CN` / `en-US`，默认 `zh-CN`
     * @en Base locale: built-in `zh-CN` / `en-US`, defaults to `zh-CN`
     */
    locale?: CaomeiLocale
    /**
     * 覆盖文案：按命名空间合并到基准语言之上，未提供的键回退基准文案
     * @en Message overrides: merged per namespace onto the base locale; missing keys fall back to the base text
     */
    messages?: CaomeiLocaleMessageOverrides
}
