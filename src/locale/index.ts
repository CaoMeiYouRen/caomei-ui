import enUS from './en-us'
import zhCN from './zh-cn'
import type { CaomeiLocaleMessages } from './types'

export type { CaomeiLocaleMessages } from './types'

export const caomeiLocales = {
    'zh-CN': zhCN,
    'en-US': enUS,
} as const

export type CaomeiLocale = keyof typeof caomeiLocales

export const defaultLocale: CaomeiLocale = 'zh-CN'

export const defaultLocaleMessages: CaomeiLocaleMessages = zhCN
